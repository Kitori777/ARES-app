# ARES — dokumentacja techniczna (1.0.0)

Ten plik opisuje aktualny stan aplikacji po wydaniu `1.0.0` i wskazuje najważniejsze moduły, testy oraz pliki dokumentacji.

## 1. Zakres aplikacji

ARES to webowy system arkuszy kalkulacyjnych (Django + JS) z modułami:

- autoryzacja (rejestracja, logowanie, weryfikacja e-mail),
- reset hasła (`/password/forgot/`, `/password/reset/`),
- arkusze i edytor komórek,
- historia zmian + przywracanie wersji,
- raporty aktywności (z eksportem PDF),
- dodatki i lokalne skrypty arkusza,
- globalna współpraca (znajomi, grupy, przypisania arkuszy),
- profil użytkownika (motyw, avatar, skróty, preferencje),
- helpdesk i zgłoszenia błędów.

## 2. Najważniejsze adresy

- `GET /dashboard/` — start aplikacji po zalogowaniu
- `GET /worksheets/` — lista arkuszy
- `GET /worksheets/editor/?sheet=<id>` — edytor
- `GET /history/` — historia
- `GET /reports/` — raporty
- `GET /network/` — moduł zespołu (globalnie)
- `GET /addons/` — marketplace dodatków
- `GET /profile/` — profil
- `GET /helpdesk/` — pomoc

## 3. API (kluczowe)

### Arkusze
- `GET /ares/api/sheets/`
- `GET /ares/api/sheets/<id>/`
- `POST /ares/api/sheets/create/`
- `POST /ares/api/sheets/<id>/save/`
- `POST /ares/api/sheets/<id>/delete/`

### Historia
- `GET /ares/api/history/`
- `POST /ares/api/history/add/`
- `POST /ares/api/history/<entry_id>/restore/`

### Zespół (globalny)
- `GET /ares/api/network/summary/`
- `POST /ares/api/network/friends/add/`
- `POST /ares/api/network/friends/<link_id>/remove/`
- `POST /ares/api/network/groups/create/`
- `POST /ares/api/network/groups/<group_id>/members/add/`
- `POST /ares/api/network/groups/<group_id>/members/<membership_id>/remove/`
- `POST /ares/api/network/groups/<group_id>/assign-sheet/`
- `POST /ares/api/network/groups/<group_id>/unassign-sheet/`
- `POST /ares/api/network/groups/<group_id>/watch/toggle/`

## 4. Stabilność i wydajność (1.0.0)

W edytorze dodano:

- **safe boot** inicjalizacji UI (pojedynczy błąd panelu nie blokuje ładowania arkusza),
- bezpieczny parser danych z `localStorage` (uszkodzone wpisy nie crashują aplikacji),
- poprawki layoutu nawigacji i sidebara.

## 5. Testy (pytest)

W repo jest folder `tests/` z testami walidacyjnymi:

- `tests/test_views_helpers.py` — helpery widoków API arkusza/historii.
- `tests/test_models_core.py` — walidacja metod modeli (serializacja JSON, payload, stany).

Uruchomienie:

```bash
pip install -e ".[dev]"
python -m pytest -q
```

## 6. Powiązane dokumenty

- `docs/CHANGELOG.md` — historia zmian i wydania
- `docs/ADMIN_REPORTS_README.md` — panel zgłoszeń
- `docs/SHEET_SHARING_README.md` — udostępnianie arkuszy

## 7. Po wdrożeniu zmian

```bash
python manage.py migrate
python manage.py check
```

Następnie wykonaj twarde odświeżenie w przeglądarce:

```text
Ctrl + F5
```

