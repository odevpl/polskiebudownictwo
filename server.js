const app = require('./app');

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);

app.listen(port, host, () => {
  console.log(`Serwer testowy: http://${host}:${port}/`);
  console.log('Formularz dziala testowo i nie wysyla prawdziwych wiadomosci.');
});
