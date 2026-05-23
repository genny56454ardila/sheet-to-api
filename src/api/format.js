const { toCsv, selectFields, toApiResponse } = require('../sheets/transform');

/**
 * Parse comma-separated fields query param
 * @param {string} fieldsParam
 * @returns {Array<string>}
 */
function parseFieldsParam(fieldsParam) {
  if (!fieldsParam) return [];
  return fieldsParam
    .split(',')
    .map(f => f.trim())
    .filter(Boolean);
}

/**
 * Format and send the response based on requested format
 * @param {Object} res - Express response object
 * @param {Array<Object>} records
 * @param {Object} query - request query params
 * @param {Object} meta - additional metadata
 */
function sendFormattedResponse(res, records, query = {}, meta = {}) {
  const { format, fields } = query;
  const selectedFields = parseFieldsParam(fields);
  const processedRecords = selectFields(records, selectedFields);

  if (format === 'csv') {
    const csv = toCsv(processedRecords);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
    return res.send(csv);
  }

  const response = toApiResponse(processedRecords, meta);
  return res.json(response);
}

module.exports = { parseFieldsParam, sendFormattedResponse };
