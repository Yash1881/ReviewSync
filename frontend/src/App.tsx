import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import Header from './components/Header'
import FileBlock from './components/FileBlock'
import PRSkeleton from './components/Skeleton'
import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
const socket = io(BACKEND_URL)

// --- HELPER: Extracts standard owner/repo/number from URL ---
const getStandardId = (url: string) => {
  try {
    const parts = new URL(url).pathname.split('/')
    return `${parts[1]}/${parts[2]}/${parts[4]}`
  } catch { return '' }
}

// --- PAGE 1: THE LANDING PAGE ---
function LandingPage() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '120px 24px',
      minHeight: 'calc(100vh - 56px)',
      backgroundImage: 'radial-gradient(#21262d 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h1 style={{ 
        fontSize: '4.5rem', 
        fontWeight: '700', 
        letterSpacing: '-0.04em', 
        marginBottom: '1rem',
        color: '#e6edf3'
      }}>
         ReviewSync
      </h1>
      <p style={{ 
        color: '#8b949e', 
        fontSize: '1.25rem', 
        marginBottom: '3rem',
        maxWidth: '600px'
      }}>
        AI-Powered collaborative code reviews for modern engineering teams.
      </p>
      
      <div style={{ 
        width: '100%',
        maxWidth: '640px', 
        background: '#161b22', 
        padding: '8px', 
        borderRadius: '6px', 
        border: '1px solid #21262d', 
        display: 'flex', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        transition: 'border-color 0.15s ease'
      }}>
         <input 
           type="text" value={url} onChange={e => setUrl(e.target.value)}
           placeholder="Paste GitHub PR URL..."
           style={{ 
             flex: 1, 
             background: 'transparent', 
             border: 'none', 
             color: '#e6edf3', 
             padding: '12px 16px', 
             fontSize: '1rem', 
             outline: 'none' 
           }}
         />
         <button 
           onClick={() => url && navigate(`/review/${encodeURIComponent(url)}`)}
           style={{ 
             background: '#238636', 
             border: 'none', 
             borderRadius: '6px', 
             color: 'white', 
             padding: '0 24px', 
             cursor: 'pointer', 
             fontWeight: '600',
             transition: 'background 0.15s ease'
           }}
           onMouseEnter={(e) => (e.currentTarget.style.background = '#2ea043')}
           onMouseLeave={(e) => (e.currentTarget.style.background = '#238636')}
         >
           Analyze
         </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
        {[
          { label: 'AI Explanations', icon: '✨' },
          { label: 'Real-time Comments', icon: '👥' },
          { label: 'Private Repos', icon: '🔒' }
        ].map((pill, i) => (
          <div key={i} style={{
            padding: '6px 16px',
            background: '#161b22',
            border: '1px solid #21262d',
            borderRadius: '100px',
            fontSize: '0.85rem',
            color: '#e6edf3',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.9rem' }}>{pill.icon}</span>
            {pill.label}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '48px' }}>
        <Link to="/history" style={{ 
          color: '#58a6ff', 
          textDecoration: 'none', 
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          View Archive ●
        </Link>
      </div>
    </div>
  )
}

// --- PAGE 2: THE HISTORY PAGE ---
function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/history`).then(res => res.json()).then(setHistory)
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '40px auto', padding: '0 24px' }}>
      <h2 style={{ marginBottom: '24px', fontWeight: 600, color: '#e6edf3' }}>Review Archive</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {history.map((item, i) => (
          <Link key={i} to={`/review/${encodeURIComponent('https://github.com/' + item.pr_id)}`} style={{ 
            background: '#161b22', 
            border: '1px solid #21262d', 
            borderRadius: '6px', 
            padding: '16px 20px', 
            color: '#e6edf3', 
            textDecoration: 'none', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'border-color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#30363d')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#21262d')}
          >
            <span style={{ fontWeight: 500 }}>{item.pr_id}</span>
            <span style={{ color: '#8b949e' }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// --- PAGE 3: THE REVIEW ROOM ---
function ReviewRoom({ user, allComments, viewerCount }: any) {
  const { prUrlEncoded } = useParams()
  const prUrl = decodeURIComponent(prUrlEncoded || '')
  const [prData, setPrData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null)
      const standardId = getStandardId(prUrl)
      try {
        const res = await fetch(`${BACKEND_URL}/api/pr?owner=${standardId.split('/')[0]}&repo=${standardId.split('/')[1]}&pull_number=${standardId.split('/')[2]}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('github_token')}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPrData(data)
        socket.emit('join-pr', standardId)
      } catch (e: any) { setError(e.message) }
      finally { setLoading(false) }
    }
    load()
  }, [prUrl])

  if (loading) return <div style={{ padding: '0 24px' }}><PRSkeleton /></div>
  if (error) return <div style={{ color: '#f85149', textAlign: 'center', marginTop: '40px' }}>{error}</div>

  const MetadataRow = ({ label, value, color }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: color || '#e6edf3', fontWeight: 500 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', padding: '24px' }}>
      <aside style={{ 
  background: '#161b22', 
  borderRight: '1px solid #21262d', 
  padding: '24px', 
  height: '100%', 
  overflowY: 'auto' 
}}>
  <h2 style={{ 
    fontSize: '0.95rem', 
    fontWeight: 600, 
    color: '#e6edf3', 
    marginBottom: '24px', 
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }} title={prData?.title}>
    {prData?.title}
  </h2>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
    <MetadataRow label="Status" value={prData?.state} color={prData?.state === 'open' ? '#3fb950' : '#8b949e'} />
    <MetadataRow label="Author" value={`@${prData?.author}`} color="#58a6ff" />
    <MetadataRow label="Adds" value={`+${prData?.additions}`} color="#3fb950" />
    <MetadataRow label="Dels" value={`-${prData?.deletions}`} color="#f85149" />
    <MetadataRow label="Files" value={prData?.changed_files} />
    <MetadataRow label="Live" value={viewerCount > 0 ? viewerCount : 1} color="#58a6ff" />
  </div>

  <div style={{ borderTop: '1px solid #21262d', paddingTop: '20px' }}>
    <div style={{ fontSize: '0.7rem', color: '#8b949e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Files</div>
    {prData?.files.map((f: any, i: number) => (
      <div 
        key={i} 
        style={{ 
          padding: '6px 0', 
          fontSize: '0.8rem', 
          color: '#8b949e', 
          cursor: 'pointer', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis' 
        }} 
        onClick={() => document.getElementById(`file-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      >
        ● <span style={{ marginLeft: '8px' }}>{f.filename.split('/').pop()}</span>
      </div>
    ))}
  </div>
</aside>

     <section style={{ 
  flex: 1, 
  padding: '32px', 
  background: '#010409', 
  height: 'calc(100vh - 56px)', // Limits height to the screen size minus header
  overflowY: 'auto',           // Enables the scrollbar for this section only
  minWidth: 0 
}}>
        {prData?.files.map((file: any, index: number) => (
          <FileBlock 
            key={index} 
            file={file} 
            index={index} 
            socket={socket} 
            prId={getStandardId(prUrl)} 
            username={user?.login || 'Anonymous'} 
            existingComments={allComments.filter((c: any) => c.filename === file.filename)} 
          />
        ))}
      </section>
    </div>
  )
}

// --- MAIN APP ---
function App() {
  const [user, setUser] = useState<any>(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [allComments, setAllComments] = useState<any[]>([])

  useEffect(() => {
    socket.on('update-viewer-count', (count: number) => setViewerCount(count))
    socket.on('load-comments', (comments: any[]) => setAllComments(comments))
    socket.on('receive-comment', (newComment: any) => setAllComments((prev) => [...prev, newComment]))
    
    const token = new URLSearchParams(window.location.search).get('token') || localStorage.getItem('github_token')
    if (new URLSearchParams(window.location.search).get('token')) {
      localStorage.setItem('github_token', token!)
      window.history.replaceState({}, document.title, '/')
    }
    if (token) {
      fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(data => setUser({ login: data.login, avatar_url: data.avatar_url }))
    }
  }, [])

  return (
  <Router>
    <style>{`
      html, body, #root { 
        margin: 0 !important; 
        padding: 0 !important; 
        width: 100vw !important; 
        height: 100vh !important;
        max-width: 100% !important; 
        background: #0d1117;
        overflow: hidden;
      }
      * { box-sizing: border-box; }
    `}</style>
    
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Header 
        user={user} 
        onLogin={() => window.location.href = `${BACKEND_URL}/api/auth/github`} 
        onLogout={() => { localStorage.removeItem('github_token'); setUser(null); }} 
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/review/:prUrlEncoded" element={<ReviewRoom user={user} allComments={allComments} viewerCount={viewerCount} />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </div>
  </Router>
)
}

export default App