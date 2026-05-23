/**
 * Environment configuration loader
 * Reads and validates required env vars for the application
 */

const DEFAULT_PORT = 3000;
const DEFAULT_CACHE_TTL = 300; // seconds
const DEFAULT_RATE_LIMIT_MAX = 100;
const DEFAULT_RATE_LIMIT_WINDOW = 60; // seconds

/**
 * Parse a positive integer from a string, returning fallback if invalid
 * @param {string|undefined} value
 * @param {number} fallback
 * @returns {number}
 */
function parsePositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Load and validate environment configuration
 * @returns {object} config
 */
function loadEnvConfig() {
  const port = parsePositiveInt(process.env.PORT, DEFAULT_PORT);
  const cacheTtl = parsePositiveInt(process.env.CACHE_TTL_SECONDS, DEFAULT_CACHE_TTL);
  const rateLimitMax = parsePositiveInt(process.env.RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX);
  const rateLimitWindow = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_SECONDS, DEFAULT_RATE_LIMIT_WINDOW);

  const googleCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || null;
  const nodeEnv = process.env.NODE_ENV || 'development';

  const warnings = [];

  if (!googleCredentials) {
    warnings.push('GOOGLE_SERVICE_ACCOUNT_JSON is not set — Google Sheets access will fail');
  }

  if (!process.env.API_KEYS) {
    warnings.push('API_KEYS is not set — authentication will be disabled');
  }

  return {
    port,
    cacheTtl,
    rateLimitMax,
    rateLimitWindow,
    googleCredentials,
    nodeEnv,
    isProduction: nodeEnv === 'production',
    warnings,
  };
}

module.exports = { loadEnvConfig, parsePositiveInt };
