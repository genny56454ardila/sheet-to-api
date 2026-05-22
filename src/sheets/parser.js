/**
 * Parses raw Google Sheets data into structured JSON records.
 * Assumes first row contains headers.
 */

/**
 * Converts a 2D array of sheet values into an array of objects.
 * @param {Array<Array<any>>} rows - Raw rows from Sheets API
 * @returns {{ headers: string[], records: Object[] }}
 */
function parseSheetData(rows) {
  if (!rows || rows.length === 0) {
    return { headers: [], records: [] };
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((h) => String(h).trim());

  const records = dataRows
    .filter((row) => row.some((cell) => cell !== '' && cell !== null && cell !== undefined))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        const value = row[index] !== undefined ? row[index] : '';
        record[header] = coerceValue(value);
      });
      return record;
    });

  return { headers, records };
}

/**
 * Attempts to coerce a string value to a number or boolean if applicable.
 * @param {any} value
 * @returns {any}
 */
function coerceValue(value) {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();

  if (trimmed === '') return '';
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') return num;

  return trimmed;
}

module.exports = { parseSheetData, coerceValue };
