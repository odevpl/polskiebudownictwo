# Linki afiliacyjne — plan implementacji

## Założenia do potwierdzenia

- Parametr w adresie rejestracji pozostaje zgodny z briefem: `afiliation`, np. `/rejestracja.html?afiliation=<uuid-v4>`.
- Atrybucja dotyczy wyłącznie pierwszej, skutecznej rejestracji nowego konta. Istniejącemu użytkownikowi nie przypisujemy afiliacji po ponownym wysłaniu formularza.
- Kod UUID v4 generuje wyłącznie serwer przez `crypto.randomUUID()` i pozostaje trwałym identyfikatorem linku.
- Opcjonalny, czytelny alias (np. `anna-sadowska`) może ustawić wyłącznie administrator. Alias wymaga normalizacji do małych liter, cyfr i myślników, limitu długości oraz unikalności; nie może być samodzielnie wybierany przez rejestrującego się użytkownika.
- Link afiliacyjny ma status aktywny/nieaktywny. Dezaktywacja zatrzymuje nowe przypisania, ale zachowuje dotychczasową historię.

## Dane i migracja

- [x] Dodać migrację tworzącą tabelę `affiliate_links`: identyfikator, `owner_name`, `owner_email`, unikalny `code` UUID v4, opcjonalny unikalny `alias`, `is_active`, autor utworzenia (`admin_id`), daty utworzenia i aktualizacji.
- [x] Dodać tabelę historii `affiliate_registrations`: identyfikator linku, identyfikator nowego użytkownika, adres e-mail z momentu rejestracji oraz data przypisania. Ustawić unikalność `user_id`, aby jedno konto miało maksymalnie jedną afiliację, i indeksy do listy oraz wyszukiwania.
- [x] Ująć nowe tabele w `sql/schema.sql` dla świeżych instalacji oraz przygotować oddzielną, bezpieczną migrację dla istniejących baz.
- [x] Dodać model/repozytorium afiliacji z metodami: utworzenie linku, wyszukiwanie/lista, odczyt aktywnego kodu, policzenie rejestracji i dezaktywacja.

## Rejestracja publiczna

- [x] W `page/rejestracja.html` i `page/assets/js/auth.js` odczytać parametr `afiliation` z URL (UUID albo alias) i dodać go do żądania rejestracji jako ukryte pole formularza. Nie wyświetlać kodu użytkownikowi ani nie zapisywać go w localStorage.
- [x] Rozszerzyć walidację rejestracji o opcjonalny kod UUID v4 oraz limit długości; traktować jego wartość wyłącznie jako nieufne dane wejściowe.
- [x] W `authController.register` po wszystkich kontrolach antyspamowych i przed odpowiedzią utworzyć użytkownika oraz atrybucję w jednej transakcji: nieistniejący lub nieaktywny kod nie blokuje rejestracji i nie tworzy wpisu afiliacyjnego.
- [x] Zachować obecną odpowiedź API niezależnie od wyniku atrybucji, aby nie ujawniać, które kody są aktywne.

## Panel administratora

- [x] Dodać pozycję nawigacji „Linki afiliacyjne” oraz trasy pod ścieżką administratora: lista, formularz dodawania, zapis i dezaktywacja. Uprawnienia: odczyt dla zalogowanego administratora, tworzenie/dezaktywacja dla `superadmin`.
- [x] Utworzyć widok listy wzorowany na `/academy/users`: nagłówek, wyszukiwarka po właścicielu, e-mailu i kodzie, przycisk „Dodaj link afiliacyjny” oraz tabela.
- [x] W tabeli pokazać: właściciela, e-mail właściciela, pełny URL rejestracji, UUID, alias, status, liczbę przypisanych rejestracji, datę utworzenia i akcje kopiowania/dezaktywacji.
- [x] Utworzyć formularz dodawania zawierający imię i nazwisko, e-mail właściciela oraz opcjonalny alias; UUID i URL generować oraz prezentować po zapisie.
- [x] Dodać widok historii linku z przypisanymi rejestracjami (e-mail i data), zgodnie z wymaganiem raportowania „jaki mail zapisał się pod czyim linkiem”.

## Bezpieczeństwo, prywatność i weryfikacja

- [x] Włączyć trasy zapisu do istniejących zabezpieczeń panelu: sesja, rola, origin/CSRF, limit wrażliwych operacji i walidacja pól.
- [x] Nie udostępniać listy kodów ani historii afiliacji w API publicznym; ograniczyć dane osobowe do administratorów i uwzględnić je w dokumentacji RODO/retencji.
- [ ] Dodać testy jednostkowe i integracyjne dla generowania kodu, duplikatu kodu, rejestracji z poprawnym/niepoprawnym/nieaktywnym kodem, braku ponownego przypisania oraz uprawnień panelu. Uruchomienie testów wymaga osobnego polecenia.
- [ ] Ręcznie sprawdzić po wdrożeniu lokalnym przepływ: utworzenie linku → otwarcie URL → rejestracja → wpis w historii i licznik w panelu. Wykonać dopiero po wyraźnym poleceniu testowania.
