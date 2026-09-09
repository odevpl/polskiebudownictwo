const form = document.querySelector('[data-auth-form]');
const status = document.querySelector('[data-auth-status]');
const token = new URLSearchParams(location.search).get('token');

if (form) {
  if (form.action.endsWith('/api/auth/register')) {
    const startedAt = form.querySelector('[name="formStartedAt"]');
    if (startedAt) startedAt.value = String(Date.now());
    const captchaContainer = form.querySelector('[data-recaptcha]');
    fetch('/api/auth/registration-settings', { headers: { Accept: 'application/json' } })
      .then(response => response.json())
      .then(settings => {
        if (!settings.recaptcha?.enabled || !settings.recaptcha.siteKey || !captchaContainer) return;
        captchaContainer.setAttribute('aria-label', 'Weryfikacja antyspamowa');
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          const renderCaptcha = () => {
            if (typeof window.grecaptcha?.render !== 'function') {
              if (status) {
                status.textContent = 'Nieprawidłowa konfiguracja reCAPTCHA. Użyj klucza reCAPTCHA v2 Checkbox.';
                status.classList.add('form-status--error');
              }
              return;
            }
            window.grecaptcha.render(captchaContainer, { sitekey: settings.recaptcha.siteKey });
          };
          if (typeof window.grecaptcha?.ready === 'function') window.grecaptcha.ready(renderCaptcha);
          else renderCaptcha();
        };
        document.head.appendChild(script);
      })
      .catch(() => {});
  }
  if (form.dataset.tokenRequired === 'true' && !token) {
    status.textContent = 'Brakuje tokenu w linku.';
    status.classList.add('form-status--error');
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form));
      if (token) data.token = token;
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      status.textContent = result.message;
      if (result.redirect) location.assign(result.redirect);
    } catch (error) {
      status.textContent = error.message || 'Wystąpił błąd. Spróbuj ponownie.';
      status.classList.add('form-status--error');
    } finally { button.disabled = false; }
  });
}

const verification = document.querySelector('[data-email-verification]');
if (verification && token) {
  fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ token }) })
    .then(response => response.json().then(result => ({ response, result })))
    .then(({ response, result }) => { status.textContent = result.message; if (!response.ok) status.classList.add('form-status--error'); })
    .catch(() => { status.textContent = 'Nie udało się potwierdzić adresu e-mail.'; status.classList.add('form-status--error'); });
}
