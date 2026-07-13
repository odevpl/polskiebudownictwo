const Event = require('../../models/Event');

async function index(request, response) {
  try {
    const events = await Event.findAll();
    response.render('public/events', { events, error: null, formatDate, formatTime, isPast });
  } catch (error) {
    console.error('Public events list error:', error);
    response.status(500).render('public/events', {
      events: [],
      error: 'Nie udalo sie pobrac wydarzen. Sprobuj ponownie pozniej.',
      formatDate,
      formatTime,
      isPast,
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
