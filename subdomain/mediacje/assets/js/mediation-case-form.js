const form = document.getElementById('mediation-case-form');
const formBody = document.getElementById('case-form-body');
const businessGateMessage = document.getElementById('business-gate-message');
const partiesList = document.getElementById('parties-list');
const partyTemplate = document.getElementById('party-template');
const addPartyButton = document.getElementById('add-party');
const description = document.getElementById('description');
const descriptionCount = document.getElementById('description-count');
const consentInfo = document.getElementById('consent-info');
const status = document.getElementById('case-form-status');
const formStarted = document.getElementById('case-form-started');
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

function updatePartyNumbers() {
  [...partiesList.querySelectorAll('.party-card')].forEach((card, index) => {
    card.querySelector('[data-party-number]').textContent = String(index + 1);
    const removeButton = card.querySelector('[data-remove-party]');
    removeButton.hidden = partiesList.children.length <= 2;
  });
}

function addParty() {
  const fragment = partyTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.party-card');
  const hasAttorney = card.querySelector('[data-field="hasAttorney"]');
  const attorneyFields = card.querySelector('.attorney-fields');
  const removeButton = card.querySelector('[data-remove-party]');

  hasAttorney.addEventListener('change', () => {
    attorneyFields.hidden = !hasAttorney.checked;
  });

  removeButton.addEventListener('click', () => {
    if (partiesList.children.length <= 2) return;
    card.remove();
    updatePartyNumbers();
  });

  partiesList.append(card);
  updatePartyNumbers();
}

function partyData(card) {
  const data = {};
  card.querySelectorAll('[data-field]').forEach(input => {
    if (input.type === 'checkbox') {
      data[input.dataset.field] = input.checked;
    } else {
      data[input.dataset.field] = input.value.trim();
    }
  });

  data.attorney = {};
  card.querySelectorAll('[data-attorney-field]').forEach(input => {
    if (input.type === 'checkbox') {
      data.attorney[input.dataset.attorneyField] = input.checked;
    } else {
      data.attorney[input.dataset.attorneyField] = input.value.trim();
    }
  });

  return data;
}

function selectedValue(name) {
  return form.querySelector(`[name="${name}"]:checked`)?.value || '';
}

function payload() {
  return {
    website: form.website.value,
    formStarted: formStarted.value,
    isBusinessCase: selectedValue('isBusinessCase'),
    mediationConsent: selectedValue('mediationConsent'),
    otherPartiesConsent: selectedValue('otherPartiesConsent'),
    disputeStage: selectedValue('disputeStage'),
    description: description.value.trim(),
    disputeValue: form.disputeValue.value,
    parties: [...partiesList.querySelectorAll('.party-card')].map(partyData),
  };
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('form-status--error', isError);
}

ensureFormStarted();
addParty();
addParty();

form?.addEventListener('change', event => {
  if (event.target.name === 'isBusinessCase') {
    const accepted = event.target.value === 'tak';
    formBody.hidden = !accepted;
    businessGateMessage.hidden = accepted;
  }

  if (event.target.name === 'otherPartiesConsent') {
    consentInfo.hidden = false;
    consentInfo.textContent = event.target.value === 'tak'
      ? 'Zgody mogą zostać przekazane później mailowo lub potwierdzone w dalszym kontakcie z Centrum.'
      : 'Oznaczymy zgłoszenie jako wymagające porady w sprawie mediacji i sposobu uzyskania zgody.';
  }
});

description?.addEventListener('input', () => {
  descriptionCount.textContent = String(description.value.length);
});

addPartyButton?.addEventListener('click', addParty);

form?.addEventListener('submit', async event => {
  event.preventDefault();
  ensureFormStarted();

  if (!form.reportValidity()) return;
  if (selectedValue('isBusinessCase') !== 'tak') {
    businessGateMessage.hidden = false;
    return;
  }

  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Wysyłanie...';
  setStatus('');

  try {
    const response = await fetch(`${apiBaseUrl()}/api/mediacje/zgloszenie`, {
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
    partiesList.innerHTML = '';
    addParty();
    addParty();
    formBody.hidden = true;
    businessGateMessage.hidden = true;
    consentInfo.hidden = true;
    descriptionCount.textContent = '0';
    if (formStarted) formStarted.value = Math.floor(Date.now() / 1000);
    setStatus(result.message || 'Zgłoszenie zostało wysłane.');
  } catch (error) {
    setStatus(error.message || 'Nie udało się wysłać formularza. Spróbuj ponownie.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});
