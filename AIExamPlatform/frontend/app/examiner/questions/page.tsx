'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { useLocale } from '../../../components/LocaleProvider';
import { deleteQuestion, getQuestionSubjects, getQuestions, QuestionRecord, QuestionSubject } from '../../api';

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

const typeLabels: Record<string, string> = { mcq: 'Multiple Choice', multi_select: 'Multiple Select', short_answer: 'Short Answer', long_answer: 'Long Answer', image_upload: 'Image Based', pdf_upload: 'PDF Based', csv_upload: 'CSV Based' };

export default function ExaminerQuestionsPage() {
  const { t } = useLocale();
  const [subjects, setSubjects] = useState<QuestionSubject[]>([]);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('DBMS');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [marksFilter, setMarksFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (subject = selectedSubject) => {
    setLoading(true);
    try {
      const [subjectData, questionData] = await Promise.all([getQuestionSubjects(), getQuestions(subject)]);
      setSubjects(subjectData);
      setQuestions(questionData);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getQuestionSubjects().then((data) => { setSubjects(data); load(data[0]?.code || 'DBMS'); }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load subjects.')); }, []);
  useEffect(() => { if (subjects.length && selectedSubject) load(selectedSubject); }, [selectedSubject]);

  const activeSubject = subjects.find((subject) => subject.code === selectedSubject);
  const filteredQuestions = useMemo(() => questions.filter((question) => {
    const matchesSearch = question.text.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || question.question_type === typeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
    const matchesMarks = marksFilter === 'all' || String(question.marks) === marksFilter;
    return matchesSearch && matchesType && matchesDifficulty && matchesMarks;
  }), [difficultyFilter, marksFilter, questions, search, typeFilter]);
  const difficultyCounts = { EASY: questions.filter((question) => question.difficulty === 'EASY').length, MEDIUM: questions.filter((question) => question.difficulty === 'MEDIUM').length, HARD: questions.filter((question) => question.difficulty === 'HARD').length };
  const typeCounts = Object.keys(typeLabels).map((type) => `${typeLabels[type].replace('Multiple ', '').replace(' Based', '')}: ${questions.filter((question) => question.question_type === type).length}`);

  const handleDelete = async (question: QuestionRecord) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try { await deleteQuestion(question.id); await load(selectedSubject); } catch (deleteError) { setError(t('Could not delete question.') || (deleteError instanceof Error ? deleteError.message : 'Could not delete question.')); }
  };

  return (
    <AppShell title="Question Bank" subtitle="Build a structured, reusable bank for every examination subject." userName="Manimala" role="Examiner" navItems={examinerNav}>
      <div className="dashboard-shell">
        <div className="question-bank-header"><div><p className="eyebrow eyebrow--dark">{t('Question Bank')}</p><h2 className="section-heading">{t('Subject overview')}</h2></div><Link href="/examiner/questions/new" className="primary-btn btn-sm">+ {t('Add Question')}</Link></div>
        <div className="subject-overview">{subjects.map((subject) => <button type="button" key={subject.code} className={`subject-card ${selectedSubject === subject.code ? 'subject-card--active' : ''}`} onClick={() => setSelectedSubject(subject.code)}><strong>{subject.code}</strong><span>{subject.question_count} {t('Questions')}</span></button>)}</div>
        <div className="question-stats"><div><strong>{selectedSubject}</strong><span>{questions.length} {t('Questions')}</span></div><div><span>{t('Easy')}: {difficultyCounts.EASY}</span><span>{t('Medium')}: {difficultyCounts.MEDIUM}</span><span>{t('Hard')}: {difficultyCounts.HARD}</span></div><div className="question-type-summary">{Object.keys(typeLabels).map((type) => <span key={type}>{t(typeLabels[type])}: {questions.filter((question) => question.question_type === type).length}</span>)}</div></div>
        <div className="tool-bar"><div className="search-box"><input aria-label={t('Search questions...')} placeholder={t('Search questions...')} value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="filter-group"><select className="filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">{t('Question Type')}</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select><select className="filter-select" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}><option value="all">{t('Difficulty')}</option><option value="EASY">{t('Easy')}</option><option value="MEDIUM">{t('Medium')}</option><option value="HARD">{t('Hard')}</option></select><select className="filter-select" value={marksFilter} onChange={(event) => setMarksFilter(event.target.value)}><option value="all">{t('Marks')}</option>{[1, 2, 5, 10].map((mark) => <option key={mark} value={mark}>{mark} {t('Marks')}</option>)}</select></div></div>
        {error ? <div className="form-error" role="alert">{error}</div> : null}
        <div className="table-card"><div className="list-card-header"><h3>{activeSubject?.name || selectedSubject}</h3><span>{activeSubject?.question_count || 0} {t('Questions')}</span></div><div className="table-wrap"><table><thead><tr><th>#</th><th>{t('Question')}</th><th>{t('Question Type')}</th><th>{t('Difficulty')}</th><th>{t('Marks')}</th><th>{t('Attachment')}</th><th>{t('Created Date')}</th><th>{t('Actions')}</th></tr></thead><tbody>{loading ? <tr><td colSpan={8}>{t('Loading questions...')}</td></tr> : filteredQuestions.length === 0 ? <tr><td colSpan={8}>{t('No questions added for this subject yet.')}</td></tr> : filteredQuestions.map((question, index) => <tr key={question.id}><td>{index + 1}</td><td translate="no">{question.text}</td><td>{t(typeLabels[question.question_type] || question.question_type)}</td><td><span className={`badge badge--${question.difficulty.toLowerCase()}`}>{t(question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase())}</span></td><td>{question.marks}</td><td translate="no">{question.attachments[0]?.file_name || '-'}</td><td>{new Date(question.created_at).toLocaleDateString()}</td><td><div className="action-group"><Link className="action-btn action-btn--ghost" href={`/examiner/questions/${question.id}`}>{t('View')}</Link><Link className="action-btn action-btn--ghost" href={`/examiner/questions/${question.id}/edit`}>{t('Edit')}</Link><button className="action-btn danger-btn" type="button" onClick={() => handleDelete(question)}>{t('Delete')}</button></div></td></tr>)}</tbody></table></div></div>
      </div>
    </AppShell>
  );
}
