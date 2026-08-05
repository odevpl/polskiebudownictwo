# Głos Polskiego Budownictwa — tickety wdrożeniowe

## Kontekst i decyzja produktowa

Na stronie ma powstać publiczna sekcja pokazująca wspólną pracę Fundacji i Ambasadorów Polskiego Budownictwa.

- nazwa w menu: **Postulaty**;
- tytuł strony: **Głos Polskiego Budownictwa**;
- adres: **`/postulaty`**;
- pierwsza publikacja: „Czy polska firma budowlana musi finansować cudzą inwestycję?” — pięć zasad równowagi kontraktowej wypracowanych przez Ambasadorów;
- źródło publikacji: [LinkedIn](https://www.linkedin.com/pulse/czy-polska-firma-budowlana-musi-finansowa%C4%87-cudz%C4%85-anna-sadowska-w%C3%B3jcik-h8n0f);
- strona ma być rozwijalnym miejscem na kolejne stanowiska, postulaty, głosy i rekomendacje, a nie jednorazową kopią artykułu.

## Kolejność realizacji

1. Przygotować i zaakceptować materiały oraz grafiki.
2. Zbudować stronę `/postulaty` z pierwszą publikacją i sekcją Manifestu.
3. Wykonać testy podstrony, responsywności i paczki wdrożeniowej.

---

## PB-POST-01 — Przygotować materiały publikacji i model kolejnych wpisów

**Status:** Backlog

**Cel:** Przygotować zaakceptowaną treść pierwszej publikacji oraz prosty standard dla następnych wpisów.

**Zadania**

- [ ] Zatwierdzić finalną nazwę strony, lead i nazwy typów publikacji:
  - Stanowisko Fundacji;
  - Postulat Ambasadorów;
  - Głos Ambasadora;
  - Projekt do konsultacji;
  - Rekomendacja dla branży.
- [ ] Przygotować pierwszą publikację na podstawie artykułu LinkedIn, z zachowaniem sensu pięciu postulatów:
  1. wady nieistotne nie blokują odbioru ani zapłaty;
  2. płatność maksymalnie w ciągu 14 dni;
  3. łączny limit kar umownych do 15% wartości umowy;
  4. kaucje i zatrzymania do 5%;
  5. jasne zasady rozliczania robót dodatkowych.
- [ ] Nie przedstawiać postulatów jako obowiązującego prawa; oznaczyć je jako stanowisko/postulaty branżowe.
- [ ] Uzupełnić metadane wpisu: typ publikacji, autor/autorzy, data, krótki opis, link źródłowy i ewentualna wersja PDF.
- [ ] Przejrzeć komentarze pod artykułem i zapisać potencjalne kolejne tematy jako osobne propozycje, bez publikowania ich automatycznie jako stanowiska Fundacji.

**Kryteria akceptacji**

- Tekst jest gotowy do publikacji i zaakceptowany merytorycznie.
- Każdy wpis ma jednolity zestaw metadanych, który pozwoli dodać następne publikacje bez przebudowy całej strony.

## PB-POST-02 — Dodać i opisać cztery grafiki

**Status:** W toku

**Cel:** Przygotować cztery grafiki do użycia na stronie `/postulaty` i przypisać je do konkretnych sekcji.

**Zadania**

- [x] Umieścić pliki w `page/assets/images/postulaty/`.
- [x] Zmienić nazwy plików na opisowe, bez spacji i polskich znaków:
  - `ambasadorzy-stol-praca.png` — wspólna praca przy dokumentacji;
  - `ambasadorzy-budowa.png` — grupa Ambasadorów na placu budowy;
  - `ambasador-portret.png` — portret przedstawiciela branży;
  - `wykonawca-technologia.png` — wykonawca korzystający z dokumentacji cyfrowej.
- [ ] Zdecydować, czy PNG zostają w repozytorium, czy konwertujemy je do zoptymalizowanego WebP/AVIF.
- [ ] Przygotować teksty alternatywne i użyć grafik jako uzupełnienia treści, a nie jej jedynego nośnika.

**Proponowane rozmieszczenie**

1. `ambasadorzy-stol-praca.png` — przy otwarciu strony lub sekcji „Stanowiska i postulaty”, jako obraz wspólnej pracy.
2. `ambasadorzy-budowa.png` — w hero albo przy opisie Ambasadorów, jako szeroki kontekst branżowy.
3. `ambasador-portret.png` — przy wyróżnionej publikacji lub cytacie „Głos Ambasadora”.
4. `wykonawca-technologia.png` — przy końcowej sekcji „Zgłoś problem. Wskaż rozwiązanie.”, jako obraz praktyki wykonawczej.

Jeżeli grafiki są kadrami z jednego filmu, należy dobrać je tak, aby nie powtarzały tej samej funkcji: hero, praca zespołowa, konkret merytoryczny, CTA.

**Kryteria akceptacji**

- Grafiki są dostępne w repozytorium w UTF-8-kompatybilnej ścieżce nazw bez spacji i polskich znaków.
- Każda ma sensowny `alt`, wersję mobilną przez `object-fit`/responsywny układ i nie powoduje przesunięcia layoutu podczas ładowania.

## PB-POST-03 — Zbudować stronę `/postulaty`

**Status:** Gotowe

**Cel:** Udostępnić publiczną stronę prezentującą Manifest, stanowiska i pierwszą publikację Ambasadorów.

**Zadania — pliki i struktura**

- [x] Utworzyć moduł strony w `page/postulaty/index.html`.
- [x] Wydzielić style strony do `page/postulaty/postulaty.css`; wspólne elementy korzystają z `page/global.css`.
- [x] Sprawdzić, że `express.static` obsługuje `/postulaty` oraz `/postulaty/` i że oba adresy zwracają 200.

**Zadania — układ i treść**

- [x] Dodać header: „Głos Polskiego Budownictwa” i podtytuł „Stanowiska i postulaty Fundacji oraz Ambasadorów Polskiego Budownictwa”.
- [x] Dodać intro z wyjaśnieniem, że problemy powtarzające się u wielu przedsiębiorców wymagają wspólnego głosu.
- [x] Dodać dwa CTA:
  - „Poznaj stanowiska i postulaty” — do listy publikacji;
  - „Zgłoś problem lub propozycję zmiany” — do formularza/sekcji zgłoszenia.
- [x] Dodać sekcję Manifestu z fundamentami podanymi w briefie i przyciskiem „Poznaj Manifest Polskiego Budownictwa”.
- [x] Dodać sekcję „Stanowiska i postulaty” z oznaczeniem typu publikacji.
- [x] Dodać pierwszą publikację jako wyróżniony wpis z pięcioma zasadami i linkiem do źródłowego artykułu LinkedIn.
- [x] Dodać sekcję końcową: „Zgłoś problem. Wskaż rozwiązanie.” z linkiem do istniejącej sekcji kontaktu.
- [x] Zachować footer z linkami do istniejących stron i powrotem do formularza dołączenia.

**Kryteria akceptacji**

- Strona jest dostępna bez logowania, czytelna na telefonie i komputerze oraz ma unikalny `<title>`, opis meta, jeden `<h1>` i poprawną hierarchię nagłówków.
- Nawigacja główna zawiera „Postulaty”; aktywne CTA nie psują istniejących linków do `#dolacz`.
- Treść nie obiecuje skutku prawnego postulatów i jasno rozróżnia Manifest, stanowisko i postulat.

## PB-POST-04 — SEO, dostępność i testy podstrony

**Status:** W toku

**Cel:** Zweryfikować jakość, dostępność i gotowość strony oraz nowych grafik do wdrożenia.

**Zadania**

- [x] Dodać canonical dla `/postulaty`, opis meta i podstawowe dane Open Graph z grafiką hero.
- [ ] Sprawdzić wizualnie alt texty, kontrast, focus, kolejność tabulatora i responsywność.
- [x] Przeszukać zmieniane pliki pod kątem mojibake (`Å‚`, `Ä™`, `Ã³`, `�`) — brak markerów w nowych plikach.
- [x] Sprawdzić linki CTA, Manifest PDF i link do LinkedIn.
- [x] Uruchomić `npm run build:main` i sprawdzić obecność strony, stylu, grafik i PDF-u w `dists/polskiebudownictwo.org/`.
- [x] Wykonać test HTTP dla `/postulaty` i `/postulaty/` — oba adresy zwracają 200.

## Otwarte decyzje przed implementacją

- Czy „Manifest Legislacyjny” ma być wszędzie nazywany „Manifestem Polskiego Budownictwa”, czy zachowujemy dotychczasową nazwę dokumentu?
- Czy pierwsza publikacja ma być pełnym artykułem na stronie, czy skrótem z linkiem do LinkedIn?
- Kto zatwierdza merytorycznie postulaty przed publikacją?

## PB-POST-05 — Dodać stanowisko Fundacji w sprawie udziału MŚP w inwestycjach

**Status:** Gotowe

**Zakres wykonany**

- [x] Dodać stanowisko z 5 sierpnia 2026 r. jako najnowszą publikację typu „Stanowisko Fundacji”.
- [x] Przygotować zwięzłe streszczenie i listę najważniejszych tez.
- [x] Skopiować pełny dokument do `page/assets/documents/positions/stanowisko-fundacji-rzecznik-msp-2026-08-05.pdf`.
- [x] Dodać link do pełnego PDF-u na stronie `/postulaty`.
- [x] Zachować dotychczasową publikację o pięciu zasadach jako osobny „Postulat Ambasadorów”.
