require('dotenv').config({ quiet: true });

const { createTransporter } = require('../config/mailer');

async function testSmtp() {
  const recipient = process.argv[2] || process.env.ADMIN_NOTIFY_EMAIL;
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
  const missing = required.filter(name => !process.env[name]);

  if (!recipient) {
    missing.push('ADMIN_NOTIFY_EMAIL albo adres jako argument');
  }

  if (missing.length) {
    throw new Error(`Brak konfiguracji SMTP: ${missing.join(', ')}`);
  }

  const transporter = createTransporter();
  await transporter.verify();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: recipient,
    subject: 'Test SMTP - Polskie Budownictwo',
    text: 'Testowa wiadomosc SMTP z aplikacji Polskie Budownictwo.',
  });

  console.log(`SMTP OK. Wiadomosc testowa wyslana na ${recipient}.`);
}

testSmtp().catch(error => {
  console.error('SMTP test failed:', error);
  process.exitCode = 1;
});
