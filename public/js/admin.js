document.addEventListener('click', event => {
  const openButton = event.target.closest('[data-modal-open]');
  if (openButton) {
    const modal = document.getElementById(openButton.dataset.modalOpen);
    if (modal) {
      modal.hidden = false;
      modal.querySelector('button, input, select, textarea, a')?.focus();
    }
    return;
  }

  const closeButton = event.target.closest('[data-modal-close]');
  if (closeButton) {
    closeButton.closest('.adm-modal')?.setAttribute('hidden', '');
    return;
  }

  if (event.target.classList.contains('adm-modal')) {
    event.target.setAttribute('hidden', '');
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  document.querySelectorAll('.adm-modal:not([hidden])').forEach(modal => {
    modal.setAttribute('hidden', '');
  });
});

function formatTimePart(value) {
  return String(value).padStart(2, '0');
}

function parseTimeValue(value) {
  const [rawHour = '0', rawMinute = '0'] = String(value || '').split(':');
  return {
    hour: Math.min(21, Math.max(6, Number(rawHour) || 6)),
    minute: Math.min(59, Math.max(0, Number(rawMinute) || 0)),
  };
}

function initTimePicker(picker) {
  const input = picker.querySelector('.time-picker-value');
  const display = picker.querySelector('[data-time-picker-display]');
  const popover = picker.querySelector('[data-time-picker-popover]');
  const toggle = picker.querySelector('[data-time-picker-toggle]');
  let { hour, minute } = parseTimeValue(input.value);

  function render() {
    const value = `${formatTimePart(hour)}:${formatTimePart(minute)}`;
    input.value = value;
    display.textContent = value;
    picker.querySelector('.hour-value').textContent = formatTimePart(hour);
    picker.querySelector('.minute-value').textContent = formatTimePart(minute);
    picker.querySelectorAll('[data-time-grid] button').forEach(button => {
      const selected = button.dataset.value === formatTimePart(button.dataset.time === 'hours' ? hour : minute);
      button.classList.toggle('active', selected);
    });
  }

  function setView(view) {
    picker.querySelector('[data-time-picker-counter]').hidden = view !== 'counter';
    picker.querySelectorAll('[data-time-grid]').forEach(grid => {
      grid.hidden = grid.dataset.timeGrid !== view;
    });
  }

  function buildGrid(type, values) {
    const grid = picker.querySelector(`[data-time-grid="${type}"]`);
    values.forEach(value => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.value = formatTimePart(value);
      button.dataset.time = type;
      button.textContent = formatTimePart(value);
      button.addEventListener('click', () => {
        if (type === 'hours') {
          hour = value;
          popover.hidden = true;
          toggle.setAttribute('aria-expanded', 'false');
          setView('counter');
        } else {
          minute = value;
          popover.hidden = true;
          toggle.setAttribute('aria-expanded', 'false');
          setView('counter');
        }
        render();
      });
      grid.append(button);
    });
  }

  buildGrid('hours', Array.from({ length: 16 }, (_, index) => index + 6));
  buildGrid('minutes', Array.from({ length: 12 }, (_, index) => index * 5));
  render();

  toggle.addEventListener('click', () => {
    popover.hidden = !popover.hidden;
    toggle.setAttribute('aria-expanded', String(!popover.hidden));
    setView('counter');
  });

  picker.addEventListener('click', event => {
    const stepButton = event.target.closest('[data-time-step]');
    if (!stepButton) return;
    const delta = Number(stepButton.dataset.step);
    if (stepButton.dataset.timeStep === 'hour') {
      hour = ((hour - 6 + delta) % 16 + 16) % 16 + 6;
    }
    if (stepButton.dataset.timeStep === 'minute') minute = (minute + delta + 60) % 60;
    render();
  });

  picker.querySelectorAll('[data-time-view]').forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.timeView));
  });
}

document.querySelectorAll('[data-time-picker]').forEach(initTimePicker);

document.querySelectorAll('[data-date-picker]').forEach(input => {
  input.addEventListener('click', () => {
    if (typeof input.showPicker === 'function') input.showPicker();
  });
});

document.querySelectorAll('[data-upcoming-toggle]').forEach(toggle => {
  const fields = document.querySelectorAll('[data-event-schedule-field]');

  function updateScheduleFields() {
    fields.forEach(field => {
      field.hidden = toggle.checked;
      field.querySelectorAll('input').forEach(input => {
        input.required = !toggle.checked;
      });
    });
  }

  toggle.addEventListener('change', updateScheduleFields);
  updateScheduleFields();
});
