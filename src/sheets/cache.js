const NodeCache = require('node-cache');

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '60', 10);

const cache = new NodeCache({ stdTTL: DEFAULT_TTL, checkperiod: 30 });

function buildCacheKey(spreadsheetId, range) {
  return `${spreadsheetId}::${range}`;
}

function getCachedData(spreadsheetId, range) {
  const key = buildCacheKey(spreadsheetId, range);
  const value = cache.get(key);
  return value !== undefined ? value : null;
}

function setCachedData(spreadsheetId, range, data, ttl) {
  const key = buildCacheKey(spreadsheetId, range);
  if (ttl !== undefined) {
    cache.set(key, data, ttl);
  } else {
    cache.set(key, data);
  }
}

function invalidateCache(spreadsheetId, range) {
  const key = buildCacheKey(spreadsheetId, range);
  cache.del(key);
}

function getCacheStats() {
  return cache.getStats();
}

module.exports = { getCachedData, setCachedData, invalidateCache, getCacheStats };
