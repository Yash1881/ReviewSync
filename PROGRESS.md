# ReviewSync — Build Progress & Roadmap

## 📌 Project Overview
A full-stack, AI-powered GitHub Pull Request review tool that supports real-time collaboration and private repository analysis.

---

## ✅ Completed Milestones

### Ring 1: The Foundation (Core Logic)
- [x] **Backend/Frontend Connectivity:** Established a robust proxy between Vite (5173) and Express (3001).
- [x] **GitHub API Integration:** Implemented logic to parse PR URLs and fetch file diffs using the Octokit-style REST API.
- [x] **Custom Diff Parser:** Built a logic engine to transform raw git patches into a structured array of line objects (Added, Removed, Context, Hunk).
- [x] **Unified Diff Viewer:** Developed a specialized UI to render code changes with line numbers and color coding (Red/Green).

### Ring 2: AI Intelligence (Groq Integration)
- [x] **LLM Integration:** Connected the Groq SDK to use Llama 3.3/3.1 models for instant code explanations.
- [x] **Client-Side Caching:** Optimized AI calls by storing explanations in React state to prevent redundant (and expensive) API requests.
- [x] **Markdown Rendering:** Integrated `react-markdown` to ensure AI explanations are readable with proper code blocks and formatting.

### Ring 3: Authentication & Security (GitHub OAuth)
- [x] **OAuth 2.0 Handshake:** Built a secure server-to-server exchange using Client IDs and Secrets.
- [x] **Session Persistence:** Used `localStorage` and `useEffect` to keep users logged in across page refreshes.
- [x] **Bearer Token Strategy:** Implemented dynamic headers to allow the app to access private repositories using the user's own GitHub permissions.

### Ring 4: Real-time Collaboration (WebSockets)
- [x] **Socket.io Integration:** Established a persistent bi-directional connection between the client and server.
- [x] **Room-Based Architecture:** Logic to silo users into specific PR rooms based on the URL (Owner/Repo/Number).
- [x] **Live Presence:** Implemented a real-time viewer count badge with automatic updates on join/disconnect.
- [x] **Real-time Inline Comments:** Developed the ability to click any line of code and post a comment that broadcasts instantly to all active reviewers.
- [x] **Professional UI Polish:** Added a "Code Gutter" styling for line numbers to mimic high-end IDEs like VS Code.

---

## 🚀 Ring 5: Production & Persistence (In Progress)

### Current Goal: The Digital Memory (Database)
- [ ] **Supabase Setup:** Initialize PostgreSQL database for long-term storage.
- [ ] **Comment Persistence:** Update backend to `INSERT` comments into SQL instead of just broadcasting them.
- [ ] **History Fetching:** Logic to `SELECT` and display previous comments when a PR is first opened.
- [ ] **Delete/Edit Comments:** Allow users to manage their own feedback.

### Final Goal: Cloud Deployment (Go Live)
- [ ] **Environment Variable Security:** Finalize `.env` for production.
- [ ] **Frontend Deployment:** Host on **Vercel**.
- [ ] **Backend Deployment:** Host on **Railway** or **Render**.
- [ ] **Database RLS:** Enable Row Level Security to protect user data.

---

## 🛠 Tech Stack Summary
- **Frontend:** React, TypeScript, Vite, Lucide Icons, React Markdown.
- **Backend:** Node.js, Express, Socket.io, Axios, Groq SDK.
- **Database:** Supabase (PostgreSQL).
- **Auth:** GitHub OAuth 2.0.