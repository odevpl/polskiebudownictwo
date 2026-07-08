# TODO – subdomena mediacje.polskiebudownictwo.org

Kontekst dla Codex: budujemy podstronę tematyczną (subdomenę) głównej organizacji
"Polskie Budownictwo" (http://polskiebudownictwo.org/), poświęconą wyłącznie mediacjom
gospodarczym i budowlanym. Strona ma być **wizualnie i strukturalnie bliźniacza** wobec
strony głównej (ten sam layout, nagłówek, stopka, typografia, wzorce sekcji), ale użytkownik
musi mieć jasność, że znajduje się na podstronie dot. mediacji, a nie na stronie głównej.

Ten plik jest **kompletny** — wszystkie teksty potrzebne do wdrożenia są wklejone poniżej.
Nie trzeba zaglądać do żadnego innego źródła. Nie zmieniaj tonu, stylu pisania ani struktury
HTML względem strony głównej bez potrzeby — kopiuj wzorce 1:1, zmieniaj tylko treść.

---

## 0. Wzorzec strukturalny do skopiowania ze strony głównej

Ze strony głównej (polskiebudownictwo.org) przenieś dosłownie:

- **Header/nav**: to samo logo (link do polskiebudownictwo.org), ten sam styl menu.
  Dodaj do nawigacji breadcrumb/etykietę wskazującą podstronę, np. obok/pod logo:
  `Polskie Budownictwo / Centrum Mediacji` — ma być widoczne na każdej podstronie subdomeny.
- **Hero pattern**: eyebrow (mały label nad H1) + H1 + lead (2-3 zdania) + dwa CTA
  (primary + secondary, jak "Dołącz do społeczności →" / "Poznaj naszą misję").
- **Sekcje treściowe**: eyebrow nad H2, krótki lead pod H2, potem numerowane karty
  01 / 02 / 03... z małym H3 i 1-2 zdaniami opisu.
- **Stopka**: identyczna jak na głównej stronie — logo, "Kontakt ogólny", oba adresy,
  linki do Polityki prywatności/cookies, copyright.
- **Formularze**: taki sam styl pól (label nad polem, zaokrąglone inputy, przycisk
  submit w stylu istniejącego formularza "Dołącz bezpłatnie"), ale z dodaną logiką
  warunkową opisaną niżej — to nowość względem strony głównej.

---

## 1. Strona główna subdomeny (index)

### 1.1 Header
- Logo Polskie Budownictwo (link do polskiebudownictwo.org)
- Nawigacja: Mediacje gospodarcze / Mediacje inwestycyjne / FAQ / Zgłoś sprawę / Zostań mediatorem
- Etykieta/breadcrumb: `Polskie Budownictwo / Centrum Mediacji`

### 1.2 Hero
- Eyebrow: `Centrum Mediacji przy Fundacji „Polskie Budownictwo”`
- H1: `Mediacje Gospodarcze. Skuteczne rozwiązywanie sporów biznesowych i budowlanych.`
- Lead: `Szybciej. Taniej. Z zachowaniem relacji biznesowych. Konflikt nie zawsze musi kończyć się wieloletnim procesem sądowym — profesjonalnie poprowadzona mediacja pozwala odzyskać należności, wypracować korzystne porozumienie i kontynuować współpracę bez ponoszenia wysokich kosztów postępowania sądowego.`
- CTA primary: `Zgłoś sprawę do mediacji →` (link do formularza Stron, `/zgloszenie`)
- CTA secondary: `Zostań mediatorem` (link do formularza Mediatorów, `/zostan-mediatorem`)
- Podtekst pod CTA: `Prowadzimy mediacje gospodarcze oraz wspieramy przedsiębiorców w rozwiązywaniu sporów na każdym etapie konfliktu.`

### 1.3 Sekcja "Dlaczego mediacja"
- Eyebrow: `Dlaczego warto wybrać mediację`
- H2: `Spór nie musi kończyć się latami w sądzie.`
- Karty:
  - 01 **Szybciej i taniej** — Znacznie krótszy czas rozwiązania sporu i niższe koszty niż postępowanie sądowe.
  - 02 **Zachowane relacje biznesowe** — Możliwość zachowania relacji biznesowych i kontynuowania współpracy po zakończeniu sporu.
  - 03 **Poufność procesu** — Cały proces objęty jest poufnością, co daje stronom komfort otwartej rozmowy.
  - 04 **Realny wpływ na treść porozumienia** — Strony mają bezpośredni wpływ na kształt ugody, a nie tylko podporządkowują się wyrokowi.
  - 05 **Większa przewidywalność** — Mediacja daje większą przewidywalność wyniku niż proces sądowy.
  - 06 **Ugoda uwzględniająca interesy obu stron** — Możliwość zawarcia porozumienia korzystnego dla wszystkich uczestników sporu.
- Cytat pod kartami (wyróżniony blok): `Dobrze przeprowadzona mediacja nie polega na tym, aby znaleźć kompromis za wszelką cenę. Jej celem jest wypracowanie rozwiązania, które pozwoli przedsiębiorcom zakończyć konflikt i wrócić do prowadzenia biznesu.`

### 1.4 Sekcja "Rodzaje mediacji gospodarczych"
- Eyebrow: `Zakres usług`
- H2: `Dopasowany tryb do etapu sporu.`

**01 — Mediacje pozasądowe w sprawach gospodarczych**
Lead: `Najlepszy moment na rozwiązanie sporu, zanim trafi on do kancelarii lub sądu.`
Opis: `Pomagamy Przedsiębiorcom wypracować porozumienie jeszcze przed wszczęciem postępowania sądowego, ograniczając koszty, skracając czas konfliktu i zwiększając szanse na dalszą współpracę biznesową.`
Najczęściej dotyczą:
- niezapłaconych faktur
- sporów pomiędzy inwestorem i wykonawcą
- sporów pomiędzy generalnym wykonawcą i podwykonawcą
- robót dodatkowych
- opóźnień realizacji
- kar umownych
- rozliczeń końcowych

**02 — Mediacje przedsądowe w sprawach gospodarczych**
Lead: `Kiedy strony są już blisko skierowania sprawy do sądu, mediacja często pozwala uniknąć wieloletniego procesu.`
Opis: `Pomagamy uporządkować stanowiska stron i wypracować rozwiązanie, które będzie korzystniejsze niż spór sądowy.`
Zakres wsparcia obejmuje:
- ogólną analizę sporu
- prowadzenie mediacji
- przygotowanie projektu ugody*

Przypis (*): `Ugoda służy do zawarcia zwięzłego porozumienia przez strony. Dodatkowe niezbędne do zawarcia ugody opracowania zostaną wycenione osobne lub dostarczone przez strony.`

**03 — Mediacje sądowe w sprawach gospodarczych**
Lead: `Mediacje prowadzone na podstawie skierowania przez sąd lub za zgodą stron już po wszczęciu postępowania.`
Opis: `Ich celem jest zakończenie sporu ugodą zatwierdzoną przez sąd, co pozwala skrócić postępowanie i ograniczyć koszty procesu.`

Blok wyróżniony — zwrot opłaty sądowej:
`Po zawarciu ugody na etapie sądowym, sąd z urzędu zwraca część lub całość uiszczonej opłaty od pozwu. Dokładna kwota zwrotu zależy od tego, na jakim etapie dojdzie do porozumienia:`
- **Całość (100%)** – jeśli ugoda zostanie zawarta przed rozpoczęciem pierwszej rozprawy przed sądem I instancji lub przed mediatorem w trakcie postępowania.
- **Trzy czwarte (75%)** – jeśli do zawarcia ugody dojdzie przed mediatorem, ale już po rozpoczęciu pierwszej rozprawy.
- **Połowa (50%)** – jeśli zawrzesz ugodę bezpośrednio przed sądem na późniejszym etapie procesu (np. w toku rozprawy, ale przed wydaniem wyroku).

Przypis: `Zwrot następuje na mocy art. 79 ustawy o kosztach sądowych w sprawach cywilnych.`

Zakres wsparcia obejmuje:
- ogólną analizę sporu
- prowadzenie mediacji
- przygotowanie projektu ugody*
- złożenie podpisanej przez strony ugody do sądu wraz z wnioskiem o jej zatwierdzenie

Przypis (*): `Ugoda służy do zawarcia zwięzłego porozumienia przez strony celem przedstawienia jej do zatwierdzenia przez sąd. Strony mogą w ramach ugody zawrzeć dodatkowe ustalenia. Rozdzielenie porozumienia na część podlegającą zatwierdzeniu przez sąd oraz część o charakterze czysto biznesowym (poufne ustalenia dodatkowe) to klasyczny, wysoce profesjonalny zabieg w mediacjach gospodarczych. Część dodatkowa nie podlega opracowaniu przez mediatora.`

Prowadzimy mediacje dotyczące między innymi:
- sporów budowlanych
- umów gospodarczych
- roszczeń o zapłatę
- odpowiedzialności kontraktowej
- rozliczeń inwestycji

**04 — Mediacje wewnętrzne w przedsiębiorstwach**
Lead: `Nie każdy konflikt dotyczy kontraktu. Często największym zagrożeniem dla firmy są spory wewnętrzne.`
Opis: `Pomagamy odbudować komunikację, wypracować porozumienie i zabezpieczyć dalsze funkcjonowanie przedsiębiorstwa.`
Podkategorie (5 mini-kart):
- **Mediacje Wspólników** — konflikty dotyczące prowadzenia spółki, podziału kompetencji, strategii oraz rozliczeń.
- **Mediacje Zarządu** — rozwiązywanie sporów pomiędzy członkami zarządu oraz usprawnianie procesu podejmowania decyzji.
- **Mediacje Sukcesyjne** — przygotowanie przedsiębiorstwa do przekazania firmy kolejnemu pokoleniu oraz rozwiązywanie konfliktów rodzinnych związanych z sukcesją.
- **Mediacje Managerskie** — konflikty pomiędzy kadrą zarządzającą, dyrektorami i kierownikami.
- **Mediacje Pracownicze** — rozwiązywanie sporów pomiędzy pracownikami, zespołami oraz pracodawcą.

### 1.5 Sekcja "Mediacje inwestycyjne"
- Eyebrow: `Dla uczestników procesu budowlanego`
- H2: `Rozwiązujemy konflikt, zanim zatrzyma inwestycję.`
- Lead: `To jedna z najbardziej specjalistycznych usług skierowanych do uczestników procesu inwestycyjnego lub procesu budowlanego. Naszym celem jest rozwiązanie konfliktu jeszcze w trakcie realizacji inwestycji, zanim doprowadzi on do zatrzymania robót lub wielomilionowego sporu.`
- Podtytuł: `Stosujemy odpowiednią metodę w zależności od charakteru konfliktu:`
- 01 **Mediacja** — Pomagamy stronom samodzielnie wypracować rozwiązanie przy wsparciu neutralnego mediatora.
- 02 **Koncyliacja** — Po wysłuchaniu stanowisk stron przedstawiamy propozycję rozwiązania sporu, która może stanowić podstawę dalszych negocjacji.
- 03 **Facylitacja** — Prowadzimy spotkania projektowe i pomagamy uczestnikom inwestycji odzyskać skuteczną komunikację, usprawnić współpracę oraz podejmować decyzje bez eskalacji konfliktu.
- Lista "Nasze wsparcie najczęściej dotyczy":
  - robót dodatkowych
  - zmian projektowych
  - harmonogramów
  - opóźnień
  - odbiorów robót
  - jakości wykonania
  - rozliczeń inwestycji
  - współpracy pomiędzy inwestorem, generalnym wykonawcą i podwykonawcami

### 1.6 Sekcja "E-mediacje"
- Eyebrow: `Bez konieczności spotkań stacjonarnych`
- H2: `Mediacja prowadzona w pełni online.`
- Lead: `Nowoczesna forma prowadzenia mediacji bez konieczności spotkań stacjonarnych. Proces może być prowadzony całkowicie online z wykorzystaniem bezpiecznych narzędzi komunikacji jak Zoom lub Google Meet.`
- Podtytuł: `To rozwiązanie szczególnie sprawdza się w przypadku:`
- Lista:
  - braku czasu na dojazdy na spotkania mediacyjne
  - przedsiębiorców działających w różnych częściach kraju
  - inwestycji realizowanych w wielu lokalizacjach
  - sporów wymagających szybkiej reakcji

### 1.7 Sekcja "Misja i Standardy Rozwoju Zawodowego"
- Eyebrow: `Nasza misja`
- H2: `Budujemy kulturę dialogu i odpowiedzialnego rozwiązywania konfliktów.`
- Lead: `Pomagamy przedsiębiorcom zakończyć spór efektywnie i z możliwością kontynuowania dalszej współpracy biznesowej.`
- Podsekcja "Standardy Rozwoju Zawodowego Centrum Mediacji":
  Lead: `Każdy mediator, poza prowadzeniem spraw, uczestniczy w programie rozwoju zawodowego obejmującym m.in.:`
  Lista:
  - webinary eksperckie
  - analizę rzeczywistych kazusów
  - omówienie najnowszego orzecznictwa
  - warsztaty z negocjacji i komunikacji
  - szkolenia specjalistyczne (np. mediacje budowlane, inne mediacje branżowe, mediacje wewnątrz organizacji, konsyliacje, facylitacje)
  - spotkania superwizyjne z doświadczonymi mediatorami
  Zamykający akapit: `Centrum Mediacji jest miejscem, w którym mediatorzy stale podnoszą swoje kwalifikacje. U nas przedsiębiorcy powierzają swoje sprawy osobom pracującym według jednolitych, wysokich standardów, a nie przypadkowym mediatorom wpisanym jedynie na listę.`
  Link do dokumentu Standardów: **placeholder** — patrz sekcja 4 (link czeka na ustalenie z Kasią, gdzie ma się pojawić).

### 1.8 Sekcja FAQ — pełna treść (33 pytania)

Eyebrow: `Najczęstsze pytania`
H2: `Mediacje gospodarcze — pytania i odpowiedzi.`

Wdrożyć jako akordeon, pogrupowany w 10 podsekcji z nagłówkami (H3) jak niżej.
Poniżej pełna treść pytań i odpowiedzi do wklejenia 1:1.

#### Grupa 1: Podstawy mediacji gospodarczej

**1. Czym różni się mediacja komercyjna (pozasądowa/przedsądowa) od mediacji sądowej?**
- Mediacja pozasądowa i przedsądowa: To proces inicjowany bezpośrednio przez strony (lub jedną ze stron za pośrednictwem naszego Centrum) zanim sprawa oficjalnie trafi na wokandę. Pozwala na najszybsze i najbardziej dyskretne zażegnanie kryzysu kontraktowego, eliminując ryzyko uszczerbku na wizerunku biznesowym.
- Mediacja sądowa: Uruchamiana jest na podstawie postanowienia Sądu prowadzącego sprawę lub za zgodą stron już w trakcie trwania procesu (art. 183⁸ § 1 k.p.c.). Jej celem jest wypracowanie ugody, która po zatwierdzeniu przez sędziego kończy trwający proces i ma moc prawną wyroku sądowego.

**16. Mediacja, koncyliacja, facylitacja – czym różnią się te metody i którą wybrać?**
Wszystkie te metody należą do alternatywnych metod rozwiązywania sporów, w skrócie ADR (Alternative Dispute Resolution). To pozasądowe sposoby na zażegnanie konfliktu między stronami, jednak różnią się rolą, jaką odgrywa w nich nasz ekspert:
- Mediacja: Mediator jest całkowicie neutralny i nie narzuca rozwiązania. Jego zadaniem jest ułatwienie komunikacji, rozładowanie konfliktu i pomoc stronom w samodzielnym wypracowaniu satysfakcjonującej ugody.
- Koncyliacja: Koncyliator ma bardziej aktywną rolę. Po wysłuchaniu racji obu stron i analizie dokumentów, ma prawo przedstawić własną, niewiążącą propozycję rozwiązania sporu (np. optymalny algorytm rozliczenia robót dodatkowych), która staje się bazą do dalszych negocjacji. Mediator może zgodnie z obecnymi przepisami stosować konsyliację, czyli zaproponować rozwiązanie.
- Facylitacja: To wsparcie w trakcie współpracy (np. w trakcie trwania budowy). Facylitator to bezstronny moderator spotkań projektowych, który dba o to, by wielostronne rozmowy (Inwestor – Generalny Wykonawca – Podwykonawcy) przebiegały merytorycznie, bez eskalacji konfliktu i bez paraliżu decyzyjnego.

**17. Czy w mediacji może uczestniczyć mój pełnomocnik (prawnik, radca prawny, adwokat)?**
Tak, jak najbardziej. Udział profesjonalnego pełnomocnika (in-house prawnika firmy lub zewnętrznej kancelarii) jest w mediacjach gospodarczych i budowlanych wysoce rekomendowany. Prawnik wspiera przedsiębiorcę w ocenie ryzyka procesowego oraz dba o prawidłowe sformułowanie zapisów ugody pod kątem formalno-prawnym. W naszym formularzu zgłoszeniowym przewidzieliśmy dedykowane miejsce na wskazanie danych pełnomocnika. W szczególnych sytuacjach, kiedy mediator zauważy nierównowagę stron w procesie mediacji może zasugerować stronie poradę u profesjonalnego pełnomocnika.

**18. Czy mogę przystąpić do mediacji samodzielnie, bez pełnomocnika?**
Tak. Mediacja gospodarcza nie wymaga przymusu adwokacko-radcowskiego. Jako przedsiębiorca możesz reprezentować swoją firmę samodzielnie (zgodnie z zasadami reprezentacji w KRS/CEIDG). Ponieważ mediacja skupia się na interesach biznesowych i realiach technicznych, Twoja bezpośrednia obecność i decyzyjność są kluczem do sukcesu. Nasi mediatorzy dbają o to, by proces był w pełni zrozumiały i bezpieczny dla każdego uczestnika. W szczególnych sytuacjach, kiedy mediator zauważy nierównowagę stron w procesie mediacji może zasugerować stronie poradę u profesjonalnego pełnomocnika.

**19. Co w sytuacji, gdy druga strona nie odpowiada na wezwanie do mediacji lub nie wyraża na nią zgody?**
Mediacja jest procesem w 100% dobrowolnym. Jeśli druga strona nie wyrazi zgody, proces nie może się rozpocząć. Jednak samo zgłoszenie sprawy do naszego Centrum ma ogromne znaczenie strategiczne – jeśli na etapie przedsądowym wykażesz czystą intencję polubownego załatwienia sporu, a druga strona ją odrzuci, Sąd w toku późniejszego procesu weźmie to pod uwagę (co może mieć wpływ np. na rozliczenie kosztów procesu). Jeśli potrzebujesz porady, jak uzyskać zgodę drugiej strony sporu, zaznacz odpowiednią opcję w naszym formularzu – zadamy pytanie o to w Twoim imieniu i skierujemy wniosek zgody.

#### Grupa 2: Koszty i zwroty

**2. Ile kosztuje proces mediacyjny i jak rozliczane są posiedzenia stacjonarne?**
Koszty mediacji są zawsze wielokrotnie niższe niż koszty prowadzenia wieloletniego procesu sądowego (opłaty od pozwu, koszty opinii biegłych, zastępstwa procesowego). Szczegółowe zasady finansowania określa Regulamin Centrum Mediacji Gospodarczej. Koszt mediacji sądowych ściśle określają przepisy i rozliczane są one bezpośrednio przez mediatora.

Mediacje Komercyjne (Zgłoszone Bezpośrednio do Centrum) — w sprawach wszczętych na wniosek stron lub na podstawie umowy o mediację (postępowanie pozasądowe/przedsądowe), koszty ustalane są ryczałtowo według poniższego taryfikatora:
- **Opłata rejestracyjna**: 1000 zł netto. Wnoszona jest przez każdą ze stron w chwili składania wniosku. Opłata ta ma charakter manipulacyjny i nie podlega zwrotowi w przypadku, gdy druga strona nie wyrazi zgody na przystąpienie do mediacji.
- **Opłata za spotkanie wstępne z mediatorem**: 2000 zł netto od każdej ze stron (indywidualne spotkanie przygotowawcze przed wspólną sesją mediacyjną).
- **Opłata za wspólną sesję mediacyjną (do 3 godzin)**: 4000 zł netto łącznie od dwóch stron (koszt dzielony po połowie, chyba że strony umówią się inaczej).
- **Opłata za oddzielną sesję mediacyjną (do 3 godzin)**: 2000 zł netto od każdej ze stron (indywidualne sesje na osobności w trakcie trwania procesu).
- **Zwrot wydatków mediatora**: Oprócz wynagrodzenia głównego, zwrotowi podlegają udokumentowane i niezbędne wydatki mediatora poniesione w związku z przeprowadzeniem mediacji na pokrycie kosztów.

**3. Jakie oszczędności finansowe w sądzie gwarantuje zawarcie ugody?**
W przypadku mediacji toczącej się na etapie sądowym, przepisy art. 79 ustawy o kosztach sądowych w sprawach cywilnych przewidują automatyczny zwrot całości lub części wniesionej opłaty od pozwu:
- 100% zwrotu opłaty – jeśli do zawarcia ugody dojdzie przed rozpoczęciem pierwszej rozprawy lub przed mediatorem w toku postępowania.
- 75% zwrotu opłaty – jeśli ugodę przed mediatorem uda się wypracować już po rozpoczęciu pierwszej rozprawy sądowej.
- 50% zwrotu opłaty – jeśli ugodę uda się zawrzeć bezpośrednio przed samym sądem na późniejszym etapie procesu (np. w trakcie rozprawy, przed ogłoszeniem wyroku).

#### Grupa 3: Przebieg procesu i czas trwania

**4. Ile czasu trwają i jak przebiegają mediacje gospodarcze?**
Proces mediacji sądowych nie powinien trwać dłużej niż 3 miesiące od czasu skierowania przez sąd do czasu podpisania ugody. W razie przekroczenia tego czasu w przypadku mediacji sądowych należy złożyć wniosek o przedłużenie i wskazać powody przedłużenia oraz planowany czas zakończenia procesu mediacji. Jeśli strony wykazują chęć zawarcia ugody warto skorzystać z opcji przedłużenia i wskazać sądowi zasadność. W razie, gdyby sąd chciał jednak kontynuować pracę sądu, to mediacje można kontynuować nadal, ponieważ mogą one być zawarte w każdym momencie procesu sądowego.

Jako Centrum wskazujemy, że w przypadku mediacji gospodarczych ważne jest twarde zarządzanie czasem (Time-boxing). Efektywny proces nie może trwać w nieskończoność. Należy narzucić zwięzłe ramy 30-45 dni. Jako najbardziej efektywny wskazujemy poniższy przebieg procesu mediacji gospodarczych:
- D0–D7: kompletacja danych
- D14: rygorystyczna sesja techniczna
- D21: podpisanie ugody częściowej i fizyczna wypłata bezspornych należności
- D30–D45: dopinanie dokumentacji i finalizacja sporu, zgłoszenie ugody do sądu

W przypadku prostszych mediacji proces może zawrzeć się w 2-3 spotkaniach: (1) monolog mediatora, potwierdzenie udziału stron w mediacji oraz rozpoczęcie mediacji (2) ustalenie treści ugody (3) podpisanie ugody zdalnie lub osobiście podczas spotkania.

**22. Co to jest monolog mediatora?**
Na pierwszym posiedzeniu mediacyjnym mediator zobowiązany jest przeprowadzić tzw. „monolog mediatora", który przebiega następująco:
- przedstawienie się mediatora i organizacji
- wyjaśnienie stronom idei mediacji
- określenie zasad (dobrowolność, poufność, bezstronność, neutralność)
- omówienie reguł jej prowadzenia, a także aspektu logistycznego (ilość spotkań, czas trwania, tryby itp.)
- wskazanie korzyści z mediacji i jej skutków
- pytanie o zgodę na mediację (nawet jeśli strony przekazały podpisane zgody przed rozpoczęciem procesu mediacji, jako potwierdzenie zapoznania się monologiem mediatora)

My dodajemy jeszcze w naszym regulaminie obowiązkowe przedstawienie przez mediatora wszystkich uczestników procesu. Uważamy to za konieczne dla pełnej transparentności. Dotyczy to każdorazowej zmiany i zastępstwa, na które uzyskujemy każdorazowo zgodę stron pod rygorem odwołania ustalonego terminu.

#### Grupa 4: Ugoda – forma i zatwierdzenie

**5. W jaki sposób należy podpisać ugodę, żeby była zawarta skutecznie?**
Ugoda do zatwierdzenia przez sąd może być podpisana na kilka sposobów, w zależności od tego, czy zawierają ją Państwo bezpośrednio przed sądem, w procesie mediacji, czy też w formie umowy pozasądowej.
Sposoby podpisania i zatwierdzenia ugody obejmują następujące warianty:
- Ugoda zawarta przed sądem: Strony podpisują ugodę osobiście lub przez pełnomocników. Sąd wciąga jej treść do protokołu rozprawy, który następnie strony podpisują (w przypadku protokołu elektronicznego lub tradycyjnego).
- Ugoda zawarta przed mediatorem (pozasądowa/sądowa): Strony podpisują dokument ugody. Taka ugoda jest następnie przesyłana przez mediatora do sądu w celu zatwierdzenia.
- Dopuszczalność formy elektronicznej: Ugoda może zostać podpisana za pomocą kwalifikowanego podpisu elektronicznego, podpisu zaufanego lub podpisu osobistego, co jest powszechnie stosowane m.in. w ugodach mediacyjnych.

**6. Czy sąd zatwierdzi każdą treść ugody jaką podpiszą strony?**
Aby ugoda była skutecznie zatwierdzona, sąd musi sprawdzić, czy nie jest ona sprzeczna z prawem, zasadami współżycia społecznego oraz czy nie zmierza do obejścia prawa. Sąd może zatwierdzić ugodę w całości, częściowo lub ją odrzucić. Dlatego ważne jest, aby ugody były zwięzłe, jasne, zrozumiałe, dotyczyły zakresu sporu i mieściły się w granicach prawa. Jednak każdorazowo to sąd podejmie decyzję w zakresie zatwierdzenia ugody.

**7. Czy mediator podpisuje ugodę razem ze stronami?**
Nie, mediator nie podpisuje ugody jako strony sporu, ani jej nie narzuca. Ugoda jest wypracowywana i podpisywana wyłącznie przez zwaśnione strony konfliktu. Mediator swoim podpisem zatwierdza jedynie protokół z przebiegu mediacji, poświadczając tym samym, że dokument został sporządzony w ich obecności i zgodnie z procedurą.

**8. Jaka jest rola mediatora w procesie zawierania ugody?**
- Bezstronność: Mediator wspiera uczestników w negocjacjach, ale nie może decydować o treści porozumienia ani zmuszać nikogo do jego podpisania.
- Protokół i ugoda w formie załącznika: Ugoda jest dołączana do protokołu końcowego z mediacji, który w przypadku sporów sądowych zatwierdza sąd.
- Zgoda na sąd: Przez złożenie podpisu na ugodzie strony wyrażają zgodę na to, aby mediator przedstawił dokument sądowi (w celu jej zatwierdzenia i nadania mocy prawnej).

**9. Co oznacza, że ugoda w naszym Centrum ma charakter zwięzły? Czy możemy uregulować inne relacje biznesowe?**
Nasze Centrum stosuje wysoce profesjonalny mechanizm Porozumienia Dwupoziomowego (Dual-Track Resolution):
- Ugoda główna: Służy do zawarcia zwięzłego, czystego proceduralnie porozumienia w zakresie ściśle objętym sporem prawnym w celu bezproblemowego i szybkiego zatwierdzenia jej przez Sąd.
- Poufne ustalenia dodatkowe: Strony mają pełne prawo zawrzeć w ramach procesu mediacyjnego dodatkowe, czysto biznesowe ustalenia (np. dotyczące przyszłych upustów, nowych kontraktów czy wymiany referencji). Ta część ma charakter poufny, stanowi klasyczną umowę handlową i nie podlega opracowaniu ani zatwierdzaniu przez mediatora, co chroni tajemnice handlowe firmy. Dodatkowe skomplikowane opracowania techniczne dostarczane są przez strony lub wyceniane osobno.

#### Grupa 5: E-mediacje i poufność

**10. Jak przebiegają e-mediacje i czy są one bezpieczne?**
E-mediacje to w pełni nowoczesne i bezpieczne postępowanie prowadzone online za pośrednictwem dedykowanych platform (Zoom / Google Meet). To rozwiązanie idealne dla generalnych wykonawców i podwykonawców realizujących inwestycje w różnych częściach kraju lub borykających się z brakiem czasu na dojazdy. Zgoda na mediację oraz sama ugoda mogą być podpisane całkowicie zdalnie przy użyciu kwalifikowanego podpisu elektronicznego lub profilu zaufanego, co gwarantuje pełną ważność prawną i poufność procesu.

**20. Czy mediator może być świadkiem w Sądzie, jeśli nie dojdzie do ugody?**
Absolutnie nie. Jedną z fundamentalnych zasad mediacji jest poufność. Wszystko, o czym rozmawiano w trakcie posiedzeń, oraz wszelkie przedstawione propozycje ugodowe są objęte tajemnicą. Mediator nie może zostać przesłuchany w charakterze świadka co do faktów, o których dowiedział się w związku z prowadzeniem mediacji (art. 165¹ k.p.c.), chyba że strony zwolnią go z tego obowiązku. Zapewnia to pełny komfort i otwartość w poszukiwaniu rozwiązań biznesowych. Brak jest możliwości powoływania się w trakcie procesu sądowego na odrzucone rozwiązania przez strony oraz pełnomocników stron. Zatem pełnomocnik w procesie mediacji ma takie same obowiązki w zakresie zachowania poufności bez podpisywania dodatkowych umów i zobowiązań.

**21. Czy w procesie mediacji istnieje konieczność podpisywania umów o poufności?**
Absolutnie nie. Wynika to wprost z przepisów prawa. Strony oraz ich pełnomocnicy zostają pouczeni o przebiegu procesu mediacji, w tym o poufności tego procesu.

#### Grupa 6: Zakres specjalizacji Centrum

**11. W jakich typach sporów specjalizuje się Centrum Mediacji Gospodarczej?**
Prowadzimy wyłącznie mediacje dotyczące umów gospodarczych oraz procesów inwestycyjnych (nie obsługujemy sporów rodzinnych, rówieśniczych, czy karnych). Naszą najsilniejszą domeną są skomplikowane technicznie spory w relacjach biznesowych: Inwestor – Wykonawca oraz Generalny Wykonawca – Podwykonawca, obejmujące spory o roboty dodatkowe, opóźnienia, kary umowne, wady, usterki oraz rozliczenia końcowe inwestycji. Ponadto skutecznie gasimy wewnętrzne konflikty w firmach (spory wspólników, zarządów, sukcesyjne i menedżerskie).

**12. Czy Centrum prowadzi spory pomiędzy inwestorem indywidualnym, a architektem, wykonawcą domu, projektantem wnętrza czy wykonawcą remontu mieszkania?**
Tak. Nasze centrum obsługuje też inwestycje w sporach, gdzie jedna ze stron jest podmiotem gospodarczym, a druga inwestorem indywidualnym - Klientem.

**13. Dlaczego warto wybrać mediatorów z Centrum Mediacji przy Fundacji „Polskie Budownictwo"?**
W odróżnieniu od osób wpisanych przypadkowo na listy stałych mediatorów, eksperci naszego Centrum działają według jednolitych, restrykcyjnych Standardów Rozwoju Zawodowego. Każdy nasz mediator stale podnosi kwalifikacje poprzez analizę rzeczywistych kazusów budowlanych, webinary eksperckie oraz warsztaty z zaawansowanych technik negocjacji, facylitacji i koncyliacji. Gwarantuje to przedsiębiorcom współpracę z mediatorem, który doskonale rozumie dokumentację techniczną, specyfikę kosztorysowania i realia biznesowe placu budowy, czy procesu inwestycyjnego. Naszym mediatorem może być mediator, mający doświadczenie jako prawnik, inżynier, architekt, projektant, przedsiębiorca, lub manager. Osoby nie posiadające takiego doświadczenia zobligowane są do odbycia kursu w zakresie przebiegu procesów budowlanych i inwestycyjnych oraz najczęstszych przyczyn powstawania sporów na tym polu. Następnie wspólnie wymieniamy się wiedzą w zakresie skutecznych metod rozwiązywania sporów.

**14. Czy Centrum zbiera opinie lub stosuje superwizję podczas procesu mediacji?**
Nie zbieramy opinii i nie stosujemy superwizji z uwagi na ograniczanie osób zaangażowanych w rozwiązywanie sporów i zachowanie w pełni poufnego charakteru procesu mediacji. Możemy natomiast poprosić Państwa o ocenę punktową współpracy z mediatorem w ramach rozwoju kwalifikacji i przekazania informacji zwrotnej.

**15. Kim jest komediator?**
W naszym centrum w razie skomplikowanych i wielostronnych sporów możemy zaproponować komediatora, który wspiera mediatora w organizacji przebiegu mediacji, a w razie potrzeby zastąpi mediatora pod jego nieobecność lub chorobę, co nie zaburzy większych procesów mediacyjnych. Gdyby taka decyzja związana była z dodatkowym kosztem Centrum przedstawi Państwu taki koszt i zapyta o decyzję.

#### Grupa 7: Prawo budowlane i obowiązkowość mediacji

**23. Na czym polega obowiązkowość mediacji dla budownictwa?**
Art. 458³a k.p.c.: Obowiązek zamiast opcji. Nowelizacja procedury cywilnej przewiduje całkowicie obligatoryjne kierowanie do mediacji sporów wynikających z umów o roboty budowlane oraz umów bezpośrednio związanych z procesem budowlanym. Zgodnie z nowym art. 458³a § 1 k.p.c., sąd jeszcze przed posiedzeniem przygotowawczym albo pierwszym posiedzeniem wyznaczonym na rozprawę skieruje strony do mediacji.

Intencją ustawodawcy jest szybka weryfikacja i odsiew spraw, gdzie błyskawiczne ustalenie faktów (np. niezaprzeczalne obmiary, wymiana brakujących dokumentów odbiorowych) oraz wypracowanie częściowych porozumień płatniczych daje potężną oszczędność czasu i kosztów. Co ważne, choć skierowanie przez sąd ma charakter obowiązkowy, sama mediacja opiera się na dobrowolności – strona ma prawo wniesienia sprzeciwu w ściśle określonym terminie (z reguły tygodnia od dnia doręczenia postanowienia, art. 205⁸ § 2 k.p.c.). Jeśli sprzeciw się uprawomocni lub mediacja nie przyniesie efektu, sprawa powraca na klasyczną ścieżkę orzeczniczą.

**24. Czy jeśli odmówię mediacji na które sąd mnie skierował to mogę otrzymać karę?**
Aby przeciwdziałać traktowaniu sprzeciwu jako domyślnej procedury uników, od 1 marca 2026 r. zaczynają obowiązywać rygorystyczne przepisy art. 103 k.p.c. uprawniające sąd do obciążenia kosztami procesu tej strony, która bez uzasadnionej przyczyny odmówiła udziału w mediacji.

⚠️ Uwaga redakcyjna: zweryfikować przed publikacją, czy ten przepis już obowiązuje w dniu deploya (wchodzi w życie 1 marca 2026).

**25. Na czym polega Model gotowości do obowiązkowych mediacji?**
5 filarów gotowości do obowiązkowych mediacji w budownictwie. Aby zniwelować ryzyko gry na czas i braku kompetencji, jako praktyk proponujemy implementację restrykcyjnego modelu mediacji budowlanych. Zamiast "terapii", spór biznesowy wymaga procedury inżynieryjnej.

- **Filar 1: Jawność danych.** Na etapie przygotowawczym (tzw. D0–D7) obie strony muszą dostarczyć pełen pakiet weryfikowalny: umowę z aneksami, PFU/projekt, skany dziennika budowy, protokoły odbiorów wraz z datami, całą korespondencję z inżynierem kontraktu, narzucony harmonogram prac w zderzeniu z realnymi przerobami, statusy zgłoszeń podwykonawców, stan retencji oraz ważność gwarancji. Bez tych danych mediacja degeneruje się do starcia dwóch subiektywnych narracji zamiast weryfikacji faktów.
- **Filar 2: Mechanizmy finansowe (Depozyt).** Ochrona słabszej strony. Wymagane jest powołanie przez obie strony rachunku powierniczego (depozytu) przypisanego do projektu mediowanego. Jeśli inwestor neguje 30% jakości, 70% części bezspornej ma zostać natychmiast wypłacone. Reszta, stanowiąca osobny depozyt retencyjny, oczekuje w bezpiecznym miejscu na ustalony kalendarz zwolnień.
- **Filar 3: Twarde zarządzanie czasem (Time-boxing).** Proces nie może trwać w nieskończoność. Należy narzucić ramy 30-45 dni: D0–D7 kompletacja danych; D14 rygorystyczna sesja techniczna; D21 podpisanie ugody częściowej i fizyczna wypłata bezspornych należności; D30–D45 dopinanie dokumentacji i finalizacja sporu, zgłoszenie ugody do sądu. Równoległe działania sądu zapobiegają marnowaniu czasu, jeśli ugoda nie zostanie w pełni wypracowana.
- **Filar 4: Sankcje i nagrody.** Konsekwentne stosowanie przez sąd art. 103 k.p.c. Wobec podmiotu grającego na zwłokę sędzia musi wyciągnąć skutki w postaci kosztów, z kolei proaktywne i uczciwe zachowanie w mediacji powinno być nagradzane przy miarkowaniu pozostałych opłat procesowych.
- **Filar 5: Integracja techniczna i ekspercka.** Nowoczesny mediator gospodarczy nie działa sam. Podobnie jak w mechanizmach międzynarodowych umów (np. DAAB według wzorów FIDIC 2017), w mediacji powinien uczestniczyć powołany ad hoc rzeczoznawca/inżynier, którego rolą nie jest wydanie opinii jak w sądzie (co trwa rok), ale błyskawiczna weryfikacja stanowisk technicznych w trakcie sesji.

#### Grupa 8: Kontekst branżowy — FIDIC, PZP, KIO, Prokuratoria Generalna

**26. Czym jest FIDIC?**
FIDIC (akronim z języka francuskiego: Fédération Internationale des Ingénieurs-Conseils) to dosłownie Międzynarodowa Federacja Inżynierów Konsultantów. Jednak w prawniczej i biznesowej praktyce budowlanej, gdy ktoś na spotkaniu mówi "robimy to na FIDIC-u", ma na myśli Warunki Kontraktowe FIDIC. Są to międzynarodowe, ustandaryzowane wzorce umów dla branży inżynieryjno-budowlanej stworzone przez tę organizację.

Dlaczego rynek stosuje FIDIC? Zamiast pisać od zera kilkusetstronicową umowę dla budowy autostrady, linii kolejowej czy elektrowni, strony inwestycji biorą gotowy, wielokrotnie przetestowany wzorzec. Główne powody to:
- Zbalansowanie ryzyka: Wzorce te (z pewnymi wyjątkami) nie faworyzują rażąco żadnej ze stron. Przypisują ryzyko temu podmiotowi, który w danym modelu inwestycji najlepiej potrafi nim zarządzać.
- Międzynarodowy standard: Warunki są od lat zrozumiałe i akceptowane przez zagraniczne konsorcja, podwykonawców, ubezpieczycieli i banki.
- Wymóg finansowania: Organizacje takie jak Bank Światowy czy fundusze unijne często uzależniają przyznanie wielomilionowej dotacji od prowadzenia inwestycji właśnie w oparciu o standardy FIDIC.

Kolorowe Książki FIDIC (tabela do wdrożenia jako tabela HTML):

| Wzorzec | Model inwestycji | Kto dostarcza projekt? |
|---|---|---|
| Czerwona Książka | Buduj (Build) | Zamawiający (Inwestor) |
| Żółta Książka | Projektuj i Buduj (Design-Build) | Wykonawca |
| Srebrna Książka | Pod Klucz (EPC/Turnkey) | Wykonawca (bierze pełne ryzyko) |
| Zielona Książka | Krótka Forma (Short Form) | Zależy od indywidualnych ustaleń |

Przez lata polski rynek zamówień publicznych opierał się głównie na Czerwonej Książce (inwestor dawał projekt, wykonawca tylko murował). Obecnie dominującym standardem przy dużych inwestycjach infrastrukturalnych jest Żółta Książka, która przerzuca obowiązek – ale i swobodę – zaprojektowania optymalnych rozwiązań inżynieryjnych na generalnego wykonawcę.

Link źródłowy: https://sidir.pl/wp-content/uploads/2024/03/Zlote-Zasady-FIDIC.pdf

**27. Na czym polega unikanie sporów według FIDIC?**
Link źródłowy: https://sidir.pl/wp-content/uploads/2024/01/Nota-praktyczna-FIDIC-Unikanie-sporow.pdf

Głównym założeniem unikania sporów wg FIDIC (Międzynarodowa Federacja Inżynierów Konsultantów) jest uświadomienie uczestnikom procesu budowlanego, że niezwłoczne unikanie sporów leży w najlepszym interesie samej inwestycji, stron zaangażowanych w umowę oraz podmiotów ją finansujących.

Kontrakty FIDIC opierają się na wielopoziomowym mechanizmie rozstrzygania sporów, który promuje unikanie konfliktów lub ich rozwiązywanie tak wcześnie, jak to możliwe (najlepiej jeszcze w trakcie trwania inwestycji).

Zasadniczym krokiem jest jak najszybsze zwiększenie świadomości stron w zakresie tego, jaką rolę pełni komisja rozjemcza. Osiąga się to poprzez:
- Wczesne spotkanie zapoznawcze: Komisja rozjemcza powinna zwołać spotkanie wstępne jak najszybciej po swoim powołaniu (najlepiej fizycznie lub w formie wideokonferencji). Ma to na celu nawiązanie relacji między stronami, budowę obopólnego zaufania i skupienie się na wspólnym sukcesie.
- Prezentację edukacyjną: Sugeruje się, aby komisja zaprezentowała stronom mechanizm unikania sporów, wskazała różnice między prewencją a formalnym procesem orzekania oraz podała konkretne przykłady spraw, w których unikanie sporów znajduje zastosowanie.
- Uruchomienie tzw. "radaru unikania sporów": Komisja rozjemcza powinna aktywnie monitorować sytuację i sygnalizować stronom ewentualne problemy, zanim te zdążą przerodzić się w otwarte spory.
- Bieżące działania prewencyjne podczas budowy: Komisja powinna stale podtrzymywać ducha zapobiegania konfliktom poprzez dodawanie "niepokojących spraw" do programów wizyt na placu budowy oraz zachęcanie stron, aby w problematycznych kwestiach wspólnie zwracały się o jej opinię.

**28. Co to jest PZP?**
Prawo zamówień Publicznych (PZP). Zamówienia publiczne to kluczowa forma udziału sektora publicznego w gospodarce i uregulowane są osobnymi aktami prawnymi.

Zamówienie Publiczne - to odpłatna umowa zawierana między zamawiającym a wykonawcą, której przedmiotem jest nabycie przez zamawiającego od wybranego wykonawcy robót budowlanych, dostaw lub usług. System zamówień publicznych opisuje szczegółowe procedury, według których zamawiający mogą dokonywać tych zakupów.

Dla osób szukających wsparcia, aktualizowana wiedza o przepisach i procedurach (np. zamówieniach podprogowych, szacowaniu wartości) dostępna jest na dedykowanych kursach i warsztatach. Zależnie od stopnia zaawansowania i potrzeb, wybrać można szkolenia:
- Dla początkujących: Akademia PARP oferuje darmowy kurs wprowadzający, który wyjaśnia podstawowe pojęcia — https://akademia.parp.gov.pl/course/view.php?id=85

**29. Czym jest KIO?**
KIO, czyli Krajowa Izba Odwoławcza, to wyspecjalizowany, niezależny organ, który zajmuje się rozstrzyganiem sporów na etapie przetargów publicznych (zanim dojdzie do podpisania umowy). Można powiedzieć, że KIO to "sąd przetargowy", który pilnuje, aby pieniądze publiczne były wydawane uczciwie, transparentnie i zgodnie z ustawą Prawo zamówień publicznych (PZP).

KIO jest instytucją, z którą firmy spotykają się na samym początku inwestycji – w walce o to, kto dany kontrakt zrealizuje. Firma startująca w przetargu (np. budowlanym, informatycznym czy na dostawę sprzętu medycznego) zgłasza się do KIO, gdy uważa, że instytucja państwowa lub samorządowa (Zamawiający) naruszyła Prawo Zamówień Publicznych (PZP).

Najczęstsze powody odwołań do KIO to:
- Niesłuszne odrzucenie oferty: Zamawiający stwierdził, że oferta wykonawcy zawiera błędy i wyrzucił ją z przetargu, z czym wykonawca się nie zgadza.
- Wybór gorszej oferty: Zamawiający wybrał ofertę konkurencji, mimo że to odwołujący dał lepszą cenę lub konkurencja nie spełniała wymogów.
- Dyskryminujące warunki w SIWZ/SWZ: Zamawiający tak opisał wymagania przetargowe, że faworyzują one konkretną firmę (np. wymagając sprzętu o bardzo specyficznych, nieuzasadnionych gabarytach), co blokuje innym udział w postępowaniu.

Najważniejsze cechy Krajowej Izby Odwoławczej:
1. Szybkość działania: W przeciwieństwie do zwykłych sądów gospodarczych, gdzie na wyrok czeka się latami, KIO działa błyskawicznie. Rozprawy wyznaczane są zazwyczaj w ciągu kilkunastu dni od wniesienia odwołania, a wyrok ogłaszany jest niemal natychmiast po rozprawie. Jest to kluczowe, aby nie blokować miesiącami ważnych inwestycji publicznych.
2. Blokada podpisania umowy: Wniesienie odwołania do KIO co do zasady "zamraża" przetarg. Zamawiający nie może legalnie podpisać umowy ze zwycięzcą, dopóki Izba nie wyda wyroku.
3. Wysoka specjalizacja: W KIO orzekają członkowie Izby, którzy są wybitnymi ekspertami wyłącznie z zakresu Prawa zamówień publicznych.
4. Wiążące wyroki: KIO może nakazać Zamawiającemu unieważnienie podjętej decyzji, powtórzenie oceny ofert lub zmianę zapisów w dokumentacji przetargowej.

Orzeczenia KIO są wiążące, jednak strona niezadowolona z wyroku (zarówno odrzucony wykonawca, jak i Zamawiający) ma prawo złożyć tzw. skargę na orzeczenie KIO do sądu powszechnego – a konkretnie do wyspecjalizowanego Sądu Zamówień Publicznych w Warszawie.

Podsumowując: KIO to "sędzia" na etapie wyboru wykonawcy. Gdy KIO rozstrzygnie kto ma budować i umowa zostanie podpisana, Izba kończy swoją pracę. Jeśli później (na etapie budowy) pojawią się konflikty, to wtedy do gry wchodzą mechanizmy z samej umowy (np. komisje rozjemcze z FIDIC), mediacje (np. w Sądzie Polubownym przy Prokuratorii Generalnej).

**30. Czym jest Prokuratoria Generalna?**
Prokuratoria Generalna Rzeczypospolitej Polskiej (PGRP) to wyspecjalizowana instytucja państwowa, którą można określić mianem „kancelarii prawnej rządu" lub „głównego prawnika państwa". Jej podstawowym zadaniem jest ochrona interesów i praw majątkowych Skarbu Państwa oraz państwowych osób prawnych.

W praktyce oznacza to, że radcowie Prokuratorii reprezentują państwo (np. ministerstwa, urzędy centralne, GDDKiA, Wody Polskie) w najważniejszych i najbardziej skomplikowanych sporach sądowych, gospodarczych oraz międzynarodowych.

Choć historycznie PGRP kojarzyła się głównie z twardą obroną państwa w sądach, jej rola w zakresie mediacji i polubownego rozwiązywania sporów stała się w ostatnich latach fundamentalna.

Przy PGRP funkcjonuje wyspecjalizowany Sąd Polubowny. Został on stworzony przede wszystkim po to, aby ułatwić rozwiązywanie sporów między państwowymi podmiotami a podmiotami prywatnymi (np. wykonawcami infrastruktury budowlanej) bez konieczności wikłania się w wieloletnie procesy przed sądami powszechnymi. Sąd ten nie tylko wydaje wyroki arbitrażowe, ale przede wszystkim prowadzi postępowania mediacyjne i koncyliacyjne.

#### Grupa 9: Przyczyny sporów budowlanych i gospodarczych

**31. Jakie są najczęstsze genezy sporów w branży budowlanej?**
Branża budowlana jest jedną z najbardziej podatnych na konflikty. Niezależnie od skali inwestycji – od budowy hali magazynowej po realizację autostrady – większość sporów sprowadza się do dwóch fundamentalnych zmiennych: pieniędzy (kto za to zapłaci?) oraz czasu (czyja to wina, że trwało to tak długo?).

Główne zapalniki sporów na placach budowy:

1. **Roboty dodatkowe i zamienne** — To absolutnie najczęstsza przyczyna konfliktów. W trakcie budowy okazuje się, że trzeba wykonać prace, których nie przewidziano w pierwotnym przedmiarze lub kosztorysie.
   - Punkt widzenia Wykonawcy: Prace wychodzą poza ramy umowy, są niezbędne do ukończenia obiektu, więc Inwestor musi za nie dodatkowo zapłacić.
   - Punkt widzenia Inwestora: Wykonawca (zwłaszcza przy wynagrodzeniu ryczałtowym) jako profesjonalista – powinien był dokładnie zapoznać się z terenem i dokumentacją przed podpisaniem umowy i wkalkulować te ryzyka w cenę.

2. **Błędy i luki w dokumentacji projektowej** — Jeśli inwestycja jest realizowana w modelu, w którym projekt dostarcza Zamawiający (jak we wspomnianej wcześniej Czerwonej Książce FIDIC), wykonawca często na etapie wykonawstwa odkrywa, że plany nijak mają się do rzeczywistości. Kolizje różnych instalacji, błędne zestawienia materiałów czy niewykonalne technologicznie detale oznaczają konieczność wstrzymania prac. Rodzi to lawinę roszczeń o dodatkowy czas i pieniądze na przeprojektowanie. Najwięcej roszczeń zgłaszają wykonawcy, którzy nie mają doświadczenia przy umowach FIDIC i nie rozumieją na co zgodzili się w tym właśnie modelu. Zamawiający/Generalny wykonawca nie organizują takich szkoleń.

3. **Opóźnienia i kary umowne** — Gdy budowa nie kończy się w terminie, Inwestor sięga po najpotężniejszą broń: zaczyna naliczać wysokie kary umowne, potrącając je z faktur. Spór ogniskuje się wokół tego, czy opóźnienie było zawinione przez wykonawcę. Wykonawcy bronią się, wskazując na przyczyny od nich niezależne:
   - Ekstremalne warunki pogodowe.
   - Brak współdziałania Inwestora (np. zwłoka w akceptacji materiałów).
   - Opóźnienia w wydawaniu pozwoleń przez organy administracji państwowej.

4. **Waloryzacja wynagrodzenia (nieprzewidywalny wzrost kosztów)** — Niezwykle gorący temat ostatnich lat (efekt pandemii, wojny w Ukrainie, skoków inflacji). Kiedy w trakcie wieloletniego kontraktu ceny stali, betonu czy asfaltu rosną o kilkadziesiąt procent, wykonawcy nie są w stanie dokończyć budowy za pierwotnie ustaloną stawkę bez widma bankructwa. Spory dotyczą tego, czy umowa pozwala na renegocjację cen, o ile procent podnieść wynagrodzenie i jak rozłożyć to ryzyko. W przypadku ZP to właśnie w tych sprawach masowo do mediacji wkracza Prokuratoria Generalna. Co ważne klauzule waloryzacyjne składają się z tzw. odhaczeń i często Generalny Wykonawca odhacza je wszystkie (zrzeczenie się waloryzacji) lub częściowo w umowach z Podwykonawcami (PDW). Zazwyczaj jedynie pełny spis klauzul pozwala na występowanie o waloryzację, a podwykonawcy, którzy realnie ponoszą zwiększone koszty pracy i materiałów dopiero orientują się, że ich umowa pomimo, że jest umową w łańcuchu PZP nie uprawnia do waloryzacji. Prowadzi to do prawdziwej nierównowagi. Generalny Wykonawca nie ponosi zwiększonych kosztów, ponieważ zablokował waloryzację PDW, a sam domaga się wypłat od zamawiającego publicznego. PDW bankrutują, a GW osiąga ponadnormatywne zyski.

5. **Nieprzewidziane warunki gruntowe** — Wykonawca wchodzi na plac budowy, zaczyna robić wykopy i natrafia na "niespodzianki", których nie wykazały badania geologiczne Inwestora: skały znacznie twardsze niż zakładano, bardzo wysoki poziom wód gruntowych, podziemne kable-widma, wykopaliska archeologiczne czy niewybuchy. Taka sytuacja natychmiast paraliżuje budowę i rodzi ostry spór o to, kto finansuje przestoje i specjalistyczne roboty ziemne.

6. **Usterki, odbiory i zatrzymywanie płatności końcowych** — Inwestor odmawia podpisania bezusterkowego protokołu odbioru końcowego, twierdząc, że obiekt ma wady. Zatrzymuje tym samym ostatnią transzę wynagrodzenia (która często stanowi zysk wykonawcy z całej budowy) lub żąda uruchomienia gwarancji bankowych. Wykonawca z kolei dowodzi, że zgłoszone wady nie są "wadami istotnymi" (czyli takimi, które uniemożliwiają bezpieczne korzystanie z budynku), a jedynie drobnymi usterkami, które powinny być usunięte w ramach gwarancji po rozliczeniu kontraktu i domaga się odbioru bez klauzuli "bezusterkowy" na zasadach odbioru końcowego.

**32. Jakie są najczęstsze powody sporów gospodarczych?**
Abstrahując od samego budownictwa na szersze wody biznesu – spory gospodarcze (B2B) rzadko zaczynają się od celowego oszustwa czy złej woli. Wtórne przyczyny bywają różne, ale u ich podstaw leży zazwyczaj kilka uniwersalnych grzechów głównych.

5 najczęstszych punktów zapalnych w relacjach między firmami:

1. **Nieprecyzyjne umowy ("Geneza główna")** — Większość sporów rodzi się już w momencie podpisywania kontraktu. Firmy często korzystają z szablonów skopiowanych z internetu lub używają pojęć niedookreślonych.
   - Brak definicji: Co dokładnie oznacza, że usługa ma być wykonana "z najwyższą starannością" albo "niezwłocznie"? Dla jednej strony to 24 godziny, dla drugiej – dwa tygodnie.
   - Brak mierzalnych KPI: Brak obiektywnych wskaźników sukcesu pozwala na subiektywną ocenę, czy umowa została wykonana prawidłowo.

2. **Zatory płatnicze (Efekt domina)** — Pieniądze to krew w krwiobiegu gospodarki. Jeśli duży kontrahent spóźnia się z zapłatą faktury o 60 dni, jego podwykonawca traci płynność finansową i przestaje płacić swoim dostawcom. Spory o zapłatę stanowią lwią część spraw w sądach gospodarczych. Często dłużnik celowo zgłasza "wymagające wyjaśnienia wady" w produkcie tylko po to, by prawnie opóźnić termin płatności.

3. **Nienależyte wykonanie zobowiązania (Różnica oczekiwań)** — To sytuacja, w której usługa została wykonana lub towar dostarczony, ale zamawiający twierdzi, że nie o to mu chodziło.
   - W branży IT jest to klasyczny konflikt o to, czy nowa aplikacja ma "błędy", czy po prostu zamawiający "zmienił wizję" w trakcie programowania.
   - Brak precyzyjnych procedur odbioru (np. braki w protokołach zdawczo-odbiorczych) sprawia, że strony nie potrafią udowodnić swoich racji.

4. **Nagłe zmiany rynkowe (Czarne łabędzie)** — Gdy zawierano umowę, biznesplan się spinał. Nagle wybucha pandemia, wojna, gwałtownie rośnie inflacja lub wchodzą nowe podatki. Realizacja umowy na starych zasadach oznacza dla jednej ze stron bankructwo. Wtedy dochodzi do zderzenia dwóch światów: jedna strona twardo mówi „pacta sunt servanda" (umów należy dotrzymywać), a druga żąda renegocjacji, powołując się na nadzwyczajną zmianę stosunków. Jeśli brakuje klauzul waloryzacyjnych (jak wspominaliśmy przy budownictwie), sprawa trafia do sądu.

5. **Komunikacja "przez prawników" i chowanie głowy w piasek** — To czynnik czysto ludzki, ale krytyczny. Zamiast zadzwonić i szczerze powiedzieć: "Mamy problem z dostawą, spóźnimy się dwa tygodnie, jak możemy wam to zrekompensować?", menedżerowie często unikają trudnych rozmów. Problem narasta. Gdy w końcu dochodzi do konfrontacji, emocje są już tak silne, a zaufanie tak zrujnowane, że strony przestają rozmawiać i zaczynają wymieniać się pismami z kancelarii prawnych.

Kluczowy wniosek (wyróżnić graficznie jako cytat): `Dobry kontrakt gospodarczy poznaje się nie po tym, jak reguluje współpracę, gdy wszystko idzie świetnie, ale po tym, jak precyzyjnie opisuje ścieżkę wyjścia (tzw. exit plan), gdy współpraca zaczyna się psuć.`

#### Grupa 10: Klauzula mediacyjna

**33. Czym jest klauzula mediacyjna?**
Klauzula mediacyjna daje szansę na szybkie porozumienie stron. Zamieszczona w umowie stanowi podstawę działania w sytuacji wystąpienia sporu pomiędzy stronami. Klauzula mediacyjna daje stronom szansę na podjęcie rozmów przed wstąpieniem na drogę postępowania sądowego.

Klauzula Mediacyjna Centrum Mediacji Gospodarczych przy Fundacji „Polskie Budownictwo" (wdrożyć jako wyróżniony blok tekstowy z przyciskiem "Kopiuj treść klauzuli"):

```
„Strony zgodnie postanawiają, że wszelkie spory dotyczące niniejszej umowy lub z
nią związane, będą rozwiązywane w trybie mediacji prowadzonej przez mediatora w
Centrum Mediacji Gospodarczych przy Fundacji »Polskie Budownictwo«, zgodnie z
regulaminem obowiązującym w tym Centrum. Każda ze Stron ma prawo
samodzielnie wystąpić do Centrum z wnioskiem o przeprowadzenie mediacji,
informując o tym drugą Stronę, nie później niż w terminie 14 dni od dnia doręczenia
drugiej Stronie pisemnego wezwania do usunięcia naruszeń lub polubownego
załatwienia sporu."
```

⚠️ Uwaga do sekcji 24/25: przed publikacją zweryfikować, czy przepis art. 103 k.p.c.
(wchodzący w życie 1 marca 2026) już obowiązuje w dniu deploya.

### 1.9 Stopka
- Identyczna jak na głównej stronie:
- E-mail: `mediacje@polskiebudownictwo.org`
- Adres 1: `ul. Nowogrodzka 50/54 lok. 515, 00-695 Warszawa`
- Adres 2: `al. Grunwaldzka 56 lok. 202, 80-241 Gdańsk`
- Dopisek pod adresami: `Mediacje stacjonarne prowadzimy w salach przystosowanych dla 6-8 osób (tylko umówione spotkania za dodatkową opłatą za każdą rozpoczętą godzinę)`
- Godziny organizacji posiedzeń mediacyjnych: `Poniedziałek – Czwartek, 10:00–15:00`
- Formy zgłoszeń: `poprzez formularz na stronie dla stron i pełnomocników` / `za pośrednictwem sądów`
- Formy organizacji mediacji: `mediacje stacjonarne, mediacje online, mediacje hybrydowe, mediacje wielostronne`
- Linki: Polityka prywatności / Polityka cookies (jak na stronie głównej), copyright

---

## 2. Formularz dla Stron sporu i Pełnomocników

Ścieżka: `/zgloszenie` (lub podstrona pod hero-CTA "Zgłoś sprawę do mediacji").
Styl pól identyczny jak istniejący formularz "Dołącz bezpłatnie" na głównej stronie.

Nagłówek strony formularza: `Formularz wniosku o mediację — dla Stron sporu i Pełnomocników`

### 2.1 Pytanie bramkujące
```
Czy zgłoszenie dotyczy umów gospodarczych lub inwestycji
(nasze centrum nie zajmuje się innymi typami mediacji)?
[ TAK ]  [ NIE ]
```
- TAK → pokaż resztę formularza
- NIE → ukryj formularz, pokaż komunikat:
  `Tym razem nie będziemy w stanie Ci pomóc. Zapraszamy Cię, kiedy Twoje trudności
  komunikacyjne będą dotyczyły kwestii gospodarczych lub inwestycyjnych.`

### 2.2 Zgoda na mediację
```
Czy masz już zgodę na mediację od wszystkich stron sporu?
[ TAK ]  [ NIE ]
```
- Pod pytaniem: link `Pobierz wzór zgody`
- Info tekstowa: `Zgoda może być potwierdzona czytelnym podpisem odręcznym i
  zeskanowana lub potwierdzona poprzez podpis elektroniczny zaufany lub kwalifikowany.`
- Link: `Link do strony z podpisami` (URL do uzupełnienia — placeholder na razie)

### 2.3 Dane strony zgłaszającej (blok dynamiczny)
- Domyślnie pokazuje pola dla min. 2 stron, z przyciskiem `+ Dodaj kolejną stronę`
  (mediacje mogą być wielostronne — bez górnego limitu)
- Per strona:
  - `Nazwa strony` — **wymagane**
  - `Imię i nazwisko reprezentanta (zgodnie z KRS/CEIDG)` — opcjonalne
  - `E-mail` — opcjonalne
  - `Telefon` — opcjonalne
  - `Adres www` — opcjonalne
  - `NIP` — opcjonalne
  - Checkbox: `Za tę stronę zgłasza się pełnomocnik`
    - Jeśli zaznaczony, rozwiń pola:
      - `Imię i nazwisko pełnomocnika`
      - `Nazwa kancelarii`
      - `E-mail pełnomocnika`
      - `Telefon pełnomocnika`
      - `Działający w imieniu…` (pole tekstowe)
      - Checkbox: `Czy posiadasz aktualne pełnomocnictwo obejmujące proces mediacji?`

### 2.4 Zgoda drugiej strony/pozostałych stron
```
Czy druga strona/pozostałe strony wyraziły zgodę na proces mediacji?
[ TAK ]  [ NIE / POTRZEBUJĘ PORADY NA TEMAT MEDIACJI I SPOSOBU UZYSKANIA ZGODY ]
```
- TAK → pokaż informację, że zgody mogą zostać przekazane później mailowo lub potwierdzone
  w dalszym kontakcie z Centrum
- POTRZEBUJĘ PORADY → oznacz zgłoszenie flagą `potrzebuje_porady`
  (inny szablon maila powiadomienia, patrz 2.8)

### 2.5 Etap sporu (jednokrotny wybór)
```
Etap sporu:
( ) Nie ma jednoznacznego sporu, ale są trudności wymagające wsparcia w ramach
    współpracy gospodarczej
( ) Spór właśnie powstał i jest chęć przystąpienia do mediacji
( ) Spór jest na etapie wezwań przedsądowych
( ) Został złożony pozew bez skierowania przez Sąd na mediację
( ) Jest skierowanie stron przez Sąd na mediację
```

### 2.6 Opis sporu i wartość
- `Krótki opis sporu` — textarea, limit **2000 znaków**, licznik znaków widoczny na żywo,
  placeholder: `np. bez danych osobowych i danych identyfikujących kontrakt`
- `Wartość przedmiotu sporu` — pole liczbowe + `PLN` (wartość kontraktu/umowy/szacowana
  wartość pozwu)

### 2.7 Zgody prawne (checkboxy blokujące submit)
- `Akceptuję Regulamin Centrum Mediacji` [rozwijany tekst + link do PDF/podstrony — treść regulaminu jest jeszcze do dostarczenia, patrz sekcja 4]
- `Akceptuję Politykę RODO Fundacji „Polskie Budownictwo"` [rozwijany tekst + link]

### 2.8 Submit
- Walidacja: wszystkie pola wymagane muszą być wypełnione, oba checkboxy zaznaczone
- Wysyłka e-mail na `mediacje@polskiebudownictwo.org` z pełną treścią zgłoszenia
- Auto-odpowiedź do zgłaszającego z potwierdzeniem przyjęcia
- Jeśli flaga `potrzebuje_porady` — osobny szablon maila (inny nagłówek/priorytet)
- Brak zaplecza/panelu admina na tym etapie — zgłoszenie trafia wyłącznie mailem
  (ustalone: **formularz → e-mail**, nic więcej)

---

## 3. Formularz dla Mediatorów

Ścieżka: `/zostan-mediatorem` (lub podstrona pod CTA "Zostań mediatorem").

Nagłówek strony formularza: `Jesteś Mediatorem i chcesz do Nas dołączyć?`

### 3.1 Pytanie wejściowe
```
Jesteś Mediatorem i chcesz do Nas dołączyć?
[ TAK ]
```
- TAK → rozwija cały formularz poniżej

### 3.2 Dane podstawowe
- `Imię, nazwisko` — wymagane
- `E-mail` — wymagane
- `Telefon` — wymagane

### 3.3 Doświadczenie
- `Ilość lat doświadczenia jako mediator`:
  ( ) zaczynam  ( ) 0-3 lata  ( ) powyżej 3 lat
- `Czy masz uprawnienia do mediacji sądowych/gospodarczych?`
  [ Tak ]  [ Nie ]
  - Jeśli Tak → pokaż pola:
    - `Numer uprawnień`
    - `Nazwa placówki, która wydała certyfikat`

### 3.4 Branże doświadczenia (checkboxy, wielokrotny wybór)
- Budownictwo jako inżynier/architekt/projektant
- Rzeczoznawca/Konsultant dla Budownictwa
- Inne dla budownictwa
- Przemysł/IT/Branże techniczne/Biotechnologia
- Biznes, przedsiębiorczość
- Księgowość/Ekonomia/Finanse/Restrukturyzacje
- Psychologia/Pedagogika/Socjologia
- Prawo Gospodarcze/Doradztwo Gospodarcze
- Prawo Budowlane
- Prawo zamówień publicznych/Administracja/Stanowiska Urzędnicze
- Inne (jeśli zaznaczone → pokaż pole tekstowe do uzupełnienia)

### 3.5 Zgody (⚠️ ustalenie robocze z 08.07.2026 — WSTAWIĆ TYLKO TO PONIŻEJ)
- `Akceptuję Politykę RODO Fundacji „Polskie Budownictwo"` [rozwijany tekst + link] —
  **jedyny obowiązkowy checkbox w tej wersji formularza**

Nie dodawać na razie (czeka na decyzję, gdzie/na jakim etapie mają się pojawić —
ustalenie do potwierdzenia, nie wdrażać bez dalszego sygnału):
- Standardy Rozwoju Mediatora
- Regulamin Centrum Mediacji
- Kodeks Etyki Mediatora
- Polityka wykorzystywania AI

### 3.6 Submit
- Walidacja: wszystkie pola sekcji 3.2–3.4 wymagane, checkbox RODO (3.5) wymagany
- Wysyłka e-mail powiadomienia do zespołu rekrutującego mediatorów
  (adres do potwierdzenia — na razie użyj `mediacje@polskiebudownictwo.org`)
- Auto-odpowiedź z potwierdzeniem zgłoszenia i informacją o kolejnych krokach
- Brak zaplecza/panelu admina na tym etapie — zgłoszenie trafia wyłącznie mailem

---

## 4. Treści/dokumenty wciąż brakujące (blockery — nie tworzyć treści samodzielnie, czekać na dostarczenie)

- Regulamin Centrum Mediacji — brak treści źródłowej, potrzebny do linku w 2.7
- Kodeks Etyki Mediatora — brak treści źródłowej
- Polityka wykorzystywania AI dla mediatorów — brak treści źródłowej
- Standardy Rozwoju Zawodowego Centrum Mediacji — treść istnieje w Google Docs
  (https://docs.google.com/document/d/1iTEmf6hHajKVLfV7XF8nABUO7MSMbBuuqcuStc3BYaI/edit),
  do przeniesienia/zlinkowania po ustaleniu z Kasią (patrz 3.5)
- Wzór zgody na mediację (PDF/DOCX do pobrania) — do przygotowania osobno
- Link do strony z podpisami elektronicznymi (wspomniany w 2.2) — URL do uzupełnienia

Dla powyższych: na stronie/w formularzu zostawić działający link wskazujący na placeholder
stronę „Wkrótce" lub ukryty odnośnik, żeby nie blokować wdrożenia reszty subdomeny.

---

## 5. Zakres tej iteracji — czego NIE robimy teraz

- Brak panelu admina / zaplecza do przeglądania zgłoszeń — ustalone: **formularz → e-mail**,
  nic więcej na tym etapie
- Brak integracji z bazą danych na potrzeby zgłoszeń
- Brak automatycznego przypisywania zgłoszeń do konkretnych mediatorów

---

## 6. Rzeczy do obgadania później

- Dokładne endpointy API na głównej domenie dla formularzy mediacji.
- CORS na `polskiebudownictwo.org` dla `https://mediacje.polskiebudownictwo.org`.
- Finalne linki do Polityki RODO, Regulaminu Centrum Mediacji, strony z podpisami elektronicznymi i wzoru zgody na mediację.
- Weryfikacja art. 103 k.p.c. przed publikacją.
