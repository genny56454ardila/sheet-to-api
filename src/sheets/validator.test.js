const { validatePagination, validateFilterParam, validateQueryParams, VALID_OPERATORS } = require('./validator');

describe('validatePagination', () => {
  it('returns valid for undefined inputs', () => {
    expect(validatePagination()).toEqual({ valid: true, errors: [] });
  });

  it('accepts valid page and pageSize', () => {
    expect(validatePagination({ page: '2', pageSize: '50' })).toEqual({ valid: true, errors: [] });
  });

  it('rejects page less than 1', () => {
    const result = validatePagination({ page: '0' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/page/);
  });

  it('rejects pageSize greater than 1000', () => {
    const result = validatePagination({ pageSize: '1001' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/pageSize/);
  });

  it('rejects non-integer page', () => {
    const result = validatePagination({ page: 'abc' });
    expect(result.valid).toBe(false);
  });

  it('rejects pageSize of 0', () => {
    const result = validatePagination({ pageSize: '0' });
    expect(result.valid).toBe(false);
  });
});

describe('validateFilterParam', () => {
  it('accepts field:value format', () => {
    expect(validateFilterParam('name:Alice')).toEqual({ valid: true, errors: [] });
  });

  it('accepts field:operator:value format', () => {
    expect(validateFilterParam('age:gte:30')).toEqual({ valid: true, errors: [] });
  });

  it('rejects unknown operator', () => {
    const result = validateFilterParam('age:between:10');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/operator/);
  });

  it('rejects empty string', () => {
    const result = validateFilterParam('');
    expect(result.valid).toBe(false);
  });

  it('rejects too many parts', () => {
    const result = validateFilterParam('a:b:c:d');
    expect(result.valid).toBe(false);
  });

  it('exports all expected operators', () => {
    expect(VALID_OPERATORS).toContain('eq');
    expect(VALID_OPERATORS).toContain('contains');
  });
});

describe('validateQueryParams', () => {
  it('returns valid for empty query', () => {
    expect(validateQueryParams({})).toEqual({ valid: true, errors: [] });
  });

  it('collects errors from pagination and filters', () => {
    const result = validateQueryParams({ page: '-1', filter: 'age:between:5' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('handles array of filters', () => {
    const result = validateQueryParams({ filter: ['name:Alice', 'age:gte:20'] });
    expect(result.valid).toBe(true);
  });

  it('handles single filter string', () => {
    const result = validateQueryParams({ filter: 'status:eq:active' });
    expect(result.valid).toBe(true);
  });
});
