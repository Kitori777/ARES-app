# ARES — udostępnianie arkuszy

Dodano mechanizm udostępniania arkuszy innym użytkownikom po e-mailu albo loginie.

## Jak działa

1. Właściciel arkusza wchodzi w widok `Arkusze`.
2. Przy swoim arkuszu klika `Udostępnij`.
3. Wpisuje e-mail lub login użytkownika, który ma już konto w ARES.
4. Wybiera poziom dostępu:
   - `Tylko podgląd` (`view`) — użytkownik może otworzyć arkusz, ale nie zapisze zmian.
   - `Może edytować` (`edit`) — użytkownik może otworzyć i zapisywać zmiany.
5. Właściciel może później zmienić poziom dostępu albo usunąć dostęp.

## Endpointy

- `GET /ares/api/sheets/<sheet_id>/shares/`
- `POST /ares/api/sheets/<sheet_id>/shares/add/`
- `POST /ares/api/sheets/<sheet_id>/shares/<share_id>/update/`
- `POST /ares/api/sheets/<sheet_id>/shares/<share_id>/delete/`

## Render

Po wrzuceniu na Render uruchom migracje:

```bash
uv run python manage.py migrate
```

Mechanizm korzysta z normalnej bazy PostgreSQL ustawionej w `DATABASE_URL`.
Nie wymaga dodatkowego serwera ani zewnętrznego API.

## Django Admin

Superadmin może zarządzać udostępnieniami także w panelu:

- `/admin/ares/sheetshare/`
- `/admin/ares/sheet/`
