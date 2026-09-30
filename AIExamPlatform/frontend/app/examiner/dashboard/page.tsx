'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { useLocale } from '../../../components/LocaleProvider';
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

export default function ExaminerDashboardPage() {
  const { t } = useLocale();
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadExams = async () => {
      try {
        const data = await getExams();
        if (active) setExams(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load exams');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadExams();
    return () => { active = false; };
  }, []);

  const recentExams = useMemo(() => exams.slice(0, 3), [exams]);
  const statCards = useMemo(() => [
    { label: 'Total Exams', value: String(exams.length), change: exams.length ? 'Live from DB' : 'No exams yet', accent: 'blue', icon: '🧪' },
    { label: 'Active Exams', value: String(exams.filter((exam) => exam.status === 'active' || exam.status === 'published').length), change: 'Current status', accent: 'cyan', icon: '▶' },
    { label: 'Total Questions', value: String(exams.reduce((sum, exam) => sum + Number(exam.question_count || 0), 0)), change: 'Across exams', accent: 'green', icon: '❓' },
    { label: 'Students', value: '540', change: '96% active', accent: 'amber', icon: '👥' },
  ], [exams]);

  return (
    <AppShell title="Examiner dashboard" subtitle="Manage your examinations, questions, submissions and results." userName="Manimala" role="Examiner" navItems={examinerNav}>
      <div className="dashboard-shell dashboard-shell--examiner">
        <div className="dashboard-topbar">
          <div>
            <p className="eyebrow eyebrow--dark">{t('Overview')}</p>
            <h2 className="section-heading">{t('Assessment center')}</h2>
          </div>
          <Link href="/examiner/exams/new" className="primary-btn btn-sm">{t('Create exam')}</Link>
        </div>

        {error ? <div style={{ marginBottom: 16, color: '#a31d1d' }}>{error}</div> : null}

        <div className="dashboard-grid dashboard-grid--stats">
          {statCards.map((card) => (
            <div key={card.label} className={`stat-card stat-card--${card.accent}`}>
              <div className="stat-card-header">
                <span>{t(card.label)}</span>
                <span className="stat-icon">{card.icon}</span>
              </div>
              <strong>{loading ? '—' : card.value}</strong>
              <small>{t(card.change)}</small>
            </div>
          ))}
        </div>

        <div className="content-grid dashboard-panels">
          <div className="list-card">
            <div className="list-card-header">
              <h3>{t('Recent exams')}</h3>
              <Link href="/examiner/exams" className="action-btn">{t('Open catalog')}</Link>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('Exam')}</th>
                    <th>{t('Subject')}</th>
                    <th>{t('Questions')}</th>
                    <th>{t('Duration')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExams.length === 0 ? (
                    <tr><td colSpan={6}>{t('No exams available yet.')}</td></tr>
                  ) : (
                    recentExams.map((exam) => (
                      <tr key={exam.id}>
                        <td>{exam.title}</td>
                        <td>{exam.subject_name || exam.subject_id}</td>
                        <td>{exam.question_count}</td>
                        <td>{exam.duration_minutes} min</td>
                        <td><span className={`badge badge--${exam.status === 'active' ? 'active' : exam.status === 'draft' ? 'draft' : 'scheduled'}`}>{t(exam.status.charAt(0).toUpperCase() + exam.status.slice(1))}</span></td>
                        <td><Link href={`/examiner/exams/${exam.id}/edit`} className="action-btn action-btn--ghost">{t('Review')}</Link></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="summary-card">
            <div className="list-card-header"><h3>{t('Performance snapshot')}</h3></div>
            <div className="summary-row"><span>{t('Pending evaluations')}</span><strong>{Math.max(0, exams.filter((exam) => exam.status === 'draft').length)}</strong></div>
            <div className="summary-row"><span>{t('Average performance')}</span><strong>82%</strong></div>
            <div>
              <div className="meta-label">{t('Pass rate')}</div>
              <div className="progress" style={{ marginTop: 8 }}><span style={{ width: '82%' }} /></div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
