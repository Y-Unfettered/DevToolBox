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

## Static export (GitHub Pages)
1) Use the admin UI locally to edit data.
2) Export the latest data to a JSON file:

```bash
npm run export
```

This creates `data/devtoolbox.json` for the static `index.html` to consume.
You can also click "生成 JSON" in `admin.html` to write `data/devtoolbox.json`, then commit the file.

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
