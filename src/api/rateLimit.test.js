const { createRateLimiter, resetRateLimits } = require('./rateLimit');

function mockReq(ip = '127.0.0.1') {
  return { ip, connection: { remoteAddress: ip } };
}

function mockRes() {
  const headers = {};
  const res = {
    _status: null,
    _body: null,
    headers,
    set: (key, val) => { headers[key] = val; },
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; }
  };
  return res;
}

beforeEach(() => {
  resetRateLimits();
});

describe('createRateLimiter', () => {
  test('allows requests under the limit', () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60000 });
    const req = mockReq();
    const next = jest.fn();

    for (let i = 0; i < 3; i++) {
      const res = mockRes();
      limiter(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(3);
  });

  test('blocks requests over the limit', () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });
    const req = mockReq();
    const next = jest.fn();

    limiter(req, mockRes(), next);
    limiter(req, mockRes(), next);
    const res = mockRes();
    limiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res._status).toBe(429);
    expect(res._body.error).toBe('Too Many Requests');
  });

  test('sets rate limit headers', () => {
    const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });
    const req = mockReq();
    const res = mockRes();
    limiter(req, res, jest.fn());

    expect(res.headers['X-RateLimit-Limit']).toBe(10);
    expect(res.headers['X-RateLimit-Remaining']).toBe(9);
  });

  test('tracks different IPs independently', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
    const next = jest.fn();

    limiter(mockReq('1.1.1.1'), mockRes(), next);
    limiter(mockReq('2.2.2.2'), mockRes(), next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  test('sets Retry-After header when blocked', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
    const req = mockReq();
    const next = jest.fn();

    limiter(req, mockRes(), next);
    const res = mockRes();
    limiter(req, res, next);

    expect(res.headers['Retry-After']).toBeDefined();
  });
});
