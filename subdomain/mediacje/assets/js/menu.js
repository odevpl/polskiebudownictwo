const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.site-menu-toggle');
const siteNav = document.getElementById('site-nav');
const dropdowns = [...document.querySelectorAll('.site-nav__dropdown')];

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
  trigger?.addEventListener('click', () => {
    const open = !dropdown.classList.contains('is-open');
    closeDropdowns(dropdown);
    setDropdownOpen(dropdown, open);
  });

  trigger?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setDropdownOpen(dropdown, true);
      dropdown.querySelector('.site-nav__dropdown-menu a')?.focus();
    }
    if (event.key === 'Escape') setDropdownOpen(dropdown, false);
  });
});

siteNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    closeDropdowns();
    setMenuOpen(false);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeDropdowns();
    setMenuOpen(false);
  }
});
