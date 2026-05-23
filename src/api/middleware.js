const { validateQueryParams } = require('../sheets/validator');

/**
 * Middleware to validate the sheetId route parameter
 */
function validateSheetId(req, res, next) {
  const { sheetId } = req.params;

  if (!sheetId || typeof sheetId !== 'string' || !sheetId.trim()) {
    return res.status(400).json({ error: 'sheetId is required' });
  }

  // Basic Google Sheets ID format check (alphanumeric + dashes/underscores)
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(sheetId.trim())) {
    return res.status(400).json({ error: 'sheetId format is invalid' });
  }

  next();
}

/**
 * Middleware to validate query parameters (filters, pagination)
 */
function validateQueryParameters(req, res, next) {
  const { valid, errors } = validateQueryParams(req.query);

  if (!valid) {
    return res.status(400).json({ error: 'Invalid query parameters', details: errors });
  }

  next();
}

/**
 * Simple request logger middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}

module.exports = { validateSheetId, validateQueryParameters, requestLogger };
