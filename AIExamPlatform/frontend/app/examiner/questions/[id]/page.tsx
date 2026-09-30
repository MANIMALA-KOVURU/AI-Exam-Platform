'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../../components/AppShell';
import { API_URL, getQuestion, QuestionRecord } from '../../../api';

const examinerNav = [{ label: 'Dashboard', href: '/examiner/dashboard', icon: '◫' }, { label: 'Exams', href: '/examiner/exams', icon: '▣' }, { label: 'Question Bank', href: '/examiner/questions', icon: '▤' }, { label: 'Results', href: '/examiner/results', icon: '◍' }, { label: 'Submissions', href: '/examiner/submissions', icon: '◌' }, { label: 'Grading', href: '/examiner/grading', icon: '◐' }, { label: 'Proctoring', href: '/examiner/proctoring', icon: '◒' }, { label: 'Profile', href: '/examiner/profile', icon: '⚙' }, { label: 'Settings', href: '/examiner/settings', icon: '⚙' }];
const typeLabels: Record<string, string> = { mcq: 'Multiple Choice', multi_select: 'Multiple Select', short_answer: 'Short Answer', long_answer: 'Long Answer', image_upload: 'Image Based', pdf_upload: 'PDF Based', csv_upload: 'CSV Based' };

export default function ViewQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [question, setQuestion] = useState<QuestionRecord>();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (questionId) getQuestion(questionId).then(setQuestion).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load question.')); }, [questionId]);
  return <AppShell title="View question" subtitle="Review the saved question and its answer configuration." userName="Manimala" role="Examiner" navItems={examinerNav}><div className="dashboard-shell"><div className="question-bank-header"><div><p className="eyebrow eyebrow--dark">Question Bank</p><h2 className="section-heading">Question details</h2></div><div className="action-group"><button type="button" className="secondary-btn btn-sm" onClick={() => router.push('/examiner/questions')}>Back to bank</button>{question ? <button type="button" className="primary-btn btn-sm" onClick={() => router.push(`/examiner/questions/${question.id}/edit`)}>Edit</button> : null}</div></div>{error ? <div className="form-error">{error}</div> : question ? <div className="form-panel"><div className="question-form-summary"><strong>{question.subject}</strong><span>{typeLabels[question.question_type] || question.question_type} | {question.difficulty} | {question.marks} marks</span></div><h3>{question.text}</h3>{question.options.length ? <div className="summary-card">{question.options.map((option) => <div className="summary-row" key={option.key}><span>{option.key}. {option.text}</span><strong>{option.is_correct ? 'Correct' : ''}</strong></div>)}</div> : null}{question.expected_answer ? <><h4>Expected answer</h4><p>{question.expected_answer}</p></> : null}{question.model_answer ? <><h4>Model answer</h4><p>{question.model_answer}</p></> : null}{question.evaluation_criteria ? <><h4>Evaluation criteria</h4><p>{question.evaluation_criteria}</p></> : null}{question.explanation ? <><h4>Explanation</h4><p>{question.explanation}</p></> : null}{question.attachments.map((attachment) => <p key={attachment.id}><a href={`${API_URL}${attachment.file_url}`} target="_blank" rel="noreferrer">{attachment.file_name}</a></p>)}</div> : <div className="empty-panel">Loading question...</div>}</div></AppShell>;
}
