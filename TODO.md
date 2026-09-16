# TODO — Polskie Budownictwo

Legenda: `[ZROBIONE]` — wdrożone i sprawdzone, `[DO ZROBIENIA]` — zadanie otwarte.

## 1. Akademia — kursy, moduły i lekcje

- 1.1 [ZROBIONE] Kursy są pobierane wyłącznie z bazy danych.
- 1.2 [ZROBIONE] Usunięto seed demonstracyjny Akademii.
- 1.3 [ZROBIONE] Dodano tabelę `course_modules` powiązaną z `courses`.
- 1.4 [ZROBIONE] Dodano `module_id` w `course_lessons`.
- 1.5 [ZROBIONE] Dodano migrację istniejących lekcji do modułu technicznego.
- 1.6 [ZROBIONE] Zachowano istniejące dostępy, zamówienia i postęp użytkownika.
- 1.7 [ZROBIONE] Panel obsługuje przepływ: kurs → moduły → lekcje.
- 1.8 [ZROBIONE] Dodano listę i formularz edycji modułów.
- 1.9 [ZROBIONE] Dodano listę i formularz edycji lekcji w module.
- 1.10 [ZROBIONE] Dodano kanoniczne adresy kursu, modułu i lekcji.
- 1.11 [ZROBIONE] Stare adresy lekcji przekierowują do nowej struktury.
- 1.12 [DO ZROBIENIA] Dodać zmianę kolejności modułów i lekcji metodą drag-and-drop.
- 1.13 [DO ZROBIENIA] Dodać podgląd nieopublikowanego kursu wyłącznie dla administratora.
- 1.14 [DO ZROBIENIA] Dodać checklistę przed publikacją kursu i modułu.

## 2. Edytor treści edukacyjnych

- 2.1 [ZROBIONE] Wydzielono reużywalny kontener bloków treści.
- 2.2 [ZROBIONE] Dodano moduł bloku tekstowego rich text.
- 2.3 [ZROBIONE] Dodano moduł bloku YouTube.
- 2.4 [ZROBIONE] Można mieszać tekst i YouTube w dowolnej kolejności.
- 2.5 [ZROBIONE] Dodano nagłówki, pogrubienie, kursywę i listy.
- 2.6 [ZROBIONE] YouTube jest zapisywany jako zweryfikowane ID filmu.
- 2.7 [ZROBIONE] Treści są normalizowane i filtrowane przed zapisem oraz renderowaniem.
- 2.8 [ZROBIONE] Zabezpieczono renderowanie przed skryptami i niekontrolowanym iframe.
- 2.9 [DO ZROBIENIA] Dodać automatyczne testy sanitizacji HTML i payloadów XSS.
- 2.10 [DO ZROBIENIA] Rozważyć migrację lokalnego edytora do Tiptap.
- 2.11 [DO ZROBIENIA] Blok „Pliki” z managerem uploadu wdrożony (sekcja 10). W dalszym rozwoju rozważyć osobne podglądy PDF i obrazów oraz bloki cytatu, quizu i akordeonu.

## 3. Akademia — zakup i dostęp

- 3.1 [ZROBIONE] Dodano tymczasowy workaround płatności aktywujący zakup bez operatora.
- 3.2 [ZROBIONE] Dostęp do kursu jest kontrolowany przez `user_course_access`.
- 3.3 [ZROBIONE] Przy braku danych Akademia wyświetla pustą listę.
- 3.4 [DO ZROBIENIA] Usunąć workaround płatności po uruchomieniu właściwego operatora.
- 3.5 [DO ZROBIENIA] Wykonać testy zakupu kursu darmowego i płatnego.
- 3.6 [DO ZROBIENIA] Dodać testy dostępu aktywnego, wygasłego, cofniętego i braku dostępu.

## 4. Publiczne landing pages szkoleń

- 4.1 [ZROBIONE] Dodano `/szkolenia`.
- 4.2 [ZROBIONE] Dodano `/szkolenia/bezpieczny-podwykonawca`.
- 4.3 [ZROBIONE] Landing przygotowano na podstawie dostarczonego PDF-a.
- 4.4 [ZROBIONE] Landing nie został dodany do głównego menu.
- 4.5 [ZROBIONE] Skopiowano główne menu wraz z dropdownami i wersją mobilną.
- 4.6 [ZROBIONE] Dodano responsywny sticky footer.
- 4.7 [ZROBIONE] Ujednolicono style sekcji, kart, nagłówków i CTA ze stroną główną.
- 4.8 [DO ZROBIENIA] Przygotować system wielu landing pages opartych o dane z bazy.
- 4.9 [DO ZROBIENIA] Dodać model landing page powiązany z kursem.
- 4.10 [DO ZROBIENIA] Dodać reużywalne sekcje landing page: hero, korzyści, program, FAQ, opinie i CTA.
- 4.11 [DO ZROBIENIA] Dodać SEO title, description, Open Graph i dane strukturalne.
- 4.12 [DO ZROBIENIA] Dodać formularz kwalifikujący przed rozmową wprowadzającą.

## 5. Rejestracja użytkowników — bezpieczeństwo przed publikacją

- 5.1 [ZROBIONE] Rejestracja wymaga poprawnego e-maila i hasła minimum 12 znaków.
- 5.2 [ZROBIONE] Hasła są haszowane przez bcrypt.
- 5.3 [ZROBIONE] Potwierdzenie e-maila wykorzystuje jednorazowe tokeny przechowywane jako hash.
- 5.4 [ZROBIONE] Rejestracja i logowanie mają podstawowy limit żądań.
- 5.5 [ZROBIONE] Istnieje ochrona CSRF dla żądań modyfikujących.
- 5.6 [ZROBIONE] Dodać Google reCAPTCHA v2 Checkbox przed utworzeniem konta.
- 5.7 [ZROBIONE] Dodać honeypot i minimalny czas wypełniania formularza.
- 5.8 [ZROBIONE] Ustawiać nowe konto jako `is_active = 0` do czasu potwierdzenia e-maila.
- 5.9 [ZROBIONE] Dodać limit ponownego wysłania wiadomości weryfikacyjnej.
- 5.10 [DO ZROBIENIA] Zastąpić pamięciowy rate limit wspólnym storage, np. Redisem.
- 5.11 [ZROBIONE] Dodać limity per IP, e-mail, domena i globalną liczbę rejestracji.
- 5.12 [ZROBIONE] Dodać oznaczanie lub blokowanie tymczasowych domen e-mail.
- 5.13 [DO ZROBIENIA] Dodać monitoring nagłego wzrostu rejestracji.
- 5.14 [ZROBIONE] Dodać logowanie prób rejestracji: IP, User-Agent, czas i wynik.
- 5.15 [DO ZROBIENIA] Dodać automatyczne czyszczenie niepotwierdzonych kont.
- 5.16 [DO ZROBIENIA] Rozważyć zatwierdzanie kont przez administratora.

## 6. Audyt obecnych kont po incydencie

- 6.1 [DO ZROBIENIA] Przejrzeć sześć potwierdzonych kont i ustalić ich źródło w logach.
- 6.2 [DO ZROBIENIA] Sprawdzić, czy obce konta mają zamówienia, dostępy lub aktywność w Akademii.
- 6.3 [DO ZROBIENIA] Wyłączyć obce konta przez `is_active = 0` po identyfikacji.
- 6.4 [DO ZROBIENIA] Usunąć niepotrzebne konta i tokeny po backupie oraz audycie.
- 6.5 [DO ZROBIENIA] Sprawdzić żądania `POST /api/auth/register` i `POST /api/auth/verify-email`.
- 6.6 [DO ZROBIENIA] Zweryfikować logi dostępu do panelu i bazy danych.
- 6.7 [DO ZROBIENIA] Zmienić sekrety i hasła, jeżeli logi wykażą dostęp spoza aplikacji.

## 7. Panel administracyjny

- 7.1 [ZROBIONE] Panel ma osobne sekcje kursów, modułów i lekcji.
- 7.2 [ZROBIONE] POST-y panelu wymagają uwierzytelnienia.
- 7.3 [ZROBIONE] Usuwanie kursów, modułów i lekcji wymaga potwierdzenia.
- 7.4 [DO ZROBIENIA] Dodać 2FA dla administratorów.
- 7.5 [DO ZROBIENIA] Dodać dziennik działań administratorów.
- 7.6 [DO ZROBIENIA] Dodać ostrzeżenia przed publikacją pustego kursu lub modułu.
- 7.7 [DO ZROBIENIA] Dodać filtrowanie i wyszukiwanie kursów.

## 8. Baza danych i wdrożenie

- 8.1 [ZROBIONE] Migracje są uruchamiane przez `npm run migrate`.
- 8.2 [ZROBIONE] Migracja modułów jest idempotentna.
- 8.3 [ZROBIONE] Seed Akademii został usunięty.
- 8.4 [ZROBIONE] Build głównej domeny działa przez `npm run build:main`.
- 8.5 [ZROBIONE] Build obu domen działa przez `npm run build:deploy`.
- 8.6 [DO ZROBIENIA] Wykonywać backup przed każdą migracją produkcyjną.
- 8.7 [DO ZROBIENIA] Ograniczyć uprawnienia użytkownika bazy danych.
- 8.8 [DO ZROBIENIA] Dodać procedurę rollbacku migracji dla produkcji.
- 8.9 [DO ZROBIENIA] Dodać test smoke po wdrożeniu obu paczek.
- 8.10 [DO ZROBIENIA] Sprawdzić poprawność UTF-8 w dotkniętych plikach i odpowiedziach HTTP.

## 9. Najbliższa kolejność prac

9.1 [DO ZROBIENIA] Zabezpieczyć rejestrację CAPTCHA, honeypotem i mocniejszym rate limitingiem.
9.2 [DO ZROBIENIA] Przeprowadzić audyt sześciu potwierdzonych kont i logów serwera.
9.3 [DO ZROBIENIA] Włączyć `is_active` dopiero po potwierdzeniu e-maila.
9.4 [DO ZROBIENIA] Dodać testy bezpieczeństwa i scenariusze end-to-end Akademii.
9.5 [DO ZROBIENIA] Zdecydować o modelu i panelu dynamicznych landing pages.
9.6 [DO ZROBIENIA] Usunąć workaround płatności po uruchomieniu operatora.

## 10. Moduł plików i sekcje „Pliki” w lekcjach

Aktualny zakres: w edytorze lekcji obok „Dodaj tekst” i „Dodaj YouTube” pojawia się „Dodaj pliki”. Przycisk tworzy niezależny blok w wybranym miejscu treści. Każdy blok zawiera manager w formie galerii plików i przycisk „+”, którym można kolejno dodawać następne pliki. Lekcja może zawierać wiele takich bloków, przeplatanych tekstem i filmami. Zastępuje to wcześniejszy pomysł jednej listy załączników na samym dole lekcji.

Stan implementacji: moduł działa lokalnie, migracja tabel plików wykonana po kopii bazy. Testy formatów, skanera i multipart oraz testy E2E na osobnej bazie i w Chromium są dostępne przez `npm run test:files` i `npm run test:files:e2e`. Dokumentacja: [docs/lesson-files.md](docs/lesson-files.md). Lokalnie jawnie pomijamy skaner; produkcja zawsze go wymaga. Tickety 10.10 i 10.26 pozostają otwarte wyłącznie w zakresie odbioru infrastruktury hostingowej — nie wykonano wdrożenia produkcyjnego.

### 10.A. Architektura i model danych

- 10.1 [ZROBIONE] Wydzielić ogólny moduł `modules/files/` z operacjami przyjęcia, weryfikacji, zapisu, odczytu i usuwania plików. Kryterium odbioru: moduł nie zależy od modeli kursów, a typy, limity i wymagania skanowania wynikają z polityki wybieranej przez serwer.
- 10.2 [ZROBIONE] Dodać tabelę `files` i model metadanych: identyfikator, klucz magazynu, nazwa oryginalna, wykryty MIME, rozmiar, status weryfikacji, autor i daty. Kryterium odbioru: ścieżki fizyczne nie trafiają do klienta, a pliki oczekujące lub odrzucone nie są dostępne uczestnikom.
- 10.3 [ZROBIONE] Rozszerzyć kontrakt `content_blocks` o typ `files`, trwały identyfikator bloku i uporządkowane referencje do plików; dodać relację `lesson_attachments` powiązaną z lekcją, blokiem i plikiem. Kryterium odbioru: wiele bloków zachowuje własną zawartość i kolejność po ponownym otwarciu lekcji; relacja SQL i JSON są aktualizowane spójnie w transakcji. Nazwy wyświetlane i kolejność mają jedno jasno wskazane źródło prawdy.
- 10.4 [ZROBIONE] Dodać idempotentną migrację tabel i indeksów oraz obsługę dotychczasowych bloków bez identyfikatorów. Kryterium odbioru: istniejące teksty, filmy, dostępy i postępy pozostają poprawne, a ponowne uruchomienie migracji jest bezpieczne.
- 10.5 [ZROBIONE] Zdefiniować cykl życia uploadu i zapisu lekcji: upload tymczasowy przypisany do administratora, zatwierdzenie powiązania przy zapisie lekcji i wygasanie porzuconych plików. Kryterium odbioru: manager działa również w nowej, jeszcze niezapisanej lekcji; upload nie przeładowuje formularza, a anulowanie edycji nie zmienia opublikowanych powiązań. Serwer weryfikuje prawo do każdego przypisywanego pliku.

### 10.B. Magazyn i zabezpieczenia

- 10.6 [ZROBIONE] Dodać lokalny magazyn wskazany przez `UPLOAD_STORAGE_PATH`, poza `page/`, `public/` i katalogiem paczki wdrożeniowej. Kryterium odbioru: pliki mają losowe nazwy techniczne, nie można odczytać ich przez statyczny URL ani wyjść poza katalog magazynu; interfejs magazynu pozwala później zmienić sposób przechowywania.
- 10.7 [ZROBIONE] Obsługiwać `multipart/form-data` przez Multera (`diskStorage`, `upload.single('file')`) uruchamianego wyłącznie na trasie uploadu, po kontroli sesji, uprawnień, CSRF i limitów. Kryterium odbioru: strumieniowy zapis do prywatnego magazynu pod losową nazwą, ograniczenia rozmiaru, liczby plików, pól i czasu żądania oraz sprzątanie po przerwanym transferze; duże pliki nie są w całości buforowane w pamięci. Walidacja faktycznej zawartości następuje po zapisie.
- 10.8 [ZROBIONE] Wprowadzić politykę formatów PDF, JPG/JPEG i WebP oraz walidację rozszerzenia, deklarowanego MIME i faktycznej zawartości. Kryterium odbioru: odrzucenie plików pustych, uszkodzonych, niedozwolonych i podszywających się pod inny format; kontrola wymiarów obrazów i kosztu ich przetwarzania; bezpieczne wyświetlanie nazw i nagłówki pobierania.
- 10.9 [ZROBIONE] Ustalić i skonfigurować limity plików, bloków i miejsca. Propozycja początkowa: 20 MB na plik i 10 plików łącznie na lekcję; dodatkowo określić limit bajtów na lekcję, uploady tymczasowe administratora i cały magazyn. Kryterium odbioru: limity obowiązują także przy równoległych uploadach i nie można ich obejść dodawaniem kolejnych sekcji.
- 10.11 [ZROBIONE] Przygotować opcjonalną obsługę DOCX po wdrożeniu podstawowych formatów. Kryterium odbioru: walidacja struktury pakietu OOXML, ograniczenie liczby wpisów i rozmiaru po rozpakowaniu, ochrona przed wyjściem poza katalog oraz odrzucanie dokumentów z makrami; sam podpis ZIP nie wystarcza. Format pozostaje wyłączony domyślnie.
- 10.12 [ZROBIONE] Dodać trasy zarządzania plikami z kontrolą aktualnej aktywności administratora, uprawnień, CSRF i limitami uploadu per konto oraz IP. Kryterium odbioru: brak możliwości podpinania lub usuwania cudzych uploadów tymczasowych, osobna polityka źródła żądań administracyjnych oraz jednoznaczne odpowiedzi JSON przy wygaśnięciu sesji.
- 10.13 [ZROBIONE] Ujednolicić kontrolę dostępu do lekcji i plików w `courseAccessService`: aktywne konto i kurs, opublikowany moduł należący do kursu, opublikowana lekcja oraz aktywny dostęp lub kurs darmowy. Kryterium odbioru: cofnięcie dostępu, jego wygaśnięcie lub ukrycie modułu blokuje również bezpośrednie pobranie pliku; uwzględnić starsze endpointy lekcji.
- 10.14 [ZROBIONE] Dodać kontrolowane pobieranie przez identyfikator powiązania załącznika z lekcją oraz oddzielny dostęp administracyjny. Kryterium odbioru: kontrola uprawnień przy każdym pobraniu, strumieniowanie, `Content-Disposition: attachment`, właściwy MIME, `nosniff`, prywatna polityka cache bez przechowywania odpowiedzi oraz brak ujawniania ścieżek dyskowych. Losowy identyfikator nie zastępuje autoryzacji.

### 10.C. Edytor i manager plików

- 10.15 [ZROBIONE] Dodać przycisk „Dodaj pliki” i moduł bloku `files` w `public/js/admin/courseContent/`. Kryterium odbioru: blok można dodać, przesunąć i usunąć tak jak pozostałe sekcje; można mieszać wiele sekcji plików z tekstem i YouTube.
- 10.16 [ZROBIONE] Zbudować reużywalny manager plików z własnym `index.ejs`, CSS i JavaScriptem. Kryterium odbioru: dane początkowe, identyfikator instancji, endpointy i limity są przekazywane jawnie przez konfigurację lub `data-*`; wiele managerów na stronie działa niezależnie.
- 10.17 [ZROBIONE] Dodać galerię z przyciskiem „+” do iteracyjnego uploadu. Kryterium odbioru: każdy kolejny plik pojawia się w odpowiedniej sekcji bez przeładowania; karta pokazuje nazwę, format, rozmiar, postęp i wynik weryfikacji oraz umożliwia ponowienie błędu lub anulowanie uploadu. Błąd jednego pliku nie usuwa pozostałych.
- 10.18 [ZROBIONE] Dodać zmianę nazwy wyświetlanej, kolejności kart i usuwanie pliku z sekcji. Kryterium odbioru: odpięcie pliku jest odróżnione od fizycznego usunięcia, a usunięcie bloku obejmuje wszystkie jego referencje dopiero po zapisaniu lekcji.
- 10.19 [ZROBIONE] Rozszerzyć serializację edytora, normalizację `modules/courseContent`, walidację kontrolera i obsługę błędów formularza o bloki plików. Kryterium odbioru: serwer odrzuca podmienione identyfikatory i niespójne powiązania; błąd walidacji tytułu lub sluga zachowuje sekcje i poprawne uploady. Trwające lub nieudane transfery nie są po cichu pomijane przy zapisie.
- 10.20 [ZROBIONE] Zapewnić dostępność i responsywność managera. Kryterium odbioru: przycisk „+” ma czytelną etykietę, upload i zmiana kolejności działają klawiaturą, postęp i błędy są komunikowane czytnikom ekranu, a długie polskie nazwy nie rozbijają widoku mobilnego.

### 10.D. Widok uczestnika i API

- 10.21 [ZROBIONE] Dodać moduł renderowania bloku plików w `views/public/academy/modules/contentBlock/` z osobnym CSS. Kryterium odbioru: galeria pojawia się dokładnie w miejscu bloku w treści lekcji; każda karta zawiera nazwę, format, rozmiar i pobranie. W pierwszej wersji wystarczą ikony typów; podglądy PDF i obrazów są dalszym rozszerzeniem.
- 10.22 [ZROBIONE] Rozszerzyć kontrolery strony i API lekcji o bezpieczne metadane bloków plików. Kryterium odbioru: renderowanie EJS i odpowiedzi JSON pokazują te same zatwierdzone materiały, bez wewnętrznych ścieżek, cudzych plików i pozycji oczekujących na weryfikację; unikać osobnego zapytania SQL dla każdej karty.

### 10.E. Cykl życia, wdrożenie i weryfikacja

- 10.23 [ZROBIONE] Dodać sprzątanie po usunięciu pliku z bloku, całego bloku, lekcji, modułu i kursu. Kryterium odbioru: kaskady SQL nie pozostawiają trwale osieroconych plików, plik używany w innym miejscu nie zostaje usunięty, a nieudane operacje dyskowe można bezpiecznie ponowić.
- 10.24 [ZROBIONE] Dodać okresowe czyszczenie wygasłych uploadów, kwarantanny i osieroconych danych oraz uzgadnianie bazy z magazynem. Kryterium odbioru: awaria między zapisem dysku a transakcją SQL jest naprawialna; sprzątanie nie usuwa trwającego transferu ani pliku właśnie zatwierdzanego.
- 10.25 [ZROBIONE] Dodać rejestrowanie uploadów, odrzuceń, powiązań, usunięć i pobrań oraz monitoring zajętości magazynu. Kryterium odbioru: logi zawierają identyfikatory i wynik operacji, bez zawartości dokumentów, sekretów i niepotrzebnych danych osobowych.
- 10.26 [DO ZROBIENIA] Odebrać wdrożenie na hostingu. `.env.example`, `.gitignore`, trwały magazyn, dokumentacja, sprzątanie i komenda `files:check` są gotowe; pozostało sprawdzenie sharp/libvips, limitów Passenger, harmonogramu oraz odtworzenia kopii produkcyjnej. Kryterium odbioru: sprawdzone uprawnienia i limity Passenger/proxy, brak uploadów w Git i paczkach, trwałość danych po ponownym wdrożeniu oraz udokumentowany backup i test odtworzenia bazy razem z plikami.
- 10.27 [ZROBIONE] Dodać testy integracyjne autoryzacji uploadu i pobierania. Kryterium odbioru: sprawdzone sesje gościa, uczestnika i administratora, konto nieaktywne, brak/cofnięcie/wygaśnięcie dostępu, kurs darmowy, ukryty kurs/moduł/lekcja, podmiana identyfikatora pliku i CSRF.
- 10.28 [ZROBIONE] Dodać testy walidacji i odporności uploadu. Kryterium odbioru: sprawdzone fałszywe rozszerzenia i MIME, niedozwolone typy, nazwy z próbą zmiany ścieżki lub XSS, przekroczenie limitów, równoległe transfery, przerwanie żądania, brak miejsca oraz awaria bazy.
- 10.29 [ZROBIONE] Sprawdzić pełny przepływ nowej i istniejącej lekcji: wiele bloków plików, kolejne uploady przez „+”, zmiana kolejności, zapis, ponowne otwarcie, anulowanie edycji, pobieranie i usunięcie kursu. Kryterium odbioru: zachowana treść tekstowa i YouTube, poprawne sprzątanie, działanie na telefonie i komputerze oraz poprawne UTF-8 nazw i komunikatów w źródłach, HTML, JSON i nagłówkach pobierania.

Kolejność realizacji: kontrakt i model danych (10.1–10.5) → magazyn, upload i kontrola dostępu (10.6–10.14, z DOCX jako opcjonalnym rozszerzeniem) → edytor i widok uczestnika (10.15–10.22) → domknięcie cyklu życia i wdrożenia (10.23–10.26). Testy 10.27–10.29 realizować wraz z odpowiednimi etapami; sprzątanie i zabezpieczenia muszą być gotowe przed udostępnieniem uploadu produkcyjnie.
