require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
// This tells the app: Use Railway's port if available, otherwise use 3001
const PORT = process.env.PORT || 3001;
const server = http.createServer(app)
const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    methods: ["GET", "POST"] 
  }
});

const CLIENT_ID = process.env.GITHUB_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

app.use(cors())
app.use(express.json())

// HELPER: Fixes the 'owner/repo/pull/number' format for the database
const cleanId = (id) => {
  if (!id) return ''
  if (id.includes('github.com')) {
    const parts = new URL(id).pathname.split('/')
    return `${parts[1]}/${parts[2]}/${parts[4]}`
  }
  return id.replace('/pull/', '/')
}

app.get('/api/pr', async (req, res) => {
  const { owner, repo, pull_number } = req.query
  const authHeader = req.headers.authorization
  const userToken = authHeader && authHeader.split(' ')[1]
  const tokenToUse = (userToken && userToken !== 'null' && userToken !== 'undefined') ? userToken : process.env.GITHUB_TOKEN

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`, {
      headers: { 'Authorization': `Bearer ${tokenToUse}` }
    })
    const data = await response.json()
    const filesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`, {
      headers: { 'Authorization': `Bearer ${tokenToUse}` }
    })
    const filesData = await filesRes.json()
    res.json({
      title: data.title, author: data.user.login, state: data.state,
      additions: data.additions, deletions: data.deletions,
      files: filesData.map(f => ({ filename: f.filename, patch: f.patch, additions: f.additions, deletions: f.deletions }))
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// --- FIX: HISTORY ROUTE ---
app.get('/api/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('pr_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // We make sure the IDs are clean before sending to frontend
    const uniquePrs = Array.from(new Map(data.map(item => [cleanId(item.pr_id), item])).values());
    res.json(uniquePrs);
  } catch (err) { res.status(500).json([]) }
})

app.post('/api/explain', async (req, res) => {
  const { patch, filename } = req.body
  try {
    const { data: cached } = await supabase.from('ai_cache').select('explanation').eq('patch_hash', patch).maybeSingle()
    if (cached) return res.json({ explanation: cached.explanation })
    const Groq = require('groq-sdk')
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'system', content: 'Senior dev.' }, { role: 'user', content: patch }]
    })
    const aiText = completion.choices[0].message.content
    await supabase.from('ai_cache').insert({ patch_hash: patch, explanation: aiText })
    res.json({ explanation: aiText })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/auth/github', (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`);
})

app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }, { headers: { Accept: 'application/json' } })
    res.redirect(`http://localhost:5173?token=${response.data.access_token}`)
  } catch (e) { res.status(500).send("Auth failed") }
})

io.on('connection', (socket) => {
  socket.on('join-pr', async (rawPrId) => {
    const prId = cleanId(rawPrId)
    socket.join(prId)
    const clients = io.sockets.adapter.rooms.get(prId)
    io.to(prId).emit('update-viewer-count', clients ? clients.size : 0)
    const { data } = await supabase.from('comments').select('*').eq('pr_id', prId).order('created_at', { ascending: true })
    if (data) socket.emit('load-comments', data)
  })

  socket.on('send-comment', async (data) => {
    const prId = cleanId(data.prId)
    try {
      const { data: savedRow, error } = await supabase.from('comments').insert({
        pr_id: prId, filename: data.filename, line_index: data.line_index, text: data.text, author: data.author
      }).select().single()
      if (!error) io.to(prId).emit('receive-comment', savedRow)
    } catch (e) { console.log(e.message) }
  })

  socket.on('delete-comment', async (data) => {
    const prId = cleanId(data.prId)
    await supabase.from('comments').delete().eq('id', data.commentId)
    io.to(prId).emit('comment-removed', data.commentId)
  })
})

server.listen(PORT, () => console.log(`Server live on ${PORT}`))