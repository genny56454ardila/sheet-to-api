const { querySheet } = require('./index');
const client = require('./client');
const cache = require('./cache');

jest.mock('./client');
jest.mock('./cache');

const mockRawData = {
  values: [
    ['name', 'age', 'city'],
    ['Alice', '30', 'NYC'],
    ['Bob', '25', 'LA'],
    ['Carol', '35', 'NYC'],
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  cache.buildCacheKey.mockReturnValue('key-123');
  cache.getCachedData.mockReturnValue(null);
  cache.setCachedData.mockImplementation(() => {});
  client.getSheetData.mockResolvedValue(mockRawData);
});

describe('querySheet', () => {
  it('returns parsed records from sheet', async () => {
    const result = await querySheet('sheet1', {});
    expect(result.records).toHaveLength(3);
    expect(result.records[0]).toMatchObject({ name: 'Alice' });
  });

  it('returns cached data when available', async () => {
    const cached = { records: [{ name: 'Alice' }], total: 1, page: 1, pageSize: 100 };
    cache.getCachedData.mockReturnValue(cached);

    const result = await querySheet('sheet1', {});
    expect(result.fromCache).toBe(true);
    expect(client.getSheetData).not.toHaveBeenCalled();
  });

  it('filters records by query param', async () => {
    const result = await querySheet('sheet1', { filter: 'city:NYC' });
    expect(result.records.every(r => r.city === 'NYC')).toBe(true);
  });

  it('throws 400 on invalid query params', async () => {
    await expect(querySheet('sheet1', { page: '-1' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 400 on non-numeric page param', async () => {
    await expect(querySheet('sheet1', { page: 'abc' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('stores result in cache after fetch', async () => {
    await querySheet('sheet1', {});
    expect(cache.setCachedData).toHaveBeenCalledWith('key-123', expect.objectContaining({
      sheetId: 'sheet1',
      fromCache: false,
    }));
  });

  it('applies pagination', async () => {
    const result = await querySheet('sheet1', { page: '1', pageSize: '2' });
    expect(result.records).toHaveLength(2);
    expect(result.pageSize).toBe(2);
  });

  it('does not store cached data back into cache', async () => {
    const cached = { records: [{ name: 'Alice' }], total: 1, page: 1, pageSize: 100 };
    cache.getCachedData.mockReturnValue(cached);

    await querySheet('sheet1', {});
    expect(cache.setCachedData).not.toHaveBeenCalled();
  });
});
