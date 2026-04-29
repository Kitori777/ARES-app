# ARES — internetowy arkusz kalkulacyjny

## Opis projektu

**ARES** to aplikacja webowa inspirowana działaniem arkuszy kalkulacyjnych takich jak Excel i Google Sheets. System ma umożliwiać użytkownikowi pracę na arkuszach bez instalowania dodatkowego oprogramowania — bezpośrednio z poziomu przeglądarki.

Projekt został zbudowany w **Django** i obecnie łączy:
- rejestrację oraz logowanie użytkownika,
- weryfikację konta przez e-mail,
- panel aplikacji po zalogowaniu,
- moduł arkuszy,
- edytor arkusza z prostymi funkcjami matematycznymi i agregacyjnymi,
- import CSV,
- eksport CSV,
- historię działań użytkownika.

---

## Na czym polega problem

Główny problem projektowy polega na zbudowaniu **uproszczonego internetowego arkusza kalkulacyjnego**, który działa podobnie do znanych narzędzi biurowych, ale w wersji webowej i edukacyjnej.

Użytkownik powinien mieć możliwość:
- założenia konta i zalogowania się do systemu,
- tworzenia własnych arkuszy,
- otwierania wcześniej zapisanych arkuszy,
- edytowania danych w komórkach,
- zaznaczania komórek i zakresów,
- wykonywania podstawowych działań matematycznych oraz agregacyjnych,
- importowania danych z plików CSV,
- eksportowania arkuszy,
- przeglądania historii własnych działań.

### Problem funkcjonalny

Najważniejszym wyzwaniem jest odtworzenie zachowania znanego z arkuszy kalkulacyjnych w przeglądarce, w tym:
- rozdzielenie **komórki aktywnej** od **zakresu zaznaczenia**,
- poprawne działanie formuł takich jak `=SUMA(A1:A10)`,
- obsługa funkcji uruchamianych na zaznaczonym zakresie, np. **standaryzacji**, 
- zachowanie układu arkusza z numeracją wierszy `1,2,3...` oraz kolumnami `A,B,C...`,
- zapis zmian i odtwarzanie danych po ponownym wejściu do aplikacji.

### Problem techniczny

Na obecnym etapie część danych działa jeszcze po stronie przeglądarki, a nie w pełni po stronie serwera. Oznacza to, że aktualna wersja projektu korzysta z:
- **Django** — dla logowania, routingu i widoków,
- **JavaScript + localStorage** — dla działania arkuszy, historii i części logiki edytora.

To rozwiązanie pozwala uruchomić działającą wersję demonstracyjną, ale ma ograniczenia:
- dane nie są jeszcze w pełni przypisane do użytkownika w bazie,
- historia działa lokalnie w danej przeglądarce,
- arkusze nie są jeszcze trwale przechowywane w modelach Django / SQLite,
- przeniesienie projektu na inne urządzenie nie daje dostępu do tych samych arkuszy bez migracji logiki do bazy danych.

---

## Aktualny stan projektu

Obecnie aplikacja ARES realizuje następujące elementy:

### 1. Autoryzacja użytkownika
- rejestracja użytkownika,
- logowanie,
- wylogowanie,
- weryfikacja adresu e-mail kodem,
- przypisanie arkuszy i danych do zalogowanego użytkownika.

### 2. Panel główny ARES
- strona startowa po zalogowaniu,
- czytelny dashboard aplikacji,
- boczne menu nawigacyjne,
- możliwość zwijania bocznego menu,
- szybkie przejścia do najważniejszych modułów:
  - arkusze,
  - import danych,
  - historia zmian,
  - raporty,
  - profil użytkownika,
- dolny pasek szybkiego dostępu,
- widok ostatnich zmian / changeloga,
- podstawowe informacje o aktywnym użytkowniku i module.

### 3. Profil użytkownika i wygląd aplikacji
- profil użytkownika dostępny z górnego paska,
- możliwość ustawienia nazwy wyświetlanej,
- kreator awatara użytkownika,
- wybór koloru awatara,
- wybór kształtu awatara,
- szybkie symbole awatara,
- możliwość wgrania własnego obrazka profilowego,
- motywy kolorystyczne aplikacji,
- wybór wariantu kolorystyki interfejsu,
- zapisywanie ustawień wyglądu w `localStorage`,
- zastosowanie motywu w głównych modułach aplikacji.

### 4. Moduł arkuszy
- tworzenie nowych arkuszy,
- nazwa arkusza,
- kategoria arkusza,
- prezentacja rozmiaru arkusza w MB,
- lista zapisanych arkuszy,
- otwieranie arkusza w osobnym edytorze,
- usuwanie arkuszy,
- oznaczanie arkuszy jako ulubione,
- sortowanie arkuszy tak, aby ulubione były wyświetlane wyżej,
- podsumowanie liczby arkuszy i liczby arkuszy ulubionych.

### 5. Edytor arkusza
- siatka w stylu arkusza kalkulacyjnego,
- wiersze numerowane `1-n`,
- kolumny oznaczone `A, B, C, D...`,
- aktywna komórka,
- zaznaczanie zakresów,
- pasek formuł,
- ręczne wpisywanie wartości i formuł,
- trwały zapis arkusza,
- autozapis zmian,
- ładowanie arkusza po parametrze `?sheet=ID`,
- obsługa wielu zakładek w jednym arkuszu,
- dodawanie nowych zakładek,
- zmiana nazwy zakładki,
- duplikowanie zakładki,
- przenoszenie zakładek,
- ustawianie koloru zakładki,
- import CSV,
- eksport CSV,
- dodawanie wierszy i kolumn,
- usuwanie wierszy i kolumn,
- podstawowe formatowanie komórek,
- wybór koloru tekstu i tła,
- obramowania komórek,
- cofanie i ponawianie zmian,
- komentarze i notatki do komórek,
- menu kontekstowe po kliknięciu prawym przyciskiem myszy na komórkę.

### 6. Menu kontekstowe komórek
- wytnij,
- kopiuj,
- wklej,
- wklej specjalnie,
- wstaw wiersz powyżej,
- wstaw kolumnę po lewej,
- wstaw komórki,
- usuń wiersz,
- usuń kolumnę,
- usuń komórki,
- utwórz wykres,
- wstaw link,
- komentarz,
- wstaw notatkę,
- otwarcie solvera.

### 7. Funkcje arkusza i podpowiedzi
- podpowiedzi składni funkcji podczas wpisywania formuł,
- opisy działania funkcji,
- walidacja części formuł,
- obsługa blokowania odwołań przez `$`, podobnie jak w arkuszach kalkulacyjnych,
- kopiowanie formuł z dostosowaniem odwołań,
- funkcje podstawowe:
  - `SUMA`,
  - `ŚREDNIA`,
  - `MEDIANA`,
  - `MINIMUM`,
  - `MAXIMUM`,
  - `ZLICZ`,
  - `ODCHYLENIE`,
  - `WARIANCJA`,
  - `STANDARYZACJA`,
- funkcje finansowe i analityczne przygotowane do dalszej rozbudowy,
- funkcje akademickie przygotowane pod matematykę, statystykę, optymalizację i badania operacyjne.

### 8. Tabele, szablony i analiza danych
- zakładka z gotowymi tabelami,
- szablony tabel do szybkiego użycia,
- przykładowe tabele pod:
  - matematykę finansową,
  - zwykłą matematykę,
  - statystykę,
  - solver,
  - analizę danych,
- wstawianie gotowych struktur tabel do arkusza,
- podstawowa obsługa tabel przestawnych,
- panel tabeli przestawnej wzorowany na arkuszach kalkulacyjnych,
- możliwość wyboru pól do analizy,
- przygotowanie pod łączenie danych z wielu arkuszy.

### 9. Wykresy
- moduł tworzenia wykresów z danych arkusza,
- większy wybór typów wykresów,
- możliwość konfiguracji danych wejściowych,
- podstawowa edycja wyglądu wykresów,
- przygotowanie pod dalszą rozbudowę wykresów analitycznych.

### 10. Solver
- panel solvera wzorowany na dodatkach typu OpenSolver,
- wybór arkusza,
- wybór komórki celu,
- wybór komórek zmiennych,
- definiowanie ograniczeń,
- tryby optymalizacji:
  - minimalizacja,
  - maksymalizacja,
  - wartość docelowa,
- ustawianie zakresu przeszukiwania:
  - minimum,
  - maksimum,
  - krok,
- opcja ograniczenia zmiennych do wartości nieujemnych,
- czytelne podsumowanie konfiguracji solvera,
- przyciski pomocnicze:
  - bieżący arkusz,
  - pobierz z aktywnej komórki,
  - zakres zaznaczenia,
  - wyczyść.

### 11. Import i eksport danych
- import danych CSV,
- import danych do istniejącego arkusza,
- tworzenie nowego arkusza z importowanego pliku,
- podgląd danych przed importem,
- eksport arkusza do CSV,
- przygotowanie pod import XLSX,
- przygotowanie pod scalanie danych z wielu arkuszy według kolumn.

### 12. Historia zmian
- wejście do modułów,
- utworzenie arkusza,
- usunięcie arkusza,
- import CSV,
- eksport CSV,
- zapis arkusza,
- edycja komórki,
- wpisywanie formuł,
- zmiany formatowania,
- użycie solvera,
- utworzenie tabeli przestawnej,
- wstawienie gotowego szablonu tabeli,
- cofanie i ponawianie zmian,
- filtrowanie historii po:
  - arkuszu,
  - typie akcji,
  - zakresie czasu,
- wykresy aktywności w historii zmian.

### 13. Raporty
- raport aktywności użytkownika,
- liczba arkuszy,
- liczba wszystkich akcji,
- aktywność dzienna,
- aktywność z ostatnich 30 dni,
- najczęściej używany arkusz,
- najczęstszy typ akcji,
- liczba edycji komórek,
- liczba użytych formuł,
- liczba użyć solvera,
- wykres aktywności z ostatnich 7 dni,
- wykres aktywności tygodniowej z ostatnich 30 dni,
- zestawienia top arkuszy,
- zestawienia typów działań.

---

## Obecna struktura projektu

Poniżej znajduje się uproszczona struktura aktualnego projektu ARES po zmianach funkcjonalnych i wizualnych:

```text
ARES-main/
├── manage.py
├── pyproject.toml
├── uv.lock
├── README.md
├── CHANGELOG.md
├── db.sqlite3
├── data.json
├── .gitignore
│
├── ares/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── urls.py
│   ├── views.py
│   └── migrations/
│       ├── __init__.py
│       └── 0001_initial.py
│
├── ares.egg-info/
│   ├── PKG-INFO
│   ├── SOURCES.txt
│   ├── dependency_links.txt
│   ├── requires.txt
│   └── top_level.txt
│
├── projekt_baza/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── users/
│   ├── __init__.py
│   ├── forms.py
│   ├── models.py
│   ├── settings.py
│   ├── urls.py
│   ├── views.py
│   └── migrations/
│       ├── __init__.py
│       └── 0001_initial.py
│
├── templates/
│   ├── app_home.html
│   ├── base.html
│   ├── dashboard.html
│   ├── history.html
│   ├── import_data.html
│   ├── index.html
│   ├── login.html
│   ├── profile.html
│   ├── register.html
│   ├── reports.html
│   ├── verify_email.html
│   ├── worksheet_editor.html
│   └── worksheets.html
│
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── worksheet_editor.css
│   ├── img/
│   │   └── ares-logo.svg
│   └── js/
│       ├── ares_api.js
│       ├── ares_sheet.js
│       ├── ares_storage.js
│       ├── formula_catalog.js
│       ├── formula_engine.js
│       ├── history_page.js
│       ├── import_data.js
│       ├── worksheet_editor.js
│       └── worksheets_page.js

```

---

## Kluczowe pliki projektu

### Backend / Django
- `projekt_baza/settings.py` — konfiguracja projektu,
- `projekt_baza/urls.py` — główne ścieżki URL,
- `users/views.py` — logowanie, rejestracja, dashboard, widoki aplikacji,
- `users/urls.py` — routing modułów użytkownika.

### Frontend / szablony
- `templates/base.html` — główny układ aplikacji,
- `templates/dashboard.html` — panel główny po zalogowaniu,
- `templates/worksheets.html` — lista arkuszy,
- `templates/worksheet_editor.html` — główny ekran edycji arkusza,
- `templates/import_data.html` — import danych,
- `templates/history.html` — historia aktywności.

### JavaScript
- `static/js/ares_storage.js` — wspólna logika przechowywania danych i historii,
- `static/js/worksheets_page.js` — obsługa listy arkuszy,
- `static/js/worksheet_editor.js` — logika edytora,
- `static/js/import_data.js` — import CSV,
- `static/js/history_page.js` — render historii.

---

## Główne ograniczenia obecnej wersji

1. **localStorage zamiast pełnej bazy danych dla arkuszy**  
   Arkusze i historia działań nie są jeszcze zapisywane jako modele Django.

2. **Brak synchronizacji między urządzeniami**  
   Dane lokalne są związane z konkretną przeglądarką.

3. **Brak pełnego silnika formuł jak w Excelu**  
   Dostępny jest uproszczony zestaw funkcji.

4. **Import XLSX nie został jeszcze wdrożony**  
   Aktualnie działa import CSV.

5. **Brak przypięcia działań użytkownika do bazy SQLite**  
   Historia i arkusze nie są jeszcze przechowywane centralnie po stronie serwera.

---

## Kierunek dalszego rozwoju

Najbardziej logiczne kolejne kroki rozwoju projektu to:

1. przeniesienie arkuszy do modeli Django,
2. zapis historii aktywności do SQLite,
3. przypisanie arkuszy do konkretnego użytkownika,
4. wdrożenie importu XLSX,
5. rozwój silnika formuł,
6. dodanie wykresów i dalszych funkcji statystycznych,
7. poprawa zaznaczania zakresów i pracy wielozakresowej,
8. przygotowanie wersji wdrożeniowej na serwer.

---

## Uruchomienie projektu

```bash
uv venv
uv sync
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py runserver
```

---

## Podsumowanie

Projekt **ARES** jest aktualnie działającą koncepcją internetowego arkusza kalkulacyjnego. Najważniejszy problem, jaki rozwiązuje, to umożliwienie pracy na danych tabelarycznych i prostych obliczeniach bez użycia klasycznego oprogramowania desktopowego. Obecna wersja jest już funkcjonalna jako prototyp, ale docelowo powinna zostać rozwinięta o pełne przechowywanie danych po stronie serwera i bardziej zaawansowaną logikę arkusza.



## Konfiguracja wysyłki e-mail na Renderze

ARES obsługuje tryb wysyłki podobny do aplikacji SleepWatch. Na Renderze najprościej ustawić Gmail SMTP przez hasło aplikacji Google.

W Environment Variables ustaw:

```env
EMAIL_DELIVERY_MODE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_TIMEOUT=20
EMAIL_HOST_USER=twoj_adres@gmail.com
EMAIL_HOST_PASSWORD=haslo_aplikacji_google
DEFAULT_FROM_EMAIL=twoj_adres@gmail.com
```

`EMAIL_HOST_PASSWORD` musi być hasłem aplikacji Google, a nie zwykłym hasłem do Gmaila.

Lokalnie można użyć:

```env
EMAIL_DELIVERY_MODE=console
```

Wtedy wiadomość z kodem weryfikacyjnym pojawi się w terminalu.
