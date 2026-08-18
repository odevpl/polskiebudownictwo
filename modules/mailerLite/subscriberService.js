const { request } = require('./client');
const { getConfig, isConfigured } = require('./config');

function normalizeRoles(roles) {
  if (Array.isArray(roles)) return roles;
  return roles ? [roles] : [];
}

function groupIdsForRoles(roles) {
  const { groupIds } = getConfig();
  const roleList = normalizeRoles(roles);
  const unknownRoles = roleList.filter(role => !groupIds[role]);

  if (unknownRoles.length) {
    throw new Error(`Brak mapowania MailerLite dla ról: ${unknownRoles.join(', ')}.`);
  }

  return [...new Set(roleList.map(role => groupIds[role]))];
}

function subscriberPayload(submission) {
  return {
    email: submission.email,
    fields: {
      name: submission.firstName || '',
      last_name: submission.lastName || '',
      company: submission.companyName || '',
      phone: submission.phone || '',
    },
    groups: groupIdsForRoles(submission.roles),
  };
}

async function syncSubmission(submission) {
  if (!submission?.consentMarketing) {
    console.warn('MailerLite sync skipped: marketing consent is not granted.');
    return { skipped: true, reason: 'marketing-consent-not-granted' };
  }

  if (!isConfigured()) {
    console.warn('MailerLite sync skipped: API token is not configured.');
    return { skipped: true, reason: 'api-token-not-configured' };
  }

  const payload = subscriberPayload(submission);
  const result = await request('/subscribers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    skipped: false,
    createdOrUpdated: result?.data || result,
  };
}

module.exports = {
  groupIdsForRoles,
  subscriberPayload,
  syncSubmission,
};
