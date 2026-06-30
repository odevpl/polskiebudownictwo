function normalizeAdminPath(value) {
  const raw = String(value || 'admin').trim();
  const withoutSlashes = raw.replace(/^\/+|\/+$/g, '');
  return `/${withoutSlashes || 'admin'}`;
}

const adminPath = normalizeAdminPath(process.env.ADMIN_PATH);

function adminUrl(path = '/') {
  const suffix = String(path || '/');
  if (suffix === '/') return adminPath;
  return `${adminPath}/${suffix.replace(/^\/+/, '')}`;
}

module.exports = {
  adminPath,
  adminUrl,
};
