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

module.exports = {
  allowedRoles,
  mediationCaseValidation,
  mediatorApplicationValidation,
  submitValidation,
};
