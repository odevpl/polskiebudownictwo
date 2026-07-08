const form = document.getElementById('mediator-form');
const formBody = document.getElementById('mediator-form-body');
const certificationFields = document.getElementById('certification-fields');
const industryOtherCheckbox = document.getElementById('industry-other');
const industryOtherField = document.getElementById('industry-other-field');
const status = document.getElementById('mediator-form-status');
const formStarted = document.getElementById('mediator-form-started');
const submitButton = form?.querySelector('[type="submit"]');

function apiBaseUrl() {
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    return 'http://127.0.0.1:3000';
  }
  return 'https://polskiebudownictwo.org';
}

function ensureFormStarted() {
  if (formStarted && !formStarted.value) {
    formStarted.value = Math.floor(Date.now() / 1000);
  }
}

function selectedValue(name) {
  return form.querySelector(`[name="${name}"]:checked`)?.value || '';
}

function checkedValues(name) {
  return [...form.querySelectorAll(`[name="${name}"]:checked`)].map(input => input.value);
}

function payload() {
  return {
    website: form.website.value,
    formStarted: formStarted.value,
    fullName: form.fullName.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    experienceYears: selectedValue('experienceYears'),
    hasCertification: selectedValue('hasCertification'),
    certificationNumber: form.certificationNumber.value.trim(),
    certificationIssuer: form.certificationIssuer.value.trim(),
    industries: checkedValues('industries'),
    industryOther: form.industryOther.value.trim(),
    rodoConsent: form.rodoConsent.checked,
  };
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('form-status--error', isError);
}

ensureFormStarted();

form?.addEventListener('change', event => {
  if (event.target.name === 'wantsToJoin') {
    formBody.hidden = event.target.value !== 'tak';
  }

  if (event.target.name === 'hasCertification') {
    certificationFields.hidden = event.target.value !== 'tak';
  }

  if (event.target === industryOtherCheckbox) {
    industryOtherField.hidden = !industryOtherCheckbox.checked;
  }
});

form?.addEventListener('submit', async event => {
  event.preventDefault();
  ensureFormStarted();

  if (!form.reportValidity()) return;

  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Wysyłanie...';
  setStatus('');

  try {
    const response = await fetch(`${apiBaseUrl()}/api/mediacje/zostan-mediatorem`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload()),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Nie udało się wysłać formularza.');

    form.reset();
    formBody.hidden = true;
    certificationFields.hidden = true;
    industryOtherField.hidden = true;
    if (formStarted) formStarted.value = Math.floor(Date.now() / 1000);
    setStatus(result.message || 'Zgłoszenie zostało wysłane.');
  } catch (error) {
    setStatus(error.message || 'Nie udało się wysłać formularza. Spróbuj ponownie.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});
