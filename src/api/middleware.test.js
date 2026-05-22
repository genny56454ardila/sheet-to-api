const { validateSheetId, requestLogger } = require('./middleware');

const mockNext = jest.fn();
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.on = jest.fn();
  return res;
};

beforeEach(() => jest.clearAllMocks());

test('validateSheetId passes valid sheetId', () => {
  const req = { params: { sheetId: 'abc123XYZ_-abcdefghij' } };
  const res = mockRes();
  validateSheetId(req, res, mockNext);
  expect(mockNext).toHaveBeenCalled();
});

test('validateSheetId rejects missing sheetId', () => {
  const req = { params: {} };
  const res = mockRes();
  validateSheetId(req, res, mockNext);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(mockNext).not.toHaveBeenCalled();
});

test('validateSheetId rejects too-short sheetId', () => {
  const req = { params: { sheetId: 'short' } };
  const res = mockRes();
  validateSheetId(req, res, mockNext);
  expect(res.status).toHaveBeenCalledWith(400);
});

test('validateSheetId rejects sheetId with invalid chars', () => {
  const req = { params: { sheetId: 'abc!@#$%^&*()abcdefghijklmno' } };
  const res = mockRes();
  validateSheetId(req, res, mockNext);
  expect(res.status).toHaveBeenCalledWith(400);
});

test('requestLogger attaches finish listener', () => {
  const req = { method: 'GET', originalUrl: '/api/sheets/abc' };
  const res = mockRes();
  requestLogger(req, res, mockNext);
  expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  expect(mockNext).toHaveBeenCalled();
});
