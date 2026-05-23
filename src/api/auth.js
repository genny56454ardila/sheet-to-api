/**
 * Simple API key authentication middleware
 */

const HEADER_NAME = 'x-api-key';
const QUERY_PARAM = 'api_key';

/**
 * Extract API key from request (header or query param)
 * @param {object} req
 * @returns {string|null}
 */
function extractApiKey(req) {
  return req.headers[HEADER_NAME] || req.query[QUERY_PARAM] || null;
}

/**
 * Validate API key against configured keys
 * @param {string} key
 * @param {string[]} validKeys
 * @returns {boolean}
 */
function isValidApiKey(key, validKeys) {
  if (!key || !Array.isArray(validKeys) || validKeys.length === 0) return false;
  return validKeys.includes(key);
}

/**
 * Create authentication middleware
 * @param {object} options
 * @param {string[]} options.apiKeys - list of valid API keys
 * @param {boolean} options.enabled - whether auth is enabled (default true)
 * @returns {function}
 */
function createAuthMiddleware(options = {}) {
  const { apiKeys = [], enabled = true } = options;

  return function authMiddleware(req, res, next) {
    if (!enabled) return next();

    const key = extractApiKey(req);

    if (!isValidApiKey(key, apiKeys)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'A valid API key is required. Provide it via the x-api-key header or api_key query parameter.'
      });
    }

    next();
  };
}

module.exports = { extractApiKey, isValidApiKey, createAuthMiddleware };
