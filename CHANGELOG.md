# Changelog

# Changelog

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
