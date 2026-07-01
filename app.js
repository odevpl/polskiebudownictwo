require('dotenv').config({ quiet: true });

const express = require('express');
const helmet = require('helmet');
const path = require('node:path');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { adminPath, adminUrl } = require('./config/adminPath');
const { createSessionMiddleware } = require('./config/session');

const app = express();
const port = Number(process.env.PORT || 3000);
const publicRoot = path.join(__dirname, 'page');
const appPublicRoot = path.join(__dirname, 'public');
let adminSessionMiddleware;

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use(express.json({ limit: '30kb' }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.adminBasePath = adminPath;
app.locals.adminUrl = adminUrl;

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use(express.static(appPublicRoot));
app.use(express.static(publicRoot, {
  extensions: ['html'],
}));

app.use(publicRoutes);
app.use(adminPath, (request, response, next) => {
  adminSessionMiddleware ||= createSessionMiddleware();
  adminSessionMiddleware(request, response, next);
}, (request, response, next) => {
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
