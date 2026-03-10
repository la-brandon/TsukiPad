/**
 * LoadingScreen.tsx — redesigned
 */

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--paper)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="fade-up" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          fontWeight: 600,
          color: 'var(--ink)',
          letterSpacing: '-0.03em',
        }}>
          TsukiPad
        </span>
        <div style={{
          width: 32, height: 32,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--blush)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default LoadingScreen;
