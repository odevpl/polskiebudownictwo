const { body } = require('express-validator');

const allowedRoles = [
  'Generalny wykonawca',
  'Wykonawca',
  'Podwykonawca',
  'Dostawca materiałów',
  'Producent materiałów',
  'Inżynier, projektant lub architekt',
  'Usługodawca dla budownictwa',
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
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Podaj imie i nazwisko.')
    .bail()
    .isLength({ max: 150 })
    .withMessage('Imie i nazwisko jest zbyt dlugie.'),
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

module.exports = {
  allowedRoles,
  submitValidation,
};
