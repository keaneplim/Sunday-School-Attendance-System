# LLM Memory for Sunday School Attendance System

## Project Overview
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **Purpose:** Manage student check-in, attendance, and name tag printing for a Sunday school.

## Key Files
- **Main Component:** `src/App.tsx` (handles routing and auth state)
- **API Client:** `src/utils/database.ts` (contains all frontend-to-backend communication and printing logic)
- **Backend Server:** `server/index.js` (Express server, API endpoints, database queries)
- **UI Components:** `src/components/`

## Core Logic
- **Authentication:** Two-tiered (teacher and admin). A secret token is used for API requests.
- **Printing:** Handled by `printNameTag` in `database.ts`. It detects the user's device (Android, iOS, Desktop) and calls a specific function for each.
  - **Android:** Now uses `printNameTagAndroidDirect` for immediate printing.
  - **Desktop:** Uses `printNameTagDesktop` with an iframe.
- **Data Flow:** React components call functions in `database.ts`, which use `fetch` to call the Express API in `server/index.js`.

## User Preferences
- Prefers the "safe approach" to development, keeping working code as a fallback when implementing new, potentially less reliable features.
