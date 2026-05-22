const { parseSheetData, coerceValue } = require('./parser');

describe('parseSheetData', () => {
  it('returns empty result for null input', () => {
    expect(parseSheetData(null)).toEqual({ headers: [], records: [] });
  });

  it('returns empty result for empty array', () => {
    expect(parseSheetData([])).toEqual({ headers: [], records: [] });
  });

  it('returns headers with no records when only header row exists', () => {
    const result = parseSheetData([['Name', 'Age', 'Active']]);
    expect(result.headers).toEqual(['Name', 'Age', 'Active']);
    expect(result.records).toEqual([]);
  });

  it('parses rows into objects keyed by headers', () => {
    const rows = [
      ['Name', 'Age', 'Active'],
      ['Alice', '30', 'true'],
      ['Bob', '25', 'false'],
    ];
    const { headers, records } = parseSheetData(rows);
    expect(headers).toEqual(['Name', 'Age', 'Active']);
    expect(records).toHaveLength(2);
    expect(records[0]).toEqual({ Name: 'Alice', Age: 30, Active: true });
    expect(records[1]).toEqual({ Name: 'Bob', Age: 25, Active: false });
  });

  it('fills missing cells with empty string', () => {
    const rows = [
      ['Name', 'Age', 'City'],
      ['Alice', '30'],
    ];
    const { records } = parseSheetData(rows);
    expect(records[0].City).toBe('');
  });

  it('filters out entirely empty rows', () => {
    const rows = [
      ['Name', 'Age'],
      ['Alice', '30'],
      ['', ''],
      ['Bob', '25'],
    ];
    const { records } = parseSheetData(rows);
    expect(records).toHaveLength(2);
  });

  it('trims whitespace from headers', () => {
    const rows = [['  Name  ', ' Age '], ['Alice', '30']];
    const { headers } = parseSheetData(rows);
    expect(headers).toEqual(['Name', 'Age']);
  });
});

describe('coerceValue', () => {
  it('coerces numeric strings to numbers', () => {
    expect(coerceValue('42')).toBe(42);
    expect(coerceValue('3.14')).toBeCloseTo(3.14);
  });

  it('coerces boolean strings', () => {
    expect(coerceValue('true')).toBe(true);
    expect(coerceValue('TRUE')).toBe(true);
    expect(coerceValue('false')).toBe(false);
    expect(coerceValue('FALSE')).toBe(false);
  });

  it('returns strings as-is when not coercible', () => {
    expect(coerceValue('hello')).toBe('hello');
  });

  it('returns non-string values unchanged', () => {
    expect(coerceValue(99)).toBe(99);
    expect(coerceValue(null)).toBe(null);
  });

  it('returns empty string for empty input', () => {
    expect(coerceValue('')).toBe('');
  });
});
