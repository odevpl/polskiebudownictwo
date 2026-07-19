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

async function sendAccountEmail(to, subject, heading, message, link, linkLabel) {
  requireMailConfig();
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text: `${message}\n\n${link}`,
    html: `<p>${message}</p><p><a href="${link}">${linkLabel}</a></p><p>Jeśli nie inicjowano tej operacji, zignoruj tę wiadomość.</p>`,
  });
}

function sendAccountVerificationEmail(to, link) {
  return sendAccountEmail(to, 'Potwierdź adres e-mail', 'Potwierdź adres e-mail', 'Dziękujemy za rejestrację. Potwierdź swój adres e-mail.', link, 'Potwierdź adres e-mail');
}

function sendPasswordResetEmail(to, link) {
  return sendAccountEmail(to, 'Reset hasła', 'Reset hasła', 'Otrzymaliśmy prośbę o zmianę hasła. Link jest ważny przez godzinę.', link, 'Ustaw nowe hasło');
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
    `Imię: ${submission.firstName}`,
    `Nazwisko: ${submission.lastName}`,
    `Firma: ${submission.companyName}`,
    `E-mail: ${submission.email}`,
    `Telefon: ${submission.phone || 'Nie podano'}`,
    `Role: ${submission.roles.join(', ')}`,
    `Wielkość firmy: ${submission.companySize || 'Nie podano'}`,
    `IP: ${submission.ipAddress || 'Nieznane'}`,
  ].join('\n');
}

function firstContactEmail(submission) {
  for (const party of submission.parties || []) {
    if (party.attorney?.email) return party.attorney.email;
    if (party.email) return party.email;
  }
  return null;
}

function mediationCaseAdminText(submission) {
  const lines = [
    submission.needsAdvice
      ? 'Nowe zgłoszenie mediacyjne - potrzebna porada w sprawie uzyskania zgody'
      : 'Nowe zgłoszenie mediacyjne',
    '',
    `Data: ${submission.submittedAt || 'Nieznana'}`,
    `IP: ${submission.ipAddress || 'Nieznane'}`,
    `Zgoda na mediację od wszystkich stron: ${submission.mediationConsent}`,
    `Zgoda pozostałych stron: ${submission.otherPartiesConsent}`,
    `Etap sporu: ${submission.disputeStage}`,
    `Wartość przedmiotu sporu: ${submission.disputeValue ? `${submission.disputeValue} PLN` : 'Nie podano'}`,
    '',
    'Opis sporu:',
    submission.description,
    '',
    'Strony:',
  ];

  (submission.parties || []).forEach((party, index) => {
    lines.push('');
    lines.push(`${index + 1}. ${party.name}`);
    lines.push(`Reprezentant: ${party.representative || 'Nie podano'}`);
    lines.push(`E-mail: ${party.email || 'Nie podano'}`);
    lines.push(`Telefon: ${party.phone || 'Nie podano'}`);
    lines.push(`WWW: ${party.website || 'Nie podano'}`);
    lines.push(`NIP: ${party.nip || 'Nie podano'}`);
    if (party.hasAttorney) {
      lines.push('Pełnomocnik: tak');
      lines.push(`Imię i nazwisko: ${party.attorney?.name || 'Nie podano'}`);
      lines.push(`Kancelaria: ${party.attorney?.lawFirm || 'Nie podano'}`);
      lines.push(`E-mail pełnomocnika: ${party.attorney?.email || 'Nie podano'}`);
      lines.push(`Telefon pełnomocnika: ${party.attorney?.phone || 'Nie podano'}`);
      lines.push(`Działający w imieniu: ${party.attorney?.actingFor || 'Nie podano'}`);
      lines.push(`Pełnomocnictwo obejmuje mediację: ${party.attorney?.hasPowerOfAttorney ? 'tak' : 'nie'}`);
    }
  });

  return lines.join('\n');
}

function mediationCaseConfirmationText() {
  return [
    'Dziękujemy za przesłanie zgłoszenia do Centrum Mediacji przy Fundacji „Polskie Budownictwo”.',
    '',
    'Otrzymaliśmy formularz i przeanalizujemy przekazane informacje. Jeśli będą potrzebne dodatkowe dane, skontaktujemy się w kolejnym kroku.',
    '',
    'Centrum Mediacji',
    'Fundacja „Polskie Budownictwo”',
  ].join('\n');
}

function mediatorApplicationAdminText(submission) {
  return [
    'Nowe zgłoszenie mediatora',
    '',
    `Data: ${submission.submittedAt || 'Nieznana'}`,
    `IP: ${submission.ipAddress || 'Nieznane'}`,
    `Imię, nazwisko: ${submission.fullName}`,
    `E-mail: ${submission.email}`,
    `Telefon: ${submission.phone}`,
    `Doświadczenie: ${submission.experienceYears}`,
    `Uprawnienia do mediacji sądowych/gospodarczych: ${submission.hasCertification}`,
    `Numer uprawnień: ${submission.certificationNumber || 'Nie podano'}`,
    `Placówka wydająca certyfikat: ${submission.certificationIssuer || 'Nie podano'}`,
    `Branże doświadczenia: ${(submission.industries || []).join(', ') || 'Nie podano'}`,
    `Inna branża: ${submission.industryOther || 'Nie podano'}`,
  ].join('\n');
}

function mediatorApplicationConfirmationText() {
  return [
    'Dziękujemy za przesłanie zgłoszenia do Centrum Mediacji przy Fundacji „Polskie Budownictwo”.',
    '',
    'Otrzymaliśmy Twoje zgłoszenie. Skontaktujemy się z Tobą w kolejnym kroku.',
    '',
    'Centrum Mediacji',
    'Fundacja „Polskie Budownictwo”',
  ].join('\n');
}

async function sendMediatorApplicationEmails(submission) {
  requireMailConfig();
  const transporter = createTransporter();
  const recipient = process.env.MEDIATION_NOTIFY_EMAIL || 'mediacje@polskiebudownictwo.org';

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: recipient,
    subject: `[ZGŁOSZENIE MEDIATORA] ${submission.fullName}`,
    text: mediatorApplicationAdminText(submission),
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: submission.email,
    subject: 'Potwierdzenie zgłoszenia do Centrum Mediacji',
    text: mediatorApplicationConfirmationText(),
  });
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
  const fullName = [submission.firstName, submission.lastName].filter(Boolean).join(' ');
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: `Nowe zgłoszenie - ${fullName}`,
    text: adminText(submission),
  });
}

async function sendSubmissionEmails(submission) {
  // await sendAdminNotification(submission);
  await sendWelcomeMail(submission);
}

async function sendMediationCaseEmails(submission) {
  requireMailConfig();
  const transporter = createTransporter();
  const recipient = process.env.MEDIATION_NOTIFY_EMAIL || 'mediacje@polskiebudownictwo.org';
  const subjectPrefix = submission.needsAdvice ? '[POTRZEBNA PORADA]' : '[ZGŁOSZENIE MEDIACJI]';

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: recipient,
    subject: `${subjectPrefix} ${submission.parties?.[0]?.name || 'Nowa sprawa'}`,
    text: mediationCaseAdminText(submission),
  });

  const contactEmail = firstContactEmail(submission);
  if (contactEmail) {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: contactEmail,
      subject: 'Potwierdzenie zgłoszenia sprawy do mediacji',
      text: mediationCaseConfirmationText(),
    });
  }
}

module.exports = {
  sendAdminNotification,
  sendMediationCaseEmails,
  sendMediatorApplicationEmails,
  sendSubmissionEmails,
  sendWelcomeMail,
  sendAccountVerificationEmail,
  sendPasswordResetEmail,
};
