require('dotenv').config({ quiet: true });

const express = require('express');
const helmet = require('helmet');
const http = require('node:http');
const https = require('node:https');
const path = require('node:path');

const app = express();
const port = Number(process.env.PORT || 3001);
const mediationRoot = path.join(__dirname, 'subdomain', 'mediacje');
const apiBaseUrl = String(
  process.env.MEDIATION_API_URL
    || (process.env.NODE_ENV === 'production' ? 'https://polskiebudownictwo.org' : 'http://127.0.0.1:3000'),
).replace(/\/$/, '');

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use(express.json({ limit: '30kb' }));

app.set('view engine', 'ejs');
app.set('views', path.join(mediationRoot, 'views'));

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.get('/mediatorzy', async (request, response) => {
  try {
    const apiResult = await requestJson(`${apiBaseUrl}/api/mediacje/mediatorzy`);
    if (apiResult.statusCode < 200 || apiResult.statusCode >= 300 || !apiResult.payload.success) {
      throw new Error(apiResult.payload.message || `Mediator API returned HTTP ${apiResult.statusCode}.`);
    }

    const mediators = Array.isArray(apiResult.payload.mediators) ? apiResult.payload.mediators : [];
    response.render('mediatorzy', { mediators, error: null });
  } catch (error) {
    console.error(`Public mediators API error (${apiBaseUrl}):`, error);
    response.status(500).render('mediatorzy', {
      mediators: [],
      error: 'Nie udalo sie pobrac listy mediatorow.',
    });
  }
});

function requestJson(urlString) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const transport = url.protocol === 'https:' ? https : http;
    const request = transport.get(url, {
      headers: { Accept: 'application/json' },
    }, apiResponse => {
      let body = '';
      apiResponse.setEncoding('utf8');
      apiResponse.on('data', chunk => { body += chunk; });
      apiResponse.on('end', () => {
        try {
          resolve({
            statusCode: apiResponse.statusCode || 500,
            payload: JSON.parse(body),
          });
        } catch (error) {
          reject(new Error(`Mediator API returned invalid JSON: ${error.message}`));
        }
      });
    });
    request.setTimeout(10000, () => request.destroy(new Error('Mediator API request timed out.')));
    request.on('error', reject);
  });
}

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
