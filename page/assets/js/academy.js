const settings = document.querySelector('[data-account-settings]');
const courseList = document.querySelector('[data-course-list]');
const completeLessonButton = document.querySelector('[data-lesson-complete]');

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

  function courseCard(course) {
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
    card.querySelector('.course-card__link').href = `/akademia/kurs/${encodeURIComponent(course.slug)}`;
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
    } catch (error) {
      if (state) state.textContent = error.message || 'Nie udało się pobrać kursów.';
    }
  }

  loadCourses();
}

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
