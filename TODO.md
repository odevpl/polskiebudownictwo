# Akademia — dashboard i katalog kursów

## Cel

Strona `/akademia/` stanie się punktem wejścia do Akademii: dashboardem dla zalogowanego kursanta. Dotychczasowy widok kart dostępnych kursów zostanie zachowany funkcjonalnie, ale przeniesiony pod `/akademia/kursy/`. Nie zmieniamy adresów szczegółów kursu, modułów, lekcji, zakupu ani ustawień konta.

## Zakres iteracji 1 — routing i pusty moduł dashboardu

### ACD-101 — Audyt obecnego wejścia do Akademii

- [ ] Zidentyfikować wszystkie odnośniki prowadzące do `/akademia/`: nagłówek, menu użytkownika, powroty z kursów, lekcji, płatności i ustawień.
- [ ] Rozdzielić linki semantycznie: „Dashboard Akademii” ma prowadzić do `/akademia/`, a „Moje kursy” / katalog kursów do `/akademia/kursy/`.
- [ ] Zachować ochronę `requireUser` dla obu adresów oraz obecne zachowanie nieautoryzowanych użytkowników.

### ACD-102 — Przeniesienie obecnego katalogu kursów

- [ ] Przenieść obecny layout z `page/akademia.html` na nową stronę `/akademia/kursy/` bez zmiany działania kart, katalogu, zakupu ani pobierania `/api/academy/courses` i `/api/academy/catalog`.
- [ ] Ustawić trasę `/akademia/kursy/` oraz warianty bez końcowego ukośnika w `app.js`.
- [ ] Zdecydować i wdrożyć bezpieczną kompatybilność dla starego `/akademia.html` (przekierowanie do `/akademia/`, bez duplikacji treści).
- [ ] Zaktualizować teksty i breadcrumby obecnego katalogu tak, by powrót kierował do dashboardu.

### ACD-103 — Moduł pustego dashboardu

- [ ] Utworzyć niezależny moduł `modules/academyDashboard/` z `index.ejs`, własnym CSS i ewentualnym JS; jego wejścia mają być przekazywane jak propsy przez EJS.
- [ ] Użyć modułu jako zawartości `/akademia/`, nie rozbudowując ponownie `page/akademia.html` o logikę katalogu kursów.
- [ ] W pierwszym przebiegu zostawić centralną część dashboardu bez danych biznesowych, kafli kursów, feedu, powiadomień i statystyk.
- [ ] Zachować wspólne komponenty nagłówka, menu oraz responsywność istniejącej Akademii.

### ACD-104 — Nawigacja i regresje

- [ ] Zmienić nawigację na stronach kursu, lekcji, płatności i ustawień tak, aby linki do katalogu wskazywały `/akademia/kursy/`, a link do strefy użytkownika — `/akademia/`.
- [ ] Sprawdzić przekierowania po logowaniu oraz po płatności, aby nadal prowadziły do właściwego miejsca.
- [ ] Nie zmieniać kontraktów API ani schematu bazy danych.

## Zakres iteracji 2 — layout dashboardu z prawą kolumną

### ACD-201 — Szkielet wizualny dashboardu

- [ ] Rozbudować moduł dashboardu do układu dwukolumnowego inspirowanego przekazanym screenem, ale dopasowanego do kolorystyki, typografii i komponentów Polskiego Budownictwa.
- [ ] Lewa, szersza kolumna pozostaje celowo pusta jako przestrzeń pod przyszłe aktywności użytkownika; można pokazać najwyżej jeden neutralny, niemający funkcji kafel-makietę.
- [ ] Nie kopiować elementów społecznościowych ze screena: bez wpisów, pinów, liczników, czatu grupowego, rankingu czy pozornych danych.

### ACD-202 — Panel kursanta po prawej stronie

- [ ] Utworzyć prawą kartę profilu korzystającą z aktualnie zalogowanego użytkownika: co najmniej e-mail oraz imię i nazwisko, jeśli profil je zawiera.
- [ ] Zastosować lokalną, wyraźnie makietową ilustrację/awatar zamiast generowania lub zapisywania zdjęcia użytkownika w bazie.
- [ ] Dodać CTA „Moje kursy” prowadzące do `/akademia/kursy/`.
- [ ] Zaprojektować stan niepełnego profilu (brak imienia i nazwiska) bez pustych etykiet i bez ujawniania danych innych kont.

### ACD-203 — Dane i ochrona prywatności

- [ ] Udostępnić dashboardowi tylko dane aktualnego użytkownika; nie pobierać ani nie renderować listy innych użytkowników.
- [ ] Preferować istniejący endpoint sesji/profilu, a jeśli będzie potrzebny nowy endpoint, zabezpieczyć go `requireUserApi` i zwracać minimalny zestaw pól.
- [ ] Nie dodawać migracji, uploadu zdjęć ani nowych danych profilu w tej iteracji.

### ACD-204 — Responsywność i dostępność

- [ ] Na małych ekranach układać prawy panel pod główną kolumną; CTA ma pozostać łatwe do użycia dotykiem.
- [ ] Zachować poprawną hierarchię nagłówków, etykietę makietowego awatara i widoczny fokus klawiatury.
- [ ] Sprawdzić polskie znaki, brak poziomego przewijania i kontrast w widoku desktopowym oraz mobilnym.

## Kryteria odbioru

- [ ] `/akademia/` nie pokazuje katalogu kursów — pokazuje moduł dashboardu.
- [ ] `/akademia/kursy/` zawiera dotychczasowy katalog i wszystkie jego akcje nadal działają.
- [ ] Dashboard jest niezależnym modułem, gotowym do dalszego rozwijania bez mieszania z katalogiem kursów.
- [ ] Druga iteracja ma prawą kolumnę z danymi bieżącego użytkownika, makietowym obrazem i działającym linkiem „Moje kursy”, bez dodawania fikcyjnej funkcjonalności.
