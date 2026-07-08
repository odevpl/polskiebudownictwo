const { validationResult } = require('express-validator');
const { sendMediatorApplicationEmails } = require('../../services/mailService');

function hasMailConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM);
}

async function submitApplication(request, response) {
  if (request.body.website) {
    response.json({ success: true, message: 'Zgłoszenie zostało przyjęte.' });
    return;
  }

  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    response.status(422).json({
      success: false,
      message: errors.array()[0]?.msg || 'Uzupełnij wszystkie wymagane pola.',
      errors: errors.array(),
    });
    return;
  }

  const submission = {
    ...request.body,
    ipAddress: request.ip,
    submittedAt: new Date().toISOString(),
  };

  try {
    if (!hasMailConfig()) {
      console.log('[test] Zgłoszenie mediatora zaakceptowane bez wysyłki e-maila.', submission);
      response.json({
        success: true,
        message: 'Zgłoszenie zostało wysłane w trybie testowym.',
      });
      return;
    }

    await sendMediatorApplicationEmails(submission);
    response.json({
      success: true,
      message: 'Dziękujemy. Zgłoszenie zostało wysłane.',
    });
  } catch (error) {
    console.error('Mediator application submit error:', error);
    response.status(500).json({
      success: false,
      message: 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie później.',
    });
  }
}

module.exports = {
  submitApplication,
};
