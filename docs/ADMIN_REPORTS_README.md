# ARES — zgłoszenia błędów i konto administratora

Dodano prosty system zgłoszeń błędów / sugestii.

## Widoki

- `/feedback/` — formularz zgłoszenia problemu przez użytkownika.
- `/admin/reports/` — panel administratora do odczytu i obsługi zgłoszeń.
- `/admin/` — standardowy panel Django, konto poniżej ma też dostęp do panelu Django.

## Konto przykładowe administratora

Migracja `users/migrations/0007_demo_admin.py` tworzy konto.

To konto jest przeznaczone do demonstracji projektu. Przed użyciem produkcyjnym należy zmienić hasło albo usunąć tę migrację i utworzyć administratora ręcznie:

```bash
uv run python manage.py createsuperuser
```

## Po wdrożeniu

```bash
uv run python manage.py migrate
```

Następnie zaloguj się na `ares_admin` i wejdź w `/admin/reports/`.


## Poprawka v15.2

Panel zgłoszeń nie jest już dostępny pod `/admin/reports/`, ponieważ `/admin/` jest zajęte przez standardowy panel Django Admin.

Aktualne adresy:

- formularz użytkownika: `/feedback/`
- panel obsługi zgłoszeń ARES: `/admin-reports/`
- standardowy Django Admin: `/admin/`
- zgłoszenia w Django Admin: `/admin/users/bugreport/`

Panel `/admin-reports/` jest widoczny tylko dla kont `is_staff` albo `is_superuser`.


## Poprawka v15.3 — dostęp tylko dla superadmina

- `/admin-reports/` jest dostępne wyłącznie dla `is_superuser`.
- Link „Panel zgłoszeń” nie pokazuje się zwykłym użytkownikom ani zwykłym kontom staff.
- Dodano `/admin-users/` — prosty panel superadmina do zarządzania kontami użytkowników.
- Standardowy Django Admin nadal działa pod `/admin/`.
- W panelu zgłoszeń nie pokazujemy już hasła przykładowego admina zwykłym użytkownikom.

Ważne: konto, które ma widzieć panel zgłoszeń i panel użytkowników, musi mieć `is_superuser=True`.
