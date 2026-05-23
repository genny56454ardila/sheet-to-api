const { fetchSheetData } = require('../sheets/client');
const { parseSheetData } = require('../sheets/parser');
const { applyFilterAndPagination } = require('../sheets/filter');
const { getCachedData, setCachedData, buildCacheKey } = require('../sheets/cache');

async function handleSheetRequest(req, res) {
  const { sheetId, range = 'Sheet1' } = req.params;
  const { page, limit, ...filters } = req.query;

  if (!sheetId) {
    return res.status(400).json({ error: 'sheetId is required' });
  }

  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 100;

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ error: 'page must be a positive integer' });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
    return res.status(400).json({ error: 'limit must be an integer between 1 and 1000' });
  }

  const cacheKey = buildCacheKey(sheetId, range);
  let records;

  try {
    const cached = getCachedData(cacheKey);
    if (cached) {
      records = cached;
    } else {
      const rawData = await fetchSheetData(sheetId, range);
      records = parseSheetData(rawData);
      setCachedData(cacheKey, records);
    }

    const pagination = { page: pageNum, limit: limitNum };

    const result = applyFilterAndPagination(records, filters, pagination);

    return res.status(200).json({
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    });
  } catch (err) {
    console.error('[handler] Error processing sheet request:', err.message);
    return res.status(500).json({ error: 'Failed to fetch sheet data', details: err.message });
  }
}

module.exports = { handleSheetRequest };
