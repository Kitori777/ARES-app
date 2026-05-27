import json
from uuid import uuid4
from django.utils.text import slugify

from django.contrib.auth.models import User

from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import (
    Addon,
    Sheet,
    HistoryEntry,
    SheetShare,
    SheetChatMessage,
    FriendLink,
    WorkspaceGroup,
    WorkspaceGroupMembership,
    GroupSheetAssignment,
    GroupWatch,
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


def _group_membership_for_user(group, user):
    return WorkspaceGroupMembership.objects.filter(group=group, user=user).first()


def _can_manage_group(group, user):
    membership = _group_membership_for_user(group, user)
    if not membership:
        return False
    return membership.role in {WorkspaceGroupMembership.ROLE_OWNER, WorkspaceGroupMembership.ROLE_ADMIN}


def _group_payload(group, user):
    memberships = WorkspaceGroupMembership.objects.filter(group=group).select_related('user').order_by('created_at')
    assignments = GroupSheetAssignment.objects.filter(group=group).select_related('sheet').order_by('-created_at')
    watched = GroupWatch.objects.filter(group=group, user=user).exists()
    my_membership = next((m for m in memberships if m.user_id == user.id), None)
    return {
        "id": group.id,
        "name": group.name,
        "slug": group.slug,
        "description": group.description,
        "role": my_membership.role if my_membership else "",
        "canManage": bool(my_membership and my_membership.role in {WorkspaceGroupMembership.ROLE_OWNER, WorkspaceGroupMembership.ROLE_ADMIN}),
        "watching": watched,
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
    groups = WorkspaceGroup.objects.filter(id__in=group_ids)
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
        "groups": [_group_payload(group, request.user) for group in groups],
    })


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
    if not name:
        return HttpResponseBadRequest("Nazwa grupy jest wymagana.")
    base_slug = slugify(name)[:170] or "grupa"
    slug = base_slug
    while WorkspaceGroup.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{uuid4().hex[:6]}"
    group = WorkspaceGroup.objects.create(name=name, description=description, slug=slug, owner=request.user)
    WorkspaceGroupMembership.objects.create(group=group, user=request.user, role=WorkspaceGroupMembership.ROLE_OWNER)
    return JsonResponse({"status": "ok", "groupId": group.id})


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
    if role not in {WorkspaceGroupMembership.ROLE_ADMIN, WorkspaceGroupMembership.ROLE_MEMBER}:
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
@require_GET
def approved_addons_list(request):
    addons = (
        Addon.objects
        .filter(status=Addon.STATUS_APPROVED)
        .select_related('author')
        .order_by('-reviewed_at', '-created_at')[:100]
    )
    return JsonResponse({
        "addons": [addon.to_public_payload() for addon in addons],
    })
