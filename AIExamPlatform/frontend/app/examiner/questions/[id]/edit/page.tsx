'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../../../components/AppShell';
import { getQuestion, getQuestionSubjects, QuestionRecord, QuestionSubject } from '../../../../api';
import { QuestionForm } from '../../../../../components/QuestionForm';

const examinerNav = [{ label: 'Dashboard', href: '/examiner/dashboard', icon: '◫' }, { label: 'Exams', href: '/examiner/exams', icon: '▣' }, { label: 'Question Bank', href: '/examiner/questions', icon: '▤' }, { label: 'Results', href: '/examiner/results', icon: '◍' }, { label: 'Submissions', href: '/examiner/submissions', icon: '◌' }, { label: 'Grading', href: '/examiner/grading', icon: '◐' }, { label: 'Proctoring', href: '/examiner/proctoring', icon: '◒' }, { label: 'Profile', href: '/examiner/profile', icon: '⚙' }, { label: 'Settings', href: '/examiner/settings', icon: '⚙' }];

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [subjects, setSubjects] = useState<QuestionSubject[]>([]);
  const [question, setQuestion] = useState<QuestionRecord>();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!questionId) return; Promise.all([getQuestionSubjects(), getQuestion(questionId)]).then(([subjectData, questionData]) => { setSubjects(subjectData); setQuestion(questionData); }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load question.')); }, [questionId]);
  return <AppShell title="Edit question" subtitle="Update question content, answers, difficulty, and attachments." userName="Manimala" role="Examiner" navItems={examinerNav}><div className="dashboard-shell"><div className="question-bank-header"><div><p className="eyebrow eyebrow--dark">Question Bank</p><h2 className="section-heading">Edit question</h2></div><button type="button" className="secondary-btn btn-sm" onClick={() => router.push('/examiner/questions')}>Back to bank</button></div>{error ? <div className="form-error">{error}</div> : subjects.length && question ? <QuestionForm subjects={subjects} initialQuestion={question} onSaved={() => router.push('/examiner/questions')} /> : <div className="empty-panel">Loading question...</div>}</div></AppShell>;
}
