const { body } = require('express-validator');

const allowedRoles = [
  'Generalny wykonawca',
  'Wykonawca',
  'Podwykonawca',
  'Dostawca materiałów',
  'Producent materiałów',
  'Inżynier, projektant lub architekt',
  'Usługodawca dla budownictwa',
  'Rzeczoznawca',
  'Prawnik',
  'Mediator',
  'Organizacja Branżowa',
  'Inna',
];

const submitValidation = [
  body('website').optional({ values: 'falsy' }).isEmpty(),
  body('form-started')
    .notEmpty()
    .withMessage('Brakuje czasu rozpoczecia formularza.')
    .bail()
    .custom(value => {
      const startedAt = Number(value);
      return Number.isFinite(startedAt) && Date.now() / 1000 - startedAt >= 3;
    })
    .withMessage('Formularz zostal wyslany zbyt szybko. Sprobuj ponownie.'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Podaj imie.')
    .bail()
    .isLength({ max: 80 })
    .withMessage('Imie jest zbyt dlugie.'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Podaj nazwisko.')
    .bail()
    .isLength({ max: 120 })
    .withMessage('Nazwisko jest zbyt dlugie.'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Podaj nazwe firmy.')
    .bail()
    .isLength({ max: 200 })
    .withMessage('Nazwa firmy jest zbyt dluga.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Podaj poprawny adres e-mail.')
    .bail()
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Adres e-mail jest zbyt dlugi.'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Numer telefonu jest zbyt dlugi.'),
  body('role')
    .custom((value, { req }) => {
      const rawRoles = value || req.body['role[]'] || req.body.roles;
      const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles].filter(Boolean);
      return roles.length > 0 && roles.every(role => allowedRoles.includes(role));
    })
    .withMessage('Wybierz co najmniej jedna poprawna role w branzy.'),
  body('company-size')
    .trim()
    .notEmpty()
    .withMessage('Wybierz wielkosc firmy.'),
  body('consent-service')
    .notEmpty()
    .withMessage('Zgoda na obsluge zgloszenia jest wymagana.'),
  body('consent-marketing')
    .notEmpty()
    .withMessage('Zgoda marketingowa jest wymagana.'),
];

const mediationCaseValidation = [
  body('website').optional({ values: 'falsy' }).isEmpty(),
  body('formStarted')
    .notEmpty()
    .withMessage('Brakuje czasu rozpoczecia formularza.')
    .bail()
    .custom(value => {
      const startedAt = Number(value);
      return Number.isFinite(startedAt) && Date.now() / 1000 - startedAt >= 3;
    })
    .withMessage('Formularz zostal wyslany zbyt szybko. Sprobuj ponownie.'),
  body('isBusinessCase')
    .equals('tak')
    .withMessage('Centrum przyjmuje w tej sciezce sprawy gospodarcze lub inwestycyjne.'),
  body('mediationConsent')
    .isIn(['tak', 'nie'])
    .withMessage('Wybierz informacje o zgodzie na mediacje.'),
  body('otherPartiesConsent')
    .isIn(['tak', 'potrzebuje_porady'])
    .withMessage('Wybierz informacje o zgodzie pozostalych stron.'),
  body('disputeStage')
    .trim()
    .notEmpty()
    .withMessage('Wybierz etap sporu.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Podaj krotki opis sporu.')
    .bail()
    .isLength({ max: 2000 })
    .withMessage('Opis sporu moze miec maksymalnie 2000 znakow.'),
  body('disputeValue')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Podaj poprawna wartosc przedmiotu sporu.'),
  body('parties')
    .isArray({ min: 2 })
    .withMessage('Podaj dane co najmniej dwoch stron sporu.'),
  body('parties.*.name')
    .trim()
    .notEmpty()
    .withMessage('Nazwa kazdej strony jest wymagana.')
    .bail()
    .isLength({ max: 200 })
    .withMessage('Nazwa strony jest zbyt dluga.'),
  body('parties.*.representative').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('parties.*.email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Podaj poprawny adres e-mail strony.'),
  body('parties.*.phone').optional({ values: 'falsy' }).trim().isLength({ max: 40 }),
  body('parties.*.website').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('parties.*.nip').optional({ values: 'falsy' }).trim().isLength({ max: 20 }),
  body('parties.*.attorney.name').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('parties.*.attorney.lawFirm').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('parties.*.attorney.email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Podaj poprawny adres e-mail pelnomocnika.'),
  body('parties.*.attorney.phone').optional({ values: 'falsy' }).trim().isLength({ max: 40 }),
  body('parties.*.attorney.actingFor').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
];

const mediatorApplicationValidation = [
  body('website').optional({ values: 'falsy' }).isEmpty(),
  body('formStarted')
    .notEmpty()
    .withMessage('Brakuje czasu rozpoczecia formularza.')
    .bail()
    .custom(value => {
      const startedAt = Number(value);
      return Number.isFinite(startedAt) && Date.now() / 1000 - startedAt >= 3;
    })
    .withMessage('Formularz zostal wyslany zbyt szybko. Sprobuj ponownie.'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Podaj imie i nazwisko.')
    .bail()
    .isLength({ max: 160 })
    .withMessage('Imie i nazwisko jest zbyt dlugie.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Podaj poprawny adres e-mail.')
    .bail()
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Adres e-mail jest zbyt dlugi.'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Podaj numer telefonu.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('Numer telefonu jest zbyt dlugi.'),
  body('experienceYears')
    .isIn(['zaczynam', '0-3 lata', 'powyżej 3 lat'])
    .withMessage('Wybierz ilosc lat doswiadczenia.'),
  body('hasCertification')
    .isIn(['tak', 'nie'])
    .withMessage('Wybierz informacje o uprawnieniach.'),
  body('certificationNumber').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  body('certificationIssuer').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('industries')
    .isArray({ min: 1 })
    .withMessage('Wybierz co najmniej jedna branze doswiadczenia.'),
  body('industries.*').trim().isLength({ max: 200 }),
  body('industryOther').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('rodoConsent')
    .custom(value => value === true)
    .withMessage('Akceptacja Polityki RODO jest wymagana.'),
];

const userEmailValidation = body('email').trim().isEmail().withMessage('Podaj poprawny adres e-mail.').bail().normalizeEmail().isLength({ max: 254 });
const userPasswordValidation = body('password').isLength({ min: 12, max: 128 }).withMessage('Hasło musi mieć od 12 do 128 znaków.');
const registrationValidation = [userEmailValidation, userPasswordValidation];
const loginValidation = [userEmailValidation, body('password').notEmpty().withMessage('Podaj hasło.')];
const resetValidation = [userEmailValidation];
const passwordChangeValidation = [body('token').trim().notEmpty().withMessage('Link jest nieprawidłowy.'), userPasswordValidation];

const accountProfileValidation = [
  body('firstName').optional({ values: 'falsy' }).trim().isLength({ max: 80 }).withMessage('Imię może mieć maksymalnie 80 znaków.'),
  body('lastName').optional({ values: 'falsy' }).trim().isLength({ max: 120 }).withMessage('Nazwisko może mieć maksymalnie 120 znaków.'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('Numer telefonu może mieć maksymalnie 30 znaków.'),
];

const accountBillingValidation = [
  body('billingType').isIn(['company', 'individual']).withMessage('Wybierz typ danych do faktury.'),
  body('companyName').optional({ values: 'falsy' }).trim().isLength({ max: 200 }).withMessage('Nazwa może mieć maksymalnie 200 znaków.'),
  body('nip').optional({ values: 'falsy' }).trim().custom(value => /^\d{10}$/.test(value.replace(/[-\s]/g, ''))).withMessage('NIP musi zawierać 10 cyfr.'),
  body('billingEmail').optional({ values: 'falsy' }).trim().isEmail().withMessage('Podaj poprawny e-mail do faktury.').isLength({ max: 254 }),
  body('street').optional({ values: 'falsy' }).trim().isLength({ max: 160 }).withMessage('Ulica może mieć maksymalnie 160 znaków.'),
  body('buildingNumber').optional({ values: 'falsy' }).trim().isLength({ max: 20 }).withMessage('Numer budynku jest zbyt długi.'),
  body('apartmentNumber').optional({ values: 'falsy' }).trim().isLength({ max: 20 }).withMessage('Numer lokalu jest zbyt długi.'),
  body('postalCode').optional({ values: 'falsy' }).trim().isLength({ max: 10 }).withMessage('Kod pocztowy jest zbyt długi.'),
  body('city').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('Miejscowość może mieć maksymalnie 100 znaków.'),
  body('country').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('Kraj jest zbyt długi.'),
];

const authenticatedPasswordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Podaj aktualne hasło.'),
  body('newPassword').isLength({ min: 12, max: 128 }).withMessage('Nowe hasło musi mieć od 12 do 128 znaków.'),
];

module.exports = {
  allowedRoles,
  mediationCaseValidation,
  mediatorApplicationValidation,
  submitValidation,
  registrationValidation,
  loginValidation,
  passwordChangeValidation,
  resetValidation,
  accountProfileValidation,
  accountBillingValidation,
  authenticatedPasswordChangeValidation,
};
