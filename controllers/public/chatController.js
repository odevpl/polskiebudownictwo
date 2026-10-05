const ChatMessage = require('../../models/ChatMessage');
const { getAccessibleChat } = require('../../services/chatAccessService');

async function history(request, response) {
  try {
    const chat = await getAccessibleChat(request.session.user.id, request.params.uuid);
    if (!chat) return response.status(403).json({ success: false, message: 'Brak dostępu do czatu.' });
    const beforeId = /^\d+$/.test(String(request.query.before || '')) ? Number(request.query.before) : null;
    const messages = await ChatMessage.findPage(chat.id, beforeId);
    return response.json({ success: true, messages });
  } catch (error) {
    console.error('Chat history error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się pobrać wiadomości.' });
  }
}

module.exports = { history };
