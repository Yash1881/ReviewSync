# ReviewSync

A full-stack GitHub Pull Request review tool built with React, TypeScript, and Node.js.

## What it does

- Paste any public GitHub PR URL and instantly see the diff
- Colour-coded diff viewer (green for additions, red for deletions)
- Line numbers on both old and new file sides
- Collapsible file blocks
- File tree sidebar with smooth scroll
- Loading skeleton while data fetches

## Tech Stack

**Frontend:** React, TypeScript, Vite  
**Backend:** Node.js, Express  
**API:** GitHub REST API  

## Running locally

### Prerequisites
- Node.js installed
- A GitHub Personal Access Token with `repo` scope

### Backend
```bash
cd backend
npm install
echo "GITHUB_TOKEN=your_token_here" > .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` and paste a GitHub PR URL.

## Example PRs to try

- `https://github.com/facebook/react/pull/31000`
- `https://github.com/microsoft/vscode/pull/200000`

## Project Structure

```
reviewsync/
  frontend/        ← React + TypeScript (Vite)
    src/
      components/
        Header.tsx        ← Top navigation bar
        DiffViewer.tsx    ← Line-by-line diff renderer
        FileBlock.tsx     ← Collapsible file section
        Skeleton.tsx      ← Loading skeleton
  backend/         ← Node.js + Express
    server.js      ← API routes, GitHub integration
```