const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function getAuthClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  let keyFile;
  try {
    keyFile = JSON.parse(credentials);
  } catch (err) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: keyFile,
    scopes: SCOPES,
  });

  return auth.getClient();
}

async function fetchSheetData(spreadsheetId, range = 'Sheet1') {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const data = rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] !== undefined ? row[index] : null;
    });
    return record;
  });

  return data;
}

module.exports = { fetchSheetData };
