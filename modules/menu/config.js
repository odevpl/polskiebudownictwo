const publicMenu = Object.freeze({
  type: 'public',
  groups: [
    {
      label: 'O nas',
      items: [
        { label: 'Misja', href: '/#misja' },
        { label: 'O fundacji', href: '/o_fundacji.html', currentPath: '/o_fundacji.html' },
        { label: 'Społeczność', href: '/#spolecznosc' },
      ],
    },
    {
      label: 'Działania',
      items: [
        { label: 'Obszary działania', href: '/#dzialania' },
        { label: 'Wydarzenia', href: '/wydarzenia', currentPath: '/wydarzenia' },
        { label: 'Postulaty', href: '/postulaty', currentPath: '/postulaty' },
      ],
    },
  ],
  links: [{ label: 'Kontakt', href: '/#kontakt' }],
  account: true,
  newsletter: true,
  cta: true,
  mobileCta: true,
});

const mediationMenu = Object.freeze({
  type: 'mediation',
  groups: [
    {
      label: 'Mediacje',
      items: [
        { label: 'Mediacje gospodarcze', href: '/#mediacje-gospodarcze' },
        { label: 'Mediacje inwestycyjne', href: '/#mediacje-inwestycyjne' },
        { label: 'Lista mediatorów', href: '/mediatorzy', currentPath: '/mediatorzy' },
      ],
    },
  ],
  links: [
    { label: 'Klauzula mediacyjna', href: '/#klauzula-mediacyjna' },
    { label: 'Baza wiedzy', href: '/baza-wiedzy', currentPath: '/baza-wiedzy' },
    { label: 'O fundacji', href: 'https://polskiebudownictwo.org/o_fundacji.html' },
    // { label: 'Zgłoś sprawę', href: '/zgloszenie', currentPath: '/zgloszenie' },
    // { label: 'Zostań mediatorem', href: '/zostan-mediatorem', currentPath: '/zostan-mediatorem', className: 'button button--nav' },
  ],
});

module.exports = Object.freeze({ public: publicMenu, mediation: mediationMenu });
