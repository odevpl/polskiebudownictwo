# Płatności Akademii

Operator płatności: Przelewy24. Faktury pozostają na późniejszy etap.

## Dostępne zmienne

- `PAYMENT_PROVIDER=przelewy24`,
- `P24_ENV=sandbox` albo `production`,
- `P24_MERCHANT_ID`,
- `P24_POS_ID` — opcjonalnie, domyślnie merchant ID,
- `P24_API_KEY`,
- `P24_CRC`.

Webhook P24 przyjmuje:

```text
POST /api/payments/webhook/przelewy24
```

P24 wysyła powiadomienie na `urlStatus`. System sprawdza podpis SHA-384, a następnie wywołuje `transaction/verify`. Dostęp jest nadawany dopiero po pozytywnej odpowiedzi P24.

Przykładowe body P24:

```json
{
  "merchantId": 123456,
  "posId": 123456,
  "sessionId": "PB-1234567890-AB12CD34",
  "amount": 1234,
  "originAmount": 1234,
  "currency": "PLN",
  "orderId": 987654,
  "methodId": 154,
  "statement": "PB-1234567890-AB12CD34",
  "sign": "..."
}
```

Zdarzenie jest zapisywane w `payment_events`, więc ponowienie tego samego webhooka nie nada dostępu drugi raz.

Przed produkcją trzeba przygotować adapter wybranego operatora, mapowanie jego statusów oraz ustalić system wystawiania faktur. Sekrety pozostają wyłącznie w konfiguracji serwera.
