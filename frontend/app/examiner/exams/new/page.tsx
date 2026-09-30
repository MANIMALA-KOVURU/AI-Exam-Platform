'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AppShell } from '../../../../components/AppShell';
import { createExam } from '../../../api';

const examinerNav = [
  { label: 'Dashboard', href: '/examiner/dashboard', icon: '◫' },
  { label: 'Exams', href: '/examiner/exams', icon: '▣' },
  { label: 'Question Bank', href: '/examiner/questions', icon: '▤' },
  { label: 'Results', href: '/examiner/results', icon: '◍' },
  { label: 'Submissions', href: '/examiner/submissions', icon: '◌' },
  { label: 'Grading', href: '/examiner/grading', icon: '◐' },
  { label: 'Proctoring', href: '/examiner/proctoring', icon: '◒' },
  { label: 'Profile', href: '/examiner/profile', icon: '⚙' },
  { label: 'Settings', href: '/examiner/settings', icon: '⚙' },
];

const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const buildDefaultDateRange = () => {
  const start = new Date(2026, 8, 25, 12, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    start_time: formatDateTimeLocal(start),
    end_time: formatDateTimeLocal(end),
  };
};

const getDateValidationError = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return null;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (end.getTime() <= start.getTime()) {
    return 'End date/time must be after the start date/time.';
  }

  return null;
};

const defaultForm = {
  title: '',
  subject_id: 'Computer Science',
  description: '',
  question_count: 20,
  duration_minutes: 60,
  status: 'draft',
  ...buildDefaultDateRange(),
};

export default function CreateExamPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!form.title.trim()) return 'Exam name is required.';
    if (!form.subject_id.trim()) return 'Subject is required.';
    if (!Number(form.question_count) || Number(form.question_count) <= 0) return 'Question count must be greater than 0.';
    if (!Number(form.duration_minutes) || Number(form.duration_minutes) <= 0) return 'Duration must be greater than 0 minutes.';

    const dateError = getDateValidationError(form.start_time, form.end_time);
    if (dateError) return dateError;

    return null;
  };

  const updateFormValue = (nextValues: Partial<typeof form>) => {
    const nextForm = { ...form, ...nextValues };
    setForm(nextForm);
    setError(getDateValidationError(nextForm.start_time, nextForm.end_time) || null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createExam({
        title: form.title.trim(),
        description: form.description.trim(),
        subject_id: form.subject_id.trim() || 'General',
        subject_name: form.subject_id.trim() || 'General',
        question_count: Number(form.question_count),
        duration_minutes: Number(form.duration_minutes),
        status: form.status,
        start_time: form.start_time || undefined,
        end_time: form.end_time || undefined,
      });

      sessionStorage.setItem('exam-action-message', 'Exam created successfully');
      router.push('/examiner/exams');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Create exam" subtitle="Create a new assessment with timed access, randomized questions, and proctoring settings." userName="Manimala" role="Examiner" navItems={examinerNav}>
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">Assessment setup</p>
            <h2 className="section-heading">Create exam</h2>
          </div>
          <button type="button" className="primary-btn btn-sm" onClick={() => router.push('/examiner/exams')}>Back to exams</button>
        </div>

        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="title">Exam name</label>
              <input id="title" value={form.title} onChange={(e) => updateFormValue({ title: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="subject">Subject</label>
              <input id="subject" value={form.subject_id} onChange={(e) => updateFormValue({ subject_id: e.target.value })} placeholder="Computer Science" required />
            </div>
            <div className="field full-span">
              <label htmlFor="description">Description</label>
              <textarea id="description" rows={3} value={form.description} onChange={(e) => updateFormValue({ description: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="question_count">Number of questions</label>
              <input id="question_count" type="number" min={1} value={form.question_count} onChange={(e) => updateFormValue({ question_count: Number(e.target.value) })} required />
            </div>
            <div className="field">
              <label htmlFor="duration_minutes">Duration (minutes)</label>
              <input id="duration_minutes" type="number" min={1} value={form.duration_minutes} onChange={(e) => updateFormValue({ duration_minutes: Number(e.target.value) })} required />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={(e) => updateFormValue({ status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="start_time">Start date/time</label>
              <input id="start_time" type="datetime-local" value={form.start_time} onChange={(e) => updateFormValue({ start_time: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="end_time">End date/time</label>
              <input id="end_time" type="datetime-local" value={form.end_time} onChange={(e) => updateFormValue({ end_time: e.target.value })} />
            </div>
          </div>

          {error ? <div style={{ marginTop: 16, color: '#a31d1d' }}>{error}</div> : null}

          <div className="dashboard-topbar" style={{ marginTop: 20 }}>
            <div />
            <button className="primary-btn btn-sm" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save exam'}</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
