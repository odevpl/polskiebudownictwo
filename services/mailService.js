const { createTransporter } = require('../config/mailer');
const path = require('path');

const manifestUrl = 'https://polskiebudownictwo.org/assets/documents/legal/manifestMSP.pdf';
const logoCid = 'polskie-budownictwo-logo';
const logoPath = path.join(__dirname, '..', 'page', 'assets', 'images', 'logo.png');

function requireMailConfig() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing mail configuration: ${missing.join(', ')}`);
  }
}

function welcomeText() {
  return [
    'Dziękujemy, że dołączasz do społeczności Polskie Budownictwo.',
    '',
    'Rusza inicjatywa, która łączy wykonawców, podwykonawców, dostawców, architektów i inżynierów wokół jednego celu: bezpieczniejszego, uczciwszego rynku.',
    '',
    'Przeczytaj Manifest Polskiego Budownictwa:',
    manifestUrl,
    '',
    'Dziękujemy, że budujesz tę inicjatywę razem z nami.',
  ].join('\n');
}

function welcomeHtml() {
  return `<!doctype html>
<html lang="pl">
  <body style="margin:0;background:#f4f4f4;font-family:Arial,sans-serif;color:#202020">
    <div style="max-width:640px;margin:auto;background:#fff;padding:32px">
      <p style="margin:0 0 28px">
        <a href="https://polskiebudownictwo.org/">
          <img src="cid:${logoCid}" width="220" alt="Polskie Budownictwo" style="display:block;width:220px;max-width:100%;height:auto;border:0">
        </a>
      </p>
      <h1>Dziękujemy, że dołączasz do Polskiego Budownictwa.</h1>
      <p>Rusza inicjatywa, która łączy wykonawców, podwykonawców, dostawców, architektów i inżynierów wokół jednego celu: bezpieczniejszego, uczciwszego rynku.</p>
      <p>Manifest Polskiego Budownictwa wyznacza kierunek wspólnego działania.</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0;border-collapse:collapse">
        <tr>
          <td bgcolor="#ee2329" style="background:#ee2329">
            <a href="${manifestUrl}" style="display:inline-block;padding:15px 20px;background:#ee2329;color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;line-height:20px;text-decoration:none">Przeczytaj Manifest Polskiego Budownictwa</a>
          </td>
        </tr>
      </table>
      <p>Dziękujemy, że budujesz tę inicjatywę razem z nami.</p>
    </div>
  </body>
</html>`;
}

function adminText(submission) {
  return [
    'Nowe zgłoszenie z formularza polskiebudownictwo.org',
    '',
    `Imię i nazwisko: ${submission.fullName}`,
    `Firma: ${submission.companyName}`,
    `E-mail: ${submission.email}`,
    `Telefon: ${submission.phone || 'Nie podano'}`,
    `Role: ${submission.roles.join(', ')}`,
    `Wielkość firmy: ${submission.companySize || 'Nie podano'}`,
    `IP: ${submission.ipAddress || 'Nieznane'}`,
  ].join('\n');
}

async function sendWelcomeMail(submission) {
  requireMailConfig();
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: submission.email,
    subject: 'Dołączasz do inicjatywy Polskie Budownictwo. Przeczytaj manifest',
    text: welcomeText(),
    html: welcomeHtml(),
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: logoCid,
      },
    ],
  });
}

async function sendAdminNotification(submission) {
  requireMailConfig();
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: `Nowe zgłoszenie - ${submission.fullName}`,
    text: adminText(submission),
  });
}

async function sendSubmissionEmails(submission) {
  // await sendAdminNotification(submission);
  await sendWelcomeMail(submission);
}

module.exports = {
  sendAdminNotification,
  sendSubmissionEmails,
  sendWelcomeMail,
};
