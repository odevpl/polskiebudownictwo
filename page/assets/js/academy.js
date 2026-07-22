const settings = document.querySelector('[data-account-settings]');

if (settings) {
  const accountStatus = settings.querySelector('[data-account-status]');
  const billingType = settings.querySelector('[name="billingType"]');

  function setStatus(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle('form-status--error', isError);
  }

  function setFormValues(form, values) {
    Object.entries(values).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (field) field.value = value || '';
    });
  }

  function toggleBillingFields() {
    const isCompany = billingType?.value === 'company';
    settings.querySelectorAll('[data-company-only]').forEach(element => {
      element.hidden = !isCompany;
    });
  }

  async function loadAccount() {
    try {
      const response = await fetch('/api/auth/account', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);

      const { account } = result;
      settings.querySelector('[data-account-email]').value = account.email;
      const emailNeedsVerification = !account.emailVerified;
      accountStatus.hidden = !emailNeedsVerification;
      setStatus(accountStatus, emailNeedsVerification ? 'Adres e-mail wymaga potwierdzenia.' : '', emailNeedsVerification);
      setFormValues(settings.querySelector('[data-profile-form]'), account.profile);
      setFormValues(settings.querySelector('[data-billing-form]'), account.billing);
      toggleBillingFields();
    } catch (error) {
      setStatus(accountStatus, error.message || 'Nie udało się pobrać danych konta.', true);
    }
  }

  async function submitForm(form) {
    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    setStatus(status, 'Zapisywanie…');

    try {
      const response = await fetch(form.action, {
        method: form.dataset.method || form.method || 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      setStatus(status, result.message);
      if (form.matches('[data-password-form]')) form.reset();
    } catch (error) {
      setStatus(status, error.message || 'Nie udało się zapisać zmian.', true);
    } finally {
      button.disabled = false;
    }
  }

  settings.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitForm(form);
    });
  });

  billingType?.addEventListener('change', toggleBillingFields);
  toggleBillingFields();
  loadAccount();
}
