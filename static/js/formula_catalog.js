window.FORMULA_CATALOG = {
    matematyczne: [
        { name: "SUMA", syntax: "=SUMA(A1:A10)", description: "Dodaje wartości z zakresu lub argumentów.", example: "=SUMA(B2:B10)" },
        { name: "ABS", syntax: "=ABS(A1)", description: "Wartość bezwzględna.", example: "=ABS(B2)" },
        { name: "ROUND", syntax: "=ROUND(A1;2)", description: "Zaokrągla liczbę do wskazanej liczby miejsc.", example: "=ROUND(C2;1)" },
        { name: "PIERWIASTEK", syntax: "=PIERWIASTEK(A1)", description: "Pierwiastek kwadratowy.", example: "=PIERWIASTEK(D2)" },
        { name: "MOC", syntax: "=MOC(A1;2)", description: "Podnosi liczbę do potęgi.", example: "=MOC(E2;3)" },
        { name: "LN", syntax: "=LN(A1)", description: "Logarytm naturalny.", example: "=LN(F2)" },
        { name: "LOG", syntax: "=LOG(A1;10)", description: "Logarytm przy dowolnej podstawie.", example: "=LOG(G2;2)" },
        { name: "EXP", syntax: "=EXP(A1)", description: "e do potęgi x.", example: "=EXP(H2)" },
        { name: "SIN", syntax: "=SIN(A1)", description: "Sinus.", example: "=SIN(I2)" },
        { name: "COS", syntax: "=COS(A1)", description: "Cosinus.", example: "=COS(J2)" },
        { name: "TAN", syntax: "=TAN(A1)", description: "Tangens.", example: "=TAN(K2)" },
        { name: "MOD", syntax: "=MOD(A1;B1)", description: "Reszta z dzielenia.", example: "=MOD(L2;3)" },
        { name: "ILOCZYN", syntax: "=ILOCZYN(A1:A5)", description: "Mnoży wszystkie wartości.", example: "=ILOCZYN(M2:M5)" },
        { name: "INT", syntax: "=INT(A1)", description: "Zaokrągla w dół do liczby całkowitej.", example: "=INT(N2)" },
        { name: "TRUNC", syntax: "=TRUNC(A1;2)", description: "Ucianie części ułamkowej / do miejsc.", example: "=TRUNC(O2;1)" },
        { name: "SILNIA", syntax: "=SILNIA(A1)", description: "Silnia liczby całkowitej.", example: "=SILNIA(5)" },
        { name: "SIGN", syntax: "=SIGN(A1)", description: "Zwraca znak liczby: -1, 0 lub 1.", example: "=SIGN(P2)" },
        { name: "QUOTIENT", syntax: "=QUOTIENT(A1;B1)", description: "Część całkowita z dzielenia.", example: "=QUOTIENT(Q2;4)" },
        { name: "LOS", syntax: "=LOS()", description: "Losowa liczba 0–1.", example: "=LOS()" },
        { name: "LOS.ZAKR", syntax: "=LOS.ZAKR(1;100)", description: "Losowa liczba całkowita z zakresu.", example: "=LOS.ZAKR(10;50)" },
        { name: "SUMA.ILOCZYNÓW", syntax: "=SUMA.ILOCZYNÓW(A1:A5;B1:B5)", description: "Suma iloczynów dwóch zakresów.", example: "=SUMA.ILOCZYNÓW(R2:R10;S2:S10)" }
    ],

    statystyczne: [
        { name: "ŚREDNIA", syntax: "=ŚREDNIA(A1:A10)", description: "Średnia arytmetyczna.", example: "=ŚREDNIA(B2:B12)" },
        { name: "MEDIANA", syntax: "=MEDIANA(A1:A10)", description: "Wartość środkowa.", example: "=MEDIANA(C2:C20)" },
        { name: "MINIMUM", syntax: "=MINIMUM(A1:A10)", description: "Najmniejsza wartość.", example: "=MINIMUM(D2:D10)" },
        { name: "MAXIMUM", syntax: "=MAXIMUM(A1:A10)", description: "Największa wartość.", example: "=MAXIMUM(E2:E10)" },
        { name: "ZLICZ", syntax: "=ZLICZ(A1:A10)", description: "Liczy liczby.", example: "=ZLICZ(F2:F100)" },
        { name: "ODCHYLENIE", syntax: "=ODCHYLENIE(A1:A10)", description: "Odchylenie standardowe.", example: "=ODCHYLENIE(G2:G20)" },
        { name: "WARIANCJA", syntax: "=WARIANCJA(A1:A10)", description: "Wariancja.", example: "=WARIANCJA(H2:H20)" },
        { name: "STANDARYZACJA", syntax: "=STANDARYZACJA(A1;10;2)", description: "Standaryzacja Z-score.", example: "=STANDARYZACJA(I2;50;5)" },
        { name: "CORREL", syntax: "=CORREL(A1:A10;B1:B10)", description: "Współczynnik korelacji.", example: "=CORREL(J2:J20;K2:K20)" },
        { name: "RANK", syntax: "=RANK(A1;A1:A10)", description: "Pozycja w rankingu.", example: "=RANK(L2;L2:L20)" },
        { name: "ŚREDNIA.WAŻONA", syntax: "=ŚREDNIA.WAŻONA(A1:A5;B1:B5)", description: "Średnia ważona.", example: "=ŚREDNIA.WAŻONA(M2:M6;N2:N6)" },
        { name: "PERCENTYL", syntax: "=PERCENTYL(A1:A10;0,9)", description: "Percentyl.", example: "=PERCENTYL(O2:O20;0,75)" },
        { name: "KWARTYL", syntax: "=KWARTYL(A1:A10;2)", description: "Kwartyl.", example: "=KWARTYL(P2:P20;1)" },
        { name: "DOMINANTA", syntax: "=DOMINANTA(A1:A10)", description: "Najczęściej występująca wartość.", example: "=DOMINANTA(Q2:Q20)" },
        { name: "ŚREDNIA.GEOMETRYCZNA", syntax: "=ŚREDNIA.GEOMETRYCZNA(A1:A10)", description: "Średnia geometryczna.", example: "=ŚREDNIA.GEOMETRYCZNA(R2:R10)" },
        { name: "ŚREDNIA.HARMONICZNA", syntax: "=ŚREDNIA.HARMONICZNA(A1:A10)", description: "Średnia harmoniczna.", example: "=ŚREDNIA.HARMONICZNA(S2:S10)" },
        { name: "MAXA", syntax: "=MAXA(A1:A10)", description: "MAX z interpretacją logicznych/tekstowych wartości.", example: "=MAXA(T2:T10)" },
        { name: "MINA", syntax: "=MINA(A1:A10)", description: "MIN z interpretacją logicznych/tekstowych wartości.", example: "=MINA(U2:U10)" },
        { name: "LICZ.JEŻELI.WIELE", syntax: '=LICZ.JEŻELI.WIELE(A1:A10;">5";B1:B10;"TAK")', description: "Liczy elementy spełniające wiele warunków.", example: '=LICZ.JEŻELI.WIELE(V2:V20;">10";W2:W20;"OK")' },
        { name: "ŚREDNIA.JEŻELI", syntax: '=ŚREDNIA.JEŻELI(A1:A10;">5";B1:B10)', description: "Średnia dla wartości spełniających warunek.", example: '=ŚREDNIA.JEŻELI(X2:X20;">50";Y2:Y20)' },
        { name: "ŚREDNIA.JEŻELI.WIELE", syntax: '=ŚREDNIA.JEŻELI.WIELE(A1:A10;B1:B10;">5";C1:C10;"TAK")', description: "Średnia dla wielu warunków.", example: '=ŚREDNIA.JEŻELI.WIELE(Z2:Z20;AA2:AA20;">0";AB2:AB20;"TAK")' }
    ],

    logiczne: [
        { name: "IF", syntax: '=IF(A1>10;"TAK";"NIE")', description: "Warunek logiczny.", example: '=IF(B2>=50;"Zaliczone";"Nie")' },
        { name: "AND", syntax: "=AND(A1>0;B1<5)", description: "TRUE gdy wszystkie warunki spełnione.", example: "=AND(C2>10;D2<100)" },
        { name: "OR", syntax: "=OR(A1>0;B1<5)", description: "TRUE gdy choć jeden warunek spełniony.", example: '=OR(E2="TAK";F2="OK")' },
        { name: "IFERROR", syntax: '=IFERROR(A1/B1;"Błąd")', description: "Wartość zastępcza przy błędzie.", example: '=IFERROR(C2/D2;"Brak danych")' },
        { name: "SUMIF", syntax: '=SUMIF(A1:A10;">5";B1:B10)', description: "Suma warunkowa.", example: '=SUMIF(D2:D20;">100";E2:E20)' },
        { name: "SUMA-JEŻELI", syntax: '=SUMA-JEŻELI(A1:A10;">5";B1:B10)', description: "Polski alias dla SUMIF.", example: '=SUMA-JEŻELI(D2:D20;">100";E2:E20)' },
        { name: "COUNTIF", syntax: '=COUNTIF(A1:A10;">5")', description: "Licznik warunkowy.", example: '=COUNTIF(F2:F20;"TAK")' }
    ],

    tekstowe: [
        { name: "LEN", syntax: "=LEN(A1)", description: "Długość tekstu.", example: "=LEN(B2)" },
        { name: "CONCAT", syntax: '=CONCAT(A1;" ";B1)', description: "Łączy teksty.", example: '=CONCAT(C2;" - ";D2)' },
        { name: "LEWO", syntax: "=LEWO(A1;3)", description: "Znaki od lewej.", example: "=LEWO(E2;5)" },
        { name: "PRAWO", syntax: "=PRAWO(A1;3)", description: "Znaki od prawej.", example: "=PRAWO(F2;4)" },
        { name: "TEXT", syntax: '=TEXT(A1;"0,00")', description: "Formatuje liczbę/daty jako tekst.", example: '=TEXT(G2;"0,00 zł")' },
        { name: "VALUE", syntax: '=VALUE("123,45")', description: "Konwertuje tekst na liczbę.", example: '=VALUE(H2)' },
        { name: "LOWER", syntax: "=LOWER(A1)", description: "Małe litery.", example: "=LOWER(I2)" },
        { name: "UPPER", syntax: "=UPPER(A1)", description: "Wielkie litery.", example: "=UPPER(J2)" },
        { name: "PROPER", syntax: "=PROPER(A1)", description: "Każde słowo wielką literą.", example: "=PROPER(K2)" },
        { name: "TRIM", syntax: "=TRIM(A1)", description: "Usuwa nadmiarowe spacje.", example: "=TRIM(L2)" },
        { name: "SPLIT", syntax: '=SPLIT(A1;";")', description: "Dzieli tekst separatorem.", example: '=SPLIT(M2;" ")' },
        { name: "JOIN", syntax: '=JOIN(", ";A1:A3)', description: "Łączy elementy separatorem.", example: '=JOIN(" | ";N2:N5)' },
        { name: "SUBSTITUTE", syntax: '=SUBSTITUTE(A1;"stary";"nowy")', description: "Podmienia fragment tekstu.", example: '=SUBSTITUTE(O2;"X";"Y")' },
        { name: "REPLACE", syntax: "=REPLACE(A1;2;3;\"abc\")", description: "Zastępuje fragment tekstu po pozycji.", example: '=REPLACE(P2;1;2;"00")' },
        { name: "MID", syntax: "=MID(A1;2;4)", description: "Wyciąga tekst od pozycji.", example: "=MID(Q2;3;5)" },
        { name: "FIND", syntax: '=FIND("abc";A1)', description: "Pozycja szukanego tekstu, wrażliwe na wielkość liter.", example: '=FIND("-";R2)' },
        { name: "SEARCH", syntax: '=SEARCH("abc";A1)', description: "Pozycja szukanego tekstu, niewrażliwe na wielkość liter.", example: '=SEARCH("kod";S2)' },
        { name: "REPT", syntax: '=REPT("*";5)', description: "Powtarza tekst.", example: '=REPT(T2;3)' },
        { name: "CLEAN", syntax: "=CLEAN(A1)", description: "Usuwa niedrukowalne znaki.", example: "=CLEAN(U2)" },
        { name: "EXACT", syntax: '=EXACT(A1;B1)', description: "Porównuje dwa teksty dokładnie.", example: '=EXACT(V2;W2)' }
    ],

    wyszukiwanie_i_odwołania: [
        { name: "MATCH", syntax: '=MATCH("test";A1:A10)', description: "Pozycja elementu w zakresie.", example: '=MATCH("ID-10";B2:B20)' },
        { name: "INDEX", syntax: "=INDEX(A1:C10;2;3)", description: "Wartość z pozycji w tabeli.", example: "=INDEX(C2:F10;3;2)" },
        { name: "WYSZUKAJ", syntax: '=WYSZUKAJ("ID1";A1:C10;2)', description: "Wyszukiwanie w pierwszej kolumnie i zwrot z innej.", example: '=WYSZUKAJ("Produkt A";A2:C20;3)' },
        { name: "LOOKUP", syntax: "=LOOKUP(A1;B1:B10;C1:C10)", description: "Wyszukiwanie przybliżone.", example: "=LOOKUP(D2;E2:E20;F2:F20)" },
        { name: "HLOOKUP", syntax: '=HLOOKUP("ID";A1:Z3;2)', description: "Wyszukiwanie poziome.", example: '=HLOOKUP("Q1";A1:M4;3)' },
        { name: "ADDRESS", syntax: "=ADDRESS(2;3)", description: "Adres komórki jako tekst.", example: "=ADDRESS(5;2)" },
        { name: "ROW", syntax: "=ROW(A5)", description: "Numer wiersza.", example: "=ROW(B7)" },
        { name: "ROWS", syntax: "=ROWS(A1:A10)", description: "Liczba wierszy w zakresie.", example: "=ROWS(C2:C20)" },
        { name: "COLUMN", syntax: "=COLUMN(C1)", description: "Numer kolumny.", example: "=COLUMN(D5)" },
        { name: "COLUMNS", syntax: "=COLUMNS(A1:D1)", description: "Liczba kolumn w zakresie.", example: "=COLUMNS(E2:H2)" },
        { name: "OFFSET", syntax: "=OFFSET(A1;1;2)", description: "Przesunięcie od komórki/zakresu.", example: "=OFFSET(B2;2;1)" },
        { name: "INDIRECT", syntax: '=INDIRECT("A1")', description: "Odwołanie po tekście adresu.", example: '=INDIRECT(C2)' },
        { name: "CHOOSE", syntax: '=CHOOSE(2;"A";"B";"C")', description: "Wybiera element po indeksie.", example: '=CHOOSE(D2;"niski";"średni";"wysoki")' }
    ],

    finansowe: [
        { name: "PMT", syntax: "=PMT(0,05/12;36;10000)", description: "Stała rata kredytu.", example: "=PMT(0,08/12;24;20000)" },
        { name: "PV", syntax: "=PV(0,05/12;36;-500)", description: "Wartość bieżąca.", example: "=PV(0,07/12;48;-800)" },
        { name: "FV", syntax: "=FV(0,05/12;36;-500)", description: "Wartość przyszła.", example: "=FV(0,06/12;24;-300)" },
        { name: "NPV", syntax: "=NPV(0,1;A1:A5)", description: "Wartość bieżąca netto.", example: "=NPV(0,08;B2:B8)" },
        { name: "XNPV", syntax: "=XNPV(0,1;A1:A5;B1:B5)", description: "Wartość bieżąca netto z datami.", example: "=XNPV(0,1;C2:C6;D2:D6)" },
        { name: "IRR", syntax: "=IRR(A1:A5)", description: "Wewnętrzna stopa zwrotu.", example: "=IRR(E2:E8)" },
        { name: "XIRR", syntax: "=XIRR(A1:A5;B1:B5)", description: "Wewnętrzna stopa zwrotu z datami.", example: "=XIRR(F2:F6;G2:G6)" },
        { name: "NPER", syntax: "=NPER(0,05/12;-500;10000)", description: "Liczba okresów.", example: "=NPER(0,04/12;-400;8000)" },
        { name: "RATE", syntax: "=RATE(36;-500;10000)", description: "Stopa procentowa.", example: "=RATE(24;-900;15000)" },
        { name: "IPMT", syntax: "=IPMT(0,05/12;1;36;10000)", description: "Część odsetkowa raty.", example: "=IPMT(0,08/12;2;24;20000)" },
        { name: "PPMT", syntax: "=PPMT(0,05/12;1;36;10000)", description: "Część kapitałowa raty.", example: "=PPMT(0,08/12;2;24;20000)" },
        { name: "RRI", syntax: "=RRI(10;1000;2000)", description: "Równoważna stopa wzrostu.", example: "=RRI(5;5000;7000)" },
        { name: "MIRR", syntax: "=MIRR(A1:A5;0,1;0,12)", description: "Zmodyfikowana wewnętrzna stopa zwrotu.", example: "=MIRR(H2:H8;0,08;0,1)" },
        { name: "FVSCHEDULE", syntax: "=FVSCHEDULE(1000;A1:A5)", description: "Przyszła wartość dla harmonogramu stóp.", example: "=FVSCHEDULE(5000;I2:I6)" },
        { name: "PI", syntax: "=PI(0,1;B2:B6;1000)", description: "Wskaźnik rentowności projektu: NPV przepływów / inwestycja początkowa.", example: "=PI(0,1;B2:B6;1000)" },
        { name: "TP", syntax: "=TP(0,05/12;36;10000)", description: "Łączna kwota spłat: liczba okresów × rata.", example: "=TP(0,08/12;24;20000)" }
    ],

    daty_i_czas: [
        { name: "DATA", syntax: "=DATA(2026;4;1)", description: "Tworzy datę z roku, miesiąca i dnia.", example: "=DATA(2026;12;24)" },
        { name: "DATA.WARTOŚĆ", syntax: '=DATA.WARTOŚĆ("2026-04-11")', description: "Zamienia tekst na datę.", example: '=DATA.WARTOŚĆ(A1)' },
        { name: "CZAS", syntax: "=CZAS(14;30;0)", description: "Tworzy czas.", example: "=CZAS(8;15;0)" },
        { name: "CZAS.WARTOŚĆ", syntax: '=CZAS.WARTOŚĆ("14:30:00")', description: "Zamienia tekst na czas.", example: '=CZAS.WARTOŚĆ(B1)' },
        { name: "DNI", syntax: "=DNI(B1;A1)", description: "Różnica dni między datami.", example: "=DNI(C2;B2)" },
        { name: "DNI.ROBOCZE", syntax: "=DNI.ROBOCZE(A1;B1)", description: "Liczba dni roboczych.", example: "=DNI.ROBOCZE(D2;E2)" },
        { name: "DZIEŃ", syntax: "=DZIEŃ(A1)", description: "Dzień miesiąca.", example: "=DZIEŃ(F2)" },
        { name: "MIESIĄC", syntax: "=MIESIĄC(A1)", description: "Miesiąc.", example: "=MIESIĄC(G2)" },
        { name: "ROK", syntax: "=ROK(A1)", description: "Rok.", example: "=ROK(H2)" },
        { name: "GODZINA", syntax: "=GODZINA(A1)", description: "Godzina.", example: "=GODZINA(I2)" },
        { name: "MINUTA", syntax: "=MINUTA(A1)", description: "Minuta.", example: "=MINUTA(J2)" },
        { name: "SEKUNDA", syntax: "=SEKUNDA(A1)", description: "Sekunda.", example: "=SEKUNDA(K2)" },
        { name: "DZIŚ", syntax: "=DZIŚ()", description: "Dzisiejsza data.", example: "=DZIŚ()" },
        { name: "TERAZ", syntax: "=TERAZ()", description: "Aktualna data i godzina.", example: "=TERAZ()" }
    ],

    warunkowe: [
        { name: "SUMIF", syntax: '=SUMIF(A1:A10;">5";B1:B10)', description: "Sumuje wartości spełniające warunek.", example: '=SUMIF(L2:L20;">100";M2:M20)' },
        { name: "COUNTIF", syntax: '=COUNTIF(A1:A10;">5")', description: "Liczy elementy spełniające warunek.", example: '=COUNTIF(N2:N20;"TAK")' }
    ],

    tablicowe: [
        { name: "TRANSPOZYCJA", syntax: "=TRANSPOZYCJA(A1:C3)", description: "Zamienia wiersze na kolumny.", example: "=TRANSPOZYCJA(B2:D4)" },
        { name: "MULTI", syntax: "=MULTI(A1:B2;D1:E2)", description: "Mnożenie macierzy.", example: "=MULTI(A2:B3;D2:E3)" },
        { name: "ARRAYFORMULA", syntax: "=ARRAYFORMULA(A1:A10;B1:B10)", description: "Działa na całych zakresach.", example: "=ARRAYFORMULA(C2:C10;D2:D10)" },
        { name: "FILTRUJ", syntax: '=FILTRUJ(A1:C10;B1:B10;">5")', description: "Filtruje wiersze po warunku.", example: '=FILTRUJ(E2:H20;F2:F20;">10")' },
        { name: "ZAPYTANIE", syntax: '=ZAPYTANIE(A1:C10;"SELECT A,B WHERE C > 10")', description: "Zapytanie podobne do SQL.", example: '=ZAPYTANIE(I2:L20;"SELECT I,K WHERE L > 50")' },
        { name: "UNIQUE", syntax: "=UNIQUE(A1:A10)", description: "Usuwa duplikaty.", example: "=UNIQUE(M2:M20)" },
        { name: "SORT", syntax: "=SORT(A1:B10;1;TRUE)", description: "Sortuje zakres.", example: "=SORT(N2:P20;2;FALSE)" },
        { name: "SEQUENCE", syntax: "=SEQUENCE(5;2;1;1)", description: "Generuje sekwencję liczb.", example: "=SEQUENCE(10;1;1;1)" },
        { name: "CHOOSECOLS", syntax: "=CHOOSECOLS(A1:D10;1;3)", description: "Wybiera kolumny z zakresu.", example: "=CHOOSECOLS(Q2:T20;2;4)" },
        { name: "CHOOSEROWS", syntax: "=CHOOSEROWS(A1:D10;1;3)", description: "Wybiera wiersze z zakresu.", example: "=CHOOSEROWS(U2:X20;2;5)" },
        { name: "TAKE", syntax: "=TAKE(A1:C10;5)", description: "Pobiera pierwsze n wierszy/kolumn.", example: "=TAKE(Y2:AA20;3)" },
        { name: "DROP", syntax: "=DROP(A1:C10;2)", description: "Pomija pierwsze n wierszy/kolumn.", example: "=DROP(AB2:AD20;2)" },
        { name: "VSTACK", syntax: "=VSTACK(A1:B3;D1:E3)", description: "Łączy zakresy pionowo.", example: "=VSTACK(AE2:AF5;AG2:AH5)" },
        { name: "HSTACK", syntax: "=HSTACK(A1:B3;D1:E3)", description: "Łączy zakresy poziomo.", example: "=HSTACK(AI2:AJ5;AK2:AL5)" }
    ],

    internetowe_i_web: [
        { name: "IMPORTRANGE", syntax: '=IMPORTRANGE("URL_arkusza";"Arkusz1!A1:C10")', description: "Import z innego arkusza. Wymaga backendu.", example: '=IMPORTRANGE("https://...";"Dane!A1:B10")' },
        { name: "IMPORTHTML", syntax: '=IMPORTHTML("https://...";"table";1)', description: "Importuje tabelę lub listę ze strony. Wymaga backendu.", example: '=IMPORTHTML("https://example.com";"table";1)' },
        { name: "IMPORTDATA", syntax: '=IMPORTDATA("https://.../plik.csv")', description: "Importuje CSV/TSV z URL. Wymaga backendu.", example: '=IMPORTDATA("https://example.com/data.csv")' },
        { name: "IMPORTFEED", syntax: '=IMPORTFEED("https://.../rss")', description: "Import kanału feed. Wymaga backendu.", example: '=IMPORTFEED("https://example.com/rss")' },
        { name: "IMPORTXML", syntax: '=IMPORTXML("https://...";"//title")', description: "Import danych przez XPath. Wymaga backendu.", example: '=IMPORTXML("https://example.com";"//h1")' },
        { name: "GOOGLEFINANCE", syntax: '=GOOGLEFINANCE("NASDAQ:GOOG";"price")', description: "Dane finansowe online. Wymaga backendu / zewnętrznego źródła.", example: '=GOOGLEFINANCE("WSE:KGH";"price")' }
    ],

    inżynieryjne: [
        { name: "BIN2DEC", syntax: '=BIN2DEC("1010")', description: "Binarny na dziesiętny.", example: '=BIN2DEC("1111")' },
        { name: "BIN2HEX", syntax: '=BIN2HEX("1010")', description: "Binarny na szesnastkowy.", example: '=BIN2HEX("1111")' },
        { name: "BIN2OCT", syntax: '=BIN2OCT("1010")', description: "Binarny na ósemkowy.", example: '=BIN2OCT("1111")' },
        { name: "BITAND", syntax: "=BITAND(12;10)", description: "Bitowe AND.", example: "=BITAND(7;3)" },
        { name: "BITLSHIFT", syntax: "=BITLSHIFT(5;2)", description: "Przesunięcie bitowe w lewo.", example: "=BITLSHIFT(3;1)" },
        { name: "BITOR", syntax: "=BITOR(12;10)", description: "Bitowe OR.", example: "=BITOR(7;3)" },
        { name: "BITRSHIFT", syntax: "=BITRSHIFT(20;2)", description: "Przesunięcie bitowe w prawo.", example: "=BITRSHIFT(8;1)" },
        { name: "BITXOR", syntax: "=BITXOR(12;10)", description: "Bitowe XOR.", example: "=BITXOR(7;3)" },
        { name: "COMPLEX", syntax: '=COMPLEX(3;4;"i")', description: "Tworzy liczbę zespoloną.", example: '=COMPLEX(2;5;"i")' },
        { name: "DEC2BIN", syntax: "=DEC2BIN(10)", description: "Dziesiętny na binarny.", example: "=DEC2BIN(15)" },
        { name: "DEC2HEX", syntax: "=DEC2HEX(10)", description: "Dziesiętny na szesnastkowy.", example: "=DEC2HEX(255)" },
        { name: "DEC2OCT", syntax: "=DEC2OCT(10)", description: "Dziesiętny na ósemkowy.", example: "=DEC2OCT(64)" },
        { name: "DELTA", syntax: "=DELTA(A1;B1)", description: "1 jeśli wartości równe, inaczej 0.", example: "=DELTA(5;5)" },
        { name: "ERF", syntax: "=ERF(1)", description: "Funkcja błędu.", example: "=ERF(0,5)" },
        { name: "GESTEP", syntax: "=GESTEP(A1;10)", description: "1 jeśli A1 >= próg, inaczej 0.", example: "=GESTEP(B2;0)" },
        { name: "HEX2BIN", syntax: '=HEX2BIN("A")', description: "Szesnastkowy na binarny.", example: '=HEX2BIN("F")' },
        { name: "HEX2DEC", syntax: '=HEX2DEC("A")', description: "Szesnastkowy na dziesiętny.", example: '=HEX2DEC("FF")' },
        { name: "HEX2OCT", syntax: '=HEX2OCT("A")', description: "Szesnastkowy na ósemkowy.", example: '=HEX2OCT("F")' },
        { name: "IMABS", syntax: '=IMABS("3+4i")', description: "Moduł liczby zespolonej.", example: '=IMABS("1+2i")' },
        { name: "IMAGINARY", syntax: '=IMAGINARY("3+4i")', description: "Część urojona.", example: '=IMAGINARY("2+5i")' },
        { name: "IMARGUMENT", syntax: '=IMARGUMENT("3+4i")', description: "Argument liczby zespolonej.", example: '=IMARGUMENT("1+1i")' },
        { name: "IMCONJUGATE", syntax: '=IMCONJUGATE("3+4i")', description: "Sprzężenie zespolone.", example: '=IMCONJUGATE("2+5i")' },
        { name: "IMCOS", syntax: '=IMCOS("3+4i")', description: "Cosinus liczby zespolonej.", example: '=IMCOS("1+2i")' },
        { name: "IMCOSH", syntax: '=IMCOSH("3+4i")', description: "Cosinus hiperboliczny zespolony.", example: '=IMCOSH("1+2i")' },
        { name: "IMCOT", syntax: '=IMCOT("3+4i")', description: "Cotangens liczby zespolonej.", example: '=IMCOT("1+2i")' },
        { name: "IMCOTH", syntax: '=IMCOTH("3+4i")', description: "Cotangens hiperboliczny zespolony.", example: '=IMCOTH("1+2i")' },
        { name: "IMCSC", syntax: '=IMCSC("3+4i")', description: "Cosecans liczby zespolonej.", example: '=IMCSC("1+2i")' },
        { name: "IMCSCH", syntax: '=IMCSCH("3+4i")', description: "Cosecans hiperboliczny zespolony.", example: '=IMCSCH("1+2i")' },
        { name: "IMDIV", syntax: '=IMDIV("3+4i";"1+2i")', description: "Dzielenie liczb zespolonych.", example: '=IMDIV("2+3i";"1+i")' },
        { name: "IMEXP", syntax: '=IMEXP("3+4i")', description: "Eksponenta liczby zespolonej.", example: '=IMEXP("1+2i")' },
        { name: "IMLOG", syntax: '=IMLOG("3+4i")', description: "Logarytm naturalny liczby zespolonej.", example: '=IMLOG("1+2i")' },
        { name: "IMLOG10", syntax: '=IMLOG10("3+4i")', description: "Logarytm dziesiętny liczby zespolonej.", example: '=IMLOG10("1+2i")' },
        { name: "IMLOG2", syntax: '=IMLOG2("3+4i")', description: "Logarytm binarny liczby zespolonej.", example: '=IMLOG2("1+2i")' },
        { name: "IMPRODUCT", syntax: '=IMPRODUCT("1+i";"2+2i")', description: "Iloczyn liczb zespolonych.", example: '=IMPRODUCT("2+i";"3+4i")' },
        { name: "IMREAL", syntax: '=IMREAL("3+4i")', description: "Część rzeczywista.", example: '=IMREAL("2+5i")' },
        { name: "IMSIN", syntax: '=IMSIN("3+4i")', description: "Sinus liczby zespolonej.", example: '=IMSIN("1+2i")' },
        { name: "IMSINH", syntax: '=IMSINH("3+4i")', description: "Sinus hiperboliczny zespolony.", example: '=IMSINH("1+2i")' },
        { name: "IMSEC", syntax: '=IMSEC("3+4i")', description: "Secans liczby zespolonej.", example: '=IMSEC("1+2i")' },
        { name: "IMSECH", syntax: '=IMSECH("3+4i")', description: "Secans hiperboliczny zespolony.", example: '=IMSECH("1+2i")' },
        { name: "IMSUB", syntax: '=IMSUB("3+4i";"1+2i")', description: "Odejmowanie liczb zespolonych.", example: '=IMSUB("2+3i";"1+i")' },
        { name: "IMSUM", syntax: '=IMSUM("3+4i";"1+2i")', description: "Suma liczb zespolonych.", example: '=IMSUM("2+3i";"1+i")' },
        { name: "IMTAN", syntax: '=IMTAN("3+4i")', description: "Tangens liczby zespolonej.", example: '=IMTAN("1+2i")' },
        { name: "IMTANH", syntax: '=IMTANH("3+4i")', description: "Tangens hiperboliczny zespolony.", example: '=IMTANH("1+2i")' },
        { name: "OCT2BIN", syntax: '=OCT2BIN("12")', description: "Ósemkowy na binarny.", example: '=OCT2BIN("17")' },
        { name: "OCT2DEC", syntax: '=OCT2DEC("12")', description: "Ósemkowy na dziesiętny.", example: '=OCT2DEC("17")' },
        { name: "OCT2HEX", syntax: '=OCT2HEX("12")', description: "Ósemkowy na szesnastkowy.", example: '=OCT2HEX("17")' }
    ]
};

(function enrichFormulaCatalog() {
    const PARAMS = {
        SUMA: { minArgs: 1, params: [{ label: "liczba lub zakres", description: "Komórka, zakres albo liczba do zsumowania." }] },
        "SUMA.ILOCZYNÓW": { minArgs: 2, params: [{ label: "zakres 1", description: "Pierwszy zakres liczb." }, { label: "zakres 2", description: "Drugi zakres liczb o takim samym rozmiarze." }] },
        ŚREDNIA: { minArgs: 1, params: [{ label: "zakres liczb", description: "Zakres, z którego ma być obliczona średnia." }] },
        MINIMUM: { minArgs: 1, params: [{ label: "zakres liczb", description: "Zakres, w którym szukamy najmniejszej wartości." }] },
        MAXIMUM: { minArgs: 1, params: [{ label: "zakres liczb", description: "Zakres, w którym szukamy największej wartości." }] },
        ZLICZ: { minArgs: 1, params: [{ label: "zakres", description: "Zakres, w którym liczone są wartości liczbowe." }] },
        PMT: { minArgs: 3, maxArgs: 3, numericArgs: [0, 1, 2], params: [{ label: "stopa", description: "Stopa procentowa dla jednego okresu, np. 0,05/12." }, { label: "liczba okresów", description: "Liczba rat lub okresów." }, { label: "wartość obecna", description: "Kwota kredytu/inwestycji." }] },
        PV: { minArgs: 3, maxArgs: 3, numericArgs: [0, 1, 2], params: [{ label: "stopa", description: "Stopa procentowa dla okresu." }, { label: "liczba okresów", description: "Ile okresów obejmuje przepływ." }, { label: "płatność", description: "Stała płatność w każdym okresie." }] },
        FV: { minArgs: 3, maxArgs: 3, numericArgs: [0, 1, 2], params: [{ label: "stopa", description: "Stopa procentowa dla okresu." }, { label: "liczba okresów", description: "Ile okresów ma być naliczone." }, { label: "płatność", description: "Stała wpłata lub wypłata." }] },
        NPV: { minArgs: 2, params: [{ label: "stopa dyskontowa", description: "Stopa dyskontowa jako liczba, np. 0,1 dla 10%." }, { label: "przepływy pieniężne", description: "Zakres komórek z kolejnymi przepływami, np. A1:A5." }] },
        XNPV: { minArgs: 3, maxArgs: 3, params: [{ label: "stopa dyskontowa", description: "Stopa dyskontowa jako liczba, np. 0,1." }, { label: "przepływy pieniężne", description: "Zakres wartości przepływów pieniężnych." }, { label: "daty", description: "Zakres dat odpowiadających przepływom." }] },
        IRR: { minArgs: 1, maxArgs: 1, params: [{ label: "przepływy pieniężne", description: "Zakres przepływów, zwykle z wartością początkową ujemną." }] },
        XIRR: { minArgs: 2, maxArgs: 2, params: [{ label: "przepływy pieniężne", description: "Zakres przepływów pieniężnych." }, { label: "daty", description: "Zakres dat odpowiadających przepływom." }] },
        NPER: { minArgs: 3, maxArgs: 3, numericArgs: [0, 1, 2], params: [{ label: "stopa", description: "Stopa procentowa dla okresu." }, { label: "płatność", description: "Kwota płatności w okresie." }, { label: "wartość obecna", description: "Wartość początkowa." }] },
        RATE: { minArgs: 3, maxArgs: 3, numericArgs: [0, 1, 2], params: [{ label: "liczba okresów", description: "Liczba okresów." }, { label: "płatność", description: "Kwota płatności." }, { label: "wartość obecna", description: "Wartość początkowa." }] },
        MIRR: { minArgs: 3, maxArgs: 3, params: [{ label: "przepływy pieniężne", description: "Zakres przepływów." }, { label: "stopa finansowania", description: "Koszt finansowania." }, { label: "stopa reinwestycji", description: "Stopa reinwestowania dodatnich przepływów." }] },
        FVSCHEDULE: { minArgs: 2, maxArgs: 2, params: [{ label: "kapitał", description: "Kwota początkowa." }, { label: "harmonogram stóp", description: "Zakres komórek ze stopami procentowymi." }] },
        PI: { minArgs: 3, maxArgs: 3, params: [{ label: "stopa dyskontowa", description: "Stopa dyskontowa." }, { label: "przepływy pieniężne", description: "Zakres przepływów pieniężnych." }, { label: "inwestycja początkowa", description: "Nakład początkowy." }] },
        TP: { minArgs: 3, maxArgs: 3, numericArgs: [0, 1, 2], params: [{ label: "stopa", description: "Stopa procentowa dla okresu." }, { label: "liczba okresów", description: "Liczba okresów." }, { label: "wartość obecna", description: "Wartość początkowa." }] },
        IMPORTRANGE: { minArgs: 2, maxArgs: 2, requiresBackend: true, params: [{ label: "URL arkusza", description: "Adres zewnętrznego arkusza." }, { label: "zakres", description: "Zakres w zewnętrznym arkuszu, np. Dane!A1:C10." }] },
        IMPORTHTML: { minArgs: 3, maxArgs: 3, requiresBackend: true, params: [{ label: "URL", description: "Adres strony." }, { label: "typ", description: "table albo list." }, { label: "indeks", description: "Numer tabeli/listy na stronie." }] },
        IMPORTDATA: { minArgs: 1, maxArgs: 1, requiresBackend: true, params: [{ label: "URL CSV/TSV", description: "Adres pliku CSV lub TSV." }] },
        IMPORTFEED: { minArgs: 1, maxArgs: 1, requiresBackend: true, params: [{ label: "URL RSS", description: "Adres kanału RSS/Atom." }] },
        IMPORTXML: { minArgs: 2, maxArgs: 2, requiresBackend: true, params: [{ label: "URL", description: "Adres strony XML/HTML." }, { label: "XPath", description: "Ścieżka XPath do pobrania danych." }] },
        GOOGLEFINANCE: { minArgs: 1, maxArgs: 2, requiresBackend: true, params: [{ label: "ticker", description: "Symbol instrumentu, np. NASDAQ:GOOG." }, { label: "atrybut", description: "Dane do pobrania, np. price." }] }
    };
    function splitArgsFromSyntax(syntax) {
        const inside = String(syntax || "").replace(/^=[^(]+\(/, "").replace(/\)$/, "");
        if (!inside || inside === String(syntax || "")) return [];
        return inside.split(";").map((part, idx) => ({ label: part.trim() || `argument ${idx + 1}`, description: "Argument zgodny ze składnią funkcji." }));
    }
    Object.values(window.FORMULA_CATALOG || {}).flat().forEach(fn => {
        const meta = PARAMS[fn.name];
        if (meta) Object.assign(fn, meta);
        if (!fn.params) fn.params = splitArgsFromSyntax(fn.syntax);
        if (fn.minArgs === undefined) fn.minArgs = fn.params.length ? Math.min(fn.params.length, 1) : 0;
        if (fn.maxArgs === undefined && fn.params.length && !/\.\.\./.test(fn.syntax)) fn.maxArgs = fn.params.length;
    });
})();


Object.assign(window.FORMULA_CATALOG, {
  akademickie: [
    { name:"WARTOŚĆ.FUNKCJI", syntax:"=WARTOŚĆ.FUNKCJI(funkcja; x)", description:"Oblicza wartość funkcji zapisanej tekstem, np. x^2+3*x.", example:"=WARTOŚĆ.FUNKCJI(A1;2)", minArgs:2, maxArgs:2, params:[{label:"funkcja",description:"Tekst funkcji z x, np. SIN(x)+x^2."},{label:"x",description:"Punkt obliczenia."}] },
    { name:"POCHODNA", syntax:"=POCHODNA(funkcja; x; [krok])", description:"Pochodna numeryczna metodą różnicy centralnej.", example:"=POCHODNA(\"x^2\";3)", minArgs:2, maxArgs:3, params:[{label:"funkcja",description:"Tekst funkcji z x."},{label:"x",description:"Punkt."},{label:"krok",description:"Opcjonalny krok numeryczny."}] },
    { name:"CAŁKA", syntax:"=CAŁKA(funkcja; a; b; [podziały])", description:"Całka oznaczona metodą trapezów.", example:"=CAŁKA(\"x^2\";0;1;1000)", minArgs:3, maxArgs:4, params:[{label:"funkcja",description:"Tekst funkcji z x."},{label:"a",description:"Dolna granica."},{label:"b",description:"Górna granica."},{label:"podziały",description:"Liczba podziałów."}] },
    { name:"EULER", syntax:"=EULER(funkcja; x0; y0; h; n)", description:"Przybliża równanie y'=f(x,y) metodą Eulera.", example:"=EULER(\"x+y\";0;1;0,1;20)", minArgs:5, maxArgs:5, params:[{label:"funkcja",description:"Prawa strona f(x,y)."},{label:"x0",description:"Punkt startowy x."},{label:"y0",description:"Warunek początkowy."},{label:"h",description:"Krok."},{label:"n",description:"Liczba kroków."}] },
    { name:"BISEKCJA", syntax:"=BISEKCJA(funkcja; a; b; eps; iteracje)", description:"Szuka miejsca zerowego, gdy funkcja zmienia znak na [a,b].", example:"=BISEKCJA(\"x^3-x-2\";1;2;0,000001;100)", minArgs:3, maxArgs:5 },
    { name:"NEWTON", syntax:"=NEWTON(funkcja; start; eps; iteracje)", description:"Szuka miejsca zerowego metodą Newtona.", example:"=NEWTON(\"x^3-x-2\";1,5;0,000001;50)", minArgs:2, maxArgs:4 },
    { name:"KOMBINACJE", syntax:"=KOMBINACJE(n; k)", description:"Liczba kombinacji C(n,k).", example:"=KOMBINACJE(10;3)", minArgs:2, maxArgs:2 },
    { name:"WARIACJE", syntax:"=WARIACJE(n; k)", description:"Liczba wariacji bez powtórzeń V(n,k).", example:"=WARIACJE(10;3)", minArgs:2, maxArgs:2 },
    { name:"PERMUTACJE", syntax:"=PERMUTACJE(n)", description:"Liczba permutacji n!.", example:"=PERMUTACJE(5)", minArgs:1, maxArgs:1 },
    { name:"NORM.DIST", syntax:"=NORM.DIST(x; średnia; sigma; TRUE/FALSE)", description:"Dystrybuanta albo gęstość rozkładu normalnego.", example:"=NORM.DIST(1,96;0;1;TRUE)", minArgs:4, maxArgs:4 },
    { name:"DWUMIAN", syntax:"=DWUMIAN(k; n; p)", description:"Prawdopodobieństwo P(X=k) w rozkładzie dwumianowym.", example:"=DWUMIAN(3;10;0,4)", minArgs:3, maxArgs:3 },
    { name:"POISSON", syntax:"=POISSON(k; lambda)", description:"Prawdopodobieństwo P(X=k) w rozkładzie Poissona.", example:"=POISSON(3;2,5)", minArgs:2, maxArgs:2 },
    { name:"NACHYLENIE", syntax:"=NACHYLENIE(x_zakres; y_zakres)", description:"Współczynnik kierunkowy regresji liniowej.", example:"=NACHYLENIE(A2:A10;B2:B10)", minArgs:2, maxArgs:2 },
    { name:"WYRAZ.WOLNY", syntax:"=WYRAZ.WOLNY(x_zakres; y_zakres)", description:"Wyraz wolny regresji liniowej.", example:"=WYRAZ.WOLNY(A2:A10;B2:B10)", minArgs:2, maxArgs:2 },
    { name:"R2", syntax:"=R2(x_zakres; y_zakres)", description:"Współczynnik determinacji regresji liniowej.", example:"=R2(A2:A10;B2:B10)", minArgs:2, maxArgs:2 },
    { name:"PROGNOZA", syntax:"=PROGNOZA(x; x_zakres; y_zakres)", description:"Prognoza y dla x z regresji liniowej.", example:"=PROGNOZA(6;A2:A10;B2:B10)", minArgs:3, maxArgs:3 }
  ]
});
