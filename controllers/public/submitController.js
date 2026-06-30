const { validationResult } = require('express-validator');
const Submission = require('../../models/Submission');
const { sendSubmissionEmails } = require('../../services/mailService');

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function normalizeCompanySize(value) {
  const text = String(value || '').trim();
  if (text.startsWith('1')) return '1-2';
  if (text.startsWith('3')) return '3-10';
  if (text.startsWith('11')) return '11-50';
  if (text.startsWith('51')) return '51-250';
  if (text.includes('250')) return '250+';
  return null;
}

function submissionFromRequest(request) {
  return {
    fullName: request.body.name.trim(),
    companyName: request.body.company.trim(),
    email: request.body.email.trim(),
    phone: (request.body.phone || '').trim(),
    roles: normalizeArray(request.body['role[]'] || request.body.roles || request.body.role),
    companySize: normalizeCompanySize(request.body['company-size']),
    consentData: Boolean(request.body['consent-service']),
    consentMarketing: Boolean(request.body['consent-marketing']),
    ipAddress: request.ip,
  };
}

function hasDatabaseConfig() {
  return Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);
}

async function store(request, response) {
  if (request.body.website) {
    response.json({ success: true, message: 'Zgloszenie zostalo przyjete.' });
    return;
  }

  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    response.status(422).json({
      success: false,
      message: errors.array()[0]?.msg || 'Uzupelnij wszystkie wymagane pola.',
      errors: errors.array(),
    });
    return;
  }

  try {
    const submissionData = submissionFromRequest(request);

    if (!hasDatabaseConfig()) {
      console.log('[test] Zgloszenie API zaakceptowane bez zapisu do bazy i wysylki e-maila.');
      response.json({
        success: true,
        message: 'Zgloszenie zostalo wyslane w trybie testowym.',
      });
      return;
    }

    const submission = await Submission.create(submissionData);
    await sendSubmissionEmails(submission);

    response.json({
      success: true,
      message: 'Dziekujemy za dolaczenie. Wiadomosc z manifestem zostala wyslana na podany adres e-mail.',
    });
  } catch (error) {
    console.error('Submit error:', error);
    response.status(500).json({
      success: false,
      message: 'Nie udalo sie wyslac zgloszenia. Sprobuj ponownie pozniej.',
    });
  }
}

module.exports = {
  store,
};
