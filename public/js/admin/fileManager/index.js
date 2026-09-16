export function createFileManager(root, initialFiles, options) {
  const cardsRoot = root.querySelector('[data-file-cards]');
  const input = root.querySelector('[data-file-input]');
  const message = root.querySelector('[data-file-message]');
  const entries = [];
  let disposed = false;
  const say = text => { message.textContent = text; };
  input.accept = options.accept;
  root.querySelector('[data-file-limits]').textContent = `${options.accept.replaceAll('.', '').toUpperCase()} · do ${formatBytes(options.maxBytes)} na plik · do ${options.lessonFiles} plików w całej lekcji. Zmiany w materiałach zatwierdza przycisk „Zapisz lekcję”.`;

  function render() {
    cardsRoot.replaceChildren();
    entries.forEach((entry, index) => {
      const card = document.createElement('div'); card.className = 'file-manager__card';
      const badge = document.createElement('span'); badge.className = 'file-manager__type';
      badge.textContent = (entry.file?.name || entry.source?.name || '').split('.').pop().toUpperCase().slice(0, 8);
      card.append(badge);
      const label = document.createElement('label'); label.textContent = 'Nazwa materiału';
      const name = document.createElement('input'); name.className = 'adm-control'; name.maxLength = 180;
      name.value = entry.name; name.disabled = entry.state !== 'ready';
      name.addEventListener('input', () => { entry.name = name.value; options.onChange(); }); label.append(name); card.append(label);
      const detail = document.createElement('p'); detail.className = 'muted';
      detail.textContent = `${formatBytes(entry.file?.size || entry.source?.size || 0)} · ${entry.state === 'ready' ? 'Gotowy' : entry.error || 'Przesyłanie i weryfikacja…'}`;
      card.append(detail);
      if (entry.state === 'uploading') {
        const progress = document.createElement('progress'); progress.max = 100; progress.value = entry.progress || 0; progress.setAttribute('aria-label', `Postęp przesyłania: ${entry.name}`); card.append(progress);
      }
      const actions = document.createElement('div'); actions.className = 'file-manager__actions';
      function button(text, action, disabled = false) { const button = document.createElement('button'); button.type = 'button'; button.className = 'button button--ghost button--compact'; button.textContent = text; button.disabled = disabled; button.addEventListener('click', action); actions.append(button); return button; }
      button('Wcześniej', () => { [entries[index - 1], entries[index]] = [entries[index], entries[index - 1]]; render(); options.onChange(); actionsFocus(index - 1); }, index === 0);
      button('Później', () => { [entries[index + 1], entries[index]] = [entries[index], entries[index + 1]]; render(); options.onChange(); actionsFocus(index + 1); }, index === entries.length - 1);
      if (entry.file?.url && entry.state === 'ready') { const link = document.createElement('a'); link.href = entry.file.url; link.textContent = 'Pobierz'; link.className = 'button button--ghost button--compact'; actions.append(link); }
      if (entry.state === 'error' && entry.source) button('Ponów', () => start(entry));
      button(entry.state === 'uploading' ? 'Anuluj' : 'Usuń', () => {
        entry.removed = true; entry.xhr?.abort(); entries.splice(index, 1); render(); options.onChange(); say('Plik usunięty z sekcji.');
        root.querySelector('[data-file-add]').focus();
        // Saved files are detached only on lesson save. Temporary uploads can be discarded now.
        if (entry.file?.temporary) fetch(`${options.uploadUrl}/${entry.file.id}`, { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
      });
      card.append(actions); cardsRoot.append(card);
    });
  }
  function actionsFocus(index) { cardsRoot.children[index]?.querySelector('button:not(:disabled)')?.focus(); }
  function start(entry) {
    if (disposed || entry.removed) return;
    entry.state = 'uploading'; entry.error = ''; entry.progress = 0; render(); options.onChange();
    const xhr = new XMLHttpRequest(); entry.xhr = xhr;
    xhr.open('POST', options.uploadUrl); xhr.responseType = 'json'; xhr.timeout = 210000;
    xhr.upload.onprogress = event => { if (event.lengthComputable) { entry.progress = Math.round(event.loaded / event.total * 100); const index = entries.indexOf(entry); const progress = cardsRoot.children[index]?.querySelector('progress'); if (progress) progress.value = entry.progress; } };
    const failed = text => { if (entry.removed || disposed) return; entry.state = 'error'; entry.error = text; render(); say(text); options.onChange(); };
    xhr.onerror = () => failed('Błąd połączenia. Możesz ponowić upload.');
    xhr.ontimeout = () => failed('Przekroczono czas przesyłania.');
    xhr.onabort = () => failed('Upload anulowany.');
    xhr.onload = () => {
      if (disposed || entry.removed) return;
      if (xhr.status !== 201 || !xhr.response?.file) return failed(xhr.response?.message || 'Nie udało się dodać pliku.');
      entry.file = xhr.response.file; entry.state = 'ready'; render(); say(`Dodano plik: ${entry.name}.`); options.onChange();
    };
    const body = new FormData(); body.append('file', entry.source); xhr.send(body);
  }
  root.querySelector('[data-file-add]').addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    const source = input.files[0]; input.value = ''; if (!source) return;
    if (!source.size || source.size > options.maxBytes) return say('Plik jest pusty lub przekracza limit rozmiaru.');
    if (options.totalCount() >= options.lessonFiles) return say(`Lekcja może zawierać maksymalnie ${options.lessonFiles} plików.`);
    const entry = { source, name: source.name, state: 'uploading' }; entries.push(entry); start(entry);
  });
  initialFiles.forEach(file => entries.push({ file, name: file.name, state: file.unavailable ? 'error' : 'ready', error: file.unavailable ? 'Plik niedostępny. Usuń go i prześlij ponownie.' : '' })); render();
  return {
    count: () => entries.length,
    valid: () => entries.every(entry => entry.state === 'ready' && entry.name.trim()),
    serialize: () => entries.filter(entry => entry.file).map(entry => ({ id: entry.file.id, name: entry.name.trim() })),
    dispose: () => { disposed = true; entries.forEach(entry => entry.xhr?.abort()); },
  };
}
function formatBytes(bytes) { return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`; }
