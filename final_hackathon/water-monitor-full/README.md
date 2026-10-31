# Water Consumption Monitoring System
Node.js + Express + Sequelize (SQL) API and a React (Vite) client.

## Run
```bash
# Terminal 1 - API (http://localhost:5000)
cd server && copy .env.example .env  (Windows)  && npm install && npm run dev

# Terminal 2 - UI (http://localhost:5173)
cd client && npm install && npm run dev
```
SQLite is the default (no setup; sample data is seeded). For MySQL/PostgreSQL set `DB_DIALECT` in `server/.env` and install `mysql2` or `pg pg-hstore`.

## API
| Resource | Endpoints |
|---|---|
| Buildings | `GET/POST /api/buildings`, `GET/PUT/DELETE /api/buildings/:id` |
| Meters | `GET/POST /api/meters` (`?BuildingId=`), `GET/PUT/DELETE /api/meters/:id` |
| Readings | `GET/POST /api/readings` (`?MeterId=`), `GET/PUT/DELETE /api/readings/:id` |
| Consumption | `GET /api/consumption?buildingId=&meterId=&from=&to=` |

Consumption is the difference between consecutive readings of the same meter, grouped by building, meter and month.

## Structure
- server/src: config/ models/ controllers/ (crudFactory + per-resource + consumption) routes/ middleware/ app.js server.js seed.js
- client/src: api.js, components/CrudPage.jsx (reusable CRUD UI), pages/, App.jsx
