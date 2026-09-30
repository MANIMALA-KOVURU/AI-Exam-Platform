'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '../../../../components/AppShell';
import { getExam, type ExamRecord } from '../../../api';

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

export default function ExamDetailPage() {
  const params = useParams();
  const examId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [exam, setExam] = useState<ExamRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    let active = true;

    const loadExam = async () => {
      try {
        const data = await getExam(examId);
        if (active) setExam(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load exam');
      }
    };

    loadExam();
    return () => { active = false; };
  }, [examId]);

  return (
    <AppShell title="Exam details" subtitle="Review configuration, schedule, and question coverage for this assessment." userName="Manimala" role="Examiner" navItems={examinerNav}>
      <div className="dashboard-shell">
        {error ? <div style={{ color: '#a31d1d', marginBottom: 16 }}>{error}</div> : null}
        {!exam ? <div>Loading exam details...</div> : (
          <>
            <div className="dashboard-topbar">
              <div>
                <p className="eyebrow eyebrow--dark">Assessment</p>
                <h2 className="section-heading">{exam.title}</h2>
              </div>
              <div className="action-group">
                <Link href={`/examiner/exams/${exam.id}/edit`} className="action-btn">Edit</Link>
                <button className="primary-btn btn-sm" type="button">Publish</button>
              </div>
            </div>

            <div className="content-grid dashboard-panels">
              <div className="list-card">
                <div className="list-card-header"><h3>Overview</h3></div>
                <div className="summary-row"><span>Subject</span><strong>{exam.subject_name || exam.subject_id}</strong></div>
                <div className="summary-row"><span>Duration</span><strong>{exam.duration_minutes} mins</strong></div>
                <div className="summary-row"><span>Question count</span><strong>{exam.question_count}</strong></div>
                <div className="summary-row"><span>Description</span><strong>{exam.description || 'No description provided.'}</strong></div>
                <div className="summary-row"><span>Proctoring</span><strong>{exam.proctoring_enabled ? 'Enabled' : 'Disabled'}</strong></div>
              </div>

              <div className="summary-card">
                <div className="list-card-header"><h3>Schedule</h3></div>
                <div className="summary-row"><span>Start</span><strong>{exam.start_time ? new Date(exam.start_time).toLocaleString() : 'Not set'}</strong></div>
                <div className="summary-row"><span>End</span><strong>{exam.end_time ? new Date(exam.end_time).toLocaleString() : 'Not set'}</strong></div>
                <div className="summary-row"><span>Status</span><strong><span className="badge badge--scheduled">{exam.status}</span></strong></div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
