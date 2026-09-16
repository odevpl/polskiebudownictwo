# Pliki w lekcjach

## Obsługa

W edytorze wybierz „Dodaj pliki”, a następnie „+ Dodaj plik” w utworzonej sekcji. Każda sekcja ma własną galerię. Można zmieniać nazwy materiałów, kolejność kart i sekcji, usuwać pozycje oraz dodawać kolejne sekcje między tekstem i YouTube. Przyciski zmiany kolejności działają również klawiaturą. Uczestnik widzi karty z pobieraniem w miejscu sekcji w treści lekcji.

Upload zapisuje plik tymczasowo, również w nowej lekcji bez ID. Powiązania i nazwy materiałów zatwierdza dopiero „Zapisz lekcję”. Anulowanie edycji pozostawia dotychczasową opublikowaną lekcję bez zmian. Błąd walidacji formularza zachowuje poprawne uploady. Trwający lub nieudany upload blokuje zapis do czasu zakończenia, ponowienia albo usunięcia karty. Porzucone pliki wygasają po 24 godzinach; po tym czasie trzeba przesłać je ponownie.

Domyślnie dostępne są PDF, JPG/JPEG i WebP, maksymalnie 20 MB na plik, 10 plików i 100 MB łącznie na lekcję. DOCX jest zaimplementowany jako opcjonalny format (`UPLOAD_DOCX_ENABLED=1`), domyślnie wyłączony. Pierwsza wersja pokazuje ikony typów i linki pobrania; nie osadza dokumentów ani nie generuje miniaturek.

## Kontrakt i odpowiedzialności

- `modules/files/`: konfiguracja, prywatny magazyn, Multer, skaner, walidacja, repozytorium metadanych, pobieranie i sprzątanie. Moduł nie zna modeli kursów.
- `services/lessonAttachmentService.js`: walidacja referencji, powiązania z lekcją i przygotowanie metadanych do edytora/widoku/API.
- `files`: UUID, losowy klucz magazynu, oryginalna nazwa, MIME, rozmiar, autor, stan `uploading`/`ready`, wynik skanowania i data pierwszego przypisania.
- `content_blocks`: źródło prawdy dla pozycji sekcji, kolejności kart i nazw wyświetlanych. Blok ma format `{ type: 'files', id: UUID, data: { files: [{ id: UUID, name: 'Nazwa materiału' }] } }`. Pola URL, MIME i rozmiaru są uzupełniane z bazy, nigdy przyjmowane od klienta jako wiarygodne.
- `lesson_attachments`: indeks powiązań lekcja/blok/plik i trwały identyfikator pobrania. Zapis JSON i relacji odbywa się w jednej transakcji. Nie zmieniające się powiązania zachowują adres pobrania.
- `file_storage_lock`: wspólna blokada transakcyjna rezerwacji miejsca, zatwierdzania i sprzątania, działająca także między procesami Passenger.
- `file_upload_attempts`: trwały limit 60 prób na administratora w 15 minut; trasa uploadu ma też limit IP, a pobieranie uczestnika limit konta.

Przy kolejnym wykorzystaniu modułu można dodać nowy adapter powiązań i autoryzacji. Obecny edytor pozwala przypisywać własne pliki tymczasowe oraz zachować/przenosić pliki już obecne w tej lekcji. Nie udostępnia globalnej biblioteki plików innych lekcji. Tabele umożliwiają zachowanie pliku używanego przez kilka powiązań.

## Endpointy

Prefiks panelu pochodzi z `adminUrl` i respektuje `ADMIN_PATH`.

| Metoda i adres | Działanie |
| --- | --- |
| `POST <admin>/files` | Jeden plik w polu multipart `file`; odpowiedź 201 z metadanymi uploadu tymczasowego |
| `DELETE <admin>/files/:id` | Usunięcie własnego, zakończonego uploadu tymczasowego |
| `GET <admin>/files/:id/download` | Pobranie przez aktywnego administratora; cudze pliki tymczasowe są niedostępne |
| `GET /api/academy/attachments/:id/download` | Pobranie przez aktywnego uczestnika z dostępem do opublikowanej lekcji i modułu w aktywnym kursie |

Zapis lekcji korzysta z dotychczasowych endpointów formularza. Serwer odrzuca podmienione identyfikatory, powtórzenia w sekcji, przekroczone limity i wygasłe uploady. Pobranie ponownie sprawdza dostęp; cofnięcie lub wygaśnięcie dostępu blokuje także wcześniej skopiowany URL. Nagłówki obejmują `Content-Disposition: attachment`, poprawny MIME, `nosniff` i `Cache-Control: private, no-store`. Nazwa oryginalna służy do pobrania, nazwa materiału do wyświetlania karty.

## Walidacja i skanowanie

Multer z `diskStorage` zapisuje dane strumieniowo do prywatnego pliku pod losowym UUID rezerwacji. Endpoint używa `upload.single('file')`, limitu rozmiaru oraz limitów jednego pliku i braku dodatkowych pól. Sesja, aktywność administratora, CSRF/źródło żądania oraz limity IP i konta są sprawdzane przed uruchomieniem Multera. Miejsce jest rezerwowane przed transferem, a po weryfikacji rozliczane według rzeczywistego rozmiaru. Domyślnie trwa najwyżej 4 uploady/weryfikacje globalnie i 2 na administratora. Limit tymczasowych plików wynosi 30 sztuk/200 MB na konto; magazynu 5 GB. Rezerwacja jest konserwatywna: nowy transfer wymaga wolnego miejsca na cały dopuszczalny plik. Błąd, timeout lub przerwanie transferu usuwa częściowy obiekt i zwalnia rezerwację; nieudane usunięcie pozostawia rekord do okresowego sprzątania.

Obsługiwany skaner to ClamAV `clamd` z protokołem INSTREAM. Najpierw skanowany jest oryginał, potem następuje kontrola formatu i faktycznej zawartości niezależna od `fileFilter` Multera. Produkcja zawsze wymaga odpowiedzi `stream: OK`; timeout, brak konfiguracji, błąd lub wykrycie malware nie udostępniają pliku. Lokalnie można jawnie ustawić `UPLOAD_SCAN_REQUIRED=0`; taki plik ma wynik `skipped` i nie będzie dostępny po przejściu na politykę wymagającą skanu. Ustawienie `0` jest ignorowane w `NODE_ENV=production`. Migracja parsera nie zmienia tej polityki; ewentualne wyłączenie obowiązkowego skanowania stanowi osobną decyzję bezpieczeństwa.

Obszar kwarantanny stanowią prywatne obiekty ze statusem `uploading`, bez tras pobierania. Odrzucone pliki są usuwane, a nie trwale archiwizowane. Walidacja dokumentów odbywa się w workerze z limitem czasu i pamięci JS:

- obrazy: wykryty format, pełne dekodowanie i limit 25 mln pikseli; brak animacji/wielu stron;
- PDF: nagłówek, zakończenie, parsowanie dokumentu, co najmniej jedna strona i odrzucanie wybranych aktywnych funkcji; dokumenty zaszyfrowane są odrzucane;
- DOCX: struktura ZIP/OOXML, wymagane części, poprawny XML, limity 1000 wpisów, 50 MB po rozpakowaniu i 10 MB na wpis; odrzucanie makr, osadzonych obiektów, DTD/encji, zewnętrznych relacji i niebezpiecznych ścieżek.

Walidacja struktury nie zastępuje skanera. Zasady projektowe: [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Multer](https://github.com/expressjs/multer), [ClamAV](https://docs.clamav.net/manual/Usage/Scanning.html).

## Uruchomienie lokalne i migracja

1. `npm install` (Node >=20.9.0, zalecane obecne środowisko Node 22).
2. Wykonać kopię bazy, następnie `npm run migrate`. Migracja uruchamia `sql/files.sql` po migracji Akademii; jest idempotentna i nie zmienia starych bloków tekstu ani filmów.
3. Skonfigurować prywatny magazyn i skaner zgodnie z `.env.example`. Lokalny domyślny magazyn to `storage/files`, ignorowany przez Git. Do testów bez ClamAV ustawić jawnie `UPLOAD_SCAN_REQUIRED=0` w lokalnym `.env`.
4. `npm run dev`, następnie utworzyć lub edytować lekcję w panelu.

Jeżeli Akademia jest już zmigrowana, można użyć zakresowego `npm run migrate:files`, który tylko dodaje tabele plików i nie uruchamia pozostałych migracji aplikacji. `npm run files:check` weryfikuje dostęp do bazy i magazynu, testowy PDF, skaner oraz obsługę WebP i wypisuje wynik JSON bez ścieżek i sekretów.

## Wdrożenie Passenger i kopie

Na produkcji `UPLOAD_STORAGE_PATH` musi być ścieżką bezwzględną poza katalogiem aplikacji, np. prywatnym katalogiem konta hostingowego. Nie umieszczać plików w `page/`, `public/`, katalogu publicznym serwera WWW ani w `dists/`. Skrypt budowania paczek nie kopiuje magazynu. Nowa paczka musi wskazywać ten sam trwały magazyn co poprzednia.

`sharp` ma zależności natywne. Instalację i dekodowanie JPEG/WebP trzeba potwierdzić na docelowym systemie; FreeBSD nie znajduje się na liście platform z gotowymi binariami w [instrukcji instalacji sharp](https://sharp.pixelplumbing.com/install/). Może być potrzebna kompilacja z systemowym libvips i narzędziami opisanymi w tej instrukcji. Nie zweryfikowano tego na koncie MyDevil. Podobnie dostępność prywatnego `clamd`, aktualizacja sygnatur i jego limity wymagają weryfikacji hostingowej. Port skanera nie powinien być publiczny; protokół nie zapewnia uwierzytelniania ani TLS.

Limit żądania proxy powinien uwzględniać rozmiar pliku i narzut multipart; timeout proxy powinien pozwalać na upload (domyślnie 120 s), skan (60 s) i walidację (15 s). Konfiguracja ma być zgodna z limitem INSTREAM skanera. Sprawdzić zapis/odczyt/usuwanie przez konto Passenger i rzeczywisty limit miejsca na dysku.

Sprzątanie uruchamia się co 15 minut, gdy proces aplikacji działa. Przy Passenger usypiającym aplikację należy również zaplanować `npm run cleanup-files` w harmonogramie hostingu co 15 minut. Zadanie usuwa przeterminowane uploady, odpięte pliki i osierocone obiekty, zachowując pliki mające choć jedno powiązanie. Uwzględnia czas aktywnego transferu/skanowania i ponawia nieudane usunięcia podczas następnego przebiegu. Brak obiektu wymaganego przez bazę jest logowany jako `missing_object`.

Logi JSON modułu zawierają zdarzenia i identyfikatory, bez nazw i treści dokumentów. Monitorować `cleanup_failed`, `delete_retry`, `missing_object`, odrzucenia 503 (skaner), wykorzystanie `bytes/capacity` i brak miejsca. Retencję i rotację logów ustawić na hostingu.

Przed migracją oraz cyklicznie wykonywać spójną kopię bazy i magazynu. Na czas wykonywania pary kopii zatrzymać operacje zapisu i sprzątanie, aby nie utracić spójności. Przywracanie: odtworzyć oba elementy do izolowanego środowiska, ustawić nową prywatną ścieżkę, sprawdzić liczby plików/powiązań i pobranie przykładowych dokumentów, a dopiero potem przywrócić ruch i sprzątanie. Ustalić harmonogram, retencję i dostęp do kopii. Rollback kodu nie wymaga usuwania nowych tabel ani magazynu; starszy kod nie pokaże bloków `files`, więc podczas rollbacku zablokować edycję tych lekcji.

## Weryfikacja

- `npm run test:files`: walidacja PDF/JPEG/WebP/DOCX, nazwy i referencje, limity, multipart, przerwanie i timeout transferu, symulacja pełnego dysku, protokół skanera z wynikiem czystym/odrzuconym/błędem/timeoutem.
- `npx playwright install chromium`, następnie `npm run test:files:e2e`: prawdziwy Express, MariaDB/MySQL i Chromium; skrypt tworzy losową bazę `pb_files_test_*` na lokalnym serwerze, migruje ją dwukrotnie, używa wyłącznie danych syntetycznych i usuwa własną bazę oraz magazyn po teście. Wymaga uprawnienia do tworzenia/usuwania baz. Nie migruje skonfigurowanej bazy aplikacji ani nie wysyła wiadomości. Skaner jest jawnie pomijany w tym teście; protokół ma osobne testy.
- Zrzuty desktop/mobile pozostają w ignorowanym przez Git `test-results/files/`.

Testy lokalne nie potwierdzają skanera produkcyjnego, jego sygnatur, limitów Passenger ani odtworzenia kopii hostingu. Te czynności są odrębnym odbiorem wdrożenia. Audyt npm podczas implementacji wykazał także istniejące ostrzeżenia w zależnościach Express/MySQL/Nodemailer, niezwiązane z nowymi parserami; ich aktualizacja wymaga osobnego przeglądu regresji.
