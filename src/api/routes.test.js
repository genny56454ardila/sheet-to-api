const request = require('supertest');
const express = require('express');
const router = require('./routes');

jest.mock('../sheets/client', () => ({
  fetchSheetData: jest.fn(),
}));

const { fetchSheetData } = require('../sheets/client');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('GET /api/sheets/:sheetId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when sheetId is missing', async () => {
    const res = await request(app).get('/api/sheets/ ');
    expect(res.status).toBe(400);
  });

  it('returns 200 with data on success', async () => {
    fetchSheetData.mockResolvedValueOnce([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);

    const res = await request(app).get('/api/sheets/abc123');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it('supports filtering via query params', async () => {
    fetchSheetData.mockResolvedValueOnce([
      { name: 'Alice', city: 'NYC' },
      { name: 'Bob', city: 'LA' },
    ]);

    const res = await request(app).get('/api/sheets/abc123?city=NYC');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alice');
  });

  it('supports pagination via query params', async () => {
    fetchSheetData.mockResolvedValueOnce([
      { id: 1 }, { id: 2 }, { id: 3 },
    ]);

    const res = await request(app).get('/api/sheets/abc123?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.totalPages).toBe(2);
  });

  it('returns 500 when fetching sheet data fails', async () => {
    fetchSheetData.mockRejectedValueOnce(new Error('API error'));

    const res = await request(app).get('/api/sheets/abc123');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
