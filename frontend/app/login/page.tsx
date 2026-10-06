'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { API_URL } from '../api';

function dashboardForRole(role: string) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  if (normalizedRole === 'admin') return '/admin/dashboard';
  if (normalizedRole === 'examiner') return '/examiner/dashboard';
  return '/student/dashboard';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? 'Unable to log in');

      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('ai_exam_access_token', result.access_token);
      localStorage.setItem('refresh_token', result.refresh_token);

      const userResponse = await fetch(`${API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${result.access_token}` },
      });
      const user = await userResponse.json();
      if (!userResponse.ok) throw new Error(user.detail ?? 'Unable to load your account');

      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = dashboardForRole(user.role);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-layout">
        <div className="auth-visual">
          <div className="auth-brand">
            <div className="auth-brand-mark">A</div>
            <div>
              <strong>AI Examination Platform</strong>
            </div>
          </div>
          <h1>Secure assessments for modern learning.</h1>
          <p>
            Build smarter examinations with proctoring, automated evaluation, question management, and role-aware dashboards designed for digital classrooms.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-item">✔ AI-assisted exam workflows</div>
            <div className="auth-feature-item">✔ Role-based student and examiner access</div>
            <div className="auth-feature-item">✔ Reliable, secure evaluation and reporting</div>
          </div>
        </div>

        <div className="auth-side">
          <div className="auth-card">
            <h2>Login</h2>
            <p>Access your exam workspace securely.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              {error && <p role="alert" className="form-error">{error}</p>}
              <button type="submit" className="auth-button" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Login'}</button>
            </form>
            <p className="auth-footer">
              Need an account? <Link href="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
