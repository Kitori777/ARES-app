# Changelog

# Changelog

## [v0.5.0] - 2026-05-05

### Dodano

- Dodano mechanizm zgłaszania błędów i sugestii przez użytkowników.
- Dodano formularz zgłoszenia problemu dostępny pod adresem `/feedback/`.
- Dodano model `BugReport` do zapisywania zgłoszeń użytkowników w bazie danych.
- Dodano możliwość dołączenia zrzutu ekranu do zgłoszenia problemu.
- Dodano panel obsługi zgłoszeń dostępny pod adresem `/admin-reports/`.
- Dodano ograniczenie panelu zgłoszeń wyłącznie do kont z uprawnieniem superadmina.
- Dodano panel zarządzania użytkownikami dostępny pod adresem `/admin-users/`.
- Dodano możliwość podglądu użytkowników przez superadmina.
- Dodano możliwość aktywowania i dezaktywowania kont użytkowników przez superadmina.
- Dodano możliwość nadawania i odbierania uprawnień `staff` oraz `superuser`.
- Dodano możliwość usuwania kont użytkowników z poziomu panelu superadmina.
- Dodano rejestrację modelu `BugReport` w standardowym panelu Django Admin.
- Dodano rejestrację modeli `Sheet`, `SheetShare` i `HistoryEntry` w panelu Django Admin.
- Dodano mechanizm udostępniania arkuszy innym użytkownikom po e-mailu albo loginie.
- Dodano model `SheetShare` przechowujący informacje o udostępnieniach arkuszy.
- Dodano poziomy dostępu do arkusza:
  - `Tylko podgląd`,
  - `Może edytować`.
- Dodano przycisk `Udostępnij` przy arkuszach należących do aktualnego użytkownika.
- Dodano modal udostępniania arkusza podobny do rozwiązania znanego z Google Drive / Google Sheets.
- Dodano listę osób z dostępem do arkusza.
- Dodano możliwość zmiany poziomu dostępu udostępnionego arkusza.
- Dodano możliwość usunięcia dostępu wybranemu użytkownikowi.
- Dodano wyświetlanie arkuszy udostępnionych na liście arkuszy użytkownika.
- Dodano informację, czy arkusz jest własny, udostępniony, tylko do odczytu albo możliwy do edycji.
- Dodano blokadę zapisu dla arkuszy udostępnionych w trybie tylko do odczytu.
- Dodano historię operacji udostępnienia arkusza.
- Dodano dokumentację techniczną do folderu `docs/`.
- Dodano plik `docs/README.md` jako główny indeks dokumentacji technicznej.
- Dodano plik dokumentacji dla systemu zgłoszeń administratora.
- Dodano plik dokumentacji dla mechanizmu udostępniania arkuszy.
- Dodano dodatkowe tłumaczenia interfejsu dla paneli administracyjnych, zgłoszeń i udostępniania arkuszy.

### Zmieniono

- Zmieniono dostęp do panelu zgłoszeń z `/admin/reports/` na `/admin-reports/`, aby nie kolidował ze standardowym panelem Django Admin.
- Zmieniono logikę widoczności linku `Panel zgłoszeń`, aby był widoczny tylko dla superadmina.
- Zmieniono logikę widoczności linku `Panel użytkowników`, aby był widoczny tylko dla superadmina.
- Zmieniono obsługę uprawnień administratora — dostęp do paneli technicznych wymaga teraz `is_superuser=True`.
- Zmieniono sposób prezentowania konta przykładowego administratora, aby nie pokazywać danych logowania zwykłym użytkownikom.
- Zmieniono listę arkuszy tak, aby obsługiwała zarówno arkusze własne, jak i arkusze udostępnione.
- Zmieniono API arkuszy tak, aby zwracało informacje o właścicielu, poziomie dostępu i możliwościach edycji.
- Zmieniono zapisywanie arkusza tak, aby użytkownik bez prawa edycji nie mógł zapisać zmian.
- Zmieniono usuwanie arkusza tak, aby tylko właściciel mógł usunąć arkusz.
- Zmieniono zmianę nazwy arkusza tak, aby była dostępna tylko dla właściciela.
- Zmieniono metadane wyświetlane w edytorze arkusza, dodając informację o trybie udostępnienia i trybie tylko do odczytu.
- Zmieniono strukturę plików tekstowych projektu — dokumentacja techniczna została przeniesiona do folderu `docs/`.
- Zmieniono cache statycznych plików, aby przeglądarka ładowała aktualne wersje JavaScript i CSS po wdrożeniu.

### Naprawiono

- Naprawiono problem, przez który panel zgłoszeń był dostępny także dla zwykłego użytkownika.
- Naprawiono problem, przez który zwykły użytkownik widział link do panelu zgłoszeń.
- Naprawiono kolizję adresu `/admin/reports/` ze standardowym panelem Django Admin.
- Naprawiono migrację tworzącą konto demonstracyjne administratora — zastąpiono `set_password()` użyciem `make_password()`, ponieważ historyczny model użytkownika w migracji nie posiada tej metody.
- Naprawiono problem z brakiem przycisku `Udostępnij` przy arkuszach właściciela.
- Naprawiono problem z cache przeglądarki dla pliku `worksheets_page.js`.
- Naprawiono obsługę dostępu do arkusza, aby użytkownik z dostępem tylko do podglądu nie mógł zapisywać zmian.
- Naprawiono zabezpieczenie endpointów API arkuszy przed dostępem osób bez uprawnień.
- Naprawiono widoczność opcji zarządzania arkuszem dla użytkowników, którzy nie są właścicielami.
- Naprawiono część tłumaczeń solvera, zgłoszeń i paneli administracyjnych.
- Naprawiono rejestrację nowych modeli w panelu Django Admin.

### Techniczne

- Dodano migrację `users.0006_bugreport`.
- Dodano migrację `users.0007_demo_admin`.
- Dodano migrację `ares.0002_sheetshare`.
- Dodano endpointy API dla udostępniania arkuszy:
  - `GET /ares/api/sheets/<sheet_id>/shares/`,
  - `POST /ares/api/sheets/<sheet_id>/shares/add/`,
  - `POST /ares/api/sheets/<sheet_id>/shares/<share_id>/update/`,
  - `POST /ares/api/sheets/<sheet_id>/shares/<share_id>/delete/`.
- Dodano widoki administracyjne:
  - `/admin-reports/`,
  - `/admin-users/`.
- Dodano widok użytkownika:
  - `/feedback/`.
- Dodano obsługę `SheetShare` w Django Admin.
- Dodano obsługę `BugReport` w Django Admin.
- Dodano dokumentację wdrożeniową dla systemu zgłoszeń i udostępniania arkuszy.
- Przygotowano zmiany do działania lokalnie oraz po wdrożeniu na Render z bazą PostgreSQL.


## [v0.4.0] - 2026-04-29

### Dodano
- Dodano obsługę importu plików CSV, TXT, TSV, XLSX oraz XLS.
- Dodano podgląd importowanych danych z poziomym przewijaniem dla szerokich tabel.
- Dodano globalną zmianę języka aplikacji w profilu użytkownika.
- Dodano obsługę języków: polski, angielski i niemiecki.
- Dodano dolny pasek szybkich akcji konfigurowany z poziomu profilu użytkownika.
- Dodano dodatkowe skróty szybkiego dostępu: wykresy, solver, matematyka akademicka i scalanie arkuszy.
- Dodano formatowanie warunkowe komórek na podstawie reguł.
- Dodano gotowe typy reguł formatowania warunkowego, m.in. tekst zawiera, tekst równy, liczba większa niż, liczba mniejsza niż, liczba między, komórka pusta i komórka niepusta.
- Dodano wybór kolorów dla reguł formatowania warunkowego.
- Dodano obsługę zwykłych działań matematycznych po znaku `=`, np. `=2+3*4`, `=(2+3)*4`, `=2*(3+4)^2`, `=A1+B1*2`.
- Dodano przeliczanie formuł w czasie rzeczywistym po zmianie danych w komórkach.
- Dodano przeliczanie aktywnej komórki podczas wpisywania formuły w pasku formuły.
- Dodano możliwość zaznaczania całych wierszy, kolumn oraz całego arkusza.
- Dodano stosowanie stylów, kolorów i obramowań do zaznaczonych wierszy oraz kolumn.
- Dodano wybór grubości obramowania komórek.
- Dodano tryb dopasowania widoku arkusza do szerokości strony.
- Dodano możliwość zmiany nazwy arkusza bezpośrednio z kafla arkusza.
- Dodano lepsze menu kontekstowe zakładek arkuszy.
- Dodano submenu „Kopiuj do” działające po najechaniu kursorem.
- Dodano kolorowanie zakładek arkuszy z dolnego menu.
- Dodano unikalne nazwy arkuszy przy tworzeniu, duplikowaniu i zmianie nazwy.
- Dodano obsługę avatara użytkownika z pliku z komputera bez wstawiania zawartości base64 do pola tekstowego.
- Dodano czytelniejsze okno komentarzy i notatek do komórek.
- Dodano dymki podglądu komentarzy po najechaniu na komórkę.

### Zmieniono
- Przebudowano pasek formuły, aby był czytelniejszy i spójny z motywem aplikacji.
- Poprawiono sekcję „Formuły”, aby działała jak panel wyboru z podglądem po najechaniu.
- Zmieniono działanie paneli Start, Wstaw, Formuły, Tabele, Dane i Widok — panele pojawiają się jako nakładka nad arkuszem, bez rozpychania układu.
- Ustawiono widok Start/Home jako domyślnie widoczny w edytorze arkusza.
- Poprawiono zachowanie zoomu arkusza, aby nie generował pustej przestrzeni po zmianie skali.
- Poprawiono wygląd i działanie list funkcji, aby miały własne przewijanie i nie zajmowały nadmiernie miejsca.
- Poprawiono kolorystykę edytora arkusza w jasnych i ciemnych motywach.
- Poprawiono kolorystykę podpowiedzi, pól opisu funkcji i aktywnych elementów.
- Poprawiono działanie dolnego paska szybkich akcji, aby respektował ustawienia zapisane w profilu.
- Rozszerzono tłumaczenia interfejsu na menu boczne, górny pasek, profil, raporty, import, edytor, arkusze i pasek szybkich akcji.
- Poprawiono dropdown profilu użytkownika, aby zawsze był widoczny nad innymi elementami strony.
- Poprawiono obsługę profilu użytkownika, ustawień wyglądu, skrótów i preferencji.
- Poprawiono sposób wyświetlania dużych tabel w imporcie i edytorze.
- Poprawiono gotowe tabele, w tym tabelę NPV projektu.
- Poprawiono zaokrąglanie wyników funkcji i formuł, aby nie wyświetlały bardzo długich wartości liczbowych.
- Poprawiono zapisywanie metadanych arkuszy, w tym koloru zakładki, nazwy i ustawień.
- Poprawiono kolorowanie tekstu, tła i obramowań komórek.
- Poprawiono obsługę arkusza otwieranego bez parametru `sheet`.

### Naprawiono
- Naprawiono problem, przez który część formuł aktualizowała wynik dopiero po odświeżeniu strony.
- Naprawiono problem z błędnym wynikiem gotowej tabeli NPV.
- Naprawiono problem z pustym edytorem po kliknięciu skrótów Wykresy, Solver, Matematyka i Scalanie.
- Naprawiono problem z rozciąganiem strony w poziomie przez szerokie arkusze i tabele importu.
- Naprawiono problem z niedziałającym kolorowaniem zakładek arkuszy.
- Naprawiono problem z niewidocznymi kolorami w menu zmiany koloru zakładki.
- Naprawiono problem z mieszaniem stylów i fontów na kaflach arkuszy.
- Naprawiono problem z nieczytelną kolorystyką menu kontekstowego zakładek arkuszy.
- Naprawiono problem z niedziałającymi częściowo opcjami w menu po prawym kliknięciu zakładki.
- Naprawiono problem z wyświetlaniem fragmentu kodu na stronie profilu.
- Naprawiono problem z niedziałającym zegarem po zmianach w profilu.
- Naprawiono problem z błędnym podglądem avatara.
- Naprawiono problem z generowaniem bardzo długiego tekstu base64 przy wyborze pliku avatara.
- Naprawiono problem z niepełnym tłumaczeniem części elementów aplikacji.
- Naprawiono problem z warstwami, przez który menu użytkownika mogło chować się pod treścią strony.

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
