## ReviewSync — Build Progress

**Current Ring:** Ring 4 (Collaboration - WebSockets)
**Completed:** Rings 1, 2, 3 complete

**What's built:**
- React + TypeScript frontend (Vite) on localhost:5173
- Express backend on localhost:3001
- GitHub PR URL input → GitHub API → PR data + file diffs
- Colour-coded diff viewer with line numbers
- Collapsible FileBlock component
- File tree sidebar with smooth scroll
- Loading skeleton with shimmer animation
- AI explanation via Groq API (llama-3.3 or gpt-oss-120b)
- react-markdown rendering for AI responses
- GitHub OAuth — Login with GitHub works
- User avatar and username in header
- Logout button
- Token passed with PR requests (private repo support)
- Professional GitHub dark theme UI

**Repo:** https://github.com/Yash1881/ReviewSync

**Ring 4 goal:**
WebSockets — real-time collaboration on same PR

**Environment variables:**
backend/.env: GITHUB_TOKEN, GROQ_API_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

**Key files:**
- frontend/src/App.tsx
- frontend/src/components/Header.tsx
- frontend/src/components/DiffViewer.tsx
- frontend/src/components/FileBlock.tsx
- frontend/src/components/Skeleton.tsx
- backend/server.js