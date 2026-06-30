# Informacje o projekcie

## Cel i technologia

- Jednostronicowa witryna PolskieBudownictwo.org.
- Frontend: statyczne HTML, CSS i JavaScript bez frameworka.
- Backend formularza: PHP oraz bezpośrednia wysyłka przez SMTP.
- Lokalny serwer Node.js symuluje wysłanie formularza i nie wysyła prawdziwych wiadomości.

## Struktura

- `page/` - publiczne pliki strony. Zmiany widoczne na stronie wykonuj tutaj.
- `page/index.html` - treść strony i formularz.
- `page/global.css` - wszystkie style, w tym widoki mobilne.
- `page/assets/js/form.js` - obsługa formularza po stronie przeglądarki.
- `page/send-contact.php` - walidacja, antyspam i wysyłka dwóch wiadomości.
- `page/smtp-mailer.php` - prosty klient SMTP.
- `page/smtp-config.php` - poufna konfiguracja SMTP; jest częścią wdrożenia, ale nie jest śledzona przez Git.
- `server.js` - lokalny serwer deweloperski.
- `zalozenia.md` - pierwotne założenia strony.

## Polecenia

- `npm run dev` - uruchamia stronę lokalnie pod `http://127.0.0.1:3000/`.

## Wdrożenie

1. Skopiuj zawartość katalogu `page/` do katalogu publicznego domeny.
2. Serwer docelowy musi obsługiwać PHP, połączenia SMTP i zapisywanie plików tymczasowych.

Nie kopiuj całego repozytorium na serwer. Pilnuj, aby `page/smtp-config.php` znajdował się na serwerze, ale nie trafił do Git.

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
- Po zmianach formularza sprawdź spójność pól w `page/index.html`, `page/assets/js/form.js`, `page/send-contact.php` i `server.js`.
- Przed wdrożeniem sprawdź składnię PHP poleceniami `php -l page/send-contact.php` i `php -l page/smtp-mailer.php`, jeśli PHP jest dostępne.
- Nie zapisuj haseł ani nowych sekretów w plikach śledzonych przez Git.
