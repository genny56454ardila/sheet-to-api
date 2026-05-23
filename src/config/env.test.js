const { loadEnvConfig, parsePositiveInt } = require('./env');

describe('parsePositiveInt', () => {
  it('parses a valid positive integer string', () => {
    expect(parsePositiveInt('42', 10)).toBe(42);
  });

  it('returns fallback for zero', () => {
    expect(parsePositiveInt('0', 10)).toBe(10);
  });

  it('returns fallback for negative numbers', () => {
    expect(parsePositiveInt('-5', 10)).toBe(10);
  });

  it('returns fallback for non-numeric strings', () => {
    expect(parsePositiveInt('abc', 99)).toBe(99);
  });

  it('returns fallback for undefined', () => {
    expect(parsePositiveInt(undefined, 7)).toBe(7);
  });
});

describe('loadEnvConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns defaults when no env vars are set', () => {
    delete process.env.PORT;
    delete process.env.CACHE_TTL_SECONDS;
    delete process.env.RATE_LIMIT_MAX;
    delete process.env.RATE_LIMIT_WINDOW_SECONDS;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    delete process.env.NODE_ENV;

    const config = loadEnvConfig();
    expect(config.port).toBe(3000);
    expect(config.cacheTtl).toBe(300);
    expect(config.rateLimitMax).toBe(100);
    expect(config.rateLimitWindow).toBe(60);
    expect(config.googleCredentials).toBeNull();
    expect(config.nodeEnv).toBe('development');
    expect(config.isProduction).toBe(false);
  });

  it('reads values from env vars', () => {
    process.env.PORT = '8080';
    process.env.CACHE_TTL_SECONDS = '600';
    process.env.RATE_LIMIT_MAX = '50';
    process.env.RATE_LIMIT_WINDOW_SECONDS = '30';
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{"type":"service_account"}';
    process.env.NODE_ENV = 'production';

    const config = loadEnvConfig();
    expect(config.port).toBe(8080);
    expect(config.cacheTtl).toBe(600);
    expect(config.rateLimitMax).toBe(50);
    expect(config.rateLimitWindow).toBe(30);
    expect(config.googleCredentials).toBe('{"type":"service_account"}');
    expect(config.isProduction).toBe(true);
  });

  it('includes warnings when critical env vars are missing', () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    delete process.env.API_KEYS;

    const config = loadEnvConfig();
    expect(config.warnings.length).toBeGreaterThanOrEqual(2);
    expect(config.warnings.some(w => w.includes('GOOGLE_SERVICE_ACCOUNT_JSON'))).toBe(true);
    expect(config.warnings.some(w => w.includes('API_KEYS'))).toBe(true);
  });

  it('has no warnings when required env vars are present', () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = '{}';
    process.env.API_KEYS = 'key1,key2';

    const config = loadEnvConfig();
    expect(config.warnings).toHaveLength(0);
  });
});
