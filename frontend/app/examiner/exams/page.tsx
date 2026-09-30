'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { getExams, type ExamRecord } from '../../api';

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

export default function ExaminerExamsPage() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = sessionStorage.getItem('exam-action-message');
    if (message) {
      setSuccessMessage(message);
      sessionStorage.removeItem('exam-action-message');
    }

    let active = true;
    const loadExams = async () => {
      try {
        const data = await getExams();
        if (active) setExams(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load exams');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadExams();
    return () => { active = false; };
  }, []);

  return (
    <AppShell title="Exam management" subtitle="Draft, review, and publish exams for your classes." userName="Manimala" role="Examiner" navItems={examinerNav}>
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">Assessment catalog</p>
            <h2 className="section-heading">Exams</h2>
          </div>
          <Link href="/examiner/exams/new" className="primary-btn btn-sm">Create exam</Link>
        </div>

        {successMessage ? <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: '#eafaf1', color: '#146c43', border: '1px solid #b8e7c8' }}>{successMessage}</div> : null}
        {error ? <div style={{ marginBottom: 16, color: '#a31d1d' }}>{error}</div> : null}

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Questions</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6}>Loading exams...</td></tr>
                ) : exams.length === 0 ? (
                  <tr><td colSpan={6}>No exams created yet.</td></tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam.id}>
                      <td>{exam.title}</td>
                      <td>{exam.subject_name || exam.subject_id}</td>
                      <td>{exam.question_count}</td>
                      <td>{exam.duration_minutes} min</td>
                      <td><span className={exam.status === 'active' || exam.status === 'published' ? 'badge badge--active' : exam.status === 'draft' ? 'badge badge--draft' : 'badge badge--scheduled'}>{exam.status}</span></td>
                      <td className="action-group">
                        <Link href={`/examiner/exams/${exam.id}`} className="action-btn">View</Link>
                        <Link href={`/examiner/exams/${exam.id}/edit`} className="action-btn action-btn--ghost">Edit</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
