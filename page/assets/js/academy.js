fetch('/api/auth/session', { headers: { Accept: 'application/json' }, cache: 'no-store' })
  .then(response => response.json())
  .then(session => {
    if (!session.authenticated || !session.user?.email) return;
    document.querySelectorAll('[data-user-email]').forEach(element => { element.value = session.user.email; });
  });
