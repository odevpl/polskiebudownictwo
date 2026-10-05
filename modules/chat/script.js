const socketScriptId = 'chat-socket-io-client';

async function loadSocketClient() {
  if (window.io) return window.io;
  await new Promise((resolve, reject) => {
    const current = document.getElementById(socketScriptId);
    if (current) {
      current.addEventListener('load', resolve, { once: true });
      current.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = socketScriptId;
    script.src = '/socket.io/socket.io.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  return window.io;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '' : new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function appendMessage(container, message) {
  if (container.querySelector(`[data-message-id="${message.id}"]`)) return;
  const item = document.createElement('article');
  item.className = 'chat-widget__message';
  item.dataset.messageId = message.id;
  const meta = document.createElement('div');
  meta.className = 'chat-widget__message-meta';
  const author = document.createElement('span');
  author.className = 'chat-widget__message-author';
  author.textContent = message.author_name;
  const time = document.createElement('time');
  time.dateTime = message.created_at;
  time.textContent = formatDate(message.created_at);
  meta.append(author, time);
  const body = document.createElement('p');
  body.className = 'chat-widget__message-body';
  body.textContent = message.body;
  item.append(meta, body);
  container.append(item);
  container.scrollTop = container.scrollHeight;
}

async function mount(widget) {
  const uuid = widget.dataset.chatUuid;
  const messages = widget.querySelector('[data-chat-messages]');
  const status = widget.querySelector('[data-chat-status]');
  const form = widget.querySelector('[data-chat-form]');
  const input = widget.querySelector('[data-chat-input]');
  const error = widget.querySelector('[data-chat-error]');
  try {
    const response = await fetch(`/api/chats/${encodeURIComponent(uuid)}/messages`, { credentials: 'same-origin' });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.message || 'Brak dostępu do czatu.');
    payload.messages.forEach(message => appendMessage(messages, message));
    const io = await loadSocketClient();
    const socket = io({ path: '/socket.io', withCredentials: true });
    socket.on('connect', () => socket.emit('chat:join', uuid, result => {
      if (!result?.ok) { status.textContent = 'Czat niedostępny'; error.textContent = result?.error || 'Brak dostępu do czatu.'; return; }
      status.textContent = 'Połączono';
    }));
    socket.on('disconnect', () => { status.textContent = 'Rozłączono'; });
    socket.on('connect_error', () => { status.textContent = 'Czat niedostępny'; });
    socket.on('chat:message', message => appendMessage(messages, message));
    form.addEventListener('submit', event => {
      event.preventDefault();
      error.textContent = '';
      const body = input.value.trim();
      if (!body) return;
      socket.emit('chat:send', { uuid, body }, result => {
        if (!result?.ok) { error.textContent = result?.error || 'Nie udało się wysłać wiadomości.'; return; }
        input.value = '';
      });
    });
  } catch (mountError) {
    status.textContent = 'Czat niedostępny';
    error.textContent = mountError.message || 'Nie udało się uruchomić czatu.';
    form.querySelector('button').disabled = true;
  }
}

document.querySelectorAll('[data-chat]').forEach(mount);
