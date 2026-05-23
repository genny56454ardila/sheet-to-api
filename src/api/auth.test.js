const { extractApiKey, isValidApiKey, createAuthMiddleware } = require('./auth');

describe('extractApiKey', () => {
  it('extracts key from header', () => {
    const req = { headers: { 'x-api-key': 'abc123' }, query: {} };
    expect(extractApiKey(req)).toBe('abc123');
  });

  it('extracts key from query param', () => {
    const req = { headers: {}, query: { api_key: 'xyz789' } };
    expect(extractApiKey(req)).toBe('xyz789');
  });

  it('prefers header over query param', () => {
    const req = { headers: { 'x-api-key': 'header-key' }, query: { api_key: 'query-key' } };
    expect(extractApiKey(req)).toBe('header-key');
  });

  it('returns null when no key present', () => {
    const req = { headers: {}, query: {} };
    expect(extractApiKey(req)).toBeNull();
  });
});

describe('isValidApiKey', () => {
  const validKeys = ['key1', 'key2', 'key3'];

  it('returns true for valid key', () => {
    expect(isValidApiKey('key1', validKeys)).toBe(true);
  });

  it('returns false for invalid key', () => {
    expect(isValidApiKey('bad-key', validKeys)).toBe(false);
  });

  it('returns false for null key', () => {
    expect(isValidApiKey(null, validKeys)).toBe(false);
  });

  it('returns false when validKeys is empty', () => {
    expect(isValidApiKey('key1', [])).toBe(false);
  });

  it('returns false when validKeys is not an array', () => {
    expect(isValidApiKey('key1', null)).toBe(false);
  });
});

describe('createAuthMiddleware', () => {
  const mockNext = jest.fn();
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next when auth is disabled', () => {
    const middleware = createAuthMiddleware({ enabled: false });
    const req = { headers: {}, query: {} };
    middleware(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('calls next with valid api key', () => {
    const middleware = createAuthMiddleware({ apiKeys: ['valid-key'], enabled: true });
    const req = { headers: { 'x-api-key': 'valid-key' }, query: {} };
    middleware(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('returns 401 with invalid api key', () => {
    const middleware = createAuthMiddleware({ apiKeys: ['valid-key'], enabled: true });
    const req = { headers: { 'x-api-key': 'wrong-key' }, query: {} };
    middleware(req, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized' }));
    expect(mockNext).not.toHaveBeenCalled();
  });
});
