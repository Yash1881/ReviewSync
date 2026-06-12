## ReviewSync — Build Progress

**Current Ring:** Ring 1 (Static Full-Stack Foundation)
**Completed:** Days 1–5

**What's built:**
- React + TypeScript frontend (Vite) on localhost:5173
- Express backend on localhost:3001
- Header component with "Login with GitHub" button
- Frontend calls backend /health route and displays response
- GitHub PR URL text input on frontend
- Backend /api/pr route that calls GitHub's API
- Parses PR URL into owner, repo, pull_number
- Displays PR title, author, state, changed files, additions, deletions
- GitHub personal access token stored in .env
- Backend fetches actual file diffs from GitHub API
- Frontend displays files changed with patch/diff content
- Git initialised, Days 1–5 committed

**Folder structure:**
Desktop/reviewsync/
  frontend/   ← React app, npm run dev → port 5173
  backend/    ← Express server, npm run dev → port 3001

**Day 6 goal:**
Build a proper diff viewer — color code the + and - lines green and red

**Key files:**
- frontend/src/App.tsx — main page, PR URL input, fetch logic, useState, parsePrUrl, diff display
- frontend/src/components/Header.tsx — header bar with login button
- backend/server.js — Express server, /health route, /api/pr route with token auth and file diffs

**Key concepts learned:**
- req.query — reads query parameters from a URL in Express
- Query string — the ?key=value&key=value part of a URL
- localhost vs external domains — localhost stays on your machine
- Ports — different programs listen on different port numbers
- Unauthenticated vs authenticated GitHub API calls
- split('/') for URL parsing and array indexing
- Multiple useState variables working together (input, data, loading, error)
- finally block — runs whether request succeeded or failed
- Conditional rendering with && in JSX
- Template literals for building URLs dynamically
- .env files — storing secrets outside your code
- process.env — how Node.js reads environment variables
- Bearer token authentication — standard HTTP auth format
- Unified diff format — @@ headers, + added lines, - removed lines
- .map() on arrays in JSX to render lists of components