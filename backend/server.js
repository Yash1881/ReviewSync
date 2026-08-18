require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios');

const app = express()
const PORT = 3001

// Get IDs from .env file
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

app.use(cors())
app.use(express.json())

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReviewSync backend is running' })
})

// PR Fetching Route
app.get('/api/pr', async (req, res) => {
  const { owner, repo, pull_number } = req.query;

  const authHeader = req.headers.authorization;
  const userToken = authHeader && authHeader.split(' ')[1];
  const tokenToUse = userToken || process.env.GITHUB_TOKEN;

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
          'Authorization': `Bearer ${tokenToUse}`
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) return res.status(404).json({ error: 'PR not found.' });
      if (response.status === 401) return res.status(401).json({ error: 'Invalid token.' });
      if (response.status === 403) return res.status(403).json({ error: 'Access denied.' });
      return res.status(response.status).json({ error: `GitHub API error (${response.status})` });
    }

    const data = await response.json();

    const filesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'ReviewSync',
          'Authorization': `Bearer ${tokenToUse}`
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

// AI Explanation Route
app.post('/api/explain', async (req, res) => {
  const { filename, patch } = req.body

  if (!filename || !patch) {
    return res.status(400).json({ error: 'Missing filename or patch' })
  }

  try {
    const Groq = require('groq-sdk')
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const completion = await groq.chat.completions.create({
      // Mixtral is a very stable model that rarely gets decommissioned
     model: 'openai/gpt-oss-120b', 
      messages: [
        {
          role: 'system',
          content: 'You are a senior developer. Explain this code change in 2 sentences.'
        },
        {
          role: 'user',
          content: `File: ${filename}\nDiff: ${patch}`
        }
      ]
    });

    const text = completion.choices[0].message.content
    res.json({ explanation: text })

  } catch (err) {
    // Improved error logging to catch exact API issues
    console.log('Explain error details:', err.response?.data || err.message)
    res.status(500).json({ error: 'AI explanation failed', message: err.message })
  }
})

// OAuth Route 1: Start login
app.get('/api/auth/github', (req, res) => {
  const redirectUri = 'http://localhost:3001/api/auth/callback';
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo`;
  res.redirect(githubUrl);
});

// OAuth Route 2: Receive callback
app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = response.data.access_token;
    res.redirect(`http://localhost:5173?token=${accessToken}`);
  } catch (error) {
    console.error("Auth Callback Error:", error.message);
    res.status(500).send("Login failed");
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})