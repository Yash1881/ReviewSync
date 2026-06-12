require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReviewSync backend is running' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})

app.get('/api/pr', async (req, res) => {
  const { owner, repo, pull_number } = req.query;

  if (!owner || !repo || !pull_number) {
    return res.status(400).json({ error: 'Missing owner, repo, or pull_number' });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'ReviewSync',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'GitHub API error' });
    }

    const data = await response.json();

    const filesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'ReviewSync',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    const filesData = await filesResponse.json();

    res.json({
      title: data.title,
      author: data.user.login,
      state: data.state,
      body: data.body,
      changed_files: data.changed_files,
      additions: data.additions,
      deletions: data.deletions,
      html_url: data.html_url,
      files: filesData.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});