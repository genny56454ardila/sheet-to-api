const SHEET_ID_PATTERN = /^[a-zA-Z0-9_-]{20,60}$/;

function validateSheetId(req, res, next) {
  const { sheetId } = req.params;

  if (!sheetId) {
    return res.status(400).json({ error: 'Missing sheetId parameter' });
  }

  if (!SHEET_ID_PATTERN.test(sheetId)) {
    return res.status(400).json({
      error: 'Invalid sheetId format',
      hint: 'sheetId should be 20-60 alphanumeric characters (hyphens and underscores allowed)',
    });
  }

  next();
}

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
}

module.exports = { validateSheetId, requestLogger };
