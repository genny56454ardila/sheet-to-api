const {
  filterRecords,
  paginateRecords,
  applyFilterAndPagination,
} = require('./filter');

const records = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
  { name: 'Charlie', age: 35, city: 'NYC' },
  { name: 'Diana', age: 28, city: 'Chicago' },
  { name: 'Eve', age: 30, city: 'LA' },
];

describe('filterRecords', () => {
  it('returns all records when no filters provided', () => {
    expect(filterRecords(records, {})).toHaveLength(5);
  });

  it('filters by a single field', () => {
    const result = filterRecords(records, { city: 'NYC' });
    expect(result).toHaveLength(2);
    expect(result.every(r => r.city === 'NYC')).toBe(true);
  });

  it('filters by multiple fields', () => {
    const result = filterRecords(records, { city: 'LA', age: 30 });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Eve');
  });

  it('returns empty array when no records match', () => {
    const result = filterRecords(records, { city: 'Boston' });
    expect(result).toHaveLength(0);
  });

  it('returns empty array when given empty records', () => {
    const result = filterRecords([], { city: 'NYC' });
    expect(result).toHaveLength(0);
  });
});

describe('paginateRecords', () => {
  it('returns first page with default limit', () => {
    const result = paginateRecords(records, 1, 2);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
  });

  it('returns correct second page', () => {
    const result = paginateRecords(records, 2, 2);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Charlie');
  });

  it('returns remaining items on last page', () => {
    const result = paginateRecords(records, 3, 2);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Eve');
  });

  it('returns empty array for out-of-range page', () => {
    const result = paginateRecords(records, 10, 2);
    expect(result).toHaveLength(0);
  });

  it('returns all records when limit exceeds total count', () => {
    const result = paginateRecords(records, 1, 100);
    expect(result).toHaveLength(5);
  });
});

describe('applyFilterAndPagination', () => {
  it('filters and paginates together', () => {
    const result = applyFilterAndPagination(records, { city: 'NYC' }, { page: 1, limit: 1 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
  });

  it('includes pagination metadata', () => {
    const result = applyFilterAndPagination(records, {}, { page: 2, limit: 2 });
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
  });
});
