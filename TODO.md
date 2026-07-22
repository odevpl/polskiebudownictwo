# Akademia — plan rozwoju kursów i dostępów

## Cel produktu

Zbudować Akademię, w której zalogowany użytkownik widzi wyłącznie kursy, do których ma dostęp. Dostęp może wynikać z tego, że kurs jest darmowy, został zakupiony albo został nadany ręcznie przez administratora.

Panel administracyjny powinien pozwalać zarządzać kursami, lekcjami, użytkownikami i dostępami bez ręcznej edycji bazy danych.

## Stan obecny

- Logowanie użytkowników i sesje już działają.
- Istnieje tabela users oraz ochrona stron Akademii.
- Istnieją ustawienia konta z danymi kontaktowymi i fakturowymi.
- Istnieje wizualny placeholder z trzema kartami kursów.
- Panel administracyjny obsługuje zgłoszenia i wydarzenia.
- Nie istnieją jeszcze kursy, lekcje, uprawnienia do kursów ani płatności.
- Lista kursów jest obecnie statyczna.

## Założenia domenowe

- Kurs może być darmowy albo płatny.
- Kurs może być aktywny albo ukryty.
- Dostęp może pochodzić z kursu darmowego, zakupu, ręcznego nadania albo kodu/promocji.
- Odebranie dostępu nie usuwa historii zakupu ani postępów.
- Każde sprawdzenie dostępu odbywa się po stronie backendu.
- Frontend może ukrywać elementy, ale nie jest mechanizmem bezpieczeństwa.

---

# Milestone 1 — model danych i migracje

## Story 1.1 — katalog kursów

- [x] Tabela courses: slug, tytuł, opis, kategoria, poziom, liczba lekcji, is_free, is_active, sort_order.
- [x] Unikalny indeks na slug.
- [x] Tabela course_lessons z kluczem course_id.
- [x] Typ treści lekcji: tekst, wideo lub materiał.
- [x] Modele Course i CourseLesson.

## Story 1.2 — dostęp użytkownika

- [x] Tabela user_course_access z user_id i course_id.
- [x] access_type: free, purchase, grant, code.
- [x] status: active, revoked, expired.
- [x] Daty nadania, wygaśnięcia i odebrania dostępu.
- [x] Informacja, który administrator nadał dostęp.
- [x] Model CourseAccess.
- [x] Funkcje hasActiveAccess(userId, courseId) i findAvailableCourses(userId).

## Story 1.3 — postęp

- [x] Tabela user_lesson_progress.
- [x] Status rozpoczęcia i ukończenia lekcji.
- [x] Unikalny indeks user_id + lesson_id.
- [x] Model odczytu i zapisu postępu.

## Story 1.4 — migracja

- [x] Dodać tabele do sql/schema.sql.
- [x] Rozszerzyć scripts/migrate.js dla istniejących instalacji.
- [x] Dodać trzy kursy testowe w osobnym, idempotentnym seedzie.
- [x] Opisać kolejność migracji na serwerze.
- [x] Nie zapisywać sekretów ani danych płatności w repozytorium.

**Kryterium:** baza pozwala utworzyć kurs, lekcję, dostęp i postęp.

---

# Milestone 2 — backend i kontrola dostępu

## Story 2.1 — serwis dostępu

- [ ] Utworzyć services/courseAccessService.js.
- [ ] Pobierać kursy dostępne dla użytkownika.
- [ ] Sprawdzać dostęp do kursu i konkretnej lekcji.
- [ ] Obsłużyć status revoked i expires_at.
- [ ] Nie ufać identyfikatorom przesyłanym tylko z frontendu.

## Story 2.2 — API Akademii

- [ ] GET /api/academy/courses.
- [ ] GET /api/academy/courses/:slug.
- [ ] GET /api/academy/courses/:slug/lessons/:lessonSlug.
- [ ] POST /api/academy/lessons/:id/progress.
- [ ] Zwracać 401 bez sesji i 403 bez dostępu.
- [ ] Nie ujawniać treści niedostępnego kursu.

## Story 2.3 — ochrona stron

- [ ] Middleware wymagający zalogowania.
- [ ] Middleware wymagający dostępu do kursu.
- [ ] Przekierowanie do listy kursów przy braku dostępu.
- [ ] Empty state, gdy użytkownik nie ma kursów.
- [ ] Ustawienia konta zawsze dostępne dla zalogowanego użytkownika.

**Kryterium:** nie da się otworzyć lekcji bez aktywnego dostępu, nawet znając URL.

---

# Milestone 3 — lista kursów i lekcje

## Wymaganie architektoniczne

- [ ] Kursy nie mogą być statycznymi podstronami zapisanymi osobno w plikach HTML.
- [ ] Lista kursów, szczegóły kursu i lekcje muszą być generowane dynamicznie na podstawie danych z bazy/API.
- [ ] Widok kursu powinien korzystać z identyfikatora lub slugu, np. `/akademia/kurs/:slug`.
- [ ] Jeden wspólny szablon EJS powinien obsługiwać wszystkie kursy i lekcje.

- [ ] Usunąć hardcoded kursy z obecnego widoku.
- [ ] Zostawić nagłówek „Dostępne kursy”.
- [ ] Pobierać listę z API.
- [ ] Renderować tytuł, kategorię, opis, poziom i liczbę lekcji.
- [ ] Dodać loading state, błąd i empty state.
- [ ] Przygotować widok szczegółów kursu.
- [ ] Przygotować widok lekcji.
- [ ] Zapisywać i wyświetlać postęp.

**Kryterium:** karta prowadzi tylko do chronionej zawartości dostępnej dla danego użytkownika.

---

# Milestone 4 — panel administracyjny

## Story 4.1 — nawigacja i role

- [ ] Dodać Akademię do admin-shell-start.ejs.
- [ ] Dodać trasę panelu Akademii.
- [ ] Ustalić akcje dla admin i superadmin.
- [ ] Zablokować zwykłemu adminowi zarządzanie administratorami.
- [ ] Rejestrować ważne operacje.

## Story 4.2 — CRUD kursów

- [ ] Lista kursów z filtrowaniem.
- [ ] Tworzenie i edycja kursu.
- [ ] Aktywowanie i ukrywanie kursu.
- [ ] Ustawianie kolejności.
- [ ] Walidacja slugu, tytułu, opisu i statusu.
- [ ] Ostrzeżenie przed usunięciem kursu z dostępami.

## Story 4.3 — lekcje

- [ ] Lista lekcji w kursie.
- [ ] Dodawanie i edycja lekcji.
- [ ] Zmiana kolejności.
- [ ] Publikowanie i ukrywanie.
- [ ] Obsługa treści tekstowej i wideo.

## Story 4.4 — dostępy

- [ ] Wyszukiwanie użytkownika po e-mailu.
- [ ] Lista dostępów użytkownika.
- [ ] Ręczne nadanie i odebranie dostępu.
- [ ] Data wygaśnięcia i powód odebrania.
- [ ] Historia zmian dostępu.
- [ ] Rozróżnienie free, purchase, grant i code.

## Story 4.5 — podgląd użytkownika

- [ ] Lista użytkowników Akademii.
- [ ] Status e-maila i konta.
- [ ] Podgląd danych kontaktowych i fakturowych według roli.
- [ ] Podgląd kursów i postępu.
- [ ] Dezaktywacja konta bez usuwania historii.

**Kryterium:** administrator może utworzyć kurs, opublikować lekcje i nadać dostęp.

---

# Milestone 5 — zakupy i płatności

- [ ] Tabele orders i order_items.
- [ ] Zapis ceny i nazwy kursu z momentu zakupu.
- [ ] Powiązanie zamówienia z użytkownikiem i fakturą.
- [ ] Statusy pending, paid, cancelled i refunded.
- [ ] Wybór operatora płatności.
- [ ] Podpisany webhook i idempotencja.
- [ ] Nadanie dostępu dopiero po potwierdzeniu płatności.
- [ ] Obsługa zwrotów i odebrania dostępu.
- [ ] Ustalenie, kto generuje faktury.

**Kryterium:** opłacony zakup nadaje dostęp idempotentnie.

---

# Milestone 6 — bezpieczeństwo, RODO i wdrożenie

## Bezpieczeństwo

- [ ] Sprawdzić autoryzację każdego endpointu.
- [ ] Sprawdzić, czy API nie ujawnia danych innych użytkowników.
- [ ] Ograniczyć próby zmiany hasła i operacji administracyjnych.
- [ ] Rozważyć unieważnianie sesji po zmianie hasła.
- [ ] Dodać CSRF, jeśli będzie wymagany przez sposób wdrożenia.
- [ ] Nie logować haseł, tokenów ani danych płatniczych.

## RODO

- [ ] Opisać cele przetwarzania danych kontaktowych i fakturowych.
- [ ] Ustalić retencję danych zakupowych i faktur.
- [ ] Przygotować eksport danych użytkownika.
- [ ] Przygotować usunięcie/anonymizację z zachowaniem wymogów księgowych.

## Testy i wdrożenie

- [ ] Test kursu darmowego, zakupionego, nadanego, revoked i expired.
- [ ] Test próby wejścia w cudzy kurs.
- [ ] Test panelu nadawania i odbierania dostępu.
- [ ] Test formularzy ustawień i NIP.
- [ ] Test webhooka z powtórzonym żądaniem.
- [ ] Test desktop/mobile i empty state.
- [ ] Backup bazy przed migracją produkcyjną.
- [ ] Migracja testowa i produkcyjna.
- [ ] Weryfikacja logów, sesji i procedury rollbacku.

---

# Proponowana kolejność

1. Baza danych i modele.
2. Serwis dostępu i ochrona backendu.
3. Dynamiczna lista kursów i lekcje.
4. Panel administracyjny.
5. Płatności i faktury.
6. Bezpieczeństwo, RODO, testy i wdrożenie.

## Pierwszy sprint

- [ ] Tabele courses, course_lessons, user_course_access i user_lesson_progress.
- [ ] Trzy kursy testowe.
- [ ] GET /api/academy/courses.
- [ ] Funkcja findAvailableCourses(userId).
- [ ] Dynamiczne karty na stronie „Dostępne kursy”.
- [ ] Jeden chroniony widok kursu.
- [ ] Tymczasowe nadanie dostępu przez seed lub panel.

Po tym sprincie mamy przepływ od bazy danych do widoku użytkownika bez czekania na płatności.

## Definition of Done

- Kod przechodzi sprawdzenie składni i build.
- Migracja działa na pustej i istniejącej bazie.
- Każdy endpoint ma kontrolę sesji i uprawnień.
- Niedostępny kurs nie jest widoczny w API ani możliwy do otwarcia po URL.
- Zmiany administracyjne są walidowane i audytowalne.
- Nie ma sekretów w repozytorium.
- Działa desktop, mobile i empty state.
