# RODO — zakres techniczny i projekt informacji

Ten dokument opisuje implementację techniczną. Nie zastępuje zatwierdzonej przez administratora danych informacji prawnej ani konsultacji z prawnikiem/IOD.

## Cele i podstawy przetwarzania

| Cel | Dane | Proponowana podstawa |
| --- | --- | --- |
| Obsługa konta i Akademii | e-mail, hasło, profil, postęp, dostępy | wykonanie umowy |
| Obsługa zakupu kursu | użytkownik, kurs, cena, dane rozliczeniowe | wykonanie umowy |
| Rozliczenia i dokumentacja księgowa | zamówienie, snapshot faktury, płatność | obowiązek prawny |
| Bezpieczeństwo i przeciwdziałanie nadużyciom | sesja, IP zgłoszeń, logi techniczne | prawnie uzasadniony interes |
| Kontakt i obsługa zgłoszeń | dane ze zgłoszenia, e-mail | zgoda lub prawnie uzasadniony interes — do zatwierdzenia |
| Marketing | e-mail i zgoda marketingowa | zgoda |

## Retencja — wartości do zatwierdzenia

- token weryfikacyjny: zgodnie z TTL zapisanym w kodzie — 24 godziny,
- token resetu hasła: 60 minut,
- konto Akademii: do usunięcia przez użytkownika albo dezaktywacji zgodnie z polityką,
- postęp i dostęp: przez okres korzystania z kursu oraz przez czas niezbędny do obsługi reklamacji,
- zamówienia i faktury: przez okres wymagany przepisami rachunkowymi/podatkowymi — dokładny okres wymaga potwierdzenia księgowego,
- zgłoszenia i marketing: okres określony w polityce retencji organizacji — do uzupełnienia,
- kopie zapasowe: zgodnie z cyklem backupów; usunięcie z backupu może nastąpić przy jego rotacji.

## Realizacja praw użytkownika

- eksport: `GET /api/auth/account/export`, JSON obejmuje konto, profil, dane fakturowe, dostępy, postęp, zamówienia i zgłoszenia powiązane z e-mailem,
- usunięcie: `DELETE /api/auth/account` po potwierdzeniu hasła i wpisaniu `USUŃ KONTO`,
- anonimizacja usuwa dane profilu, dane kontaktowe, dane rozliczeniowe konta i dane zgłoszeń,
- opłacone zamówienia oraz dokumenty wymagane do rozliczeń pozostają w zakresie wymaganym prawem; zamówienia nieopłacone, anulowane i zwrócone są anonimizowane,
- po usunięciu konto jest dezaktywowane, sesja niszczona, tokeny usuwane, a dostęp do Akademii wygaszony przez nieaktywne konto.

## Odbiorcy i procesorzy

Przed publikacją polityki należy uzupełnić rzeczywistą listę dostawców: hosting/baza danych, SMTP, Przelewy24, narzędzia marketingowe i dostawców analityki, wraz z informacją o transferach poza EOG, jeśli występują.

## Do zatwierdzenia organizacyjnego

- pełne dane administratora danych i adres kontaktowy,
- kontakt do IOD, jeśli został wyznaczony,
- dokładne okresy retencji,
- zasady realizacji żądań i weryfikacji tożsamości,
- lista procesorów i umów powierzenia,
- aktualizacja publicznej polityki prywatności oraz polityki cookies.
