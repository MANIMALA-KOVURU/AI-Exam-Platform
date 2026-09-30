'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../../components/AppShell';
import { getQuestionSubjects, QuestionSubject } from '../../../api';
import { QuestionForm } from '../../../../components/QuestionForm';

const examinerNav = [{ label: 'Dashboard', href: '/examiner/dashboard', icon: '◫' }, { label: 'Exams', href: '/examiner/exams', icon: '▣' }, { label: 'Question Bank', href: '/examiner/questions', icon: '▤' }, { label: 'Results', href: '/examiner/results', icon: '◍' }, { label: 'Submissions', href: '/examiner/submissions', icon: '◌' }, { label: 'Grading', href: '/examiner/grading', icon: '◐' }, { label: 'Proctoring', href: '/examiner/proctoring', icon: '◒' }, { label: 'Profile', href: '/examiner/profile', icon: '⚙' }, { label: 'Settings', href: '/examiner/settings', icon: '⚙' }];

export default function NewQuestionPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<QuestionSubject[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getQuestionSubjects().then(setSubjects).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load subjects.')); }, []);
  return <AppShell title="Add question" subtitle="Create a validated question for the selected subject." userName="Manimala" role="Examiner" navItems={examinerNav}><div className="dashboard-shell"><div className="question-bank-header"><div><p className="eyebrow eyebrow--dark">Question Bank</p><h2 className="section-heading">New question</h2></div><button type="button" className="secondary-btn btn-sm" onClick={() => router.push('/examiner/questions')}>Back to bank</button></div>{error ? <div className="form-error">{error}</div> : subjects.length ? <QuestionForm subjects={subjects} onSaved={() => router.push('/examiner/questions')} /> : <div className="empty-panel">Loading subjects...</div>}</div></AppShell>;
}
