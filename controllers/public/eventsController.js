const Event = require('../../models/Event');
const { renderMenu } = require('../../modules/menu');
const { renderJoinCta } = require('../../modules/joinCta');

const menu = renderMenu({ variant: 'public', currentPath: '/wydarzenia' });
const joinCta = renderJoinCta();

async function index(request, response) {
  try {
    const events = await Event.findAll();
    response.render('public/events', { events, error: null, formatDate, formatTime, isPast, menu, joinCta });
  } catch (error) {
    console.error('Public events list error:', error);
    response.status(500).render('public/events', {
      events: [],
      error: 'Nie udalo sie pobrac wydarzen. Sprobuj ponownie pozniej.',
      formatDate,
      formatTime,
      isPast,
      menu,
      joinCta,
    });
  }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : '';
}

function isPast(value) {
  if (!value) return false;
  const eventDate = new Date(value);
  const today = new Date();
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
}

module.exports = { formatDate, formatTime, index, isPast };
