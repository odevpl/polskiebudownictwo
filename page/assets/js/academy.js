const settings = document.querySelector('[data-account-settings]');
const courseList = document.querySelector('[data-course-list]');
const catalogSection = document.querySelector('[data-catalog-section]');
const catalogList = document.querySelector('[data-catalog-list]');
const completeLessonButton = document.querySelector('[data-lesson-complete]');
const exportAccountButton = document.querySelector('[data-account-export]');
const deleteAccountButton = document.querySelector('[data-account-delete]');
const checkoutForm = document.querySelector('[data-checkout-form]');

checkoutForm?.querySelector('[data-checkout-submit]')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = checkoutForm.querySelector('[data-checkout-status]');
  button.disabled = true;
  if (status) status.textContent = 'Tworzenie zamówienia…';
  try {
    const response = await fetch('/api/academy/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ courseSlug: checkoutForm.dataset.courseSlug }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message);
    window.location.href = result.checkoutUrl;
  } catch (error) {
    if (status) { status.textContent = error.message || 'Nie udało się rozpocząć płatności.'; status.classList.add('form-status--error'); }
    button.disabled = false;
  }
});

function privacyStatus(message, isError = false) {
  const status = document.querySelector('[data-privacy-status]');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('form-status--error', isError);
}

exportAccountButton?.addEventListener('click', async () => {
  exportAccountButton.disabled = true;
  privacyStatus('Przygotowywanie eksportu…');
  try {
    const response = await fetch('/api/auth/account/export', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) throw new Error('Nie udało się przygotować eksportu danych.');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'polskiebudownictwo-dane.json';
    link.click();
    URL.revokeObjectURL(url);
    privacyStatus('Eksport danych został pobrany.');
  } catch (error) {
    privacyStatus(error.message, true);
  } finally { exportAccountButton.disabled = false; }
});

deleteAccountButton?.addEventListener('click', async () => {
  const password = window.prompt('Podaj aktualne hasło:');
  if (password === null) return;
  const confirmation = window.prompt('Aby potwierdzić, wpisz: USUŃ KONTO');
  if (confirmation === null) return;
  deleteAccountButton.disabled = true;
  privacyStatus('Usuwanie i anonimizowanie konta…');
  try {
    const response = await fetch('/api/auth/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ password, confirmation }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message);
    window.location.href = '/';
  } catch (error) {
    privacyStatus(error.message || 'Nie udało się usunąć konta.', true);
    deleteAccountButton.disabled = false;
  }
});

if (completeLessonButton) {
  completeLessonButton.addEventListener('click', async () => {
    const status = document.querySelector('[data-lesson-status]');
    completeLessonButton.disabled = true;
    if (status) status.textContent = 'Zapisywanie…';
    try {
      const response = await fetch(`/api/academy/lessons/${completeLessonButton.dataset.lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      completeLessonButton.textContent = 'Lekcja ukończona';
      if (status) status.textContent = 'Postęp został zapisany.';
    } catch (error) {
      completeLessonButton.disabled = false;
      if (status) {
        status.textContent = error.message || 'Nie udało się zapisać postępu.';
        status.classList.add('form-status--error');
      }
    }
  });
}

if (courseList) {
  const state = courseList.querySelector('[data-course-state]');

  function formatPrice(course) {
    return `${Number(course.price_amount).toFixed(2).replace('.', ',')} ${course.currency || 'PLN'}`;
  }

  function courseCard(course, catalogMode = false) {
    const card = document.createElement('article');
    card.className = 'course-card';
    card.innerHTML = `
      <p class="course-card__tag"></p>
      <h3></h3>
      <p class="course-card__description"></p>
      <ul class="course-card__meta" aria-label="Informacje o kursie"><li></li><li></li></ul>
      <a class="course-card__link" href="#">Zobacz kurs <span aria-hidden="true">→</span></a>`;
    card.querySelector('.course-card__tag').textContent = course.category || 'Kurs Akademii';
    card.querySelector('h3').textContent = course.title;
    card.querySelector('.course-card__description').textContent = course.description;
    card.querySelector('.course-card__meta li:first-child').textContent = course.level || 'Poziom podstawowy';
    card.querySelector('.course-card__meta li:last-child').textContent = `${course.lesson_count || 0} lekcji`;
    const link = card.querySelector('.course-card__link');
    const hasAccess = Number(course.has_access) === 1;
    const isFree = Number(course.is_free) === 1;
    if (catalogMode && !hasAccess && !isFree) {
      link.textContent = `Kup szkolenie · ${formatPrice(course)} `;
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      link.append(arrow);
      link.href = `/akademia/kup/${encodeURIComponent(course.slug)}`;
    } else {
      link.textContent = hasAccess ? 'Rozpocznij szkolenie ' : 'Rozpocznij bezpłatnie ';
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      link.append(arrow);
      link.href = `/akademia/kurs/${encodeURIComponent(course.slug)}`;
    }
    return card;
  }

  async function loadCourses() {
    try {
      const response = await fetch('/api/academy/courses', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      courseList.replaceChildren();
      if (!result.courses.length) {
        const empty = document.createElement('p');
        empty.className = 'academy-courses__state';
        empty.textContent = 'Nie masz jeszcze dostępu do żadnego kursu.';
        courseList.append(empty);
        return;
      }
      result.courses.forEach(course => courseList.append(courseCard(course)));
      if (catalogList && catalogSection) {
        const catalogResponse = await fetch('/api/academy/catalog', { headers: { Accept: 'application/json' }, cache: 'no-store' });
        if (catalogResponse.ok) {
          const catalogResult = await catalogResponse.json();
          const otherCourses = catalogResult.courses.filter(course => !course.has_access);
          if (otherCourses.length) {
            catalogSection.hidden = false;
            otherCourses.forEach(course => catalogList.append(courseCard(course, true)));
          }
        }
      }
    } catch (error) {
      if (state) state.textContent = error.message || 'Nie udało się pobrać kursów.';
    }
  }

  loadCourses();
}

if (settings) {
  const accountStatus = settings.querySelector('[data-account-status]');
  const orderHistory = settings.querySelector('[data-order-history-list]');
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

  async function loadOrders() {
    if (!orderHistory) return;
    try {
      const response = await fetch('/api/auth/account/orders', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      orderHistory.replaceChildren();
      if (!result.orders.length) { const empty = document.createElement('p'); empty.textContent = 'Nie masz jeszcze żadnych zamówień.'; orderHistory.append(empty); return; }
      const labels = { pending: 'Oczekuje na płatność', paid: 'Opłacone', cancelled: 'Anulowane', refunded: 'Zwrócone' };
      result.orders.forEach(order => {
        const row = document.createElement('article'); row.className = 'academy-order-history__row';
        const title = document.createElement('h3'); title.textContent = order.item_titles || 'Szkolenie';
        const meta = document.createElement('p'); meta.textContent = `${order.order_number} · ${new Date(order.created_at).toLocaleDateString('pl-PL')}`;
        const status = document.createElement('strong'); status.textContent = labels[order.status] || order.status;
        const amount = document.createElement('span'); amount.textContent = `${Number(order.total_amount).toFixed(2)} ${order.currency}`;
        row.append(title, meta, status, amount); orderHistory.append(row);
      });
    } catch (error) { orderHistory.textContent = error.message || 'Nie udało się pobrać historii zamówień.'; }
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
  loadOrders();
}
