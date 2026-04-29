# Changelog

## [v0.3.2] - 2026-04-29

### Dodano
- Model `PendingRegistration` do obsługi tymczasowej rejestracji użytkownika przed potwierdzeniem e-mail.
- Migrację bazy danych dla tymczasowych rejestracji.
- Mechanizm tworzenia właściwego konta użytkownika dopiero po poprawnym wpisaniu kodu weryfikacyjnego.
- Ponowną wysyłkę kodu weryfikacyjnego e-mail.
- Odświeżony wygląd stron:
  - logowania,
  - rejestracji,
  - potwierdzenia e-mail.

### Zmieniono
- Proces rejestracji użytkownika.
- Formularz rejestracji nie tworzy już od razu aktywnego konta `User`.
- Dane rejestracyjne są najpierw zapisywane jako tymczasowe zgłoszenie rejestracji.
- Konto użytkownika jest tworzone dopiero po skutecznej weryfikacji kodem e-mail.
- Poprawiono komunikaty dla użytkownika przy rejestracji, weryfikacji i ponownej wysyłce kodu.

### Naprawiono
- Naprawiono problem, w którym konto użytkownika mogło zostać utworzone mimo braku potwierdzenia adresu e-mail.
- Naprawiono sytuację, w której nieudana wysyłka e-maila mogła pozostawić niepotwierdzone konto w bazie.
- Poprawiono obsługę błędów SMTP podczas rejestracji.
- Zachowano zgodność ze starszymi nieaktywnymi kontami utworzonymi przed zmianą procesu rejestracji.

### Techniczne
- Dodano logikę tymczasowej rejestracji przed utworzeniem konta.
- Dodano obsługę ważności kodu weryfikacyjnego.
- Dodano obsługę ponownego generowania i wysyłania kodu.
- Sprawdzono poprawność projektu komendami:
  - `uv run python manage.py check`
  - `uv run python manage.py migrate`


## [v0.3.1] - 2026-04-28

### Dodano
- Przygotowanie aplikacji ARES pod wdrożenie na Render.
- Obsługę konfiguracji przez zmienne środowiskowe.
- Plik `.env.example` z przykładowymi zmiennymi konfiguracyjnymi.
- Plik `build.sh` do budowania aplikacji na Renderze.
- Opcjonalny plik `render.yaml` do konfiguracji usługi Render.
- Obsługę `DATABASE_URL` dla produkcyjnej bazy PostgreSQL.
- Konfigurację wysyłki e-mail przez SMTP.
- Obsługę zmiennych środowiskowych dla:
  - `SECRET_KEY`,
  - `DEBUG`,
  - `ALLOWED_HOSTS`,
  - `CSRF_TRUSTED_ORIGINS`,
  - `DATABASE_URL`,
  - `EMAIL_BACKEND`,
  - `DEFAULT_FROM_EMAIL`,
  - `EMAIL_HOST`,
  - `EMAIL_PORT`,
  - `EMAIL_USE_TLS`,
  - `EMAIL_USE_SSL`,
  - `EMAIL_HOST_USER`,
  - `EMAIL_HOST_PASSWORD`.
- Konfigurację statycznych plików produkcyjnych.
- Obsługę `collectstatic` dla deploymentu.
- Konfigurację `gunicorn` jako serwera produkcyjnego.
- Przygotowanie projektu pod użycie PostgreSQL na Renderze.

### Zmieniono
- Ustawienia Django zostały dostosowane do środowiska produkcyjnego.
- Konfiguracja sekretów została przeniesiona do zmiennych środowiskowych.
- Lokalny plik `.env` nie jest wymagany na Renderze, ponieważ wartości są ustawiane w panelu Environment Variables.
- Poprawiono sposób definiowania `ALLOWED_HOSTS` i `CSRF_TRUSTED_ORIGINS`.
- Poprawiono konfigurację statycznych plików dla środowiska produkcyjnego.
- Zmieniono podejście do uruchamiania aplikacji z lokalnego `runserver` na produkcyjne `gunicorn`.

### Naprawiono
- Naprawiono problem braku `requirements.txt` przez przygotowanie projektu do pracy z `uv`.
- Poprawiono konfigurację tak, aby aplikacja mogła być budowana z `pyproject.toml` i `uv.lock`.
- Poprawiono obsługę SMTP przez zmienne środowiskowe.
- Poprawiono zabezpieczenie przed przypadkowym wrzuceniem `.env` do repozytorium.

### Techniczne
- Dodano / uzupełniono zależności produkcyjne:
  - `gunicorn`,
  - `whitenoise`,
  - `dj-database-url`,
  - `psycopg`.
- Przygotowano komendy Render:
  - `uv sync && uv run python manage.py collectstatic --noinput && uv run python manage.py migrate`
  - `uv run gunicorn projekt_baza.wsgi:application`
- Dodano zalecenie ustawienia wersji Pythona przez `runtime.txt`.
- Uporządkowano `.gitignore` pod deployment i lokalne środowisko.


## [v0.3.0] - 2026-04-26

### Dodano
- Rozbudowany panel główny aplikacji ARES.
- Profil użytkownika dostępny z górnego paska aplikacji.
- Możliwość ustawiania własnej nazwy wyświetlanej użytkownika.
- Możliwość ustawiania awatara użytkownika.
- Kreator awatara:
  - wybór kolorystyki awatara,
  - wybór kształtu awatara,
  - szybkie symbole awatara,
  - możliwość wgrania własnego obrazka profilowego.
- System motywów kolorystycznych aplikacji.
- Dziesięć wariantów kolorystyki interfejsu.
- Zapisywanie ustawień wyglądu użytkownika w `localStorage`.
- Rozszerzone menu profilu użytkownika.
- Konfigurowalny pasek szybkiego dostępu.
- Dolny dock z najważniejszymi skrótami aplikacji.
- Możliwość wyboru ulubionych arkuszy.
- Sortowanie arkuszy tak, aby ulubione arkusze były wyświetlane wyżej.
- Podsumowanie liczby arkuszy oraz liczby ulubionych arkuszy.
- Rozbudowaną historię zmian obejmującą akcje użytkownika w arkuszach.
- Filtrowanie historii zmian po arkuszu, typie akcji i zakresie czasu.
- Rozszerzone raporty użytkownika i aktywności.
- Wykresy aktywności w raportach:
  - aktywność z ostatnich 7 dni,
  - aktywność tygodniowa z ostatnich 30 dni,
  - najczęstsze typy działań.
- Wykresy aktywności w historii zmian.
- Obsługę menu kontekstowego po kliknięciu prawym przyciskiem myszy na komórkę.
- Przykładowe opcje menu kontekstowego komórki:
  - wytnij,
  - kopiuj,
  - wklej,
  - wklej specjalnie,
  - wstaw wiersz powyżej,
  - wstaw kolumnę po lewej,
  - usuń wiersz,
  - usuń kolumnę,
  - usuń komórki,
  - utwórz wykres,
  - wstaw link,
  - komentarz,
  - wstaw notatkę,
  - solver.
- Podstawową obsługę akcji z menu kontekstowego:
  - kopiowanie,
  - wycinanie,
  - wklejanie,
  - czyszczenie komórki,
  - usuwanie wiersza,
  - usuwanie kolumny,
  - otwieranie wykresu,
  - otwieranie komentarza,
  - otwieranie notatki,
  - otwieranie solvera.
- Czytelniejszy panel solvera.
- Podsumowanie ustawień solvera:
  - aktywny arkusz,
  - komórka celu,
  - tryb optymalizacji,
  - liczba komórek zmiennych.
- Obsługę wariantów solvera:
  - minimalizacja,
  - maksymalizacja,
  - wartość docelowa.
- Przyciski pomocnicze solvera:
  - bieżący arkusz,
  - pobierz z aktywnej komórki,
  - zakres zaznaczenia,
  - wyczyść.
- Lepszą integrację kolorystyki z modułami:
  - panel główny,
  - arkusze,
  - edytor arkusza,
  - import danych,
  - historia zmian,
  - raporty,
  - profil użytkownika,
  - dolny pasek szybkiego dostępu.
- Ujednolicone kolory kart, paneli, boxów statystyk, tabel i formularzy.

### Zmieniono
- Przebudowano wygląd panelu głównego na bardziej aplikacyjny i czytelny.
- Poprawiono wygląd listy arkuszy.
- Poprawiono kontrast tekstu i widoczność elementów w jasnych oraz ciemnych motywach.
- Poprawiono działanie bocznego paska nawigacji.
- Poprawiono wygląd i zachowanie list rozwijanych w historii zmian.
- Poprawiono wygląd formularzy w modułach importu, raportów i historii.
- Poprawiono spójność kolorystyczną pomiędzy modułami.
- Rozbudowano raporty tak, aby uwzględniały więcej działań użytkownika.
- Rozbudowano historię tak, aby lepiej opisywała pracę w arkuszach.
- Uspójniono styl przycisków, kart, pól formularzy i paneli.
- Poprawiono czytelność solvera przy zmianie wariantu optymalizacji.

### Naprawiono
- Naprawiono problem z niespójną kolorystyką po zmianie motywu.
- Naprawiono miejsca, w których jasny motyw mieszał się z ciemnymi elementami arkusza.
- Naprawiono nieczytelne pola wyboru w historii zmian.
- Naprawiono problem z brakiem widocznych kolorów w kreatorze awatara.
- Naprawiono zachowanie menu zakładek arkuszy.
- Poprawiono widoczność elementów w dolnym pasku szybkiego dostępu.
- Poprawiono działanie zwijania bocznego panelu.
- Poprawiono układ edytora, aby lepiej dopasowywał się do szerokości ekranu.

### Techniczne
- Dodano nowe skrypty JavaScript obsługujące:
  - profil użytkownika,
  - motywy,
  - skróty,
  - ulubione arkusze,
  - menu kontekstowe komórek,
  - wykresy aktywności,
  - rozszerzony solver.
- Rozszerzono style CSS dla modułów aplikacji.
- Ujednolicono obsługę wyglądu przez zmienne motywów.
- Dodano lekkie wykresy SVG bez konieczności używania dodatkowych bibliotek.

## [v0.2.0] - 2026-04-15

### Dodano
- Trwały zapis arkuszy przypisanych do użytkownika.
- Odczyt arkuszy z backendu przez endpointy Django.
- Ręczny zapis arkusza z poziomu edytora.
- Autozapis zmian w arkuszu.
- Ładowanie konkretnego arkusza po parametrze `?sheet=ID`.
- Rozszerzony edytor arkusza z zakładkami:
  - Start
  - Wstaw
  - Formuły
  - Dane
  - Widok
- Rozbudowaną sekcję „Start”.
- Wybór czcionki.
- Zmianę rozmiaru czcionki.
- Pogrubienie, kursywę i podkreślenie.
- Kolor tekstu.
- Kolor tła komórki.
- Wyrównanie do lewej, do środka i do prawej.
- Cofanie zmian przyciskiem „Cofnij”.
- Zaznaczanie wielu komórek myszką.
- Nakładanie stylu na cały zaznaczony zakres.
- Bezpośrednie wpisywanie danych do komórek.
- Edycję komórki bez konieczności używania wyłącznie paska formuł.
- Obsługę bardziej rozbudowanych elementów wstawianych:
  - linków
  - pól wyboru
  - list rozwijanych
  - komentarzy
  - notatek
  - emoji
- Sekcję przeglądania formuł z kategoriami.
- Panel opisu funkcji z przykładami użycia.
- Wstawianie wybranej funkcji do aktywnej komórki.
- Automatyczne dopasowanie szerokości kolumn do treści.
- Tryb ukrywania / pokazywania siatki.
- Tryb pełnej szerokości edytora.
- Generowanie wykresów w sekcji „Wstaw”.
- Obsługę typów wykresów:
  - liniowy
  - słupkowy
  - kolumnowy
  - warstwowy
  - kołowy
  - punktowy
  - histogram
- Konfigurację wykresów:
  - tytuł wykresu
  - tytuł osi X
  - tytuł osi Y
  - legenda
  - siatka
  - etykiety danych
  - kolor serii
- Tabelę przestawną z agregacjami:
  - suma
  - liczba
  - średnia
  - minimum
  - maksimum
  - mediana
- Solver w edytorze arkusza.
- Obsługę wielu pól zmiennych w solverze.
- Podgląd wygenerowanych obiektów pod arkuszem.

### Funkcje arkusza
#### Matematyczne
- SUMA
- ABS
- ROUND
- PIERWIASTEK
- MOC
- LN
- LOG
- EXP
- SIN
- COS
- TAN
- MOD
- ILOCZYN
- INT
- TRUNC
- SILNIA
- SIGN
- QUOTIENT
- LOS
- LOS.ZAKR
- SUMA.ILOCZYNÓW

#### Statystyczne
- ŚREDNIA
- MEDIANA
- MINIMUM
- MAXIMUM
- ZLICZ
- ODCHYLENIE
- WARIANCJA
- STANDARYZACJA
- CORREL
- RANK
- ŚREDNIA.WAŻONA
- PERCENTYL
- KWARTYL
- DOMINANTA
- ŚREDNIA.GEOMETRYCZNA
- ŚREDNIA.HARMONICZNA
- MAXA
- MINA
- LICZ.JEŻELI.WIELE
- ŚREDNIA.JEŻELI
- ŚREDNIA.JEŻELI.WIELE

#### Logiczne i warunkowe
- IF
- AND
- OR
- IFERROR
- SUMIF
- SUMA-JEŻELI
- COUNTIF

#### Tekstowe
- LEN
- CONCAT
- LEWO
- PRAWO
- TEXT
- VALUE
- LOWER
- UPPER
- PROPER
- TRIM
- SPLIT
- JOIN
- SUBSTITUTE
- REPLACE
- MID
- FIND
- SEARCH
- REPT
- CLEAN
- EXACT

#### Wyszukiwanie i odwołania
- MATCH
- INDEX
- WYSZUKAJ
- LOOKUP
- HLOOKUP
- ADDRESS
- ROW
- ROWS
- COLUMN
- COLUMNS
- OFFSET
- INDIRECT
- CHOOSE

#### Finansowe
- PMT
- PV
- FV
- NPV
- XNPV
- IRR
- XIRR
- NPER
- RATE
- IPMT
- PPMT
- RRI
- MIRR
- FVSCHEDULE
- PI
- TP

#### Daty i czas
- DATA
- DATA.WARTOŚĆ
- CZAS
- CZAS.WARTOŚĆ
- DNI
- DNI.ROBOCZE
- DZIEŃ
- MIESIĄC
- ROK
- GODZINA
- MINUTA
- SEKUNDA
- DZIŚ
- TERAZ

#### Tablicowe
- TRANSPOZYCJA
- MULTI
- ARRAYFORMULA
- FILTRUJ
- ZAPYTANIE
- UNIQUE
- SORT
- SEQUENCE
- CHOOSECOLS
- CHOOSEROWS
- TAKE
- DROP
- VSTACK
- HSTACK

#### Internetowe / web
- IMPORTRANGE
- IMPORTHTML
- IMPORTDATA
- IMPORTFEED
- IMPORTXML
- GOOGLEFINANCE

#### Inżynieryjne
- BIN2DEC
- BIN2HEX
- BIN2OCT
- BITAND
- BITLSHIFT
- BITOR
- BITRSHIFT
- BITXOR
- COMPLEX
- DEC2BIN
- DEC2HEX
- DEC2OCT
- DELTA
- ERF
- GESTEP
- HEX2BIN
- HEX2DEC
- HEX2OCT
- IMABS
- IMAGINARY
- IMARGUMENT
- IMCONJUGATE
- IMCOS
- IMCOSH
- IMCOT
- IMCOTH
- IMCSC
- IMCSCH
- IMDIV
- IMEXP
- IMLOG
- IMLOG10
- IMLOG2
- IMPRODUCT
- IMREAL
- IMSIN
- IMSINH
- IMSEC
- IMSECH
- IMSUB
- IMSUM
- IMTAN
- IMTANH
- OCT2BIN
- OCT2DEC
- OCT2HEX

### Technicznie
- Logika arkusza została bardziej wyraźnie podzielona na:
  - katalog funkcji
  - silnik formuł
  - logikę edytora
- Rozszerzono frontend o bardziej rozbudowane operacje na zakresach komórek.
- Dodano mechanizm historii zmian w obrębie bieżącej sesji edytora.
- Wprowadzono lepsze rozdzielenie obliczeń, stylów komórek i renderowania.
- Przygotowano podstawy pod dalszą rozbudowę:
  - formaty liczb
  - kopiuj / wklej zakresów
  - bardziej zaawansowany solver
  - pełniejsze wykresy i tabele przestawne

### Ograniczenia wersji
- Część funkcji internetowych wymaga jeszcze backendu / zewnętrznego źródła danych i nie działa w pełni lokalnie.
- Nie wszystkie funkcje finansowe są jeszcze policzone w pełnej zgodności z arkuszami Google / Excel.
- Solver działa w uproszczonej wersji i może być wolny dla większej liczby zmiennych lub małego kroku.
- Tabela przestawna jest nadal uproszczona względem pełnych arkuszy kalkulacyjnych.
- Style komórek wymagają pełnego wsparcia po stronie backendu, aby zawsze były trwale zachowywane po odświeżeniu.
- Część funkcji zaawansowanych może wymagać dalszych poprawek składni i testów brzegowych.

### Porządki repozytorium
- Uporządkowano strukturę plików JavaScript odpowiedzialnych za katalog funkcji, silnik formuł i logikę edytora.
- Rozszerzono interfejs edytora bez zmiany głównej architektury aplikacji.
- Przygotowano bazę pod dalsze iteracyjne rozwijanie modułu arkuszy.


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
