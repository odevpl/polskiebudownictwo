require('dotenv').config({ quiet: true });

const express = require('express');
const helmet = require('helmet');
const path = require('node:path');
const publicRoutes = require('./routes/public');
const eventsController = require('./controllers/public/eventsController');
const adminRoutes = require('./routes/admin');
const { adminPath, adminUrl } = require('./config/adminPath');
const { createSessionMiddleware } = require('./config/session');
const { requireUser } = require('./middleware/userAuth');
const academyPageController = require('./controllers/public/academyPageController');
const { csrfProtection } = require('./middleware/csrf');

const app = express();
const port = Number(process.env.PORT || 3000);
const publicRoot = path.join(__dirname, 'page');
const appPublicRoot = path.join(__dirname, 'public');

app.disable('x-powered-by');
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

app.use(helmet({
  contentSecurityPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use(express.json({ limit: '30kb' }));
app.use(createSessionMiddleware());
app.use(csrfProtection);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.adminBasePath = adminPath;
app.locals.adminUrl = adminUrl;

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.get('/wydarzenia', eventsController.index);
app.get('/akademia/kurs/:slug', requireUser, academyPageController.course);
app.get('/akademia/kurs/:slug/lekcja/:lessonSlug', requireUser, academyPageController.lesson);
app.get('/akademia/kup/:slug', requireUser, academyPageController.checkout);
app.get('/akademia/platnosc/wynik', requireUser, academyPageController.paymentResult);
const academyPages = {
  '/akademia': 'akademia.html',
  '/akademia/': 'akademia.html',
  '/akademia.html': 'akademia.html',
  '/akademia/ustawienia': path.join('akademia', 'ustawienia', 'index.html'),
  '/akademia/ustawienia/': path.join('akademia', 'ustawienia', 'index.html'),
  '/akademia/ustawienia/index.html': path.join('akademia', 'ustawienia', 'index.html'),
};

app.get([
  '/akademia/strefa-szkolen',
  '/akademia/strefa-szkolen/',
  '/akademia/strefa-szkolen/index.html',
], requireUser, (request, response) => {
  response.redirect('/akademia/');
});

app.get(Object.keys(academyPages), requireUser, (request, response) => {
  response.sendFile(path.join(publicRoot, academyPages[request.path]));
});

app.use('/api/mediacje', (request, response, next) => {
  const allowedOrigins = new Set([
    'https://mediacje.polskiebudownictwo.org',
    'http://127.0.0.1:3001',
    'http://localhost:3001',
  ]);
  const origin = request.get('origin');
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

app.use(express.static(appPublicRoot));
app.use(express.static(publicRoot, {
  extensions: ['html'],
}));

app.use(publicRoutes);
app.use(adminPath, (request, response, next) => {
  response.locals.adminBasePath = adminPath;
  response.locals.adminUrl = adminUrl;
  next();
}, adminRoutes);

app.use((request, response) => {
  response.status(404).send('Not found');
});

const server = app.listen(port, () => {
  console.log(`Polskie Budownictwo running on port ${port}`);
});

module.exports = app;
module.exports.server = server;
