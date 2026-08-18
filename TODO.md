# Integracja formularza głównego z MailerLite

Zadania są ułożone w kolejności wykonania. Najpierw konfiguracja w kokpicie MailerLite, następnie zmiany w aplikacji.

## MailerLite — do wykonania przez właściciela konta

- [x] **ML-01. Utworzyć grupy odpowiadające rolom z formularza**
  - `Generalny wykonawca`
  - `Wykonawca`
  - `Podwykonawca`
  - `Dostawca materiałów`
  - `Producent materiałów`
  - `Inżynier, projektant lub architekt`
  - `Usługodawca dla budownictwa`
  - `Rzeczoznawca`
  - `Prawnik`
  - `Mediator`
  - `Organizacja Branżowa`
  - `Inna`

- [x] **ML-02. Uwierzytelnić domenę nadawcy**
  - Zweryfikować domenę `polskiebudownictwo.org` w MailerLite.
  - Ustawić adres nadawcy używany przez kampanie i automatyzacje.

- [x] **ML-03. Ustalić obsługę double opt-in**
  - Na obecnym etapie nie włączać double opt-in dla API.
  - Nie tworzyć teraz wiadomości potwierdzającej ani strony po potwierdzeniu.
  - Wiadomość powitalna nadal jest wysyłana przez Polskie Budownictwo.

- [ ] **ML-04. Automatyzacja powitalna — odłożona**
  - Na obecnym etapie nie tworzyć automatyzacji w MailerLite.
  - Wrócić do tego ticketu, gdy MailerLite ma przejąć wysyłkę wiadomości marketingowych.

- [x] **ML-05. Wygenerować token API**
  - `Integrations → MailerLite API → Use → Generate new token`.
  - Nazwać token np. `polskiebudownictwo.org production`.
  - Ustawić ograniczenie po IP serwera, jeśli hosting ma stały adres IP.
  - Przekazać token wyłącznie do konfiguracji serwera, nie do repozytorium Git.

- [x] **ML-06. Zebrać identyfikatory grup**
  - Mapa `roles` → MailerLite `Group ID`:
    - `Generalny wykonawca` → `192174106703037566`
    - `Wykonawca` → `192174121393588053`
    - `Podwykonawca` → `192174136389273291`
    - `Dostawca materiałów` → `192174150210553036`
    - `Producent materiałów` → `192174179865330813`
    - `Inżynier, projektant lub architekt` → `192174192328705065`
    - `Usługodawca dla budownictwa` → `192174998790604347`
    - `Rzeczoznawca` → `19217493319587568`
    - `Prawnik` → `191875008252871787`
    - `Mediator` → `192174909181396766`
    - `Organizacja Branżowa` → `192176612860495094`
    - `Inna` → `1921750209658889393`

## Aplikacja — do wykonania przeze mnie w kodzie

- [x] **APP-01. Dodać konfigurację MailerLite bez sekretów w Git**
  - Dodać odczyt `MAILERLITE_API_TOKEN` z ENV.
  - Dodać konfigurację identyfikatorów grup MailerLite.
  - Uzupełnić dokumentację wymaganych zmiennych środowiskowych bez wpisywania prawdziwego tokena.

- [x] **APP-02. Utworzyć serwis integracji MailerLite**
  - Użyć aktualnego API `https://connect.mailerlite.com/api`.
  - Dodać funkcję tworzenia lub aktualizacji subskrybenta.
  - Przesyłać e-mail, imię, nazwisko, firmę i telefon.
  - Przypisywać wszystkie wybrane role do odpowiadających im grup.
  - Nie wystawiać tokena ani wywołań MailerLite po stronie przeglądarki.

- [x] **APP-03. Dodać bezpieczne mapowanie ról na grupy**
  - Oprzeć mapę na wartościach już dozwolonych przez walidację formularza.
  - Odrzucać lub logować nieznaną rolę zamiast wysyłać nieprawidłowy `Group ID`.
  - Zachować role także w lokalnej bazie danych.

- [x] **APP-04. Włączyć synchronizację w obsłudze formularza**
  - Zachować kolejność: walidacja → zapis lokalny → synchronizacja z MailerLite.
  - Synchronizować tylko zgłoszenia z `consentMarketing`.
  - Nie synchronizować honeypotów, błędnych zgłoszeń ani trybu testowego bez bazy.
  - Nie ustawiać ręcznie statusu subskrybenta; o statusie decyduje konfiguracja MailerLite.

- [x] **APP-05. Zachować wiadomość powitalną po stronie aplikacji**
  - Wiadomość z manifestem nadal wysyła Polskie Budownictwo przez SMTP.
  - Nie tworzyć obecnie równoległej wiadomości powitalnej w MailerLite.
  - Zachować wiadomość administracyjną, jeśli będzie potrzebna do obsługi zgłoszeń.

- [x] **APP-06. Dodać obsługę błędów i ponawianie synchronizacji**
  - Awaria MailerLite nie może kasować ani unieważniać poprawnego zgłoszenia lokalnego.
  - Logować odpowiedź i kod błędu MailerLite bez ujawniania tokena.
  - Zapisać status synchronizacji lub przygotować kolejkę ponowień w bazie.
  - Obsłużyć timeout, błąd walidacji API, rate limit i konflikt istniejącego adresu.
  - Migrację kolumn `mailerlite_*` uruchomić na środowisku z dostępem do bazy poleceniem `npm run migrate`.
  - Migracja oznacza istniejące zgłoszenia jako `skipped`; do MailerLite trafiają tylko nowe zgłoszenia z formularza.

- [ ] **APP-07. Przygotować testy integracyjne**
  - Nowy kontakt z jedną rolą trafia do jednej właściwej grupy.
  - Kontakt z wieloma rolami trafia do wszystkich wybranych grup.
  - Brak zgody marketingowej nie tworzy subskrybenta w MailerLite.
  - Istniejący adres nie tworzy duplikatu.
  - Awaria MailerLite nie powoduje utraty wpisu w lokalnej bazie.
  - Formularz i komunikaty zachowują poprawne kodowanie UTF-8.

- [ ] **APP-08. Zweryfikować działanie produkcyjne**
  - Wykonać test na adresie testowym MailerLite.
  - Sprawdzić utworzenie kontaktu oraz przypisanie wszystkich wybranych grup.
  - Sprawdzić, że MailerLite nie wysyła wiadomości, a powitanie przychodzi z aplikacji.
  - Sprawdzić logi serwera oraz zgodność liczby wpisów w obu systemach.

## Później — opcjonalna synchronizacja zwrotna

- [ ] **APP-09. Dodać webhooki MailerLite**
  - Obsłużyć `subscriber.unsubscribed`, `subscriber.active`, `subscriber.bounced` i `subscriber.updated`.
  - Weryfikować podpis HMAC webhooka.
  - Aktualizować lokalny status zgody lub status kontaktu.
  - Odpowiadać szybko kodem 2xx i przenosić cięższe operacje poza żądanie webhooka.
