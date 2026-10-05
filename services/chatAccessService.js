const Chat = require('../models/Chat');
const courseAccessService = require('./courseAccessService');

async function getAccessibleChat(userId, uuid) {
  const chat = await Chat.findActiveByUuid(uuid);
  if (!chat) return null;

  const membership = await Chat.findMember(chat.id, userId);
  if (membership?.is_blocked) return null;

  if (chat.access_type === 'course') {
    return chat.course_id && await courseAccessService.hasActiveAccess(userId, chat.course_id) ? chat : null;
  }

  return membership && !membership.is_blocked ? chat : null;
}

module.exports = { getAccessibleChat };
