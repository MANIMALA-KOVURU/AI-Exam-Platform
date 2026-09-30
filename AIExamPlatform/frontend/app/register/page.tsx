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
  if (role === 'admin') {
    return '/admin/dashboard';
  }

  if (role === 'examiner') {
    return '/examiner/dashboard';
  }

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
      const response = await fetch(
        `${API_URL}/api/v1/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
          }),
        }
      );

      const contentType =
        response.headers.get('content-type') || '';

      let result: any = null;

      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();

        result = {
          detail:
            text ||
            `Server returned HTTP ${response.status}`,
        };
      }

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            `Registration failed with HTTP ${response.status}`
        );
      }

      // Save authentication information
      localStorage.setItem(
        'access_token',
        result.access_token
      );

      localStorage.setItem(
        'refresh_token',
        result.refresh_token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(result.user)
      );

      // Save preferred language
      localStorage.setItem(
        'examai-language',
        result.user.preferred_language ||
          localStorage.getItem('examai-language') ||
          'en'
      );

      // Redirect according to selected role
      window.location.href = dashboardForRole(
        result.user.role
      );
    } catch (submitError) {
      console.error(
        'Registration error:',
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create account'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      {/* Your existing registration UI goes here */}

      <form onSubmit={handleSubmit}>
        {/* Keep your existing form fields here */}
      </form>
    </main>
  );
}