require('dotenv').config({ quiet: true });

const express = require('express');
const helmet = require('helmet');
const path = require('node:path');

const app = express();
const port = Number(process.env.PORT || 3001);
const mediationRoot = path.join(__dirname, 'subdomain', 'mediacje');

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use(express.json({ limit: '30kb' }));

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use(express.static(mediationRoot, {
  extensions: ['html'],
}));

app.use((request, response) => {
  response.status(404).send('Not found');
});

const server = app.listen(port, () => {
  console.log(`Centrum Mediacji running on port ${port}`);
});

module.exports = app;
module.exports.server = server;
