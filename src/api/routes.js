const express = require('express');
const { validateSheetId, validateQueryParameters, requestLogger } = require('./middleware');
const { createAuthMiddleware } = require('./auth');
const { loadAuthConfig } = require('../config/auth');
const sheetHandler = require('./sheetHandler');
const { createRateLimiter } = require('./rateLimit');

const router = express.Router();

const authConfig = loadAuthConfig();
const auth = createAuthMiddleware(authConfig);

const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10)
});

router.use(requestLogger);
router.use(rateLimiter);
router.use(auth);

router.get('/sheet/:sheetId', validateSheetId, validateQueryParameters, sheetHandler);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
