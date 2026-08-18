## ReviewSync — Build Progress

**Current Ring:** Ring 4 (Collaboration)
**Completed:** Days 1–16 (Rings 1–3 complete)

**What's built:**
- React + TypeScript frontend (Vite) on localhost:5173
- Express backend on localhost:3001
- GitHub PR URL input → calls GitHub API → returns PR data
- Colour-coded diff viewer with line numbers (green/red/blue)
- File tree sidebar with smooth scroll
- Collapsible FileBlock component with local useState
- Loading skeleton with shimmer animation
- Specific error messages (404, 401, 403)
- Pushed to GitHub with README
- Groq AI API integrated (/api/explain POST route)
- "Explain this diff" button on each FileBlock
- react-markdown renders AI explanation properly
- GitHub OAuth — Login with GitHub works
- Token saved to localStorage
- User avatar and username shown in header after login
- Logout button clears token
- Token passed with every PR request (supports private repos)

**Repo:** https://github.com/Yash1881/ReviewSync

**Ring 4 goal:**
WebSockets — multiple people on same PR, inline comments on diff lines

**Key files:**
- frontend/src/App.tsx
- frontend/src/components/Header.tsx
- frontend/src/components/DiffViewer.tsx
- frontend/src/components/FileBlock.tsx
- frontend/src/components/Skeleton.tsx
- backend/server.js

**Backend routes:**
- GET /health
- GET /api/pr?owner=&repo=&pull_number=
- POST /api/explain (body: { filename, patch })
- GET /api/auth/github
- GET /api/auth/callback

**Environment variables needed:**
- backend/.env: GITHUB_TOKEN, GROQ_API_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

**Key concepts learned:**
- req.query, req.body — GET vs POST data
- Query string, template literals
- useState, useEffect, async/await
- localStorage — storing data in browser
- Conditional rendering with ternary operator
- OAuth flow — code exchange for token
- Bearer token authentication
- GitHub REST API
- Flexbox layout, local component state
- CSS keyframe animations
- HTTP status codes
- Git remote, pushing to GitHub
- react-markdown for AI responses
- WebSockets (coming in Ring 4)