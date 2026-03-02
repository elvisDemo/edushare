# EduShare — School Inventory Management System

A fully standalone Windows desktop application for school inventory management.

## Tech Stack
- Electron + React 18 + Tailwind CSS
- SQLite via better-sqlite3
- i18n: English + Swahili

## Database
Database path: `C:\Users\[user]\AppData\Roaming\EduShare\edushare.db`

Stored in `userData` — always writable, no admin rights required.

## Setup

```bash
npm install
npm run dev        # Start in development mode
npm run test:db    # Test database connection (no Electron needed)
npm run dist       # Build .exe installer
```

## Project Structure
```
edushare/
├── main/
│   ├── main.js          ← Electron entry point
│   ├── preload.js       ← contextBridge IPC API
│   ├── database/
│   │   ├── db.js        ← SQLite connection (userData path)
│   │   └── schema.js    ← All CREATE TABLE statements
│   └── ipc/             ← IPC handlers (Week 2+)
├── renderer/src/        ← React app (Week 1+)
└── scripts/
    └── test-db.js       ← Database connection test
```
