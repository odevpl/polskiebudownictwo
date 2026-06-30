require('dotenv').config({ quiet: true });

const express = require('express');
const helmet = require('helmet');
const path = require('node:path');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { adminPath, adminUrl } = require('./config/adminPath');
const { createSessionMiddleware } = require('./config/session');

const app = express();
const publicRoot = path.join(__dirname, 'page');
const appPublicRoot = path.join(__dirname, 'public');

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use(express.json({ limit: '30kb' }));
app.use(createSessionMiddleware());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

module.exports = app;
