const { randomUUID } = require('node:crypto');
const Chat = require('../../models/Chat');
const ChatMessage = require('../../models/ChatMessage');
const Course = require('../../models/Course');
const User = require('../../models/User');

async function index(request, response) {
  try {
    const chats = await Chat.findAll();
    return response.render('admin/chats/index', { title: 'Chaty', admin: request.session.admin, chats });
  } catch (error) {
    console.error('Chats index error:', error);
    return response.status(500).send('Nie udało się pobrać czatów.');
  }
}

async function newForm(request, response) {
  return renderForm(request, response, { title: '', accessType: 'course', courseId: '' }, [], 200);
}

async function create(request, response) {
  const data = chatFromBody(request.body);
  const errors = await validate(data);
  if (errors.length) return renderForm(request, response, data, errors, 422);
  try {
    const chat = await Chat.create({ ...data, uuid: randomUUID(), adminId: request.session.admin.id });
    return response.redirect(request.app.locals.adminUrl(`/chats/${chat.id}`));
  } catch (error) {
    console.error('Chat create error:', error);
    return renderForm(request, response, data, ['Nie udało się utworzyć czatu.'], 500);
  }
}

async function detail(request, response) {
  try {
    const chat = await Chat.findById(request.params.id);
    if (!chat) return response.status(404).send('Czat nie istnieje.');
    const [messages, members] = await Promise.all([ChatMessage.findForAdmin(chat.id), Chat.findMembers(chat.id)]);
    return response.render('admin/chats/detail', { title: `Czat #${chat.id}`, admin: request.session.admin, chat, messages, members });
  } catch (error) {
    console.error('Chat detail error:', error);
    return response.status(500).send('Nie udało się pobrać czatu.');
  }
}

async function toggle(request, response) {
  try {
    const chat = await Chat.findById(request.params.id);
    if (!chat) return response.status(404).send('Czat nie istnieje.');
    await Chat.setActive(chat.id, !chat.is_active);
    return response.redirect(request.app.locals.adminUrl(`/chats/${chat.id}`));
  } catch (error) {
    console.error('Chat toggle error:', error);
    return response.status(500).send('Nie udało się zmienić statusu czatu.');
  }
}

async function addMember(request, response) {
  const email = String(request.body.email || '').trim().toLowerCase();
  try {
    const [chat, user] = await Promise.all([Chat.findById(request.params.id), User.findByEmail(email)]);
    if (!chat) return response.status(404).send('Czat nie istnieje.');
    if (chat.access_type !== 'members') return response.status(422).send('Ten czat nie korzysta z listy uczestników.');
    if (!user) return response.status(422).send('Nie znaleziono konta o podanym adresie e-mail.');
    await Chat.addMember(chat.id, user.id);
    return response.redirect(request.app.locals.adminUrl(`/chats/${chat.id}`));
  } catch (error) {
    console.error('Chat add member error:', error);
    return response.status(500).send('Nie udało się dodać uczestnika.');
  }
}

async function toggleMemberBlock(request, response) {
  try {
    const [chat, member] = await Promise.all([Chat.findById(request.params.id), Chat.findMember(request.params.id, request.params.userId)]);
    if (!chat || !member) return response.status(404).send('Nie znaleziono czatu lub uczestnika.');
    await Chat.setMemberBlocked(chat.id, member.user_id, !member.is_blocked);
    return response.redirect(request.app.locals.adminUrl(`/chats/${chat.id}`));
  } catch (error) {
    console.error('Chat block member error:', error);
    return response.status(500).send('Nie udało się zmienić dostępu uczestnika.');
  }
}

async function blockMessageAuthor(request, response) {
  try {
    const chat = await Chat.findById(request.params.id);
    if (!chat) return response.status(404).send('Czat nie istnieje.');
    const messages = await ChatMessage.findForAdmin(chat.id);
    const message = messages.find(item => String(item.id) === String(request.params.messageId));
    if (!message) return response.status(404).send('Wiadomość nie istnieje.');
    await Chat.setMemberBlocked(chat.id, message.user_id, true);
    return response.redirect(request.app.locals.adminUrl(`/chats/${chat.id}`));
  } catch (error) {
    console.error('Chat block author error:', error);
    return response.status(500).send('Nie udało się zablokować użytkownika.');
  }
}

async function deleteMessage(request, response) {
  try {
    const chat = await Chat.findById(request.params.id);
    if (!chat) return response.status(404).send('Czat nie istnieje.');
    await ChatMessage.softDelete(chat.id, request.params.messageId, request.session.admin.id);
    return response.redirect(request.app.locals.adminUrl(`/chats/${chat.id}`));
  } catch (error) {
    console.error('Chat delete message error:', error);
    return response.status(500).send('Nie udało się usunąć wiadomości.');
  }
}

function chatFromBody(body) {
  return { title: String(body.title || '').trim(), accessType: body.accessType === 'members' ? 'members' : 'course', courseId: String(body.courseId || '').trim() };
}

async function validate(data) {
  const errors = [];
  if (!data.title || data.title.length > 160) errors.push('Podaj nazwę czatu (maksymalnie 160 znaków).');
  if (data.accessType === 'course') {
    if (!/^\d+$/.test(data.courseId) || !await Course.findById(data.courseId)) errors.push('Wybierz istniejący kurs.');
  }
  return errors;
}

async function renderForm(request, response, chat, errors, status) {
  const courses = await Course.findAll();
  return response.status(status).render('admin/chats/form', { title: 'Nowy czat', admin: request.session.admin, chat, courses, errors, action: request.app.locals.adminUrl('/chats/new') });
}

module.exports = { addMember, blockMessageAuthor, create, deleteMessage, detail, index, newForm, toggle, toggleMemberBlock };
