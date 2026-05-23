/**
 * Transform sheet records into various output formats
 */

/**
 * Convert records to CSV format
 * @param {Array<Object>} records
 * @returns {string}
 */
function toCsv(records) {
  if (!records || records.length === 0) return '';

  const headers = Object.keys(records[0]);
  const headerRow = headers.map(escapeCsvValue).join(',');

  const dataRows = records.map(record =>
    headers.map(header => escapeCsvValue(record[header] ?? '')).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape a value for CSV output
 * @param {*} value
 * @returns {string}
 */
function escapeCsvValue(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}`;
  }
  return str;
}

/**
 * Rename or pick specific fields from records
 * @param {Array<Object>} records
 * @param {Array<string>} fields - fields to include (empty = all)
 * @returns {Array<Object>}
 */
function selectFields(records, fields = []) {
  if (!fields || fields.length === 0) return records;
  return records.map(record =>
    fields.reduce((acc, field) => {
      if (Object.prototype.hasOwnProperty.call(record, field)) {
        acc[field] = record[field];
      }
      return acc;
    }, {})
  );
}

/**
 * Wrap records in a standard API response envelope
 * @param {Array<Object>} records
 * @param {Object} meta
 * @returns {Object}
 */
function toApiResponse(records, meta = {}) {
  return {
    data: records,
    meta: {
      count: records.length,
      ...meta
    }
  };
}

module.exports = { toCsv, escapeCsvValue, selectFields, toApiResponse };
