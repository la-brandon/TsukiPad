/**
 * AuthScreen.tsx — redesigned
 */

type AuthMode = 'login' | 'register';

type AuthScreenProps = {
  mode: AuthMode;
  username: string;
  password: string;
  authError: string;
  isSubmitting: boolean;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
  onModeChange: (mode: AuthMode) => void;
};

function AuthScreen({
  mode, username, password, authError, isSubmitting,
  onUsernameChange, onPasswordChange, onSubmit, onModeChange,
}: AuthScreenProps) {
  const isLogin = mode === 'login';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.9rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--paper)',
    color: 'var(--ink)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onSubmit();
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--paper)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div className="fade-up auth-card">
        {/* Brand */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
          }}>
            TsukiPad ☽
          </h1>
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.8rem', color: 'var(--ink-muted)', letterSpacing: '0.06em' }}>
            memory calendar journal
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}>
          {(['login', 'register'] as AuthMode[]).map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              style={{
                padding: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                background: mode === m ? 'var(--ink)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--ink-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-body)',
              }}
            >
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => onUsernameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
          />
        </div>

        {!isLogin && (
          <p style={{ fontSize: '0.73rem', color: 'var(--ink-muted)', margin: '0 0 1rem', lineHeight: 1.5 }}>
            Username ≥ 5 characters · Password ≥ 6 characters · Thank u frends
          </p>
        )}

        {authError && (
          <p style={{ fontSize: '0.8rem', color: '#c0392b', margin: '0 0 1rem', padding: '0.5rem 0.75rem', background: '#fdf0ee', borderRadius: 'var(--radius-sm)', border: '1px solid #f5c6c2' }}>
            {authError}
          </p>
        )}

        <button
          className="btn-primary"
          onClick={onSubmit}
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.7rem', fontSize: '0.875rem', opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting
            ? isLogin ? 'Signing in…' : 'Creating account…'
            : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </div>
    </div>
  );
}

export default AuthScreen;
