import json
import io
import zipfile
import unicodedata
from uuid import uuid4
from html import escape as html_escape
from django.utils.text import slugify

from django.contrib.auth.models import User

from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import (
    Addon,
    AddonInstallation,
    Sheet,
    HistoryEntry,
    SheetShare,
    SheetChatMessage,
    FriendLink,
    WorkspaceOrganization,
    WorkspaceGroup,
    WorkspaceGroupMembership,
    GroupSheetAssignment,
    GroupWatch,
    UserReport,
)


def _cell_changes_summary(before_grid, after_grid, limit=300):
    before_grid = before_grid if isinstance(before_grid, list) else []
    after_grid = after_grid if isinstance(after_grid, list) else []
    max_rows = max(len(before_grid), len(after_grid))
    max_cols = 0
    for row in before_grid:
        if isinstance(row, list):
            max_cols = max(max_cols, len(row))
    for row in after_grid:
        if isinstance(row, list):
            max_cols = max(max_cols, len(row))
    changes = []
    for r in range(max_rows):
        before_row = before_grid[r] if r < len(before_grid) and isinstance(before_grid[r], list) else []
        after_row = after_grid[r] if r < len(after_grid) and isinstance(after_grid[r], list) else []
        for c in range(max_cols):
            before_val = before_row[c] if c < len(before_row) else ""
            after_val = after_row[c] if c < len(after_row) else ""
            if str(before_val) != str(after_val):
                col_label = ""
                n = c + 1
                while n > 0:
                    rem = (n - 1) % 26
                    col_label = chr(65 + rem) + col_label
                    n = (n - 1) // 26
                cell = f"{col_label}{r + 1}"
                changes.append({
                    "cell": cell,
                    "before": str(before_val),
                    "after": str(after_val),
                })
                if len(changes) >= limit:
                    return changes
    return changes


def _extract_active_grid(grid_payload, fallback=None):
    """
    Wspiera 2 formaty zapisu:
    - klasyczna siatka (lista list),
    - workbook {activeSheetIndex, sheets:[{grid: ...}]}
    """
    if isinstance(grid_payload, list):
        return grid_payload

    if isinstance(grid_payload, dict):
        sheets = grid_payload.get("sheets")
        if isinstance(sheets, list) and sheets:
            active_index = grid_payload.get("activeSheetIndex", 0)
            try:
                active_index = int(active_index)
            except Exception:
                active_index = 0
            if active_index < 0 or active_index >= len(sheets):
                active_index = 0
            active_sheet = sheets[active_index] if isinstance(sheets[active_index], dict) else {}
            active_grid = active_sheet.get("grid")
            return active_grid if isinstance(active_grid, list) else (fallback or [])
    return fallback or []


def _default_grid(rows=20, cols=8):
    return [["" for _ in range(cols)] for _ in range(rows)]


def _sheet_access(sheet, user):
    """Zwraca zakres dostępu użytkownika do arkusza."""
    if sheet.user_id == user.id:
        return {
            "role": "owner",
            "permission": "owner",
            "canEdit": True,
            "canShare": True,
            "isOwner": True,
        }

    share = SheetShare.objects.filter(sheet=sheet, user=user).first()
    if not share:
        return None

    return {
        "role": "shared",
        "permission": share.permission,
        "canEdit": share.permission == SheetShare.PERMISSION_EDIT,
        "canShare": False,
        "isOwner": False,
    }


def _sheet_queryset_for_user(user):
    """Arkusze właściciela + arkusze udostępnione użytkownikowi."""
    shared_ids = SheetShare.objects.filter(user=user).values_list('sheet_id', flat=True)
    return Sheet.objects.filter(Q(user=user) | Q(id__in=shared_ids)).distinct()


def _get_sheet_for_user(sheet_id, user, require_edit=False, require_owner=False):
    sheet = get_object_or_404(Sheet, id=sheet_id)
    access = _sheet_access(sheet, user)
    if not access:
        return None, None, HttpResponseForbidden("Nie masz dostępu do tego arkusza.")
    if require_owner and not access["isOwner"]:
        return None, None, HttpResponseForbidden("Tylko właściciel może udostępniać ten arkusz.")
    if require_edit and not access["canEdit"]:
        return None, None, HttpResponseForbidden("Masz dostęp tylko do odczytu.")
    return sheet, access, None


def _sheet_to_payload(sheet, user, index=1, include_grid=True):
    access = _sheet_access(sheet, user) or {}
    payload = {
        "id": sheet.id,
        "order": index,
        "name": sheet.name,
        "category": sheet.category,
        "createdAt": sheet.created_at.isoformat(),
        "updatedAt": sheet.updated_at.isoformat(),
        "owner": {
            "id": sheet.user_id,
            "username": sheet.user.username,
            "email": sheet.user.email,
        },
        "access": access,
        "isShared": access.get("role") == "shared",
        "canEdit": bool(access.get("canEdit")),
        "canShare": bool(access.get("canShare")),
    }
    if include_grid:
        payload["grid"] = sheet.get_grid()
        payload["scripts"] = sheet.get_scripts()
    else:
        payload["gridSizeBytes"] = len(sheet.grid_data.encode("utf-8")) if sheet.grid_data else 0
    return payload


@login_required
@require_GET
def sheets_list(request):
    sheets = _sheet_queryset_for_user(request.user).select_related('user').only('id', 'user_id', 'user__username', 'user__email', 'name', 'category', 'grid_data', 'created_at', 'updated_at')
    data = [_sheet_to_payload(sheet, request.user, index, include_grid=False) for index, sheet in enumerate(sheets, start=1)]
    return JsonResponse(data, safe=False)


@login_required
@require_POST
@csrf_exempt
def create_sheet(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")

    name = (payload.get("name") or "").strip()
    category = (payload.get("category") or "Bez kategorii").strip()

    if not name:
        return HttpResponseBadRequest("Nazwa arkusza jest wymagana.")

    sheet = Sheet(
        user=request.user,
        name=name,
        category=category,
    )
    sheet.set_grid(_default_grid())
    sheet.save()

    entry = HistoryEntry(
        user=request.user,
        sheet=sheet,
        action="Utworzono arkusz",
    )
    entry.set_details({
        "sheetName": sheet.name,
        "category": sheet.category,
        "type": "sheet_create",
    })
    entry.save()

    return JsonResponse({
        "id": sheet.id,
        "name": sheet.name,
        "category": sheet.category,
        "createdAt": sheet.created_at.isoformat(),
        "updatedAt": sheet.updated_at.isoformat(),
    })


@login_required
@require_GET
def sheet_detail(request, sheet_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user)
    if error:
        return error
    return JsonResponse(_sheet_to_payload(sheet, request.user))


@login_required
@require_POST
@csrf_exempt
def save_sheet(request, sheet_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user, require_edit=True)
    if error:
        return error

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")

    before_payload = sheet.get_grid()
    before_grid = _extract_active_grid(before_payload)
    before_scripts = sheet.get_scripts()

    if "name" in payload:
        sheet.name = (payload.get("name") or sheet.name).strip()

    if "category" in payload:
        sheet.category = (payload.get("category") or sheet.category).strip()

    if "grid" in payload:
        # Zachowujemy pełny payload arkusza/workbooka.
        sheet.set_grid(payload.get("grid") or sheet.get_grid())
    if "scripts" in payload:
        sheet.set_scripts(payload.get("scripts") or [])

    sheet.save()

    after_payload = sheet.get_grid()
    after_grid = _extract_active_grid(after_payload)
    after_scripts = sheet.get_scripts()
    changes = _cell_changes_summary(before_grid, after_grid)

    entry = HistoryEntry(
        user=request.user,
        sheet=sheet,
        action=payload.get("action", "Zapisano arkusz"),
    )
    entry.set_details({
        "sheetName": sheet.name,
        "type": "save_sheet",
        "snapshot": {
            "name": sheet.name,
            "category": sheet.category,
            # Snapshot pełnego payloadu (obsługuje wiele zakładek workbooka).
            "grid": after_payload,
            "scripts": after_scripts,
        },
        "changes": changes,
        "changesCount": len(changes),
        "scriptsChanged": before_scripts != after_scripts,
    })
    entry.save()

    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def delete_sheet(request, sheet_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user, require_owner=True)
    if error:
        return error
    sheet_name = sheet.name

    entry = HistoryEntry(
        user=request.user,
        sheet=None,
        action="Usunięto arkusz",
    )
    entry.set_details({
        "sheetName": sheet_name,
        "type": "sheet_delete",
    })
    entry.save()

    sheet.delete()
    return JsonResponse({"status": "ok"})



@login_required
@require_GET
def sheet_shares_list(request, sheet_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user)
    if error:
        return error

    shares = []
    if access["isOwner"]:
        qs = SheetShare.objects.filter(sheet=sheet).select_related('user').order_by('user__username')
        for share in qs:
            shares.append({
                "id": share.id,
                "userId": share.user_id,
                "username": share.user.username,
                "email": share.user.email,
                "permission": share.permission,
                "permissionLabel": share.get_permission_display(),
                "createdAt": share.created_at.isoformat(),
            })

    return JsonResponse({
        "sheet": _sheet_to_payload(sheet, request.user, include_grid=False),
        "shares": shares,
        "canShare": access["canShare"],
    })


@login_required
@require_POST
@csrf_exempt
def share_sheet(request, sheet_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user, require_owner=True)
    if error:
        return error

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")

    recipient_text = (payload.get("email") or payload.get("recipient") or "").strip()
    permission = (payload.get("permission") or SheetShare.PERMISSION_VIEW).strip()

    if permission not in {SheetShare.PERMISSION_VIEW, SheetShare.PERMISSION_EDIT}:
        return HttpResponseBadRequest("Nieprawidłowy poziom dostępu.")

    if not recipient_text:
        return HttpResponseBadRequest("Podaj e-mail lub login użytkownika.")

    recipient = User.objects.filter(Q(email__iexact=recipient_text) | Q(username__iexact=recipient_text)).first()
    if not recipient:
        return HttpResponseBadRequest("Nie znaleziono użytkownika o podanym e-mailu lub loginie.")

    if recipient.id == request.user.id:
        return HttpResponseBadRequest("Nie możesz udostępnić arkusza samemu sobie.")

    share, created = SheetShare.objects.update_or_create(
        sheet=sheet,
        user=recipient,
        defaults={
            "owner": request.user,
            "permission": permission,
        },
    )

    entry = HistoryEntry(user=request.user, sheet=sheet, action="Udostępniono arkusz")
    entry.set_details({
        "sheetName": sheet.name,
        "type": "sheet_share",
        "recipient": recipient.email or recipient.username,
        "permission": permission,
        "created": created,
    })
    entry.save()

    return JsonResponse({
        "status": "ok",
        "created": created,
        "share": {
            "id": share.id,
            "username": recipient.username,
            "email": recipient.email,
            "permission": share.permission,
            "permissionLabel": share.get_permission_display(),
        },
    })


@login_required
@require_POST
@csrf_exempt
def update_sheet_share(request, sheet_id, share_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user, require_owner=True)
    if error:
        return error

    share = get_object_or_404(SheetShare, id=share_id, sheet=sheet)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")

    permission = (payload.get("permission") or "").strip()
    if permission not in {SheetShare.PERMISSION_VIEW, SheetShare.PERMISSION_EDIT}:
        return HttpResponseBadRequest("Nieprawidłowy poziom dostępu.")

    share.permission = permission
    share.owner = request.user
    share.save(update_fields=["permission", "owner", "updated_at"])

    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def delete_sheet_share(request, sheet_id, share_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user, require_owner=True)
    if error:
        return error

    share = get_object_or_404(SheetShare, id=share_id, sheet=sheet)
    share.delete()
    return JsonResponse({"status": "ok"})


@login_required
@require_GET
def history_list(request):
    entries = HistoryEntry.objects.filter(user=request.user)
    data = []
    for index, entry in enumerate(entries, start=1):
        details = entry.get_details()
        data.append({
            "id": entry.id,
            "order": index,
            "action": entry.action,
            "sheetName": details.get("sheetName"),
            "details": details,
            "createdAt": entry.created_at.isoformat(),
        })
    return JsonResponse(data, safe=False)


@login_required
@require_POST
@csrf_exempt
def add_history_entry(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")

    sheet = None
    sheet_id = payload.get("sheetId")
    if sheet_id:
        sheet = _sheet_queryset_for_user(request.user).filter(id=sheet_id).first()

    entry = HistoryEntry(
        user=request.user,
        sheet=sheet,
        action=payload.get("action", "Wykonano akcję"),
    )
    entry.set_details(payload.get("details", {}))
    entry.save()

    return JsonResponse({
        "id": entry.id,
        "action": entry.action,
        "createdAt": entry.created_at.isoformat(),
    })


@login_required
@require_POST
@csrf_exempt
def restore_sheet_from_history(request, entry_id):
    entry = get_object_or_404(HistoryEntry, id=entry_id, user=request.user)
    if not entry.sheet_id:
        return HttpResponseBadRequest("To zdarzenie nie dotyczy arkusza.")
    sheet, access, error = _get_sheet_for_user(entry.sheet_id, request.user, require_edit=True)
    if error:
        return error
    details = entry.get_details()
    snapshot = details.get("snapshot") if isinstance(details, dict) else None
    if not snapshot:
        return HttpResponseBadRequest("Ta wersja nie ma zapisanego podglądu.")

    sheet.name = (snapshot.get("name") or sheet.name).strip()
    sheet.category = (snapshot.get("category") or sheet.category).strip() or sheet.category
    sheet.set_grid(snapshot.get("grid") or [])
    sheet.set_scripts(snapshot.get("scripts") or [])
    sheet.save()

    restore_entry = HistoryEntry(
        user=request.user,
        sheet=sheet,
        action="Przywrócono wersję z historii",
    )
    restore_entry.set_details({
        "sheetName": sheet.name,
        "type": "restore_sheet_version",
        "restoredFromEntryId": entry.id,
    })
    restore_entry.save()
    return JsonResponse({"status": "ok", "sheetId": sheet.id})


@login_required
@require_GET
def sheet_chat_messages(request, sheet_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user)
    if error:
        return error

    after_id = request.GET.get("after")
    qs = SheetChatMessage.objects.filter(sheet=sheet).select_related('user').order_by('-created_at')
    if after_id and str(after_id).isdigit():
        qs = qs.filter(id__gt=int(after_id)).order_by('created_at')[:80]
    else:
        qs = list(qs[:80])
        qs.reverse()

    data = []
    for msg in qs:
        display_name = (msg.user.get_full_name() or msg.user.username or msg.user.email or "Użytkownik").strip()
        data.append({
            "id": msg.id,
            "body": msg.body,
            "author": display_name,
            "username": msg.user.username,
            "isMine": msg.user_id == request.user.id,
            "createdAt": msg.created_at.isoformat(),
        })
    return JsonResponse({"messages": data})


@login_required
@require_POST
@csrf_exempt
def add_sheet_chat_message(request, sheet_id):
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user)
    if error:
        return error

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")

    body = str(payload.get("body") or "").strip()
    if not body:
        return HttpResponseBadRequest("Wiadomość nie może być pusta.")
    if len(body) > 2000:
        return HttpResponseBadRequest("Wiadomość jest za długa — maksymalnie 2000 znaków.")

    msg = SheetChatMessage.objects.create(sheet=sheet, user=request.user, body=body)
    display_name = (request.user.get_full_name() or request.user.username or request.user.email or "Użytkownik").strip()
    return JsonResponse({
        "status": "ok",
        "message": {
            "id": msg.id,
            "body": msg.body,
            "author": display_name,
            "username": request.user.username,
            "isMine": True,
            "createdAt": msg.created_at.isoformat(),
        }
    })


def _resolve_user_from_query(query_text):
    query = (query_text or "").strip()
    if not query:
        return None
    return User.objects.filter(Q(username__iexact=query) | Q(email__iexact=query)).first()


def _organization_for_user_queryset(user):
    team_org_ids = WorkspaceGroupMembership.objects.filter(
        user=user,
        group__organization__isnull=False,
    ).values_list('group__organization_id', flat=True)
    return WorkspaceOrganization.objects.filter(Q(owner=user) | Q(id__in=team_org_ids)).distinct()


def _organization_can_manage(organization, user):
    if organization.owner_id == user.id:
        return True
    return WorkspaceGroupMembership.objects.filter(
        user=user,
        group__organization=organization,
        role__in={
            WorkspaceGroupMembership.ROLE_OWNER,
            WorkspaceGroupMembership.ROLE_ADMIN,
            WorkspaceGroupMembership.ROLE_MAINTAINER,
        },
    ).exists()


def _organization_payload(organization, user):
    teams = WorkspaceGroup.objects.filter(organization=organization).order_by('name')
    members_count = WorkspaceGroupMembership.objects.filter(group__organization=organization).values('user_id').distinct().count()
    report_count = UserReport.objects.filter(organization=organization).count()
    return {
        "id": organization.id,
        "name": organization.name,
        "slug": organization.slug,
        "description": organization.description,
        "website": organization.website,
        "visibility": organization.visibility,
        "visibilityLabel": organization.get_visibility_display(),
        "allowMemberTeamCreation": organization.allow_member_team_creation,
        "teamCount": teams.count(),
        "memberCount": members_count,
        "reportCount": report_count,
        "canManage": _organization_can_manage(organization, user),
        "settings": organization.settings_json if isinstance(organization.settings_json, dict) else {},
    }


def _group_membership_for_user(group, user):
    return WorkspaceGroupMembership.objects.filter(group=group, user=user).first()


def _can_manage_group(group, user):
    membership = _group_membership_for_user(group, user)
    if not membership:
        return False
    return membership.role in {
        WorkspaceGroupMembership.ROLE_OWNER,
        WorkspaceGroupMembership.ROLE_ADMIN,
        WorkspaceGroupMembership.ROLE_MAINTAINER,
    }


def _group_payload(group, user):
    memberships = WorkspaceGroupMembership.objects.filter(group=group).select_related('user').order_by('created_at')
    assignments = GroupSheetAssignment.objects.filter(group=group).select_related('sheet').order_by('-created_at')
    watched = GroupWatch.objects.filter(group=group, user=user).exists()
    my_membership = next((m for m in memberships if m.user_id == user.id), None)
    children = list(WorkspaceGroup.objects.filter(parent=group).order_by('name').values('id', 'name', 'slug'))
    return {
        "id": group.id,
        "name": group.name,
        "slug": group.slug,
        "description": group.description,
        "specification": group.specification,
        "organizationId": group.organization_id,
        "organizationName": group.organization.name if group.organization_id else "",
        "parentTeamId": group.parent_id,
        "parentTeamName": group.parent.name if group.parent_id else "",
        "visibility": group.visibility,
        "visibilityLabel": group.get_visibility_display(),
        "notificationSetting": group.notification_setting,
        "notificationSettingLabel": group.get_notification_setting_display(),
        "role": my_membership.role if my_membership else "",
        "canManage": bool(my_membership and my_membership.role in {
            WorkspaceGroupMembership.ROLE_OWNER,
            WorkspaceGroupMembership.ROLE_ADMIN,
            WorkspaceGroupMembership.ROLE_MAINTAINER,
        }),
        "watching": watched,
        "children": children,
        "settings": group.settings_json if isinstance(group.settings_json, dict) else {},
        "members": [
            {
                "id": m.id,
                "userId": m.user_id,
                "username": m.user.username,
                "email": m.user.email,
                "role": m.role,
            } for m in memberships
        ],
        "assignedSheets": [
            {
                "id": a.sheet_id,
                "name": a.sheet.name,
                "category": a.sheet.category,
            } for a in assignments
        ],
    }


@login_required
@require_GET
def network_summary(request):
    memberships = WorkspaceGroupMembership.objects.filter(user=request.user).select_related('group').order_by('group__name')
    group_ids = [m.group_id for m in memberships]
    owned_group_ids = WorkspaceGroup.objects.filter(owner=request.user).values_list('id', flat=True)
    groups = WorkspaceGroup.objects.filter(Q(id__in=group_ids) | Q(id__in=owned_group_ids)).select_related('organization', 'parent').distinct()
    organizations = _organization_for_user_queryset(request.user)
    friends = FriendLink.objects.filter(owner=request.user).select_related('friend').order_by('friend__username')
    return JsonResponse({
        "friends": [
            {
                "id": f.id,
                "userId": f.friend_id,
                "username": f.friend.username,
                "email": f.friend.email,
            } for f in friends
        ],
        "organizations": [_organization_payload(org, request.user) for org in organizations],
        "groups": [_group_payload(group, request.user) for group in groups],
    })


@login_required
@require_POST
@csrf_exempt
def create_organization(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidlowe dane JSON.")
    name = (payload.get("name") or "").strip()
    if not name:
        return HttpResponseBadRequest("Nazwa organizacji jest wymagana.")
    base_slug = slugify(name)[:170] or "organizacja"
    slug = base_slug
    while WorkspaceOrganization.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{uuid4().hex[:6]}"
    visibility = (payload.get("visibility") or WorkspaceOrganization.VISIBILITY_PRIVATE).strip()
    if visibility not in dict(WorkspaceOrganization.VISIBILITY_CHOICES):
        visibility = WorkspaceOrganization.VISIBILITY_PRIVATE
    organization = WorkspaceOrganization.objects.create(
        name=name,
        description=(payload.get("description") or "").strip(),
        website=(payload.get("website") or "").strip(),
        visibility=visibility,
        allow_member_team_creation=bool(payload.get("allowMemberTeamCreation")),
        settings_json=payload.get("settings") if isinstance(payload.get("settings"), dict) else {},
        slug=slug,
        owner=request.user,
    )
    return JsonResponse({"status": "ok", "organizationId": organization.id})


@login_required
@require_POST
@csrf_exempt
def update_organization(request, organization_id):
    organization = get_object_or_404(WorkspaceOrganization, id=organization_id)
    if not _organization_can_manage(organization, request.user):
        return HttpResponseForbidden("Brak uprawnien do zarzadzania organizacja.")
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidlowe dane JSON.")
    organization.description = (payload.get("description") or organization.description).strip()
    organization.website = (payload.get("website") or organization.website).strip()
    visibility = (payload.get("visibility") or organization.visibility).strip()
    if visibility in dict(WorkspaceOrganization.VISIBILITY_CHOICES):
        organization.visibility = visibility
    if "allowMemberTeamCreation" in payload:
        organization.allow_member_team_creation = bool(payload.get("allowMemberTeamCreation"))
    if isinstance(payload.get("settings"), dict):
        organization.settings_json = payload.get("settings")
    organization.save()
    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def add_friend(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")
    candidate = _resolve_user_from_query(payload.get("query"))
    if not candidate:
        return HttpResponseBadRequest("Nie znaleziono użytkownika.")
    if candidate.id == request.user.id:
        return HttpResponseBadRequest("Nie możesz dodać siebie.")
    FriendLink.objects.get_or_create(owner=request.user, friend=candidate)
    FriendLink.objects.get_or_create(owner=candidate, friend=request.user)
    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def remove_friend(request, link_id):
    link = get_object_or_404(FriendLink, id=link_id, owner=request.user)
    FriendLink.objects.filter(owner=link.friend, friend=request.user).delete()
    link.delete()
    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def create_group(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")
    name = (payload.get("name") or "").strip()
    description = (payload.get("description") or "").strip()
    specification = (payload.get("specification") or "").strip()
    organization = None
    organization_id = payload.get("organizationId")
    if organization_id:
        organization = WorkspaceOrganization.objects.filter(id=organization_id).first()
        if not organization:
            return HttpResponseBadRequest("Nie znaleziono organizacji.")
        if not (_organization_can_manage(organization, request.user) or organization.allow_member_team_creation):
            return HttpResponseForbidden("Nie mozesz tworzyc teamow w tej organizacji.")
    parent = None
    parent_id = payload.get("parentTeamId")
    if parent_id:
        parent = WorkspaceGroup.objects.filter(id=parent_id).first()
        if not parent:
            return HttpResponseBadRequest("Nie znaleziono zespolu nadrzednego.")
    if not name:
        return HttpResponseBadRequest("Nazwa grupy jest wymagana.")
    base_slug = slugify(name)[:170] or "grupa"
    slug = base_slug
    while WorkspaceGroup.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{uuid4().hex[:6]}"
    visibility = (payload.get("visibility") or WorkspaceGroup.VISIBILITY_VISIBLE).strip()
    if visibility not in dict(WorkspaceGroup.VISIBILITY_CHOICES):
        visibility = WorkspaceGroup.VISIBILITY_VISIBLE
    notification_setting = (payload.get("notificationSetting") or WorkspaceGroup.NOTIFY_ENABLED).strip()
    if notification_setting not in dict(WorkspaceGroup.NOTIFY_CHOICES):
        notification_setting = WorkspaceGroup.NOTIFY_ENABLED
    group = WorkspaceGroup.objects.create(
        name=name,
        description=description,
        specification=specification,
        organization=organization,
        parent=parent,
        visibility=visibility,
        notification_setting=notification_setting,
        settings_json=payload.get("settings") if isinstance(payload.get("settings"), dict) else {},
        slug=slug,
        owner=request.user,
    )
    WorkspaceGroupMembership.objects.create(group=group, user=request.user, role=WorkspaceGroupMembership.ROLE_OWNER)
    return JsonResponse({"status": "ok", "groupId": group.id})


@login_required
@require_POST
@csrf_exempt
def update_group(request, group_id):
    group = get_object_or_404(WorkspaceGroup, id=group_id)
    if not _can_manage_group(group, request.user):
        return HttpResponseForbidden("Brak uprawnien do zarzadzania grupa.")
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidlowe dane JSON.")
    group.description = (payload.get("description") or group.description).strip()
    group.specification = (payload.get("specification") or group.specification).strip()
    visibility = (payload.get("visibility") or group.visibility).strip()
    if visibility in dict(WorkspaceGroup.VISIBILITY_CHOICES):
        group.visibility = visibility
    notification_setting = (payload.get("notificationSetting") or group.notification_setting).strip()
    if notification_setting in dict(WorkspaceGroup.NOTIFY_CHOICES):
        group.notification_setting = notification_setting
    if isinstance(payload.get("settings"), dict):
        group.settings_json = payload.get("settings")
    group.save()
    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def add_group_member(request, group_id):
    group = get_object_or_404(WorkspaceGroup, id=group_id)
    if not _can_manage_group(group, request.user):
        return HttpResponseForbidden("Brak uprawnień do zarządzania grupą.")
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")
    candidate = _resolve_user_from_query(payload.get("query"))
    if not candidate:
        return HttpResponseBadRequest("Nie znaleziono użytkownika.")
    role = (payload.get("role") or WorkspaceGroupMembership.ROLE_MEMBER).strip()
    if role not in {
        WorkspaceGroupMembership.ROLE_ADMIN,
        WorkspaceGroupMembership.ROLE_MAINTAINER,
        WorkspaceGroupMembership.ROLE_MEMBER,
    }:
        role = WorkspaceGroupMembership.ROLE_MEMBER
    WorkspaceGroupMembership.objects.update_or_create(
        group=group,
        user=candidate,
        defaults={"role": role},
    )
    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def remove_group_member(request, group_id, membership_id):
    group = get_object_or_404(WorkspaceGroup, id=group_id)
    if not _can_manage_group(group, request.user):
        return HttpResponseForbidden("Brak uprawnień do zarządzania grupą.")
    membership = get_object_or_404(WorkspaceGroupMembership, id=membership_id, group=group)
    if membership.role == WorkspaceGroupMembership.ROLE_OWNER:
        return HttpResponseBadRequest("Nie można usunąć właściciela grupy.")
    membership.delete()
    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def assign_sheet_to_group(request, group_id):
    group = get_object_or_404(WorkspaceGroup, id=group_id)
    if not _can_manage_group(group, request.user):
        return HttpResponseForbidden("Brak uprawnień do zarządzania grupą.")
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")
    sheet_id = payload.get("sheetId")
    if not sheet_id:
        return HttpResponseBadRequest("Brak sheetId.")
    sheet, access, error = _get_sheet_for_user(sheet_id, request.user)
    if error:
        return error
    GroupSheetAssignment.objects.get_or_create(group=group, sheet=sheet, defaults={"assigned_by": request.user})
    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def unassign_sheet_from_group(request, group_id):
    group = get_object_or_404(WorkspaceGroup, id=group_id)
    if not _can_manage_group(group, request.user):
        return HttpResponseForbidden("Brak uprawnień do zarządzania grupą.")
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidłowe dane JSON.")
    sheet_id = payload.get("sheetId")
    GroupSheetAssignment.objects.filter(group=group, sheet_id=sheet_id).delete()
    return JsonResponse({"status": "ok"})


@login_required
@require_POST
@csrf_exempt
def toggle_group_watch(request, group_id):
    group = get_object_or_404(WorkspaceGroup, id=group_id)
    membership = _group_membership_for_user(group, request.user)
    if not membership:
        return HttpResponseForbidden("Brak dostępu do grupy.")
    watch, created = GroupWatch.objects.get_or_create(group=group, user=request.user)
    if not created:
        watch.delete()
        return JsonResponse({"status": "ok", "watching": False})
    return JsonResponse({"status": "ok", "watching": True})


@login_required
@require_POST
@csrf_exempt
def install_addon(request, addon_id):
    addon = get_object_or_404(Addon, id=addon_id, status=Addon.STATUS_APPROVED)
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        payload = {}
    sheet = None
    sheet_id = payload.get("sheetId")
    if sheet_id:
        sheet, _, error = _get_sheet_for_user(sheet_id, request.user)
        if error:
            return error
    installation, created = AddonInstallation.objects.get_or_create(
        addon=addon,
        user=request.user,
        sheet=sheet,
        defaults={
            "enabled": True,
            "config_json": payload.get("config") if isinstance(payload.get("config"), dict) else {},
        },
    )
    if not created and isinstance(payload.get("config"), dict):
        installation.config_json = payload.get("config")
        installation.enabled = True
        installation.save(update_fields=["config_json", "enabled"])
    if created:
        addon.installation_count = (addon.installation_count or 0) + 1
        addon.save(update_fields=["installation_count"])
    return JsonResponse({"status": "ok", "created": created})


def _report_snapshot(report):
    return report.snapshot_json if isinstance(report.snapshot_json, dict) else {}


def _report_scope_label(report):
    if report.group_id:
        return f"Zespół: {report.group.name}"
    if report.organization_id:
        return f"Organizacja: {report.organization.name}"
    if report.sheet_id:
        return f"Arkusz: {report.sheet.name}"
    return "Raport prywatny"


def _report_preview_context(report):
    snapshot = _report_snapshot(report)
    kpis = snapshot.get("kpis") if isinstance(snapshot.get("kpis"), list) else []
    insights = snapshot.get("insights") if isinstance(snapshot.get("insights"), list) else []
    charts = snapshot.get("charts") if isinstance(snapshot.get("charts"), list) else []
    pivots = snapshot.get("pivots") if isinstance(snapshot.get("pivots"), list) else []
    return {
        "title": report.title,
        "description": report.description or "Bez opisu.",
        "report_type": report.get_report_type_display(),
        "visibility": report.get_visibility_display(),
        "scope_label": _report_scope_label(report),
        "sheet_name": report.sheet.name if report.sheet_id else "",
        "owner": report.owner.username,
        "kpis": [row for row in kpis if isinstance(row, dict) and row.get("label")],
        "insights": [row for row in insights if row],
        "executive_summary": (snapshot.get("executiveSummary") or "").strip(),
        "risk": (snapshot.get("risk") or "").strip(),
        "recommendation": (snapshot.get("recommendation") or "").strip(),
        "charts": [row for row in charts if isinstance(row, dict)],
        "pivots": [row for row in pivots if isinstance(row, dict)],
        "selection": snapshot.get("selection") if isinstance(snapshot.get("selection"), dict) else None,
        "updated_at": report.updated_at,
    }


def _report_preview_html(report, format_name="pdf"):
    ctx = _report_preview_context(report)
    kpi_html = "".join(
        f'<div class="kpi"><small>{html_escape(str(item.get("label") or ""))}</small><strong>{html_escape(str(item.get("value") or ""))}</strong></div>'
        for item in ctx["kpis"]
    ) or '<div class="empty">Brak KPI.</div>'
    insights_html = "".join(f"<li>{html_escape(str(item))}</li>" for item in ctx["insights"]) or "<li>Brak wniosków.</li>"
    chart_html = "".join(
        f"<li>{html_escape(str(item.get('title') or 'Wykres'))} <small>({html_escape(str(item.get('type') or 'chart'))}, {html_escape(str(item.get('rangeText') or 'brak zakresu'))})</small></li>"
        for item in ctx["charts"]
    ) or "<li>Brak wybranych wykresów.</li>"
    pivot_html = "".join(
        f"<li>{html_escape(str(item.get('title') or 'Tabela przestawna'))} <small>({html_escape(str(item.get('agg') or 'sum'))}, {html_escape(str(item.get('rangeText') or 'brak zakresu'))})</small></li>"
        for item in ctx["pivots"]
    ) or "<li>Brak wybranych tabel przestawnych.</li>"
    selection_html = ""
    if ctx["selection"]:
        selection_html = f"""
        <div class="card">
            <h2>Zakres roboczy</h2>
            <p>{html_escape(str(ctx['selection'].get('rangeText') or ''))}</p>
        </div>
        """
    return f"""<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>{html_escape(ctx['title'])}</title>
<style>
body{{margin:0;padding:32px;background:#0f1728;color:#f8fbff;font:16px/1.5 'Segoe UI',Arial,sans-serif}}
.shell{{max-width:1120px;margin:0 auto;display:grid;gap:18px}}
.hero,.card{{border-radius:24px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,rgba(31,44,70,.98),rgba(14,21,36,.98));padding:22px}}
.hero h1,.card h2,.hero strong{{color:#fff;margin:0}}
.meta{{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}}
.chip{{display:inline-flex;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.22);background:rgba(12,19,33,.96)}}
.kpis{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}}
.kpi{{border-radius:16px;border:1px solid rgba(148,163,184,.18);background:rgba(12,19,33,.92);padding:14px}}
.kpi strong{{display:block;margin-top:6px;font-size:1.4rem}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
.list{{margin:0;padding-left:18px}}
.muted{{color:#cfe0ff}}
.empty{{color:#cfe0ff}}
.top-actions{{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}}
.btn{{display:inline-flex;padding:10px 14px;border-radius:12px;border:1px solid rgba(148,163,184,.24);background:#5d8fff;color:#fff;text-decoration:none;font-weight:700}}
.btn-secondary{{background:rgba(255,255,255,.08)}}
@media(max-width:920px){{body{{padding:18px}}.grid{{grid-template-columns:1fr}}}}
</style>
</head>
<body>
<div class="shell">
    <section class="hero">
        <strong>Podgląd serwerowy {html_escape(format_name.upper())}</strong>
        <h1 style="margin-top:6px;">{html_escape(ctx['title'])}</h1>
        <p class="muted">{html_escape(ctx['description'])}</p>
        <div class="meta">
            <span class="chip">{html_escape(ctx['report_type'])}</span>
            <span class="chip">{html_escape(ctx['visibility'])}</span>
            <span class="chip">{html_escape(ctx['scope_label'])}</span>
            <span class="chip">Autor: {html_escape(ctx['owner'])}</span>
        </div>
        <div class="top-actions">
            <a class="btn" href="/ares/api/reports/user/{report.id}/export/?format={html_escape(format_name)}">Pobierz {html_escape(format_name.upper())}</a>
            <a class="btn btn-secondary" href="/reports/">Wróć do raportów</a>
        </div>
    </section>
    <section class="card">
        <h2>KPI</h2>
        <div class="kpis">{kpi_html}</div>
    </section>
    <section class="grid">
        <div class="card">
            <h2>Executive summary</h2>
            <p>{html_escape(ctx['executive_summary'] or 'Brak sekcji executive summary.')}</p>
        </div>
        <div class="card">
            <h2>Wnioski</h2>
            <ul class="list">{insights_html}</ul>
        </div>
        <div class="card">
            <h2>Risk</h2>
            <p>{html_escape(ctx['risk'] or 'Brak sekcji risk.')}</p>
        </div>
        <div class="card">
            <h2>Rekomendacja</h2>
            <p>{html_escape(ctx['recommendation'] or 'Brak sekcji rekomendacji.')}</p>
        </div>
    </section>
    {selection_html}
    <section class="grid">
        <div class="card">
            <h2>Wybrane wykresy</h2>
            <ul class="list">{chart_html}</ul>
        </div>
        <div class="card">
            <h2>Wybrane tabele przestawne</h2>
            <ul class="list">{pivot_html}</ul>
        </div>
    </section>
</div>
</body>
</html>"""


def _ascii_report_text(value):
    return unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode("ascii")


def _build_report_pdf_bytes(report):
    ctx = _report_preview_context(report)
    text_lines = [
        ctx["title"],
        "",
        ctx["description"],
        "",
        f"Type: {ctx['report_type']}",
        f"Visibility: {ctx['visibility']}",
        f"Scope: {ctx['scope_label']}",
        "",
        "Executive summary",
        ctx["executive_summary"] or "No executive summary.",
        "",
        "KPI",
    ]
    if ctx["kpis"]:
        text_lines.extend([f"- {item.get('label')}: {item.get('value')}" for item in ctx["kpis"]])
    else:
        text_lines.append("- No KPI")
    text_lines.extend(["", "Insights"])
    if ctx["insights"]:
        text_lines.extend([f"- {item}" for item in ctx["insights"]])
    else:
        text_lines.append("- No insights")
    text_lines.extend(["", "Risk", ctx["risk"] or "No risk section.", "", "Recommendation", ctx["recommendation"] or "No recommendation section."])

    def pdf_escape(text):
        return _ascii_report_text(text).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    stream_lines = ["BT", "/F1 18 Tf", "50 790 Td", f"({pdf_escape(text_lines[0])}) Tj", "/F1 11 Tf"]
    first = True
    for line in text_lines[1:]:
        if first:
            stream_lines.append("0 -26 Td")
            first = False
        else:
            stream_lines.append("0 -16 Td")
        stream_lines.append(f"({pdf_escape(line)}) Tj")
    stream_lines.append("ET")
    stream = "\n".join(stream_lines).encode("latin-1", "ignore")
    objects = [
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
        f"4 0 obj << /Length {len(stream)} >> stream\n".encode("latin-1") + stream + b"\nendstream endobj",
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    ]
    buffer = io.BytesIO()
    buffer.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for obj in objects:
        offsets.append(buffer.tell())
        buffer.write(obj + b"\n")
    xref_pos = buffer.tell()
    buffer.write(f"xref\n0 {len(offsets)}\n".encode("latin-1"))
    buffer.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        buffer.write(f"{offset:010d} 00000 n \n".encode("latin-1"))
    buffer.write(f"trailer << /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF".encode("latin-1"))
    return buffer.getvalue()


def _xml_escape(value):
    return (
        str(value or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _build_report_docx_bytes(report):
    ctx = _report_preview_context(report)
    paragraphs = [
        ctx["title"],
        ctx["description"],
        f"Typ: {ctx['report_type']}",
        f"Widoczność: {ctx['visibility']}",
        f"Zakres: {ctx['scope_label']}",
        "",
        "Executive summary",
        ctx["executive_summary"] or "Brak sekcji executive summary.",
        "",
        "KPI",
    ]
    if ctx["kpis"]:
        paragraphs.extend([f"{item.get('label')}: {item.get('value')}" for item in ctx["kpis"]])
    else:
        paragraphs.append("Brak KPI.")
    paragraphs.extend(["", "Wnioski"])
    if ctx["insights"]:
        paragraphs.extend([f"- {item}" for item in ctx["insights"]])
    else:
        paragraphs.append("Brak wniosków.")
    paragraphs.extend(["", "Risk", ctx["risk"] or "Brak sekcji risk.", "", "Rekomendacja", ctx["recommendation"] or "Brak sekcji rekomendacji.", "", "Wybrane wykresy"])
    if ctx["charts"]:
        paragraphs.extend([f"- {item.get('title') or 'Wykres'} ({item.get('type') or 'chart'}, {item.get('rangeText') or 'brak zakresu'})" for item in ctx["charts"]])
    else:
        paragraphs.append("Brak wybranych wykresów.")
    paragraphs.extend(["", "Wybrane tabele przestawne"])
    if ctx["pivots"]:
        paragraphs.extend([f"- {item.get('title') or 'Tabela przestawna'} ({item.get('agg') or 'sum'}, {item.get('rangeText') or 'brak zakresu'})" for item in ctx["pivots"]])
    else:
        paragraphs.append("Brak wybranych tabel przestawnych.")

    document_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14"><w:body>""" + "".join(
        f"<w:p><w:r><w:t xml:space=\"preserve\">{_xml_escape(text)}</w:t></w:r></w:p>"
        for text in paragraphs
    ) + """<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>"""
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""
    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>"""
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", content_types)
        docx.writestr("_rels/.rels", rels)
        docx.writestr("word/document.xml", document_xml)
        docx.writestr("word/_rels/document.xml.rels", doc_rels)
    return buffer.getvalue()


@login_required
@require_GET
def user_report_preview(request, report_id):
    report = get_object_or_404(UserReport, id=report_id, owner=request.user)
    format_name = (request.GET.get("format") or "pdf").lower()
    if format_name not in {"pdf", "docx"}:
        return HttpResponseBadRequest("Nieobslugiwany format podgladu.")
    return HttpResponse(_report_preview_html(report, format_name), content_type="text/html; charset=utf-8")


@login_required
@require_GET
def export_user_report(request, report_id):
    report = get_object_or_404(UserReport, id=report_id, owner=request.user)
    format_name = (request.GET.get("format") or "pdf").lower()
    safe_name = slugify(report.title) or f"report-{report.id}"
    if format_name == "pdf":
        response = HttpResponse(_build_report_pdf_bytes(report), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{safe_name}.pdf"'
        return response
    if format_name == "docx":
        response = HttpResponse(
            _build_report_docx_bytes(report),
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        response["Content-Disposition"] = f'attachment; filename="{safe_name}.docx"'
        return response
    return HttpResponseBadRequest("Nieobslugiwany format eksportu.")


@login_required
@require_GET
def user_reports_list(request):
    reports = UserReport.objects.filter(owner=request.user).select_related('sheet', 'group', 'organization')
    return JsonResponse({"reports": [report.to_payload() for report in reports]})


@login_required
@require_POST
@csrf_exempt
def create_user_report(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidlowe dane JSON.")
    title = (payload.get("title") or "").strip()
    if not title:
        return HttpResponseBadRequest("Tytul raportu jest wymagany.")
    sheet = None
    group = None
    organization = None
    sheet_id = payload.get("sheetId")
    if sheet_id:
        sheet, _, error = _get_sheet_for_user(sheet_id, request.user)
        if error:
            return error
    group_id = payload.get("groupId")
    if group_id:
        group = WorkspaceGroup.objects.filter(id=group_id).first()
    organization_id = payload.get("organizationId")
    if organization_id:
        organization = WorkspaceOrganization.objects.filter(id=organization_id).first()
    report_type = payload.get("reportType") or UserReport.TYPE_ANALYTICAL
    if report_type not in dict(UserReport.TYPE_CHOICES):
        report_type = UserReport.TYPE_ANALYTICAL
    visibility = payload.get("visibility") or UserReport.VISIBILITY_PRIVATE
    if visibility not in dict(UserReport.VISIBILITY_CHOICES):
        visibility = UserReport.VISIBILITY_PRIVATE
    report = UserReport.objects.create(
        owner=request.user,
        sheet=sheet,
        group=group,
        organization=organization,
        title=title,
        description=(payload.get("description") or "").strip(),
        report_type=report_type,
        visibility=visibility,
        config_json=payload.get("config") if isinstance(payload.get("config"), dict) else {},
        snapshot_json=payload.get("snapshot") if isinstance(payload.get("snapshot"), dict) else {},
    )
    return JsonResponse({"status": "ok", "report": report.to_payload()})


@login_required
@require_POST
@csrf_exempt
def update_user_report(request, report_id):
    report = get_object_or_404(UserReport, id=report_id, owner=request.user)
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponseBadRequest("Nieprawidlowe dane JSON.")
    if "title" in payload:
        report.title = (payload.get("title") or report.title).strip()
    if "description" in payload:
        report.description = (payload.get("description") or report.description).strip()
    if "reportType" in payload and payload.get("reportType") in dict(UserReport.TYPE_CHOICES):
        report.report_type = payload.get("reportType")
    if "visibility" in payload and payload.get("visibility") in dict(UserReport.VISIBILITY_CHOICES):
        report.visibility = payload.get("visibility")
    if isinstance(payload.get("config"), dict):
        report.config_json = payload.get("config")
    if isinstance(payload.get("snapshot"), dict):
        report.snapshot_json = payload.get("snapshot")
    report.save()
    return JsonResponse({"status": "ok", "report": report.to_payload()})


@login_required
@require_POST
@csrf_exempt
def delete_user_report(request, report_id):
    report = get_object_or_404(UserReport, id=report_id, owner=request.user)
    report.delete()
    return JsonResponse({"status": "ok"})


@login_required
@require_GET
def approved_addons_list(request):
    addons = (
        Addon.objects
        .filter(status=Addon.STATUS_APPROVED)
        .select_related('author')
        .order_by('-reviewed_at', '-created_at')[:100]
    )
    installed_pairs = set(
        AddonInstallation.objects.filter(user=request.user).values_list('addon_id', 'sheet_id')
    )
    sheet_filter = request.GET.get("sheet")
    sheet_filter = int(sheet_filter) if sheet_filter and str(sheet_filter).isdigit() else None
    payload = []
    for addon in addons:
        item = addon.to_public_payload()
        item["installed"] = (addon.id, sheet_filter) in installed_pairs or (addon.id, None) in installed_pairs
        payload.append(item)
    return JsonResponse({
        "addons": payload,
    })
