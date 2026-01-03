# LLM Memory for Sunday School Attendance System

## Project Overview
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL (Supabase)
- **Purpose:** Manage student check-in, attendance, and name tag printing for a Sunday school.

## Key Files
- **Main Component:** `src/App.tsx` (handles routing and auth state)
- **API Client:** `src/utils/database.ts` (contains all frontend-to-backend communication and printing logic)
- **Backend Server:** `server/index.js` (Express server, API endpoints, database queries)
- **UI Components:** `src/components/` (includes custom `ConfirmModal` and `PasswordConfirmModal`)

## Core Logic
- **Authentication:** Two-tiered (teacher and admin). A secret token is used for API requests.
- **Printing:** Handled by `printNameTag` in `database.ts`. It detects the user's device (Android, iOS, Desktop) and calls a specific function for each.
- **Data Flow:** React components call functions in `database.ts`, which use `fetch` to call the Express API in `server/index.js`.
- **UI Standards:** 
  - Standard container padding: `p-8` (32px).
  - Standard max-width: `max-w-7xl`.
  - Responsive text: Uses `clamp()` functions for titles and buttons (e.g., `text-[clamp(1.25rem,4vw,1.875rem)]`).

## Database Schema
- **Students Table**: `id`, `nickname` (optional), `firstName`, `lastName`, `dateOfBirth`, `grade`, `parentName`, `parentPhone`, `medicalNotes`, `createdAt`.
- **Attendance Records**: `id`, `studentId`, `sessionTime`, `checkinTimestamp`.

## Local Development
- Requires a `server/.env` file containing `DATABASE_URL`, `TEACHER_PASSWORD`, `ADMIN_PASSWORD`, `ADMIN_SECRET_HEADER`, and `CLEAR_DATA_PASSWORD`.
- Server uses `dotenv` to load these variables.

## User Preferences
- Prefers the "safe approach" to development.
- Likes spacious, professional UI (`p-8` padding) and responsive typography.
