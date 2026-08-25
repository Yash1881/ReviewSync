function SkeletonLine({ width = '100%', height = '1rem', marginBottom = '0.75rem' }: { width?: string, height?: string, marginBottom?: string }) {
  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(90deg, #161b22 25%, #21262d 50%, #161b22 75%)',
      backgroundSize: '200% 100%',
      borderRadius: '4px',
      marginBottom,
      animation: 'shimmer 2s infinite linear'
    }} />
  )
}

function PRSkeleton() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Grid Layout to match App.tsx */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '300px 1fr', 
        gap: '32px',
        marginTop: '8px'
      }}>
        
        {/* Sidebar Skeleton */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ 
            background: '#161b22', 
            border: '1px solid #21262d', 
            borderRadius: '6px', 
            padding: '20px' 
          }}>
            <SkeletonLine width="30%" height="0.6rem" marginBottom="12px" />
            <SkeletonLine width="90%" height="1.2rem" marginBottom="20px" />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><SkeletonLine width="50%" height="0.5rem" /><SkeletonLine width="80%" height="0.8rem" /></div>
              <div><SkeletonLine width="50%" height="0.5rem" /><SkeletonLine width="80%" height="0.8rem" /></div>
              <div><SkeletonLine width="50%" height="0.5rem" /><SkeletonLine width="80%" height="0.8rem" /></div>
              <div><SkeletonLine width="50%" height="0.5rem" /><SkeletonLine width="80%" height="0.8rem" /></div>
            </div>
          </div>

          <div style={{ 
            background: '#161b22', 
            border: '1px solid #21262d', 
            borderRadius: '6px', 
            padding: '16px' 
          }}>
            <SkeletonLine width="40%" height="0.6rem" marginBottom="16px" />
            <SkeletonLine width="100%" height="0.7rem" marginBottom="12px" />
            <SkeletonLine width="85%" height="0.7rem" marginBottom="12px" />
            <SkeletonLine width="90%" height="0.7rem" marginBottom="12px" />
          </div>
        </aside>

        {/* Main Content (File Blocks) Skeleton */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ 
              border: '1px solid #21262d', 
              borderRadius: '6px', 
              background: '#161b22',
              overflow: 'hidden'
            }}>
              {/* Header part */}
              <div style={{ padding: '12px 16px', background: '#161b22', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #21262d' }}>
                <SkeletonLine width="40%" height="0.85rem" marginBottom="0" />
                <SkeletonLine width="10%" height="0.85rem" marginBottom="0" />
              </div>
              {/* Diff part */}
              <div style={{ padding: '16px', background: '#0d1117' }}>
                <SkeletonLine width="100%" height="0.75rem" />
                <SkeletonLine width="100%" height="0.75rem" />
                <SkeletonLine width="100%" height="0.75rem" />
                <SkeletonLine width="70%" height="0.75rem" />
              </div>
              {/* Button part */}
              <div style={{ padding: '16px', background: '#0d1117', borderTop: '1px solid #21262d' }}>
                <SkeletonLine width="120px" height="32px" marginBottom="0" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default PRSkeleton;