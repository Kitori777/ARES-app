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

Obecnie aplikacja realizuje następujące elementy:

### 1. Autoryzacja użytkownika
- rejestracja,
- logowanie,
- wylogowanie,
- weryfikacja e-mail kodem.

### 2. Panel ARES
- strona startowa po zalogowaniu,
- boczne menu aplikacji,
- przejście do arkuszy, importu, historii i raportów.

### 3. Moduł arkuszy
- tworzenie nowych arkuszy,
- nazwa arkusza,
- kategoria,
- prezentacja rozmiaru arkusza w MB,
- lista zapisanych arkuszy,
- otwieranie arkusza w osobnym edytorze.

### 4. Edytor arkusza
- siatka w stylu arkusza kalkulacyjnego,
- wiersze numerowane `1-n`,
- kolumny oznaczone `A, B, C, D...`,
- aktywna komórka,
- zaznaczanie zakresów,
- pasek formuł,
- import CSV,
- eksport CSV,
- dodawanie wierszy i kolumn,
- zmiana nazwy arkusza.

### 5. Funkcje zaimplementowane lub przygotowane do rozwoju
- `SUMA`,
- `ŚREDNIA`,
- `MEDIANA`,
- `MINIMUM`,
- `MAXIMUM`,
- `ZLICZ`,
- `ODCHYLENIE`,
- `WARIANCJA`,
- `STANDARYZACJA` dla zaznaczonego zakresu.

### 6. Historia zmian
- wejście do modułów,
- utworzenie arkusza,
- usunięcie arkusza,
- import CSV,
- eksport CSV,
- zapis arkusza,
- zmiany wykonywane w edytorze.

---

## Obecna struktura projektu

Poniżej znajduje się uproszczona struktura aktualnego projektu ARES po zmianach funkcjonalnych i wizualnych:

```text
projekt_baza_merged/
├── manage.py
├── requirements.txt
├── db.sqlite3                      # pojawi się po migracjach
├── README.md                       # ten plik
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
│   ├── urls.py
│   ├── views.py
│   └── migrations/
│       └── ...
│
│
├── templates/
│   ├── base.html
│   ├── login.html
│   ├── register.html
│   ├── verify_email.html
│   ├── dashboard.html
│   ├── app_home.html
│   ├── worksheets.html
│   ├── worksheet_editor.html
│   ├── import_data.html
│   ├── history.html
│   └── reports.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   │   └── ares-logo.svg
│   └── js/
│       ├── ares_storage.js
│       ├── worksheets_page.js
│       ├── worksheet_editor.js
│       ├── import_data.js
│       └── history_page.js
│
└── media/
    └── ...
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
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

---

## Podsumowanie

Projekt **ARES** jest aktualnie działającą koncepcją internetowego arkusza kalkulacyjnego. Najważniejszy problem, jaki rozwiązuje, to umożliwienie pracy na danych tabelarycznych i prostych obliczeniach bez użycia klasycznego oprogramowania desktopowego. Obecna wersja jest już funkcjonalna jako prototyp, ale docelowo powinna zostać rozwinięta o pełne przechowywanie danych po stronie serwera i bardziej zaawansowaną logikę arkusza.

