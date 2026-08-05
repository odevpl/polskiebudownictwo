# Informacje o projekcie

## Cel i technologia

- Jednostronicowa witryna PolskieBudownictwo.org.
- Frontend: statyczne HTML, CSS i JavaScript bez frameworka.
- Backend formularza: Node.js, Express oraz wysyłka przez SMTP.
- Lokalny serwer Node.js obsługuje formularz i w trybie bez konfiguracji bazy przyjmuje zgłoszenia testowo.

## Struktura

- `page/` - publiczne pliki strony. Zmiany widoczne na stronie wykonuj tutaj.
- `subdomain/mediacje/` - publiczne pliki subdomeny `mediacje.polskiebudownictwo.org`.
- `page/index.html` - treść strony i formularz.
- `page/global.css` - wszystkie style, w tym widoki mobilne.
- `page/assets/js/form.js` - obsługa formularza po stronie przeglądarki.
- `app-mediacje.js` - osobny entrypoint Passenger/Node dla subdomeny mediacji.
- `controllers/public/submitController.js` - obsługa zgłoszenia formularza.
- `services/mailService.js` - wysyłka wiadomości e-mail.
- `server.js` - lokalny serwer deweloperski.
- `zalozenia.md` - pierwotne założenia strony.

## Polecenia

- `npm run dev` - uruchamia stronę lokalnie pod `http://127.0.0.1:3000/`.
- `npm run build:main` - buduje paczkę wdrożeniową głównej domeny do `dists/polskiebudownictwo.org/`.
- `npm run build:mediacje` - buduje paczkę wdrożeniową subdomeny do `dists/mediacje.polskiebudownictwo.org/`.
- `npm run build:deploy` - buduje obie paczki wdrożeniowe.

## Wdrożenie

1. Dla głównej domeny używaj paczki `dists/polskiebudownictwo.org/`.
2. Dla subdomeny mediacji używaj paczki `dists/mediacje.polskiebudownictwo.org/`.
3. Serwer docelowy musi obsługiwać Node.js, połączenia SMTP i bazę danych.

Subdomena `mediacje.polskiebudownictwo.org` działa jako osobna aplikacja Passenger/Node,
ale może korzystać z API głównej domeny `polskiebudownictwo.org`. Formularze mediacji
powinny docelowo wysyłać dane do endpointów API na głównej domenie; przy takim użyciu
trzeba dodać CORS dla `https://mediacje.polskiebudownictwo.org`.

Nie zapisuj sekretów SMTP ani danych dostępowych do bazy w plikach śledzonych przez Git.

## Formularz i manifest

- Formularz wysyła dane administratorowi na `kontakt@polskiebudownictwo.org`.
- Użytkownik otrzymuje marketingową wiadomość powitalną w HTML i plain text.
- Manifest znajduje się w `page/assets/documents/legal/manifestMSP.pdf`.
- Link do manifestu ma występować w wiadomości powitalnej, ale nie w nawigacji strony.
- Zachowuj istniejące CTA prowadzące do `#dolacz`.
- Zgody `consent-service` i `consent-marketing` są wymagane.
- Ochrona antyspamowa obejmuje honeypot, minimalny czas wypełnienia i limit zgłoszeń na IP.

## Zasady zmian

- Nie dodawaj frameworków ani procesu kompilacji frontendu bez wyraźnej potrzeby.
- Nie zmieniaj niepowiązanych sekcji strony.
- Zachowuj działanie na urządzeniach mobilnych i komputerach.
- Wszystkie pliki tekstowe zapisuj w UTF-8; przed zakończeniem zmian sprawdź, czy polskie znaki nie zostały zamienione na mojibake, np. `Å‚`, `Ä™`, `Ã³` lub `�`.
- Przy komunikatach API, tekstach interfejsu i danych renderowanych po stronie klienta kontroluj kodowanie zarówno w pliku źródłowym, jak i w odpowiedzi HTTP.
- Po zmianach formularza sprawdź spójność pól w `page/index.html`, `page/assets/js/form.js`, `controllers/public/submitController.js`, `middleware/validate.js` i `server.js`.
- Nie zapisuj haseł ani nowych sekretów w plikach śledzonych przez Git.

## Kierunek architektoniczny

- Stopniowo przechodzimy na modułową strukturę całej aplikacji.
- Nowe elementy interfejsu projektuj jako niezależne moduły, najlepiej z własnym `index.ejs`, CSS i JavaScript, zamiast rozbudowywać jeden duży szablon pełen warunków.
- Moduły powinny mieć jasno określone dane wejściowe i komunikację podobną do propsów: dane przekazywane przez EJS `include`, konfigurację JSON lub `data-*`.
- Modułowość ma zwiększać reużywalność kodu, ułatwiać późniejsze poprawki i umożliwić stopniowe testowanie poszczególnych elementów.
- Jesteśmy w trakcie migracji — przy istniejących widokach nie wykonuj dużych, niepowiązanych refaktorów. Nowe zmiany wdrażaj modułowo, a stare fragmenty przenoś przy okazji bezpiecznych, zakresowych poprawek.
