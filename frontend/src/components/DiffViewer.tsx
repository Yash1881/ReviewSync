import { useState, useEffect } from 'react';

type Props = { patch: string; socket: any; prId: string; filename: string; existingComments: any[]; username: string; }

type DiffLine = {
  content: string
  type: 'added' | 'removed' | 'context' | 'hunk'
  oldLineNumber: number | null
  newLineNumber: number | null
}

function parsePatch(patch: string): DiffLine[] {
  const lines = patch.split('\n');
  const result: DiffLine[] = [];
  let oldL = 0, newL = 0;
  for (const line of lines) {
    if (line.startsWith('@@')) {
      const m = line.match(/@@ -(\d+).*\+(\d+).* @@/);
      if (m) { oldL = parseInt(m[1]); newL = parseInt(m[2]); }
      result.push({ content: line, type: 'hunk', oldLineNumber: null, newLineNumber: null });
    } else if (line.startsWith('+')) {
      result.push({ content: line, type: 'added', oldLineNumber: null, newLineNumber: newL++ });
    } else if (line.startsWith('-')) {
      result.push({ content: line, type: 'removed', oldLineNumber: oldL++, newLineNumber: null });
    } else {
      result.push({ content: line, type: 'context', oldLineNumber: oldL++, newLineNumber: newL++ });
    }
  }
  return result
}

function DiffViewer({ patch, socket, prId, filename, existingComments, username }: Props) {
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => { setComments(existingComments || []); }, [existingComments])

  useEffect(() => {
    if (!socket) return
    const handleNewComment = (newComment: any) => {
      if (newComment.filename !== filename) return
      setComments(prev => {
        const draftIdx = prev.findIndex(c => c.isSyncing && c.line_index === newComment.line_index && c.text === newComment.text)
        if (draftIdx !== -1) {
          const updated = [...prev]
          updated[draftIdx] = newComment
          return updated
        }
        if (prev.some(c => c.id === newComment.id)) return prev
        return [...prev, newComment]
      })
    }
    const handleRemove = (id: string) => setComments(prev => prev.filter(c => c.id !== id))
    socket.on('receive-comment', handleNewComment)
    socket.on('comment-removed', handleRemove)
    return () => { socket.off('receive-comment'); socket.off('comment-removed'); }
  }, [socket, filename])

  const postComment = () => {
    if (!commentText.trim() || activeLine === null) return
    const newCommentData = { prId, filename, line_index: activeLine, text: commentText, author: username }
    setComments(prev => [...prev, { ...newCommentData, isSyncing: true }])
    socket.emit('send-comment', newCommentData)
    setCommentText(""); setActiveLine(null)
  }

  const lines = parsePatch(patch)

  return (
    <div style={{ 
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace', 
      fontSize: '13px', 
      background: '#0d1117',
      borderRadius: '6px',
      overflow: 'hidden',
      border: '1px solid #21262d'
    }}>
      {lines.map((line, index) => {
        const isHunk = line.type === 'hunk'
        const isAdded = line.type === 'added'
        const isRemoved = line.type === 'removed'

        const bgColor = isAdded ? 'rgba(46, 160, 67, 0.15)' : isRemoved ? 'rgba(248, 81, 73, 0.15)' : isHunk ? 'rgba(56, 139, 253, 0.1)' : 'transparent'
        const textColor = isAdded ? '#7ee787' : isRemoved ? '#ff7b72' : isHunk ? '#8b949e' : '#e6edf3'
        const marker = isAdded ? '+' : isRemoved ? '-' : ' '

        return (
          <div key={index}>
            <div 
              onClick={() => !isHunk && setActiveLine(activeLine === index ? null : index)} 
              style={{ 
                display: 'flex', 
                background: bgColor, 
                cursor: isHunk ? 'default' : 'pointer',
                transition: 'background 0.15s ease',
                borderLeft: activeLine === index ? `3px solid #58a6ff` : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isHunk) e.currentTarget.style.background = isAdded ? 'rgba(46, 160, 67, 0.25)' : isRemoved ? 'rgba(248, 81, 73, 0.25)' : '#161b22'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = bgColor
              }}
            >
              {/* Line Number Gutter */}
              <div style={{ 
                display: 'flex', 
                width: '7rem', 
                flexShrink: 0, 
                background: 'rgba(0,0,0,0.2)', 
                borderRight: '1px solid #21262d',
                userSelect: 'none',
                color: '#484f58'
              }}>
                <span style={{ width: '3.5rem', textAlign: 'right', paddingRight: '0.75rem' }}>{line.oldLineNumber ?? ''}</span>
                <span style={{ width: '3.5rem', textAlign: 'right', paddingRight: '0.75rem' }}>{line.newLineNumber ?? ''}</span>
              </div>

              {/* Code Content */}
              <div style={{ display: 'flex', flex: 1, paddingLeft: '0.5rem', alignItems: 'center' }}>
                <span style={{ width: '1.2rem', color: textColor, opacity: 0.7, flexShrink: 0 }}>{isHunk ? '' : marker}</span>
                <span style={{ color: textColor, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line.content.replace(/^[+-]/, '')}</span>
              </div>
            </div>

            {/* Comments Thread */}
            {comments.filter(c => c.line_index === index).map((c, i) => (
              <div key={i} style={{ 
                margin: '4px 12px 4px 7.5rem', 
                padding: '12px 16px', 
                background: '#161b22', 
                border: '1px solid #21262d', 
                borderRadius: '6px',
                color: c.isSyncing ? '#8b949e' : '#e6edf3',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: '#58a6ff', fontWeight: 600 }}>@{c.author}</span>
                  {!c.isSyncing && (
                    <button 
                      onClick={() => socket.emit('delete-comment', { commentId: c.id, prId })} 
                      style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div style={{ lineHeight: 1.5 }}>{c.text} {c.isSyncing && <span style={{ fontSize: '10px', opacity: 0.6, fontStyle: 'italic' }}>(syncing...)</span>}</div>
              </div>
            ))}

            {/* Comment Input Box */}
            {activeLine === index && (
              <div onClick={e => e.stopPropagation()} style={{ 
                padding: '12px 12px 12px 7.5rem', 
                background: '#0d1117', 
                borderBottom: '1px solid #21262d' 
              }}>
                <div style={{ 
                  background: '#161b22', 
                  border: '1px solid #21262d', 
                  borderRadius: '6px', 
                  padding: '12px' 
                }}>
                  <textarea 
                    value={commentText} 
                    onChange={e => setCommentText(e.target.value)} 
                    placeholder="Leave a comment..." 
                    style={{ 
                      width: '100%', 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#e6edf3', 
                      fontSize: '13px', 
                      outline: 'none', 
                      minHeight: '80px', 
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid #21262d', paddingTop: '12px' }}>
                    <button 
                      onClick={() => setActiveLine(null)} 
                      style={{ background: 'transparent', border: '1px solid #21262d', color: '#e6edf3', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={postComment} 
                      style={{ background: '#238636', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DiffViewer;