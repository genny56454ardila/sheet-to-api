const express = require('express');
const { handleSheetRequest } = require('./handler');
const { validateSheetId } = require('./middleware');

const router = express.Router();

/**
 * GET /api/sheets/:sheetId
 * Fetch all rows from default sheet range
 */
router.get('/sheets/:sheetId', validateSheetId, handleSheetRequest);

/**
 * GET /api/sheets/:sheetId/:range
 * Fetch rows from a specific named range or sheet tab
 */
router.get('/sheets/:sheetId/:range', validateSheetId, handleSheetRequest);

module.exports = router;
