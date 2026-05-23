const { toCsv, escapeCsvValue, selectFields, toApiResponse } = require('./transform');

describe('toCsv', () => {
  it('returns empty string for empty records', () => {
    expect(toCsv([])).toBe('');
    expect(toCsv(null)).toBe('');
  });

  it('converts records to csv with headers', () => {
    const records = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ];
    const result = toCsv(records);
    expect(result).toBe('name,age\nAlice,30\nBob,25');
  });

  it('escapes values with commas', () => {
    const records = [{ name: 'Smith, John', city: 'NY' }];
    const result = toCsv(records);
    expect(result).toContain('"Smith, John"');
  });

  it('handles missing fields with empty string', () => {
    const records = [{ name: 'Alice', age: null }];
    const result = toCsv(records);
    expect(result).toBe('name,age\nAlice,');
  });
});

describe('escapeCsvValue', () => {
  it('returns plain string unchanged', () => {
    expect(escapeCsvValue('hello')).toBe('hello');
  });

  it('wraps value with comma in quotes', () => {
    expect(escapeCsvValue('a,b')).toBe('"a,b"');
  });

  it('escapes double quotes', () => {
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi""');
  });
});

describe('selectFields', () => {
  const records = [{ id: 1, name: 'Alice', age: 30 }];

  it('returns all records when no fields specified', () => {
    expect(selectFields(records, [])).toEqual(records);
  });

  it('picks only specified fields', () => {
    expect(selectFields(records, ['id', 'name'])).toEqual([{ id: 1, name: 'Alice' }]);
  });

  it('ignores fields not present in record', () => {
    expect(selectFields(records, ['id', 'missing'])).toEqual([{ id: 1 }]);
  });
});

describe('toApiResponse', () => {
  it('wraps records with count in meta', () => {
    const records = [{ id: 1 }, { id: 2 }];
    const result = toApiResponse(records);
    expect(result.data).toEqual(records);
    expect(result.meta.count).toBe(2);
  });

  it('merges extra meta fields', () => {
    const result = toApiResponse([], { page: 1, total: 0 });
    expect(result.meta.page).toBe(1);
    expect(result.meta.total).toBe(0);
  });
});
