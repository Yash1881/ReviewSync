## ReviewSync — Build Progress

**Current Ring:** Ring 1 (Static Full-Stack Foundation)
**Completed:** Days 1–7

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
- DiffViewer component with colour coded lines (green/red/blue)
- Line numbers on both old and new sides, exactly like GitHub
- parsePatch function that tracks line counters through the diff
- Git history clean, node_modules untracked

**Folder structure:**
Desktop/reviewsync/
  frontend/   ← React app, npm run dev → port 5173
  backend/    ← Express server, npm run dev → port 3001

**Day 8 goal:**
Add a file tree sidebar — list all changed files on the left, click a file to jump to its diff

**Key files:**
- frontend/src/App.tsx — main page, PR URL input, fetch logic, useState, parsePrUrl
- frontend/src/components/Header.tsx — header bar with login button
- frontend/src/components/DiffViewer.tsx — line-by-line diff renderer with line numbers
- backend/server.js — Express server, /health, /api/pr with token auth and file diffs

**Key concepts learned:**
- req.query — reads query parameters from a URL in Express
- Query string — the ?key=value part of a URL
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
- Unified diff format — @@ headers, + added, - removed lines
- .map() on arrays in JSX to render lists of components
- Regular expressions — pattern matching to extract numbers from @@ header
- Nullish coalescing (??) — fallback when a value is null
- Type unions in TypeScript — 'added' | 'removed' | 'context' | 'hunk'
- Git submodule problem and how to fix it with git rm --cached