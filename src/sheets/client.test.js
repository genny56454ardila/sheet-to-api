const { fetchSheetData } = require('./client');

jest.mock('googleapis', () => {
  const mockGet = jest.fn();
  return {
    google: {
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({
          getClient: jest.fn().mockResolvedValue({}),
        })),
      },
      sheets: jest.fn().mockReturnValue({
        spreadsheets: {
          values: { get: mockGet },
        },
      }),
      __mockGet: mockGet,
    },
  };
});

const { google } = require('googleapis');

beforeEach(() => {
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({ type: 'service_account' });
  google.__mockGet.mockReset();
});

describe('fetchSheetData', () => {
  test('returns empty array when sheet has no rows', async () => {
    google.__mockGet.mockResolvedValue({ data: { values: [] } });
    const result = await fetchSheetData('spreadsheet-id');
    expect(result).toEqual([]);
  });

  test('returns empty array when values is undefined', async () => {
    google.__mockGet.mockResolvedValue({ data: {} });
    const result = await fetchSheetData('spreadsheet-id');
    expect(result).toEqual([]);
  });

  test('maps headers and rows into objects', async () => {
    google.__mockGet.mockResolvedValue({
      data: {
        values: [
          ['Name', 'Age', 'City'],
          ['Alice', '30', 'NYC'],
          ['Bob', '25', 'LA'],
        ],
      },
    });
    const result = await fetchSheetData('spreadsheet-id');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'Alice', age: '30', city: 'NYC' });
    expect(result[1]).toEqual({ name: 'Bob', age: '25', city: 'LA' });
  });

  test('fills missing cells with null', async () => {
    google.__mockGet.mockResolvedValue({
      data: {
        values: [
          ['Name', 'Age'],
          ['Alice'],
        ],
      },
    });
    const result = await fetchSheetData('spreadsheet-id');
    expect(result[0]).toEqual({ name: 'Alice', age: null });
  });

  test('throws when GOOGLE_SERVICE_ACCOUNT_KEY is missing', async () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    await expect(fetchSheetData('id')).rejects.toThrow('GOOGLE_SERVICE_ACCOUNT_KEY');
  });
});
