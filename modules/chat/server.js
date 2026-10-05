const { Server } = require('socket.io');
const User = require('../../models/User');
const ChatMessage = require('../../models/ChatMessage');
const { getAccessibleChat } = require('../../services/chatAccessService');

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_PER_MINUTE = 12;

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  const host = request.headers.host;
  return origin === `https://${host}` || origin === `http://${host}`;
}

function attach(server, sessionMiddleware) {
  const connectionsPerUser = new Map();
  const io = new Server(server, {
    allowRequest: (request, callback) => callback(null, sameOrigin(request)),
    path: '/socket.io',
    serveClient: true,
  });

  io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
  io.use(async (socket, next) => {
    try {
      const userId = socket.request.session?.user?.id;
      if (!userId) return next(new Error('unauthorized'));
      const user = await User.findById(userId);
      if (!user || !user.is_active) return next(new Error('unauthorized'));
      const currentConnections = connectionsPerUser.get(user.id) || 0;
      if (currentConnections >= 3) return next(new Error('connection_limit'));
      connectionsPerUser.set(user.id, currentConnections + 1);
      socket.data.user = user;
      socket.data.joinedChats = new Set();
      socket.data.sentAt = [];
      return next();
    } catch (error) {
      return next(new Error('unauthorized'));
    }
  });

  io.on('connection', socket => {
    socket.on('disconnect', () => {
      const userId = socket.data.user?.id;
      if (!userId) return;
      const remaining = (connectionsPerUser.get(userId) || 1) - 1;
      if (remaining > 0) connectionsPerUser.set(userId, remaining);
      else connectionsPerUser.delete(userId);
    });

    socket.on('chat:join', async (uuid, acknowledge = () => {}) => {
      try {
        const chat = await getAccessibleChat(socket.data.user.id, String(uuid || ''));
        if (!chat) return acknowledge({ ok: false, error: 'Brak dostępu do czatu.' });
        socket.join(`chat:${chat.id}`);
        socket.data.joinedChats.add(chat.id);
        return acknowledge({ ok: true, title: chat.title });
      } catch (error) {
        console.error('Chat join error:', error);
        return acknowledge({ ok: false, error: 'Nie udało się połączyć z czatem.' });
      }
    });

    socket.on('chat:leave', uuid => {
      for (const chatId of socket.data.joinedChats) {
        socket.leave(`chat:${chatId}`);
      }
      socket.data.joinedChats.clear();
    });

    socket.on('chat:send', async ({ uuid, body } = {}, acknowledge = () => {}) => {
      try {
        const chat = await getAccessibleChat(socket.data.user.id, String(uuid || ''));
        const content = String(body || '').trim();
        if (!chat || !socket.data.joinedChats.has(chat.id)) return acknowledge({ ok: false, error: 'Brak dostępu do czatu.' });
        if (!content || content.length > MAX_MESSAGE_LENGTH) return acknowledge({ ok: false, error: `Wiadomość może mieć maksymalnie ${MAX_MESSAGE_LENGTH} znaków.` });

        const now = Date.now();
        socket.data.sentAt = socket.data.sentAt.filter(time => now - time < 60000);
        if (socket.data.sentAt.length >= MAX_MESSAGES_PER_MINUTE) return acknowledge({ ok: false, error: 'Wysyłasz wiadomości zbyt szybko. Spróbuj za chwilę.' });
        socket.data.sentAt.push(now);

        const message = await ChatMessage.create(chat.id, socket.data.user.id, content);
        io.to(`chat:${chat.id}`).emit('chat:message', message);
        return acknowledge({ ok: true });
      } catch (error) {
        console.error('Chat send error:', error);
        return acknowledge({ ok: false, error: 'Nie udało się wysłać wiadomości.' });
      }
    });
  });

  return io;
}

module.exports = { attach };
