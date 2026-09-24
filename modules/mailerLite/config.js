const groupIds = Object.freeze({
  'Generalny wykonawca': '196350440890173388',
  Wykonawca: '196350289705436579',
  Podwykonawca: '196350344642430396',
  'Dostawca materiałów': '196350326114092898',
  'Producent materiałów': '19635035955517189',
  'Inżynier, projektant lub architekt': '196350402794357855',
  'Usługodawca dla budownictwa': '196350498772616993',
  Rzeczoznawca: '196350427251345070',
  Prawnik: '196350262987720007',
  Mediator: '196350433130710443',
  'Organizacja Branżowa': '196350197315010416',
  Inna: '196350539689100897',
});

function getConfig() {
  return {
    apiToken: String(process.env.MAILERLITE_API_TOKEN || '').trim(),
    baseUrl: String(process.env.MAILERLITE_API_URL || 'https://connect.mailerlite.com/api').replace(/\/$/, ''),
    groupIds,
  };
}

function isConfigured() {
  return Boolean(getConfig().apiToken);
}

function isSyncEnabled() {
  return process.env.NODE_ENV === 'production' && isConfigured();
}

module.exports = {
  getConfig,
  isConfigured,
  isSyncEnabled,
};
