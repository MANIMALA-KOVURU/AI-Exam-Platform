'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../../../../components/AppShell';
import { getExam, updateExam } from '../../../../api';

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

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [form, setForm] = useState({
    title: '',
    subject_id: 'General',
    description: '',
    question_count: 10,
    duration_minutes: 60,
    status: 'draft',
    start_time: '',
    end_time: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!examId) return;

    let active = true;
    const loadExam = async () => {
      try {
        const exam = await getExam(examId);
        if (!active) return;
        const nextForm = {
          title: exam.title,
          subject_id: exam.subject_name || exam.subject_id,
          description: exam.description || '',
          question_count: Number(exam.question_count || 0),
          duration_minutes: Number(exam.duration_minutes || 60),
          status: exam.status,
          start_time: exam.start_time ? exam.start_time.slice(0, 16) : '',
          end_time: exam.end_time ? exam.end_time.slice(0, 16) : '',
        };
        setForm(nextForm);
        setError(getDateValidationError(nextForm.start_time, nextForm.end_time) || null);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadExam();
    return () => { active = false; };
  }, [examId]);

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
    if (!examId) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateExam(examId, {
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

      sessionStorage.setItem('exam-action-message', 'Exam updated successfully');
      router.push('/examiner/exams');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Edit exam" subtitle="Update the assessment schedule, instructions, and configuration." userName="Manimala" role="Examiner" navItems={examinerNav}>
      <div className="dashboard-shell">
        <form className="form-panel" onSubmit={handleSubmit}>
          {loading ? <div>Loading exam...</div> : (
            <div className="form-grid">
              <div className="field">
                <label htmlFor="title">Exam name</label>
                <input id="title" value={form.title} onChange={(e) => updateFormValue({ title: e.target.value })} required />
              </div>
              <div className="field">
                <label htmlFor="subject">Subject</label>
                <input id="subject" value={form.subject_id} onChange={(e) => updateFormValue({ subject_id: e.target.value })} required />
              </div>
              <div className="field full-span">
                <label htmlFor="description">Description</label>
                <textarea id="description" rows={4} value={form.description} onChange={(e) => updateFormValue({ description: e.target.value })} />
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
          )}

          {error ? <div style={{ marginTop: 16, color: '#a31d1d' }}>{error}</div> : null}

          <div className="dashboard-topbar" style={{ marginTop: 20 }}>
            <div />
            <button className="primary-btn btn-sm" type="submit" disabled={loading || isSubmitting}>{isSubmitting ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
