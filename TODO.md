# Akademia — dashboard i katalog kursów

## ACD-101 — Wejście do Akademii — wykonane

- [x] `/akademia/` jest chronionym dashboardem zalogowanego kursanta.
- [x] Linki rozróżniają dashboard (`/akademia/`) i katalog „Moje kursy” (`/akademia/kursy/`).

## ACD-102 — Katalog kursów — wykonane

- [x] Dotychczasowy katalog, jego API i akcje kart są dostępne pod `/akademia/kursy/`.
- [x] `/akademia.html` przekierowuje do dashboardu, bez duplikowania treści.
- [x] Katalog ma poprawiony nagłówek i link powrotny do dashboardu.

## ACD-103 — Moduł dashboardu — wykonane

- [x] Dodano moduł `modules/academyDashboard/` z EJS i własnym CSS.
- [x] Dashboard renderuje moduł niezależnie od katalogu kursów.
- [x] Lewa kolumna pozostaje celowo pusta, z jednym neutralnym komunikatem-makietą.

## ACD-104 — Nawigacja — wykonane

- [x] Zaktualizowano odnośniki w widokach kursu, lekcji, zakupu i wyniku płatności.
- [x] Nie zmieniono kontraktów API ani schematu bazy danych.

## ACD-201 — Układ dashboardu — wykonane

- [x] Dashboard ma responsywny układ dwukolumnowy zgodny ze stylem portalu.
- [x] Nie zawiera wpisów społecznościowych, pozornych statystyk ani innych fikcyjnych funkcji.

## ACD-202 — Panel kursanta — wykonane

- [x] Prawa kolumna pokazuje imię i nazwisko z profilu, gdy są dostępne, oraz e-mail aktualnego użytkownika.
- [x] Dodano lokalny, makietowy awatar bez uploadu i bez danych obrazu w bazie.
- [x] Przycisk „Moje kursy” prowadzi do `/akademia/kursy/`.
- [x] Przy niepełnym profilu wyświetla się neutralna wskazówka do uzupełnienia danych.

## ACD-203 — Prywatność — wykonane

- [x] Dashboard otrzymuje wyłącznie dane użytkownika z bieżącej sesji i jego istniejącego profilu.
- [x] Nie dodano endpointów, migracji ani nowych pól danych osobowych.

## ACD-204 — Responsywność i dostępność — wykonane

- [x] Na małych ekranach panel profilu przechodzi pod główną kolumnę.
- [x] Zachowano semantyczne nagłówki, etykiety i widoczny fokus istniejących komponentów.

## Weryfikacja przed wdrożeniem

- [ ] Ręcznie sprawdzić lokalnie routing `/akademia/`, `/akademia/kursy/`, wygląd mobilny oraz konto z nieuzupełnionym profilem.
