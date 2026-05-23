const { getSheetData } = require('./client');
const { parseSheetData } = require('./parser');
const { filterRecords, paginateRecords, applyFilterAndPagination } = require('./filter');
const { getCachedData, setCachedData, buildCacheKey } = require('./cache');
const { validateQueryParams } = require('./validator');

/**
 * Fetches, parses, filters, and paginates sheet data.
 * Returns structured API-ready response.
 */
async function querySheet(sheetId, queryParams = {}) {
  const validation = validateQueryParams(queryParams);
  if (!validation.valid) {
    const err = new Error(validation.errors.join(', '));
    err.statusCode = 400;
    throw err;
  }

  const cacheKey = buildCacheKey(sheetId, queryParams);
  const cached = getCachedData(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const rawData = await getSheetData(sheetId);
  const records = parseSheetData(rawData);

  const { filter, page, pageSize, ...rest } = queryParams;
  const result = applyFilterAndPagination(records, {
    filter,
    page: page ? parseInt(page, 10) : 1,
    pageSize: pageSize ? parseInt(pageSize, 10) : 100,
  });

  const response = {
    sheetId,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    records: result.records,
    fromCache: false,
  };

  setCachedData(cacheKey, response);
  return response;
}

module.exports = { querySheet };
