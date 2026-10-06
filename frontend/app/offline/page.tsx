import Link from 'next/link';

export default function OfflinePage() {
  return (
    <main className="auth-shell">
      <section className="auth-layout" style={{ maxWidth: 720 }}>
        <div className="auth-visual">
          <div className="auth-brand">
            <div className="auth-brand-mark">AI</div>
            <strong>AI Examination Platform</strong>
          </div>
          <h1>Offline</h1>
          <p>
            You are offline right now. The app shell can still load some cached public pages,
            but live exam functionality requires an active internet connection.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-item">📡 Check your connection and retry.</div>
            <div className="auth-feature-item">🔒 Exam submissions are only confirmed by the backend.</div>
            <div className="auth-feature-item">📘 Public dashboard pages may still open from cache.</div>
          </div>
        </div>

        <div className="auth-side">
          <div className="auth-card">
            <h2>Connection required</h2>
            <p>Live assessment, responses, and grading all depend on online status.</p>
            <div className="auth-form">
              <Link href="/" className="primary auth-button" style={{ textAlign: 'center' }}>
                Go to home
              </Link>
              <Link href="/login" className="secondary auth-button" style={{ textAlign: 'center' }}>
                Try login again
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
