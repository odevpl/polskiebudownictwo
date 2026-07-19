const form = document.querySelector('[data-auth-form]');
const status = document.querySelector('[data-auth-status]');
const token = new URLSearchParams(location.search).get('token');

if (form) {
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
