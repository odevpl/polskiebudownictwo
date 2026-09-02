# Akademia — wprowadzanie treści edukacyjnych z panelu admina

## Status bieżącej implementacji

Zrealizowany jest przepływ MVP end-to-end:

`Katalog szkoleń → Szkolenie → Moduły → Lekcje → bloki treści`

- `course_modules` przechowuje moduły przypisane do kursu.
- `course_lessons.module_id` przypisuje lekcję do modułu; istniejące lekcje są migrowane do modułu technicznego.
- Panel admina prowadzi przez kurs, moduły i lekcje, bez konieczności ręcznego budowania adresów.
- Lekcja może mieć naprzemiennie reużywalne bloki `richText` i `youtube`.
- Publiczne adresy kanoniczne to `/akademia/kurs/:kurs/modul/:modul` oraz `/lekcja/:lekcja`; stary adres lekcji przekierowuje do nowego.
- Nie ma seedów demonstracyjnych. Przy braku rekordów katalog pozostaje pusty.

Do dalszego rozwoju pozostają przede wszystkim: podgląd admin-only, drag-and-drop kolejności, testy automatyczne oraz kolejne typy bloków (PDF, obraz, quiz).

## Cel

Administrator ma móc utworzyć kurs, uzupełnić jego dane ogólne, dodać uporządkowane moduły edukacyjne oraz opublikować je tak, aby zalogowany klient z dostępem do kursu widział treści w Akademii.

Zakładany przepływ: `Lista kursów → Edycja kursu → Lista modułów → Edycja modułu → zapis szkicu/publikacja → publiczny kurs`.

W tym dokumencie rozróżniamy `course_modules` jako moduły szkolenia oraz `course_lessons` jako lekcje należące do modułu. Bloki treści są zapisywane w `course_lessons.content_blocks` jako JSON.

---

## Ustalenia z inwestygacji

### Co już istnieje

- `sql/schema.sql` zawiera `courses`, `course_lessons`, `user_course_access` i `user_lesson_progress`.
- `models/Course.js` oraz `models/CourseLesson.js` obsługują CRUD; model modułu synchronizuje `courses.lesson_count`.
- Panel ma już trasy listy/dodawania/edycji kursu oraz listy/dodawania/edycji lekcji.
- Publiczne API zwraca aktywne kursy, opublikowane lekcje i postęp użytkownika.
- Publiczny widok modułu renderuje `lesson.content` jako HTML (`<%- ... %>`), więc zawartość z panelu musi być sanitizowana.
- Istnieje `views/components/RichTextEditor.ejs` i prosty edytor oparty o `document.execCommand`, ale służy on obecnie mediatorom.
- `modules/richText/index.js` dopuszcza tylko `p`, `br`, `strong`, `b`, `em`, `i`, `ul`, `ol`, `li`; nie obsługuje nagłówków, linków ani bezpiecznych osadzeń YouTube.
- Seed Akademii zawiera demonstracyjne kursy i puste treści. Produkcja powinna być uzupełniana z panelu.

### Problemy do rozwiązania

1. Formularz modułu ma zwykły `textarea`, więc nie obsługuje wygodnie nagłówków, list, pogrubień i linków.
2. `content_type = 'video'` jest tylko etykietą; nie ma pola ani walidacji URL YouTube.
3. Jedno pole `content` nie deklaruje, czy przechowuje HTML, tekst czy inny format.
4. Sanitizacja nie jest podłączona do zapisu lekcji, a renderer ufa HTML.
5. Lista modułów nie pokazuje stanu treści, wideo, publikacji i kolejności w sposób wygodny redakcyjnie.
6. Panel nie komunikuje jasno, że klient zobaczy wyłącznie `is_active = 1` i `is_published = 1`.
7. W istniejących plikach Akademii występuje mojibake (`ZarzÄ…dzaj`, `Nie udaĹ‚o siÄ™`, `TytuĹ‚`). Dotknięte komunikaty trzeba poprawić i sprawdzić UTF-8.

### Rekomendacja edytora

Docelowo można użyć Tiptap z ograniczonym zestawem rozszerzeń: akapity, `h2`/`h3`/`h4`, pogrubienie, kursywa, listy punktowane/numerowane, link, cytat oraz undo/redo. Osadzanie YouTube powinno być osobnym, kontrolowanym polem albo kontrolowanym rozszerzeniem — nie dowolnym iframe z HTML.

Pierwsza implementacja używa lekkiego, natywnego `contenteditable` zamkniętego w reużywalnym module `richText`, aby nie dodawać teraz frameworka ani procesu bundlowania. Migracja do Tiptap pozostaje lokalną zmianą tego modułu, bez zmiany kontraktu `content_blocks`. Oficjalny `StarterKit` obejmuje m.in. nagłówki, listy, akapity, pogrubienie, kursywę i linki, a rozszerzenie YouTube obsługuje adres filmu.

### Decyzja architektoniczna — realizacja prac

Edytor musi być zbudowany z reużywalnych modułów blokowych, a nie jako jeden liniowy formularz z powtarzalnym kodem. Aktywne są moduły `richText` i `youtube`, które można układać naprzemiennie w jednym module kursu. Każdy następny typ treści (np. PDF, obraz, quiz lub akordeon) ma być dodawany przez rejestrację nowego modułu z własnym rendererem i własną walidacją.

Format zapisu modułu:

```json
[
  { "type": "richText", "data": { "html": "<h2>Wprowadzenie</h2><p>...</p>" } },
  { "type": "youtube", "data": { "url": "https://youtu.be/...", "title": "Materiał wideo" } }
]
```

Nie wolno kopiować toolbaru, obsługi usuwania, serializacji ani renderowania w każdym typie bloku. Wspólne zachowania należą do kontenera edytora, a różnice do modułu danego typu.

---

## Proponowany model danych

### MVP — rozdzielenie szkolenia, modułu i lekcji

Tabela `course_modules` jest kontenerem pomiędzy `courses` i `course_lessons`. Lekcja ma `module_id`, dzięki czemu zachowujemy istniejący model postępu i dostępów, a jednocześnie otrzymujemy czteropoziomową nawigację.

Do rozważenia w migracji:

- `content_format ENUM('html') NOT NULL DEFAULT 'html'` — jawny format `content`;
- `video_url VARCHAR(500) NULL` — jedno główne wideo w MVP;
- `video_provider ENUM('youtube') NULL` lub stała po stronie aplikacji;
- `published_at DATETIME NULL` — faktyczny czas publikacji;
- `updated_by_admin_id INT UNSIGNED NULL` z FK do `admins` — audyt ostatniej zmiany.

Jeśli od początku potrzebne są liczne filmy/materiały, utworzyć `course_lesson_media`:

```text
id, lesson_id → course_lessons.id, media_type, title, url,
provider_id/video_id, sort_order, created_at, updated_at
```

Rekomendacja dla obecnej wersji: `content_blocks` jako JSON z blokami `richText` i `youtube`. Tabelę mediów dodać osobno, gdy potrzebne będzie wiele plików lub niezależne zarządzanie załącznikami.

### Kurs

Istniejące `courses` pokrywa dane ogólne. Nie należy pozwalać na ręczne ustawianie `lesson_count`; licznik ma być wynikiem synchronizacji z modułami. Panel powinien pokazywać liczbę wszystkich, opublikowanych i posiadających treść modułów.

---

## Tickety implementacyjne

### [ ] EDU-01 — Kontrakt treści i zasady publikacji

**Do wykonania:** ustalić, że `content` przechowuje sanitizowany HTML, a `description` jest zwykłym tekstem; spisać dozwolone tagi (`p`, `br`, `h2`, `h3`, `h4`, `strong`, `em`, `ul`, `ol`, `li`, `blockquote`, `a`), atrybuty i protokoły URL (`http`, `https`, `mailto`); ustalić, że dowolny iframe jest zabroniony; zdefiniować stany szkicu i publikacji.

**Decyzja do potwierdzenia:** rekomendowane jest dopuszczenie aktywnego kursu bez opublikowanych modułów, ale z widocznym ostrzeżeniem w panelu.

**Akceptacja:** kontrakt jest zapisany w kodzie/dokumentacji i kolejne prace używają jednoznacznych nazw.

### [ ] EDU-02 — Migracja bazy dla treści modułów

**Do wykonania:** przygotować idempotentną migrację w `scripts/migrate.js` i `sql/schema.sql`; dodać zaakceptowane pola (`content_format`, `video_url`, opcjonalnie `published_at`/audyt); zachować istniejące `content_type`; ustawić wartości domyślne dla starych rekordów; opisać backup i rollback w `docs/academy-migration.md`; dla tabeli mediów dodać FK, `ON DELETE CASCADE`, kolejność i indeksy.

**Akceptacja:** `npm run migrate` można uruchamiać ponownie, stare kursy działają, a migracja nie zawiera sekretów ani danych demonstracyjnych.

### [ ] EDU-03 — Bezpieczna sanitizacja i normalizacja HTML

**Do wykonania:** rozbudować lub wydzielić `modules/richText/index.js`; usuwać skrypty, style, event handlery, formularze, obiekty, embed i nieznane tagi; zachować tylko kontrakt z EDU-01; filtrować URL; osobno walidować YouTube i wyciągać ID; nie zapisywać dowolnego iframe; sanitizować przy zapisie i mieć obronę przy renderowaniu; dodać testy XSS, `javascript:`, `onerror` i wklejonego HTML.

**Akceptacja:** treść jest bezpiecznym HTML, a niebezpieczny payload nie prowadzi do XSS ani niekontrolowanego iframe.

### [ ] EDU-04 — Model i serwis modułów edukacyjnych

**Do wykonania:** rozszerzyć `models/CourseLesson.js` o nowe pola; dodać serwis walidujący payload, sanitizujący HTML, normalizujący slug i synchronizujący licznik; sprawdzać przynależność modułu do kursu także przy edycji po ID; zachować stabilną kolejność `sort_order, id`; rozważyć osobne `saveDraft`/`publish`; dodać testy CRUD, duplikatu sluga, usuwania i kaskady.

**Akceptacja:** kontroler nigdy nie zapisuje surowego HTML, a licznik kursu jest poprawny po dodaniu i usunięciu modułu.

### [ ] EDU-05 — Panel: lista kursów i dane ogólne

**Do wykonania:** zachować `/academy/courses`; dodać status, cenę, wszystkie/opublikowane moduły, datę aktualizacji i podgląd; dodać filtr statusu/wyszukiwanie przy większej liczbie kursów; podzielić formularz na identyfikację, opis, sprzedaż, publikację i sortowanie; usunąć pole ręcznego `lessonCount`; po zapisie dać link do modułów; ostrzegać przed aktywacją pustego kursu; zachować auth, rate limiting i potwierdzenie usuwania.

**Akceptacja:** administrator tworzy kurs i przechodzi do jego modułów bez ręcznego budowania URL; aktywny kurs trafia do istniejącego katalogu.

### [ ] EDU-06 — Panel: lista i kolejność modułów

**Do wykonania:** w UI użyć nazwy „Moduły kursu” przy zachowaniu kompatybilnych tras; pokazywać numer, tytuł, slug, typ, status, obecność treści/wideo i aktualizację; dodać edycję, publikację/cofnięcie, usunięcie i podgląd; minimum obsłużyć `sort_order`, docelowo drag-and-drop; ostrzegać o opublikowanym module bez treści; po usunięciu odświeżać licznik; sprawdzać własność kursu.

**Akceptacja:** administrator widzi moduły w kolejności klienta i przygotowuje kurs bez SQL.

### [ ] EDU-07 — Panel: edycja pojedynczego modułu

**Pola:** wymagany tytuł, slug generowany z tytułu przy tworzeniu, opis jako tekst, typ modułu, treść główna, opcjonalny link YouTube, kolejność oraz publikacja.

**Edytor:** `h2`/`h3`/`h4` (bez `h1`), pogrubienie, kursywa, listy punktowane/numerowane, bezpieczne linki, opcjonalny cytat, undo/redo i podgląd. Przycisk „Wstaw YouTube” ma zapisywać kontrolowany URL/ID, nie dowolny iframe.

**Akceptacja:** administrator zapisuje moduł z nagłówkami, listami i pogrubieniem; klient widzi tę strukturę, a błędny URL YouTube nie może zostać opublikowany.

### [ ] EDU-08 — Integracja Tiptap w statycznym panelu

**Do wykonania:** dodać zależności tylko jeśli build/deploy je obsłuży; przygotować niezależny `public/js/admin-course-editor.js` i komponent widoku; synchronizować HTML do hidden input; obsłużyć brak JS czytelnym błędem; dodać CSS toolbaru, focusu, placeholdera, nagłówków i list; ograniczyć rozszerzenia do potrzeb edukacyjnych; sprawdzić assety w paczce wdrożeniowej.

**Akceptacja:** edytor działa desktop/mobile, nie wpływa na formularze mediatorów i jest obecny w `dists/polskiebudownictwo.org/`.

### [ ] EDU-09 — Publiczny renderer modułu i YouTube

**Do wykonania:** rozbudować `views/public/academy/modules/lessonView/index.ejs`; generować embed wyłącznie z zweryfikowanego ID, preferować `youtube-nocookie.com`; dodać responsywny wrapper 16:9 i opisowy tytuł; renderować sanitizowane `content`; zachować filtrowanie po aktywnym kursie/opublikowanym module; sprawdzić widok kursu, nawigację i postęp.

**Akceptacja:** klient z dostępem widzi treść i responsywny film, a klient bez dostępu nie dostaje treści przez API.

### [ ] EDU-10 — Statusy, podgląd i bezpieczna publikacja

**Do wykonania:** dodać admin-only podgląd tą samą ścieżką renderowania albo podpisany token; rozdzielić zapis szkicu od publikacji; przed publikacją pokazać checklistę tytułu, opisu, treści, wideo, kolejności i statusu kursu; pokazywać ostrzeżenia o pustych/nieopublikowanych modułach; rozważyć log admin/rekord/akcja/czas.

**Akceptacja:** administrator wie, co będzie widoczne i nie publikuje przez ręczne SQL.

### [ ] EDU-11 — Walidacja, uprawnienia i testy end-to-end

**Do wykonania:** walidować długości, slug, kolejność, typy, URL i rozmiar HTML; używać parametrów SQL; sprawdzić `requireAuth` i role dla POST; testować UTF-8; przetestować utworzenie/edycję/publikację/cofnięcie/usunięcie, duplikaty, kaskadę, dostęp aktywny/wygasły/brak dostępu i synchronizację `lesson_count`.

**Akceptacja:** scenariusz „admin dodaje kurs → publikuje moduł → klient z dostępem widzi treść” przechodzi na środowisku testowym.

### [ ] EDU-12 — Dokumentacja i wdrożenie

**Do wykonania:** zaktualizować `docs/academy-migration.md`; opisać assety edytora i `npm run build:deploy`; przygotować instrukcję dla administratora; sprawdzić paczkę głównej domeny; wykonać test kursu darmowego i płatnego; poprawić mojibake w dotkniętych plikach.

**Akceptacja:** wdrożenie jest powtarzalne, a administrator potrafi samodzielnie opublikować kurs.

---

## Kolejność realizacji

1. EDU-01 — kontrakt i decyzje modelu.
2. EDU-02 — migracja bazy.
3. EDU-03 — sanitizacja.
4. EDU-04 — model/serwis.
5. EDU-05 i EDU-06 — listy kursów i modułów.
6. EDU-07 i EDU-08 — formularz i edytor.
7. EDU-09 — publiczne renderowanie.
8. EDU-10 — publikacja i podgląd.
9. EDU-11 — testy bezpieczeństwa i end-to-end.
10. EDU-12 — dokumentacja i wdrożenie.

## Poza MVP

- wiele filmów i plików w jednym module (`course_lesson_media`),
- upload plików do storage,
- wersjonowanie i historia zmian,
- autosave szkicu,
- quizy i punktacja,
- certyfikaty,
- role autora/redaktora i akceptacja publikacji,
- automatyczny spis treści.

## Definition of Done pierwszego kursu

- Kurs można utworzyć w panelu z tytułem, slugiem, opisem, ceną i statusem.
- Można dodać moduł z tytułem, kolejnością i treścią z edytora.
- Treść obsługuje nagłówki, listy, pogrubienia, linki i opcjonalny YouTube.
- HTML przechodzi sanitizację i nie umożliwia XSS.
- Kurs i moduł można opublikować z panelu.
- Klient z dostępem widzi kurs, treść, film, nawigację i postęp.
- Klient bez dostępu nie otrzymuje treści.
- Liczniki i statusy są zgodne z bazą.
- Migracja i build wdrożeniowy przechodzą poprawnie, a teksty są poprawnym UTF-8.

---

## Docelowa hierarchia Akademii — katalog szkoleń → szkolenie → moduł → lekcja

### Decyzja nazewnicza

Przyjmujemy cztery główne poziomy:

```text
Katalog szkoleń
  → Szkolenie
    → Moduł
      → Lekcja
        → bloki treści: tekst, YouTube, później PDF/quiz/obraz
```

„Etap” i „podmoduł” nie będą używane jako nazwy domenowe. Widok ze screenów jest widokiem lekcji. Po lewej stronie lekcji znajduje się „Program szkolenia” lub „Lekcje modułu”, a nie „Lista podmodułów”.

### Docelowa struktura katalogów

Nowe elementy należy dodawać modułowo, bez rozbudowywania jednego dużego kontrolera lub szablonu:

```text
models/
  Course.js
  CourseModule.js              # nowy model modułu
  CourseLesson.js              # obecny model; semantycznie lekcja

controllers/admin/
  academyController.js         # tymczasowo może obsłużyć przepływ
  academyModuleController.js   # docelowo osobny kontroler modułów

controllers/public/
  academyPageController.js     # strony katalogu/szkolenia/modułu/lekcji
  academyController.js         # API Akademii

views/admin/academy/
  courses/                     # lista i dane szkolenia
  modules/                     # lista i formularz modułu
  lessons/                     # lista i formularz lekcji

views/public/academy/
  catalog.ejs                  # opcjonalnie, jeśli katalog przestanie być statycznym HTML
  course.ejs                   # szkolenie i klocki modułów
  module.ejs                   # moduł i lista lekcji
  lesson.ejs                   # obecny widok lekcji
  modules/
    courseCard/
    moduleCard/                # nowy klocek modułu
    lessonList/
    lessonView/
    contentBlock/              # renderer tekstu/YouTube

public/js/admin/courseContent/
  editor.js                    # kontener i rejestr bloków lekcji
  modules/richText.js
  modules/youtube.js

modules/courseContent/
  index.js                     # normalizacja, sanitizacja i walidacja bloków
```

Nazwy mogą pozostać przy obecnych trasach dla kompatybilności, ale kod i UI powinny używać `module` dla modułu szkolenia oraz `lesson` dla lekcji.

### Zmiany w bazie danych

Dodać tabelę `course_modules`:

```text
id                  INT UNSIGNED PK
course_id           INT UNSIGNED FK → courses.id ON DELETE CASCADE
slug                VARCHAR(160)
title               VARCHAR(255)
description         TEXT NULL
image_url           VARCHAR(500) NULL      # opcjonalnie, nie blokuje MVP
sort_order          INT NOT NULL DEFAULT 0
is_published        TINYINT(1) NOT NULL DEFAULT 0
created_at          TIMESTAMP
updated_at          TIMESTAMP
UNIQUE(course_id, slug)
INDEX(course_id, is_published, sort_order, id)
```

Do `course_lessons` dodać:

```text
module_id INT UNSIGNED NULL FK → course_modules.id ON DELETE CASCADE
```

`module_id` powinien być chwilowo nullable na czas migracji. Po przypisaniu istniejących lekcji można rozważyć `NOT NULL`.

Pozostałe zasady:

- `courses` pozostaje szkoleniem i nadal przechowuje cenę, dostęp oraz aktywność sprzedażową;
- `course_lessons` staje się lekcją należącą do modułu;
- `content_blocks` pozostaje w `course_lessons`, bo tekst i YouTube są zawartością lekcji;
- `user_lesson_progress` pozostaje tabelą postępu lekcji;
- `user_course_access` pozostaje dostępem do całego szkolenia, nie do pojedynczego modułu;
- `lesson_count` powinien zostać uzupełniony o `module_count` albo być liczony zapytaniem; nie należy ręcznie wpisywać tych wartości z panelu.

### Migracja istniejących danych

Nie wolno przypisywać wszystkich obecnych lekcji bezpośrednio do przypadkowego modułu. Migracja powinna:

1. utworzyć tabelę `course_modules`;
2. dla każdego istniejącego kursu utworzyć tymczasowy moduł, np. slug `materialy-kursu`, z tytułem „Materiały szkolenia”;
3. przypisać obecne `course_lessons.module_id` do tego modułu;
4. zachować slugi, kolejność, publikację, `content`, `content_blocks` i postęp użytkowników;
5. pozwolić administratorowi później rozdzielić lekcje do właściwych modułów;
6. po weryfikacji ustalić, czy `module_id` może stać się wymagane.

### Publiczny przepływ i routing

Obecnie `/akademia/kurs/:slug` przekierowuje do pierwszej lekcji. Należy zmienić to na stronę szkolenia z kartami modułów.

Rekomendowane adresy:

```text
/akademia                         # katalog szkoleń
/akademia/kurs/:courseSlug       # szkolenie, lista modułów
/akademia/kurs/:courseSlug/modul/:moduleSlug
                                  # moduł, lista lekcji
/akademia/kurs/:courseSlug/modul/:moduleSlug/lekcja/:lessonSlug
                                  # lekcja, treść i postęp
```

Istniejący adres `/akademia/kurs/:courseSlug/lekcja/:lessonSlug` należy tymczasowo obsłużyć jako legacy route. Jeśli slug lekcji jest jednoznaczny w kursie, można przekierować do nowego URL; w przeciwnym przypadku zwrócić bezpieczny wybór modułu.

Do API dodać lub zmienić:

- `GET /api/academy/courses/:slug` — szkolenie z opublikowanymi modułami i liczbami lekcji;
- `GET /api/academy/courses/:slug/modules/:moduleSlug` — moduł z opublikowanymi lekcjami;
- `GET /api/academy/courses/:slug/modules/:moduleSlug/lessons/:lessonSlug` — lekcja;
- dotychczasowy endpoint lekcji zachować jako kompatybilność;
- postęp nadal zapisywać po `lesson_id`.

Każdy endpoint musi najpierw sprawdzić dostęp do szkolenia. Moduł i lekcja nie mogą ujawnić danych, jeśli kurs jest nieaktywny albo użytkownik nie ma dostępu.

### Zmiany w zapleczu admina

#### Lista szkoleń

Pozostaje pierwszym ekranem Akademii i pokazuje:

- nazwę szkolenia,
- status aktywności,
- liczbę modułów,
- liczbę lekcji,
- liczbę opublikowanych modułów/lekcji,
- cenę,
- datę aktualizacji,
- akcję „Edytuj szkolenie”.

#### Edycja szkolenia

Formularz danych sprzedażowych i ogólnych pozostaje bez zmian. Należy dodać panel „Struktura szkolenia” z:

- listą modułów,
- liczbą lekcji w każdym module,
- statusem publikacji,
- zmianą kolejności,
- akcją „Zarządzaj modułami”.

#### Lista modułów szkolenia

Nowy ekran, np. `/admin/academy/courses/:courseId/modules`:

- karty lub tabela modułów,
- kolejność,
- tytuł i opis,
- liczba lekcji,
- liczba opublikowanych lekcji,
- status modułu,
- „Edytuj moduł”, „Zarządzaj lekcjami”, „Podgląd”, „Usuń”.

#### Edycja modułu

Nowy formularz powinien zawierać wyłącznie dane organizacyjne:

- tytuł,
- slug,
- opis,
- opcjonalną grafikę/ikonę,
- kolejność,
- publikację.

Treść edukacyjna nie powinna być wpisywana na tym ekranie. Przycisk „Zarządzaj lekcjami” prowadzi do podmodułów nazywanych w UI „Lekcjami modułu”.

#### Lista lekcji modułu

Obecny ekran `lessons/index.ejs` należy przenieść semantycznie pod moduł. Powinien pokazywać:

- kolejność,
- tytuł lekcji,
- typ/bloki treści,
- status publikacji,
- obecność treści,
- obecność YouTube,
- akcje edycji i podglądu.

#### Edycja lekcji

Obecny edytor blokowy tekst/YouTube pozostaje na poziomie lekcji. Nie należy przenosić `content_blocks` do modułu. Lekcja może zawierać dowolną sekwencję:

```text
tekst → YouTube → tekst → YouTube
```

### Kolejność prac

1. Dodać model `CourseModule` i migrację `course_modules`.
2. Dodać `module_id` do `course_lessons` oraz migrację danych tymczasowych.
3. Wydzielić kontroler i widoki modułów w panelu admina.
4. Przenieść obecne lekcje do kontekstu wybranego modułu.
5. Zmienić `/akademia/kurs/:slug` na widok kart modułów.
6. Dodać publiczny widok modułu z listą lekcji.
7. Dodać kanoniczny URL lekcji oraz legacy redirect.
8. Rozszerzyć API i zachować kontrolę dostępu na poziomie szkolenia.
9. Uzupełnić liczby modułów/lekcji i statusy publikacji w panelu.
10. Przetestować migrację, dostęp, postęp, zakup i widoki na telefonie.

### Kryterium końcowe

Administrator wykonuje:

```text
Dodaj szkolenie
  → Dodaj moduł
    → Dodaj lekcję
      → Dodaj tekst / YouTube
        → Opublikuj lekcję
          → Opublikuj moduł
            → Aktywuj szkolenie
```

Klient wykonuje:

```text
Katalog szkoleń
  → Szkolenie
    → Moduł
      → Lekcja
        → czyta bloki treści i zapisuje postęp
```
