# TODO

## [x] 1. Link do podstrony wydarzenia na stronie głównej
Dodaj na stronie głównej link do podstrony `/wydarzenia`.

## [x] 2. Routing `/wydarzenia`
Utwórz plik/stronę dla trasy `/wydarzenia`. Podstrona ma zawierać ten sam Header co strona
główna oraz tę samą stopkę.

## [x] 3. Sekcja wydarzeń na `/wydarzenia`
Wewnątrz podstrony ma się znaleźć sekcja informująca o wydarzeniach: Tytuł, opis, data,
godzina. Elementy (pojedyncze wydarzenia) pojawiają się jeden pod drugim (lista pionowa).

## [x] 4. Nowa pozycja w panelu admina: "Wydarzenia"
W zapleczu admina istnieje obecnie jedna pozycja menu: "Zgłoszenia". Dodaj kolejną
pozycję: "Wydarzenia".

## [x] 5. Reużywalny komponent Table
"Wydarzenia" w adminie mają korzystać z tej samej listy/tabeli co "Zgłoszenia". Jeśli
komponent tabeli nie istnieje jako osobny, reużywalny komponent (jest napisany ręcznie
inline), wydziel go do folderu komponentów pod nazwą `Table` i podłącz w obu miejscach,
zachowując obecną funkcjonalność zgłoszeń oraz zapewniając reużywalność dla wydarzeń
i przyszłych sekcji korzystających z tabel.

## [x] 6. Tabela wydarzeń — kolumny i akcja edycji
Podobnie jak w zgłoszeniach, na końcu wiersza wydarzenia znajduje się przycisk "Edytuj"
umożliwiający edycję. Tabela ma pokazywać: tytuł (max 120 znaków, dłuższy ucinany
i zakończony "…"), datę wydarzenia oraz godzinę.

## [x] 7. Formularz dodawania/edycji wydarzenia
Po wejściu w "Edytuj" pojawia się formularz (tak jak przy zgłoszeniach) z polami: tytuł,
opis, data, godzina. Przyciski: "Anuluj" i "Zapisz", a w przypadku edycji istniejącego
wydarzenia dodatkowo przycisk "Usuń". Ten sam formularz służy zarówno do edycji, jak
i do dodawania nowego wydarzenia.

## [x] 8. Audyt maila no-reply@polskiebudownictwo.org
Sprawdź kod w poszukiwaniu adresu `no-reply@polskiebudownictwo.org` — jest planowana jego
zmiana na `kontakt@polskiebudownictwo.pl`. **JEŚLI GDZIEKOLWIEK W KODZIE WYMAGANE JEST DO
TEGO HASŁO (np. konfiguracja SMTP/skrzynki), KONIECZNIE POINFORMUJ O TYM UŻYTKOWNIKA —
TO WAŻNE, NIE MOŻE ZGINĄĆ W NATŁOKU WIADOMOŚCI!**

## [x] 9. Baza danych pod wydarzenia
Przygotować zmiany w bazie danych (schema/migracja) pod nową encję "Wydarzenia"
(tytuł, opis, data, godzina).
