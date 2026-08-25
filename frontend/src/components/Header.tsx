import { Link } from 'react-router-dom';

type Props = {
  user: { login: string; avatar_url: string } | null
  onLogin: () => void
  onLogout: () => void
}

function Header({ user, onLogin, onLogout }: Props) {
  return (
    <header style={{
      height: '56px',
      background: '#161b22',
      borderBottom: '1px solid #21262d',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Left Side: Brand Name Only */}
      <Link to="/" style={{ textDecoration: 'none', color: '#e6edf3' }}>
        <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>ReviewSync</span>
      </Link>

      {/* Right Side: Navigation & User Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link
          to="/history"
          style={{
            color: '#8b949e',
            textDecoration: 'none',
            fontSize: '0.85rem',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e6edf3')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8b949e')}
        >
          History
        </Link>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={user.avatar_url}
                alt={user.login}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid #21262d'
                }}
              />
              <span style={{ color: '#e6edf3', fontSize: '0.85rem', fontWeight: 500 }}>{user.login}</span>
            </div>
            <button
              onClick={onLogout}
              style={{
                padding: '4px 10px',
                background: 'transparent',
                color: '#8b949e',
                border: '1px solid #21262d',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.15s ease',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#e6edf3';
                e.currentTarget.style.borderColor = '#8b949e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8b949e';
                e.currentTarget.style.borderColor = '#21262d';
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            style={{
              padding: '5px 12px',
              background: '#238636',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Login with GitHub
          </button>
        )}
      </div>
    </header>
  )
}

export default Header;