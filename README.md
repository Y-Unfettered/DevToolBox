# DevToolBox

Backend API for managing tool entries (title, summary, icon, category, url).

## Quick start
1) Install deps

```bash
npm install
```

2) Run the API

```bash
npm run start
```

The server starts on `http://localhost:3000` by default.

## Environment variables
- `PORT`: server port (default: 3000)
- `DB_PATH`: path to sqlite file (default: `data/devtoolbox.db`)
- `DATA_DIR`: folder for db file (default: `data/`)

## API
### Health
- `GET /api/health`

### Tools
- `GET /api/tools` (query: `q`, `category`, `limit`, `offset`)
- `GET /api/tools/:id`
- `POST /api/tools`
- `PUT /api/tools/:id`
- `DELETE /api/tools/:id`

### Example payload
```json
{
  "title": "Postman",
  "summary": "API testing and collaboration",
  "icon": "https://example.com/postman.png",
  "category": "API",
  "url": "https://www.postman.com/"
}
```