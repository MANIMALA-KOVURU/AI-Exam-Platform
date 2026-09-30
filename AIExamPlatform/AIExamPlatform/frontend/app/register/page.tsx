'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { API_URL } from '../api';
import { LanguageSelector } from '../../components/LanguageSelector';
import { useLocale } from '../../components/LocaleProvider';
import { ConnectionStatus } from '../../components/ConnectionStatus';
import { InstallPWA } from '../../components/InstallPWA';
import { LocalizedContent } from '../../components/LocalizedContent';

function dashboardForRole(role: string) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'examiner') return '/examiner/dashboard';
  return '/student/dashboard';
}

export default function RegisterPage() {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? 'Unable to create account');

      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('refresh_token', result.refresh_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('examai-language', result.user.preferred_language || localStorage.getItem('examai-language') || 'en');
      window.location.href = dashboardForRole(result.user.role);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <LocalizedContent>
      <div className="auth-layout">
        <div className="auth-visual">
          <div className="auth-brand">
            <div className="auth-brand-mark">A</div>
            <div>
              <strong>AI Examination Platform</strong>
            </div>
          </div>
          <h1>Create your learning account.</h1>
          <p>
            Join as a student or examiner and manage secure, AI-enabled assessments with a polished workflow that fits modern digital education.
          </p>
        </div>

        <div className="auth-side">
          <div className="auth-locale"><ConnectionStatus /><LanguageSelector /><InstallPWA compact /></div>
          <div className="auth-card">
            <h2>{t('Register')}</h2>
            <p>{t('Create your account to get started.')}</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">{t('Name')}</label>
                <input id="name" type="text" placeholder={t('Full name')} value={name} onChange={(event) => setName(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="register-email">{t('Email')}</label>
                <input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="register-password">{t('Password')}</label>
                <input id="register-password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
              </div>
              <div className="field">
                <label htmlFor="role">{t('Role')}</label>
                <select id="role" value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="student">{t('Student')}</option>
                  <option value="examiner">{t('Examiner')}</option>
                  <option value="admin">{t('Admin')}</option>
                </select>
              </div>
              {error && <p role="alert" className="form-error">{error}</p>}
              <button type="submit" className="auth-button" disabled={isSubmitting}>{isSubmitting ? t('Creating account...') : t('Create Account')}</button>
            </form>
            <p className="auth-footer">
              {t('Already have an account?')} <Link href="/login">{t('Login here')}</Link>
            </p>
          </div>
        </div>
      </div>
      </LocalizedContent>
    </main>
  );
}
