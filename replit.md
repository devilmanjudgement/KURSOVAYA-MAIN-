# КГУ СПОРТ — Web Application

A sports section booking platform for KGU (Kyrgyz State University). Students can browse and sign up for sports sections, and coaches can manage their sections and student applications.

## Architecture

- **Frontend**: React + Vite (port 5000)
- **Backend**: Express.js (port 3001)
- **Database**: SQLite via better-sqlite3 (`web-prilojenie/server/kgusport.db`)

## Project Structure

```
web-prilojenie/
  src/           # React frontend components
  server/        # Express.js backend
    index.js     # Main server entry point
    db.js        # Database schema helper
    kgusport.db  # SQLite database
  vite.config.js # Vite config with proxy to backend
```

## Development

Two workflows run simultaneously:
- **Backend API**: `node web-prilojenie/server/index.js` → port 3001
- **Start application**: `cd web-prilojenie && npm run dev` → port 5000

The Vite dev server proxies `/api` and `/images` requests to the backend on port 3001.

## Key Features

- User registration and login (students and coaches)
- Sports section browsing and search
- Booking/enrollment system
- Coach management panel
- Student profile with health document upload
- Schedule management

## Default Users (seeded on first run)

- Coach accounts: `coach1`, `coach2`, `coach3` (password: `123`)
- Student account: `ivan` (password: `123`)
