/**
 * Auth configuration loader
 * Reads API key settings from environment variables
 */

/**
 * Parse a comma-separated list of API keys from env
 * @param {string} raw
 * @returns {string[]}
 */
function parseApiKeys(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

/**
 * Load auth configuration from environment
 * @returns {object}
 */
function loadAuthConfig() {
  const rawKeys = process.env.API_KEYS || '';
  const apiKeys = parseApiKeys(rawKeys);
  const enabled = process.env.AUTH_ENABLED !== 'false' && apiKeys.length > 0;

  return {
    enabled,
    apiKeys
  };
}

module.exports = { parseApiKeys, loadAuthConfig };
