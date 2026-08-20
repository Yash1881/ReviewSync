require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios');

const http = require('http'); 
const { Server } = require('socket.io');

const app = express()
const PORT = 3001

const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow your React app to connect
    methods: ["GET", "POST"]
  }
});

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

  // --- CHANGE THIS LINE ---
  // We check if userToken exists AND is not the literal string "null"
  const tokenToUse = (userToken && userToken !== 'null' && userToken !== 'undefined') 
    ? userToken 
    : process.env.GITHUB_TOKEN;
  // ------------------------

  if (!owner || !repo || !pull_number) {
    return res.status(400).json({ error: 'Missing owner, repo, or pull_number' });
  }
  
  // ... rest of the code stays the same

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

// --- PASTE AT THE VERY BOTTOM ---
io.on('connection', (socket) => {
  // Listen for new comments
 socket.on('send-comment', (data) => {
  // 1. LOG: Did the server even receive the message?
  console.log("SERVER RECEIVED COMMENT:", data);

  // 2. Broadcast to the room
  // This sends it to everyone in 'data.prId' EXCEPT the sender
  socket.to(data.prId).emit('receive-comment', {
    lineIndex: data.lineIndex,
    text: data.text
  });
  
  console.log(`Relaying comment to room: ${data.prId}`);
});
  });
  

io.on('connection', (socket) => {
  console.log('A user connected with ID:', socket.id);

  // --- ALL socket.on LISTENERS MUST BE INSIDE THIS BLOCK ---

  // 1. When a user joins a specific PR room
  socket.on('join-pr', (prId) => {
    socket.join(prId);
    
    // Logic to count people in this room
    const clients = io.sockets.adapter.rooms.get(prId);
    const numClients = clients ? clients.size : 0;

    // Shout to everyone in the room what the new count is
    io.to(prId).emit('update-viewer-count', numClients);
    console.log(`Room: ${prId} | Total Viewers: ${numClients}`);
  });

  // 2. When a user posts a comment
 socket.on('send-comment', (data) => {
  // data contains { prId, lineIndex, text }
  console.log(`COMMENT RECEIVED FOR ROOM: ${data.prId}`);

  // Use io.to() to shout to EVERYONE in the room including the sender
  // Or socket.to() to shout to everyone EXCEPT the sender
  // We will use io.to() and change the frontend to handle it better
  io.to(data.prId).emit('receive-comment', {
    lineIndex: data.lineIndex,
    text: data.text
  });
    console.log("Relayed comment for line:", data.lineIndex);
  });

  // 3. Optional: Real-time "Activity" message
  socket.on('send-activity', (data) => {
    socket.to(data.prId).emit('new-activity', data.message);
  });

  // When the user closes the tab
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // --- END OF THE CONNECTED USER'S LOGIC ---
});

// Finally, start the server
server.listen(PORT, () => {
  console.log(`ReviewSync Server running on http://localhost:${PORT}`);
});