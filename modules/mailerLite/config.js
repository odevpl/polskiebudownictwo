const groupIds = Object.freeze({
  'Generalny wykonawca': '192174106703037566',
  Wykonawca: '192174121393588053',
  Podwykonawca: '192174136389273291',
  'Dostawca materiałów': '192174150210553036',
  'Producent materiałów': '192174179865330813',
  'Inżynier, projektant lub architekt': '192174192328705065',
  'Usługodawca dla budownictwa': '192174998790604347',
  Rzeczoznawca: '19217493319587568',
  Prawnik: '191875008252871787',
  Mediator: '192174909181396766',
  'Organizacja Branżowa': '192176612860495094',
  Inna: '1921750209658889393',
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
