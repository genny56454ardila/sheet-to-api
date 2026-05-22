const { handleSheetRequest } = require('./handler');
const { fetchSheetData } = require('../sheets/client');
const { getCachedData, setCachedData } = require('../sheets/cache');

jest.mock('../sheets/client');
jest.mock('../sheets/cache');

const mockReq = (params = {}, query = {}) => ({ params, query });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const RAW_DATA = [
  ['name', 'age', 'city'],
  ['Alice', '30', 'New York'],
  ['Bob', '25', 'London'],
];

beforeEach(() => {
  jest.clearAllMocks();
  getCachedData.mockReturnValue(null);
  setCachedData.mockImplementation(() => {});
});

test('returns 400 if sheetId is missing', async () => {
  const req = mockReq({}, {});
  const res = mockRes();
  await handleSheetRequest(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
});

test('fetches and returns parsed sheet data', async () => {
  fetchSheetData.mockResolvedValue(RAW_DATA);
  const req = mockReq({ sheetId: 'abc123', range: 'Sheet1' }, {});
  const res = mockRes();
  await handleSheetRequest(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  const json = res.json.mock.calls[0][0];
  expect(json.data).toHaveLength(2);
  expect(json.meta.total).toBe(2);
});

test('uses cached data when available', async () => {
  const cached = [{ name: 'Alice', age: 30, city: 'New York' }];
  getCachedData.mockReturnValue(cached);
  const req = mockReq({ sheetId: 'abc123', range: 'Sheet1' }, {});
  const res = mockRes();
  await handleSheetRequest(req, res);
  expect(fetchSheetData).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
});

test('returns 500 on fetch error', async () => {
  fetchSheetData.mockRejectedValue(new Error('API failure'));
  const req = mockReq({ sheetId: 'abc123', range: 'Sheet1' }, {});
  const res = mockRes();
  await handleSheetRequest(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
});
