const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');

const MySQLStore = MySQLStoreFactory(session);

function createSessionMiddleware() {
  const hasDatabaseConfig = process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER;
  const store = hasDatabaseConfig
    ? new MySQLStore({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        schema: {
          tableName: 'sessions',
          columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data',
          },
        },
      })
    : undefined;

  return session({
    name: 'pb.sid',
    secret: process.env.SESSION_SECRET || 'development-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8,
    },
  });
}

module.exports = {
  createSessionMiddleware,
};
