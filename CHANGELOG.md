# Changelog

## [v0.1.0] - 2026-03-31

### Dodano
- Rejestrację użytkowników.
- Logowanie i wylogowanie.
- Weryfikację konta przez e-mail.
- Panel aplikacji dostępny po zalogowaniu.
- Moduł arkuszy.
- Możliwość tworzenia nowych arkuszy.
- Listę zapisanych arkuszy.
- Otwieranie arkusza w osobnym edytorze.
- Edytor arkusza w stylu arkusza kalkulacyjnego.
- Numerację wierszy i oznaczenia kolumn.
- Obsługę aktywnej komórki i zaznaczania zakresów.
- Pasek formuł.
- Import CSV.
- Eksport CSV.
- Zmianę nazwy arkusza.
- Dodawanie wierszy i kolumn.
- Historię działań użytkownika.

### Funkcje arkusza
- SUMA
- ŚREDNIA
- MEDIANA
- MINIMUM
- MAXIMUM
- ZLICZ
- ODCHYLENIE
- WARIANCJA
- STANDARYZACJA dla zaznaczonego zakresu

### Technicznie
- Projekt oparty o Django.
- Część logiki arkusza działa po stronie przeglądarki z użyciem JavaScript i localStorage.
- Przygotowana struktura aplikacji pod dalszy rozwój trwałego zapisu danych.

### Ograniczenia wersji
- Dane arkuszy nie są jeszcze w pełni przypisane do użytkownika w bazie danych.
- Historia działa lokalnie w przeglądarce.
- Arkusze nie są jeszcze w pełni utrwalane w SQLite / modelach Django.
- Przeniesienie projektu na inne urządzenie nie zachowuje pełnej ciągłości danych bez dalszej migracji logiki.

### Porządki repozytorium
- Usunięto z repozytorium pliki `data.json` i `db.sqlite3`.
- Dodano ignorowanie plików lokalnych i roboczych.
