const { querySheet } = require('../sheets/index');
const { parseFieldsParam, sendFormattedResponse } = require('./format');

/**
 * Express handler for GET /api/sheets/:sheetId
 * Delegates to querySheet and formats the response.
 */
async function getSheetHandler(req, res) {
  const { sheetId } = req.params;
  const { fields, format, ...queryParams } = req.query;

  try {
    const result = await querySheet(sheetId, queryParams);

    let records = result.records;
    if (fields) {
      const fieldList = parseFieldsParam(fields);
      records = records.map(record =>
        fieldList.reduce((acc, f) => {
          if (Object.prototype.hasOwnProperty.call(record, f)) acc[f] = record[f];
          return acc;
        }, {})
      );
    }

    const payload = {
      sheetId: result.sheetId,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      fromCache: result.fromCache,
      records,
    };

    return sendFormattedResponse(res, payload, format);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      error: err.message || 'Internal server error',
    });
  }
}

module.exports = { getSheetHandler };
