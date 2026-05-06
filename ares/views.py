import json

from django.contrib.auth.models import User

from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Sheet, HistoryEntry, SheetShare, SheetChatMessage


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

    if "name" in payload:
        sheet.name = (payload.get("name") or sheet.name).strip()

    if "category" in payload:
        sheet.category = (payload.get("category") or sheet.category).strip()

    if "grid" in payload:
        sheet.set_grid(payload.get("grid") or sheet.get_grid())

    sheet.save()

    entry = HistoryEntry(
        user=request.user,
        sheet=sheet,
        action=payload.get("action", "Zapisano arkusz"),
    )
    entry.set_details({
        "sheetName": sheet.name,
        "type": "save_sheet",
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
