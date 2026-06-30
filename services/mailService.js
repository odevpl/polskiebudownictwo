const { createTransporter } = require('../config/mailer');

const manifestUrl = 'https://polskiebudownictwo.org/assets/documents/legal/manifestMSP.pdf';
const logoUrl = 'https://polskiebudownictwo.org/assets/images/logo.png';

function requireMailConfig() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'ADMIN_NOTIFY_EMAIL'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing mail configuration: ${missing.join(', ')}`);
  }
}

function welcomeText() {
  return [
    'Dziekujemy, ze dolaczasz do spolecznosci Polskie Budownictwo.',
    '',
    'Rusza inicjatywa, ktora laczy wykonawcow, podwykonawcow, dostawcow, architektow i inzynierow wokol jednego celu: bezpieczniejszego, uczciwszego rynku.',
    '',
    'Przeczytaj Manifest Polskiego Budownictwa:',
    manifestUrl,
    '',
    'Dziekujemy, ze budujesz te inicjatywe razem z nami.',
  ].join('\n');
}

function welcomeHtml() {
  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;background:#f4f4f4;font-family:Arial,sans-serif;color:#202020">
    <div style="max-width:640px;margin:auto;background:#fff;padding:32px">
      <p style="margin:0 0 28px">
        <a href="https://polskiebudownictwo.org/">
          <img src="${logoUrl}" width="220" alt="Polskie Budownictwo" style="display:block;width:220px;max-width:100%;height:auto;border:0">
        </a>
      </p>
      <h1>Dziekujemy, ze dolaczasz do Polskiego Budownictwa.</h1>
      <p>Rusza inicjatywa, ktora laczy wykonawcow, podwykonawcow, dostawcow, architektow i inzynierow wokol jednego celu: bezpieczniejszego, uczciwszego rynku.</p>
      <p>Manifest Polskiego Budownictwa wyznacza kierunek wspolnego dzialania.</p>
      <p><a href="${manifestUrl}" style="display:inline-block;padding:15px 20px;background:#ee2329;color:#fff;text-decoration:none;font-weight:bold">Przeczytaj Manifest Polskiego Budownictwa</a></p>
      <p>Dziekujemy, ze budujesz te inicjatywe razem z nami.</p>
    </div>
  </body>
</html>`;
}

function adminText(submission) {
  return [
    'Nowe zgloszenie z formularza polskiebudownictwo.org',
    '',
    `Imie i nazwisko: ${submission.fullName}`,
    `Firma: ${submission.companyName}`,
    `E-mail: ${submission.email}`,
    `Telefon: ${submission.phone || 'Nie podano'}`,
    `Role: ${submission.roles.join(', ')}`,
    `Wielkosc firmy: ${submission.companySize || 'Nie podano'}`,
    `IP: ${submission.ipAddress || 'Nieznane'}`,
  ].join('\n');
}

async function sendWelcomeMail(submission) {
  requireMailConfig();
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: submission.email,
    subject: 'Dolaczasz do inicjatywy Polskie Budownictwo. Przeczytaj manifest',
    text: welcomeText(),
    html: welcomeHtml(),
  });
}

async function sendAdminNotification(submission) {
  requireMailConfig();
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: `Nowe zgloszenie - ${submission.fullName}`,
    text: adminText(submission),
  });
}

async function sendSubmissionEmails(submission) {
  await sendAdminNotification(submission);
  await sendWelcomeMail(submission);
}

module.exports = {
  sendAdminNotification,
  sendSubmissionEmails,
  sendWelcomeMail,
};
