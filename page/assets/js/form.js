const form = document.getElementById('signup-form');
const status = document.getElementById('form-status');
const popup = document.getElementById('form-popup');
const closePopupButton = document.getElementById('form-popup-close');
const submitButton = form?.querySelector('[type="submit"]');
const formStarted = document.getElementById('form-started');
const rolePopup = document.getElementById('role-popup');
const roleTrigger = document.getElementById('role-trigger');
const roleSummary = document.getElementById('role-summary');
const roleValidation = document.getElementById('role-validation');
const roleCheckboxes = [...document.querySelectorAll('input[name="role[]"]')];
const roleAcceptButton = document.getElementById('role-popup-accept');
const roleCancelButton = document.getElementById('role-popup-cancel');
let previousRoles = [];

function ensureFormStarted() {
  if (formStarted && !formStarted.value) {
    formStarted.value = Math.floor(Date.now() / 1000);
  }
}

ensureFormStarted();

function closePopup() {
  popup.hidden = true;
  submitButton?.focus();
}

closePopupButton?.addEventListener('click', closePopup);
popup?.addEventListener('click', event => {
  if (event.target === popup) closePopup();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !popup?.hidden) closePopup();
  if (event.key === 'Escape' && !rolePopup?.hidden) cancelRoleSelection();
});

function updateRoleSummary() {
  const selected = roleCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
  roleValidation.value = selected.join(', ');
  roleSummary.textContent = selected.length ? selected.join(', ') : 'Wybierz role';
}

function closeRolePopup() {
  rolePopup.hidden = true;
  roleTrigger.focus();
}

function cancelRoleSelection() {
  roleCheckboxes.forEach(checkbox => { checkbox.checked = previousRoles.includes(checkbox.value); });
  updateRoleSummary();
  closeRolePopup();
}

roleTrigger?.addEventListener('click', () => {
  previousRoles = roleCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
  rolePopup.hidden = false;
  roleCheckboxes[0]?.focus();
});
roleCancelButton?.addEventListener('click', cancelRoleSelection);
roleAcceptButton?.addEventListener('click', () => {
  updateRoleSummary();
  if (!roleValidation.value) {
    roleValidation.reportValidity();
    return;
  }
  closeRolePopup();
});
rolePopup?.addEventListener('click', event => {
  if (event.target === rolePopup) cancelRoleSelection();
});

form?.addEventListener('submit', async event => {
  event.preventDefault();
  ensureFormStarted();
  if (!roleValidation.value) {
    rolePopup.hidden = false;
    roleCheckboxes[0]?.focus();
    return;
  }
  status.textContent = '';
  status.classList.remove('form-status--error');
  submitButton.disabled = true;
  const originalLabel = submitButton.textContent;
  submitButton.textContent = 'Wysyłanie...';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new URLSearchParams(new FormData(form)),
      headers: { Accept: 'application/json' },
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Nie udało się wysłać formularza.');
    form.reset();
    if (formStarted) formStarted.value = Math.floor(Date.now() / 1000);
    updateRoleSummary();
    popup.hidden = false;
    closePopupButton.focus();
  } catch (error) {
    status.textContent = error.message || 'Nie udało się wysłać formularza. Spróbuj ponownie.';
    status.classList.add('form-status--error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});
