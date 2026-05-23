const { parseApiKeys, loadAuthConfig } = require('./auth');

describe('parseApiKeys', () => {
  it('parses comma-separated keys', () => {
    expect(parseApiKeys('key1,key2,key3')).toEqual(['key1', 'key2', 'key3']);
  });

  it('trims whitespace around keys', () => {
    expect(parseApiKeys(' key1 , key2 ')).toEqual(['key1', 'key2']);
  });

  it('filters empty entries', () => {
    expect(parseApiKeys('key1,,key2')).toEqual(['key1', 'key2']);
  });

  it('returns empty array for empty string', () => {
    expect(parseApiKeys('')).toEqual([]);
  });

  it('returns empty array for null', () => {
    expect(parseApiKeys(null)).toEqual([]);
  });

  it('returns single key', () => {
    expect(parseApiKeys('only-one')).toEqual(['only-one']);
  });
});

describe('loadAuthConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns enabled=false when no API_KEYS set', () => {
    delete process.env.API_KEYS;
    const config = loadAuthConfig();
    expect(config.enabled).toBe(false);
    expect(config.apiKeys).toEqual([]);
  });

  it('returns enabled=true when API_KEYS are set', () => {
    process.env.API_KEYS = 'key1,key2';
    const config = loadAuthConfig();
    expect(config.enabled).toBe(true);
    expect(config.apiKeys).toEqual(['key1', 'key2']);
  });

  it('respects AUTH_ENABLED=false override', () => {
    process.env.API_KEYS = 'key1';
    process.env.AUTH_ENABLED = 'false';
    const config = loadAuthConfig();
    expect(config.enabled).toBe(false);
  });
});
