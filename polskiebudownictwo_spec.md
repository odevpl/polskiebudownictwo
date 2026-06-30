# Specyfikacja Techniczna — polskiebudownictwo.org
> Wersja: 1.0 | Stack: Node.js + Express + EJS + MariaDB + Nodemailer | Hosting: MyDevil.net / Phusion Passenger

---

## 1. PRD — Opis Produktu

### 1.1 Cel produktu
Przepisanie statycznej strony polskiebudownictwo.org na aplikację Express.js z dynamicznym formularzem zgłoszeniowym, bazą danych uczestników i panelem admina do zarządzania zgłoszeniami.

### 1.2 Użytkownicy

| Rola | Opis |
|---|---|
| **Gość** | Odwiedza stronę, wypełnia formularz zgłoszeniowy |
| **Admin** | Przegląda i edytuje zgłoszenia w panelu |
| **Superadmin** | Pełen dostęp + zarządzanie kontami adminów |

### 1.3 User Stories

**Gość:**
- Jako gość chcę wypełnić formularz zgłoszeniowy, żeby dołączyć do społeczności
- Jako gość chcę otrzymać mail powitalny po zapisaniu się
- Jako gość chcę móc wybrać więcej niż jedną rolę w branży

**Admin:**
- Jako admin chcę widzieć tabelę wszystkich zgłoszeń
- Jako admin chcę filtrować/szukać po nazwisku, mailu, roli
- Jako admin chcę edytować dane zgłoszenia
- Jako admin chcę otrzymywać mail o każdym nowym zgłoszeniu

**Superadmin:**
- Jako superadmin chcę tworzyć konta dla innych adminów
- Jako superadmin chcę dezaktywować konta adminów
- Jako superadmin chcę mieć dostęp do wszystkiego co admin

### 1.4 Zakres v1 (MVP)
- ✅ Strona publiczna (przepisana z HTML na EJS 1:1)
- ✅ Formularz zgłoszeniowy → zapis do bazy
- ✅ Powiadomienia mailowe (gość + admin) przez Nodemailer
- ✅ Panel admina `/admin` — tabela zgłoszeń + edycja
- ✅ System kont adminów (superadmin tworzy adminów)
- ✅ Logowanie/wylogowanie do panelu

### 1.5 Poza zakresem v1
- ❌ Kursy/bootcampy
- ❌ Czat społecznościowy
- ❌ Eksport CSV
- ❌ Dashboard ze statystykami
- ❌ Płatności/subskrypcje

---

## 2. Specyfikacja Techniczna

### 2.1 Stack

| Warstwa | Technologia |
|---|---|
| Runtime | Node.js 22+ |
| Framework | Express.js 4.x |
| Templating | EJS |
| Baza danych | MariaDB (MySQL) |
| ORM/Query builder | mysql2 (raw queries) |
| Maile | Nodemailer |
| Sesje | express-session + connect-session-knex lub session store w MySQL |
| Hasła | bcrypt |
| Walidacja | express-validator |
| Środowisko | dotenv |
| Deployment | Phusion Passenger na MyDevil.net |

### 2.2 Design systemu — "White Spotify"

**Paleta kolorów:**
```
--color-bg:          #FFFFFF
--color-surface:     #F7F7F7
--color-border:      #E8E8E8
--color-text:        #121212
--color-text-muted:  #6A6A6A
--color-accent:      #EE242A   /* brand red */
--color-accent-hover:#C91E24
--color-sidebar-bg:  #FAFAFA
```

**Typografia:**
```
Font: Inter (Google Fonts)
--font-display: 700, 2rem+
--font-body: 400, 0.875rem
--font-label: 500, 0.75rem, letter-spacing: 0.05em
```

**Layout panelu admina:**
- Sidebar stały po lewej (240px), logo + nawigacja
- Topbar z avatarem admina i przyciskiem logout
- Content area — biała, z subtelnymi kartami
- Tabela z hover `background: #F7F7F7`, zaokrąglone rogi
- Brak nadmiarowych dekoracji — przestrzeń mówi sama za siebie

### 2.3 Bezpieczeństwo
- Hasła hashowane bcrypt (saltRounds: 12)
- Sesje HTTP-only cookie
- CSRF protection (csurf middleware)
- Helmet.js (security headers)
- Rate limiting na `/admin/login` (max 10 prób / 15 min)
- Walidacja i sanityzacja wszystkich inputów
- Honeypot pole w formularzu publicznym (antyspam)

### 2.4 Maile — szablony

**Mail do gościa (powitalny):**
- Temat: `Witamy w społeczności Polskiego Budownictwa!`
- Treść: podziękowanie za zapis, info co dalej

**Mail do admina (notyfikacja):**
- Temat: `Nowe zgłoszenie — [Imię Nazwisko]`
- Treść: pełne dane zgłoszenia (wszystkie pola)

---

## 3. Schemat Bazy Danych

```sql
-- Zgłoszenia z formularza publicznego
CREATE TABLE submissions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150) NOT NULL,
  company_name    VARCHAR(200),
  email           VARCHAR(254) NOT NULL,
  phone           VARCHAR(20),
  roles           JSON NOT NULL,           -- ["Wykonawca", "Podwykonawca"]
  company_size    ENUM(
                    '1-2',
                    '3-10',
                    '11-50',
                    '51-250',
                    '250+'
                  ),
  consent_data    TINYINT(1) NOT NULL DEFAULT 0,
  consent_marketing TINYINT(1) NOT NULL DEFAULT 0,
  ip_address      VARCHAR(45),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notes           TEXT,                    -- notatki admina
  status          ENUM('new','contacted','member') DEFAULT 'new',
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Konta adminów
CREATE TABLE admins (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(254) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(150) NOT NULL,
  role            ENUM('admin','superadmin') NOT NULL DEFAULT 'admin',
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at   TIMESTAMP NULL,
  created_by      INT UNSIGNED,            -- FK do admins.id
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sesje (express-session store)
CREATE TABLE sessions (
  session_id      VARCHAR(128) NOT NULL PRIMARY KEY,
  expires         INT UNSIGNED NOT NULL,
  data            TEXT,
  INDEX idx_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4. Endpointy API

### 4.1 Publiczne (strona)

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/` | Strona główna (EJS) |
| POST | `/api/submit` | Obsługa formularza zgłoszeniowego |

**POST `/api/submit`**
```
Body (form-data lub JSON):
  full_name        string, required, max 150
  company_name     string, optional, max 200
  email            string, required, email format
  phone            string, optional
  roles            array of strings, required, min 1
  company_size     string, optional, enum
  consent_data     boolean, required, must be true
  consent_marketing boolean, optional
  honeypot         string, must be empty (bot trap)

Response 200: { success: true, message: "Dziękujemy za zgłoszenie!" }
Response 400: { success: false, errors: [...] }
Response 429: { success: false, message: "Zbyt wiele zgłoszeń" }
```

### 4.2 Panel admina (chronione sesją)

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/admin/login` | Strona logowania |
| POST | `/admin/login` | Obsługa logowania |
| POST | `/admin/logout` | Wylogowanie |
| GET | `/admin` | Redirect → `/admin/submissions` |
| GET | `/admin/submissions` | Lista zgłoszeń (tabela) |
| GET | `/admin/submissions/:id` | Szczegół zgłoszenia |
| GET | `/admin/submissions/:id/edit` | Formularz edycji |
| POST | `/admin/submissions/:id/edit` | Zapis edycji |
| GET | `/admin/accounts` | Lista kont adminów (tylko superadmin) |
| GET | `/admin/accounts/new` | Formularz nowego admina (tylko superadmin) |
| POST | `/admin/accounts/new` | Zapis nowego admina (tylko superadmin) |
| POST | `/admin/accounts/:id/toggle` | Aktywacja/deaktywacja konta (tylko superadmin) |

### 4.3 Query params dla listy zgłoszeń

```
GET /admin/submissions
  ?search=   string (szuka w full_name, email, company_name)
  ?status=   new|contacted|member
  ?role=     string (filtr po roli)
  ?page=     int (domyślnie 1)
  ?limit=    int (domyślnie 25)
```

---

## 5. Struktura Projektu

```
polskiebudownictwo/
├── app.js                          # Entry point, Express setup
├── passenger_wsgi.py               # Phusion Passenger adapter (jeśli potrzebny)
├── .env                            # Zmienne środowiskowe (NIE commitować)
├── .env.example                    # Szablon .env
├── .gitignore
├── package.json
│
├── config/
│   ├── database.js                 # Połączenie z MariaDB (mysql2 pool)
│   ├── mailer.js                   # Konfiguracja Nodemailer transporter
│   └── session.js                  # Konfiguracja express-session
│
├── middleware/
│   ├── auth.js                     # requireAuth, requireSuperadmin
│   ├── rateLimiter.js              # Rate limiting dla /admin/login i /api/submit
│   └── validate.js                 # express-validator chains
│
├── routes/
│   ├── public.js                   # GET / + POST /api/submit
│   └── admin/
│       ├── index.js                # Router admina, łączy subroutes
│       ├── auth.js                 # GET/POST /admin/login, POST /admin/logout
│       ├── submissions.js          # CRUD zgłoszeń
│       └── accounts.js            # Zarządzanie kontami adminów
│
├── controllers/
│   ├── public/
│   │   └── submitController.js    # Logika zapisu zgłoszenia + wysyłka maili
│   └── admin/
│       ├── authController.js      # Logika logowania/wylogowania
│       ├── submissionsController.js
│       └── accountsController.js
│
├── models/
│   ├── Submission.js              # Queries dla tabeli submissions
│   └── Admin.js                   # Queries dla tabeli admins
│
├── services/
│   └── mailService.js             # Funkcje sendWelcomeMail(), sendAdminNotification()
│
├── views/
│   ├── layouts/
│   │   ├── public.ejs             # Layout strony publicznej (header/footer)
│   │   └── admin.ejs              # Layout panelu (sidebar + topbar)
│   ├── public/
│   │   └── index.ejs              # Strona główna (przepisany HTML)
│   ├── admin/
│   │   ├── login.ejs
│   │   ├── submissions/
│   │   │   ├── index.ejs          # Tabela zgłoszeń
│   │   │   ├── show.ejs           # Szczegół zgłoszenia
│   │   │   └── edit.ejs           # Formularz edycji
│   │   └── accounts/
│   │       ├── index.ejs          # Lista adminów
│   │       └── new.ejs            # Formularz nowego admina
│   └── partials/
│       ├── sidebar.ejs
│       ├── topbar.ejs
│       ├── flash.ejs              # Flash messages (success/error)
│       └── pagination.ejs
│
├── public/
│   ├── assets/
│   │   ├── images/                # Logo, hero image (skopiowane z obecnej strony)
│   │   └── documents/             # PDFs (polityka prywatności etc.)
│   ├── css/
│   │   ├── main.css               # Style strony publicznej
│   │   └── admin.css              # Style panelu admina (White Spotify)
│   └── js/
│       ├── form.js                # Obsługa multi-select checkboxów + submit AJAX
│       └── admin.js               # Drobne interakcje w panelu
│
├── scripts/
│   ├── migrate.js                 # Uruchamia SQL schema (jednorazowo)
│   └── createSuperadmin.js        # CLI do stworzenia pierwszego superadmina
│
└── sql/
    └── schema.sql                 # Pełny schemat bazy danych
```

---

## 6. Zmienne Środowiskowe (.env)

```env
# App
NODE_ENV=production
PORT=3000
SESSION_SECRET=your_very_long_random_secret_here

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=polskiebudownictwo
DB_USER=db_user
DB_PASSWORD=db_password

# Mail (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kontakt@polskiebudownictwo.org
SMTP_PASS=mail_password
MAIL_FROM="Polskie Budownictwo <kontakt@polskiebudownictwo.org>"
ADMIN_NOTIFY_EMAIL=patryk@odev.pl
```

---

## 7. Taski Implementacyjne

### Faza 1 — Setup projektu
- [ ] **T01** `npm init` + instalacja dependencies (`express`, `ejs`, `mysql2`, `nodemailer`, `bcrypt`, `express-session`, `express-validator`, `helmet`, `express-rate-limit`, `connect-flash`, `dotenv`, `csurf`)
- [ ] **T02** Stworzenie struktury folderów zgodnie ze specyfikacją
- [ ] **T03** Konfiguracja `app.js` (middleware stack: helmet, session, flash, csrf, static files)
- [ ] **T04** Konfiguracja `config/database.js` — pool połączeń mysql2
- [ ] **T05** Stworzenie `sql/schema.sql` + skryptu `scripts/migrate.js`
- [ ] **T06** Uruchomienie migracji, weryfikacja tabel w bazie

### Faza 2 — Strona publiczna
- [ ] **T07** Stworzenie `views/layouts/public.ejs` — layout z head, meta, fonts (Inter)
- [ ] **T08** Przepisanie `index.html` → `views/public/index.ejs` (1:1, sekcje bez zmian)
- [ ] **T09** Skopiowanie wszystkich assets (images, PDFs, CSS) do `public/`
- [ ] **T10** Route `GET /` serwujący stronę główną
- [ ] **T11** Podmiana formularza zgłoszeniowego na wersję EJS z CSRF tokenem
- [ ] **T12** `public/js/form.js` — obsługa multi-select checkboxów, walidacja front-end, AJAX submit
- [ ] **T13** Controller `submitController.js` — walidacja back-end (express-validator)
- [ ] **T14** Model `Submission.js` — funkcja `create(data)`
- [ ] **T15** Zapis zgłoszenia do bazy (INSERT)
- [ ] **T16** `services/mailService.js` — funkcja `sendWelcomeMail(submission)`
- [ ] **T17** `services/mailService.js` — funkcja `sendAdminNotification(submission)`
- [ ] **T18** Integracja maili w submitController
- [ ] **T19** Obsługa honeypot (pole ukryte, bot odrzucany cicho)
- [ ] **T20** Rate limiting na `/api/submit`
- [ ] **T21** Test end-to-end: formularz → baza → oba maile

### Faza 3 — Autentykacja panelu
- [ ] **T22** Model `Admin.js` — `findByEmail()`, `create()`, `toggleActive()`
- [ ] **T23** Skrypt `scripts/createSuperadmin.js` — CLI do pierwszego konta
- [ ] **T24** Widok `views/admin/login.ejs` — formularz logowania (White Spotify style)
- [ ] **T25** Controller `authController.js` — logowanie (bcrypt.compare, sesja)
- [ ] **T26** Controller `authController.js` — wylogowanie (destroy session)
- [ ] **T27** Middleware `auth.js` — `requireAuth`, `requireSuperadmin`
- [ ] **T28** Rate limiting na `POST /admin/login` (10 prób / 15 min)
- [ ] **T29** Test: logowanie poprawne, błędne hasło, blokada po przekroczeniu limitu

### Faza 4 — Panel admina (zgłoszenia)
- [ ] **T30** Layout `views/layouts/admin.ejs` + partials: `sidebar.ejs`, `topbar.ejs`, `flash.ejs`, `pagination.ejs`
- [ ] **T31** `public/css/admin.css` — White Spotify design system (CSS variables, sidebar, topbar, tabela)
- [ ] **T32** Model `Submission.js` — `findAll(filters, pagination)`, `findById()`, `update()`
- [ ] **T33** Widok `submissions/index.ejs` — tabela z kolumnami: imię, firma, email, role, status, data, akcje
- [ ] **T34** Controller `submissionsController.js` — lista z filtrowaniem i paginacją
- [ ] **T35** Widok `submissions/show.ejs` — szczegół zgłoszenia
- [ ] **T36** Widok `submissions/edit.ejs` — formularz edycji wszystkich pól
- [ ] **T37** Controller — zapis edycji (PUT/POST + redirect z flash)
- [ ] **T38** Test: filtrowanie, paginacja, edycja, flash messages

### Faza 5 — Panel admina (konta)
- [ ] **T39** Widok `accounts/index.ejs` — tabela adminów (email, rola, status, ostatnie logowanie)
- [ ] **T40** Widok `accounts/new.ejs` — formularz nowego admina
- [ ] **T41** Controller `accountsController.js` — tworzenie konta (hash hasła, zapis)
- [ ] **T42** Controller — toggle aktywacji konta
- [ ] **T43** Middleware `requireSuperadmin` na wszystkich `/admin/accounts` routach
- [ ] **T44** Test: tworzenie admina, logowanie jako admin, brak dostępu do /accounts

### Faza 6 — Deployment
- [ ] **T45** Konfiguracja Phusion Passenger na MyDevil.net (plik `passenger_wsgi.py` lub `.htaccess`)
- [ ] **T46** Upload projektu (bez `node_modules`, bez `.env`)
- [ ] **T47** `npm install --production` na serwerze
- [ ] **T48** Stworzenie `.env` na serwerze z produkcyjnymi danymi
- [ ] **T49** Uruchomienie `scripts/migrate.js` na serwerze
- [ ] **T50** Uruchomienie `scripts/createSuperadmin.js` — pierwsze konto
- [ ] **T51** Test produkcyjny: formularz → baza → maile → panel admina
- [ ] **T52** Weryfikacja HTTPS, security headers (Helmet)

---

## 8. Zależności (package.json)

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "connect-flash": "^0.1.1",
    "csurf": "^1.11.0",
    "dotenv": "^16.4.5",
    "ejs": "^3.1.10",
    "express": "^4.19.2",
    "express-rate-limit": "^7.3.1",
    "express-session": "^1.18.0",
    "express-validator": "^7.1.0",
    "helmet": "^7.1.0",
    "mysql2": "^3.10.1",
    "nodemailer": "^6.9.14",
    "express-mysql-session": "^3.0.0"
  }
}
```

---

## 9. Notatki dla Codex

- Każdy task jest niezależny i może być implementowany sekwencyjnie
- Nie używać ORM (Sequelize/Prisma) — raw queries przez mysql2
- Wszystkie widoki EJS dziedziczą layout przez `<%- include('../layouts/admin') %>`
- Flash messages przez `connect-flash` — zawsze sprawdzaj w layoucie
- CSRF token musi być w każdym formularzu POST: `<input type="hidden" name="_csrf" value="<%= csrfToken %>">`
- Pole `roles` w bazie to JSON array — przy wyświetlaniu `JSON.parse()`
- Paginacja: domyślnie 25 rekordów na stronę, LIMIT/OFFSET w SQL
- Superadmin nie może dezaktywować własnego konta
- Pierwszy superadmin tworzony wyłącznie przez CLI script (nie przez panel)
