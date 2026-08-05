const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.site-menu-toggle');
const siteNav = document.getElementById('site-nav');
const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
const isLocalHost = localHosts.has(window.location.hostname);
const menuVariants = {
  public: { mobileAccount: 'button' },
  academy: { mobileAccount: 'links' },
};
const menuVariant = document.body.dataset.menuVariant || (document.body.classList.contains('academy-page') ? 'academy' : 'public');
const menuConfig = menuVariants[menuVariant] || menuVariants.public;
const dropdowns = [...document.querySelectorAll('.site-nav__dropdown')];

if (siteNav) siteNav.dataset.mobileAccount = menuConfig.mobileAccount;

function setMenuOpen(open) {
  siteHeader?.classList.toggle('site-header--menu-open', open);
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
}

menuToggle?.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

function setDropdownOpen(dropdown, open) {
  dropdown.classList.toggle('is-open', open);
  dropdown.querySelector('.site-nav__dropdown-trigger')?.setAttribute('aria-expanded', String(open));
}

function closeDropdowns(except = null) {
  dropdowns.forEach(dropdown => {
    if (dropdown !== except) setDropdownOpen(dropdown, false);
  });
}

dropdowns.forEach(dropdown => {
  const trigger = dropdown.querySelector('.site-nav__dropdown-trigger');
  const links = [...dropdown.querySelectorAll('.site-nav__dropdown-menu a')];

  trigger?.addEventListener('click', () => {
    const open = !dropdown.classList.contains('is-open');
    closeDropdowns(dropdown);
    setDropdownOpen(dropdown, open);
  });

  trigger?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      closeDropdowns(dropdown);
      setDropdownOpen(dropdown, true);
      links[0]?.focus();
    }
  });

  links.forEach((link, index) => {
    link.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDropdownOpen(dropdown, false);
        trigger?.focus();
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        links[(index + 1) % links.length]?.focus();
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        links[(index - 1 + links.length) % links.length]?.focus();
      }
    });
  });
});

siteNav?.addEventListener('click', event => {
  if (event.target.closest('a')) setMenuOpen(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeDropdowns();
    setMenuOpen(false);
  }
});

document.addEventListener('click', event => {
  if (!event.target.closest('.site-nav__dropdown')) closeDropdowns();
});

async function updateAccountMenu() {
  const accountMenu = document.querySelector('[data-auth-menu]');
  if (!accountMenu) return;
  if (!isLocalHost) {
    accountMenu.hidden = true;
    return;
  }

  try {
    const response = await fetch('/api/auth/session', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const session = await response.json();
    if (!response.ok || !session.authenticated || !session.user?.email) return;

    const initial = session.user.email.slice(0, 1).toLocaleUpperCase('pl-PL');
    accountMenu.innerHTML = `<div class="user-menu"><button class="user-menu__trigger" type="button" aria-expanded="false" aria-label="Menu użytkownika">${initial}</button><div class="user-menu__popover"><p class="user-menu__email">${session.user.email}</p><a href="/akademia/ustawienia/">Ustawienia</a><a href="/akademia/">Strefa Akademii</a><button class="user-menu__logout" type="button">Wyloguj</button></div></div>`;
    const userMenu = accountMenu.querySelector('.user-menu');
    const userMenuTrigger = userMenu.querySelector('.user-menu__trigger');
    userMenuTrigger.addEventListener('click', () => {
      const open = userMenu.classList.toggle('is-open');
      userMenuTrigger.setAttribute('aria-expanded', String(open));
    });
    userMenu.querySelector('.user-menu__logout').addEventListener('click', async () => {
      const logoutResponse = await fetch('/api/auth/logout', { method: 'POST', headers: { Accept: 'application/json' } });
      if (logoutResponse.ok) window.location.assign('/');
    });
  } catch {
    // Publiczna nawigacja pozostaje dostępna, gdy sprawdzenie sesji się nie powiedzie.
  }
}

updateAccountMenu();
