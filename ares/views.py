import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import Sheet, HistoryEntry


def _default_grid(rows=20, cols=8):
    return [["" for _ in range(cols)] for _ in range(rows)]


@login_required
@require_GET
def sheets_list(request):
    sheets = Sheet.objects.filter(user=request.user)
    data = []
    for index, sheet in enumerate(sheets, start=1):
        data.append({
            "id": sheet.id,
            "order": index,
            "name": sheet.name,
            "category": sheet.category,
            "grid": sheet.get_grid(),
            "createdAt": sheet.created_at.isoformat(),
            "updatedAt": sheet.updated_at.isoformat(),
        })
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
        "grid": sheet.get_grid(),
        "createdAt": sheet.created_at.isoformat(),
        "updatedAt": sheet.updated_at.isoformat(),
    })


@login_required
@require_GET
def sheet_detail(request, sheet_id):
    sheet = get_object_or_404(Sheet, id=sheet_id, user=request.user)
    return JsonResponse({
        "id": sheet.id,
        "name": sheet.name,
        "category": sheet.category,
        "grid": sheet.get_grid(),
        "createdAt": sheet.created_at.isoformat(),
        "updatedAt": sheet.updated_at.isoformat(),
    })


@login_required
@require_POST
@csrf_exempt
def save_sheet(request, sheet_id):
    sheet = get_object_or_404(Sheet, id=sheet_id, user=request.user)

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
    sheet = get_object_or_404(Sheet, id=sheet_id, user=request.user)
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
        sheet = Sheet.objects.filter(id=sheet_id, user=request.user).first()

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
