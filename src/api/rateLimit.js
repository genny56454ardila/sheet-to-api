/**
 * Simple in-memory rate limiter middleware
 * Limits requests per IP address within a time window
 */

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 60;

const requestCounts = new Map();

/**
 * Clean up expired entries from the request counts map
 */
function pruneExpiredEntries(windowMs) {
  const now = Date.now();
  for (const [key, entry] of requestCounts.entries()) {
    if (now - entry.windowStart >= windowMs) {
      requestCounts.delete(key);
    }
  }
}

/**
 * Create a rate limiter middleware
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Max requests per window
 * @returns {function} Express middleware
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;

  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    pruneExpiredEntries(windowMs);

    const entry = requestCounts.get(ip);

    if (!entry || now - entry.windowStart >= windowMs) {
      requestCounts.set(ip, { count: 1, windowStart: now });
      res.set('X-RateLimit-Limit', maxRequests);
      res.set('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    entry.count += 1;
    const remaining = Math.max(0, maxRequests - entry.count);
    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', remaining);

    if (entry.count > maxRequests) {
      const resetAt = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.set('Retry-After', resetAt);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${resetAt} seconds.`,
        retryAfter: resetAt
      });
    }

    next();
  };
}

/**
 * Reset rate limit counts (useful for testing)
 */
function resetRateLimits() {
  requestCounts.clear();
}

module.exports = { createRateLimiter, resetRateLimits };
