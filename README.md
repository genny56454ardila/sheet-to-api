# sheet-to-api

> Converts Google Sheets data into a simple REST API endpoint with optional filtering and pagination.

## Installation

```bash
npm install sheet-to-api
```

## Usage

```javascript
const sheetToApi = require('sheet-to-api');

const api = sheetToApi({
  sheetId: 'YOUR_GOOGLE_SHEET_ID',
  apiKey: 'YOUR_GOOGLE_API_KEY',
  port: 3000
});

api.start();
// Server running at http://localhost:3000/api/data
```

Once running, query your sheet data via HTTP:

```bash
# Fetch all rows
GET /api/data

# Filter by column value
GET /api/data?status=active

# Pagination
GET /api/data?page=2&limit=25
```

The first row of your Google Sheet is automatically treated as the column headers and used as query parameter keys for filtering.

## Configuration

| Option   | Type   | Description                        |
|----------|--------|------------------------------------|
| sheetId  | string | Google Sheets document ID          |
| apiKey   | string | Google API key with Sheets access  |
| port     | number | Port to run the server on          |

## Requirements

- Node.js v14+
- A publicly accessible Google Sheet or valid API credentials

## License

[MIT](LICENSE)