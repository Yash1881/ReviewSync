import { useState, useEffect } from 'react'
import DiffViewer from './DiffViewer'
import ReactMarkdown from 'react-markdown'

// Deployment Prep: Define Backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

type FileInfo = {
  filename: string
  status: string
  additions: number
  deletions: number
  patch: string
}

type Props = {
  file: FileInfo;
  index: number;
  socket: any;
  prId: string;
  existingComments: any[]; 
  username: string;
};

function FileBlock({ file, index, socket, prId, existingComments, username }: Props) {
  const [isOpen, setIsOpen] = useState(true)
  const [explanation, setExplanation] = useState('')
  const [explaining, setExplaining] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  // 1. REAL-TIME: Listen for AI Explanations shared by other developers
  useEffect(() => {
    if (!socket) return;
    socket.on('receive-shared-explanation', (data: any) => {
      if (data.filename === file.filename) {
        setExplanation(data.explanation);
        setShowExplanation(true);
      }
    });
    return () => { socket.off('receive-shared-explanation'); };
  }, [file.filename, socket]);

  // 2. AI LOGIC: Caching lookup happens in the backend
  async function explainDiff() {
    if (explanation) {
      setShowExplanation(!showExplanation);
      return;
    }
    setExplaining(true);
    setShowExplanation(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.filename, patch: file.patch })
      })
      const data = await response.json()
      setExplanation(data.explanation)
      
      // Share the AI insight with the rest of the team
      socket.emit('share-explanation', { 
        prId, 
        filename: file.filename, 
        explanation: data.explanation 
      });
    } catch (err) {
      setExplanation('Failed to get AI explanation. Please try again.')
    } finally {
      setExplaining(false)
    }
  }

  return (
    <div 
      id={`file-${index}`} 
      style={{ 
        marginBottom: '24px', 
        border: '1px solid #21262d', 
        borderRadius: '6px', 
        background: '#161b22', 
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* PROFESSIONAL FILE HEADER */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ 
          padding: '12px 16px', 
          cursor: 'pointer', 
          background: '#161b22', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: isOpen ? '1px solid #21262d' : 'none',
          transition: 'background 0.15s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#1f242c')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#161b22')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#8b949e', fontSize: '10px', width: '12px' }}>{isOpen ? '▼' : '▶'}</span>
          <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#e6edf3' }}>{file.filename}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div style={{ fontSize: '0.75rem', fontWeight: 500 }}>
             <span style={{ color: '#3fb950' }}>+{file.additions}</span>
             <span style={{ color: '#f85149', marginLeft: '8px' }}>-{file.deletions}</span>
           </div>
        </div>
      </div>

      {isOpen && (
        <div>
          {/* INLINE DIFF VIEWER */}
          {file.patch && (
            <DiffViewer 
              patch={file.patch} 
              socket={socket} 
              prId={prId} 
              filename={file.filename} 
              existingComments={existingComments} 
              username={username}
            />
          )}

          {/* AI ACTION BAR */}
          <div style={{ padding: '16px', background: '#0d1117', borderTop: '1px solid #21262d' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); explainDiff() }} 
              disabled={explaining} 
              style={{ 
                background: '#21262d', 
                color: '#e6edf3', 
                border: '1px solid #30363d', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                cursor: explaining ? 'wait' : 'pointer', 
                fontSize: '0.8rem', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8b949e';
                e.currentTarget.style.background = '#282e34';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#30363d';
                e.currentTarget.style.background = '#21262d';
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{explaining ? '⌛' : '✨'}</span>
              {explaining ? 'Analyzing diff...' : 'Explain with AI'}
            </button>

            {/* AI INSIGHT BOX */}
            {showExplanation && explanation && (
              <div style={{ 
                marginTop: '16px', 
                padding: '16px', 
                background: '#161b22', 
                borderRadius: '6px', 
                border: '1px solid #58a6ff', 
                borderLeftWidth: '4px',
                color: '#e6edf3', 
                fontSize: '0.9rem', 
                lineHeight: '1.6' 
              }}>
                <div style={{ 
                  color: '#58a6ff', 
                  fontWeight: 600, 
                  marginBottom: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                   🤖 AI Reviewer Insight
                </div>
                <div className="markdown-body">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              </div>  
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileBlock;