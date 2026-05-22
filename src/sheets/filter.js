/**
 * Filtering and pagination utilities for parsed sheet records.
 */

/**
 * Filters records by matching query params against record fields.
 * All provided filters must match (AND logic).
 * @param {Object[]} records
 * @param {Object} filters - key/value pairs to match
 * @returns {Object[]}
 */
function filterRecords(records, filters = {}) {
  const entries = Object.entries(filters);
  if (entries.length === 0) return records;

  return records.filter((record) =>
    entries.every(([key, value]) => {
      if (!(key in record)) return false;
      const recordVal = String(record[key]).toLowerCase();
      const filterVal = String(value).toLowerCase();
      return recordVal === filterVal;
    })
  );
}

/**
 * Paginates an array of records.
 * @param {Object[]} records
 * @param {number} page - 1-based page number
 * @param {number} pageSize - number of records per page
 * @returns {{ data: Object[], total: number, page: number, pageSize: number, totalPages: number }}
 */
function paginateRecords(records, page = 1, pageSize = 50) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safePageSize = Math.min(500, Math.max(1, parseInt(pageSize, 10) || 50));

  const total = records.length;
  const totalPages = Math.ceil(total / safePageSize);
  const start = (safePage - 1) * safePageSize;
  const data = records.slice(start, start + safePageSize);

  return {
    data,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

/**
 * Applies both filtering and pagination in one call.
 * @param {Object[]} records
 * @param {Object} filters
 * @param {number} page
 * @param {number} pageSize
 */
function applyFilterAndPagination(records, filters, page, pageSize) {
  const filtered = filterRecords(records, filters);
  return paginateRecords(filtered, page, pageSize);
}

module.exports = { filterRecords, paginateRecords, applyFilterAndPagination };
