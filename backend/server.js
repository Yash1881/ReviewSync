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
  if (response.status === 404) {
    return res.status(404).json({ error: 'PR not found. Check the URL and try again.' });
  }
  if (response.status === 401) {
    return res.status(401).json({ error: 'GitHub token is invalid or expired.' });
  }
  if (response.status === 403) {
    return res.status(403).json({ error: 'Access denied. This repo may be private.' });
  }
  return res.status(response.status).json({ error: `GitHub API error (${response.status})` });
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
app.post('/api/explain', async (req, res) => {
  const { filename, patch } = req.body

  if (!filename || !patch) {
    return res.status(400).json({ error: 'Missing filename or patch' })
  }

  try {
    const Groq = require('groq-sdk')
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
     model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a senior software engineer reviewing a pull request. Be concise and clear.'
        },
        {
          role: 'user',
          content: `File changed: ${filename}

Here is the diff:
${patch}

Explain this code change in simple terms:
1. What was changed?
2. Why was it likely changed?
3. Any potential issues or things to watch out for?`
        }
      ]
    })

    const text = completion.choices[0].message.content
    res.json({ explanation: text })

  } catch (err) {
    console.log('Explain error:', err.message)
    res.status(500).json({ error: 'AI explanation failed', message: err.message })
  }
})