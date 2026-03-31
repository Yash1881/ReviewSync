## ReviewSync — Build Progress

**Current Ring:** Ring 1 (Static Full-Stack Foundation)
**Completed:** Days 1–3

**What's built:**
- React + TypeScript frontend (Vite) on localhost:5173
- Express backend on localhost:3001
- Header component with "Login with GitHub" button
- Frontend calls backend /health route and displays response
- Git initialised, Day 3 committed

**Folder structure:**
Desktop/reviewsync/
  frontend/   ← React app, npm run dev → port 5173
  backend/    ← Express server, npm run dev → port 3001

**Day 4 goal:**
Add a text input for GitHub PR URL → backend calls GitHub API → returns real diff data

**Key files:**
- frontend/src/App.tsx — main page, fetch logic, useState
- frontend/src/components/Header.tsx — header bar with login button
- backend/server.js — Express server, /health route