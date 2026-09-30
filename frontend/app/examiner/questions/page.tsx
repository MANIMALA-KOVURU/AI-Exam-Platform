'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../../components/AppShell';
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
    try { await deleteQuestion(question.id); await load(selectedSubject); } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Could not delete question.'); }
  };

  return (
    <AppShell title="Question Bank" subtitle="Build a structured, reusable bank for every examination subject." userName="Manimala" role="Examiner" navItems={examinerNav}>
      <div className="dashboard-shell">
        <div className="question-bank-header"><div><p className="eyebrow eyebrow--dark">Question Bank</p><h2 className="section-heading">Subject overview</h2></div><Link href="/examiner/questions/new" className="primary-btn btn-sm">+ Add Question</Link></div>
        <div className="subject-overview">{subjects.map((subject) => <button type="button" key={subject.code} className={`subject-card ${selectedSubject === subject.code ? 'subject-card--active' : ''}`} onClick={() => setSelectedSubject(subject.code)}><strong>{subject.code}</strong><span>{subject.question_count} Questions</span></button>)}</div>
        <div className="question-stats"><div><strong>{selectedSubject}</strong><span>{questions.length} Questions</span></div><div><span>Easy: {difficultyCounts.EASY}</span><span>Medium: {difficultyCounts.MEDIUM}</span><span>Hard: {difficultyCounts.HARD}</span></div><div className="question-type-summary">{typeCounts.map((item) => <span key={item}>{item}</span>)}</div></div>
        <div className="tool-bar"><div className="search-box"><input aria-label="Search questions" placeholder="Search questions..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="filter-group"><select className="filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">Question Type</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select className="filter-select" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}><option value="all">Difficulty</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select><select className="filter-select" value={marksFilter} onChange={(event) => setMarksFilter(event.target.value)}><option value="all">Marks</option>{[1, 2, 5, 10].map((mark) => <option key={mark} value={mark}>{mark} marks</option>)}</select></div></div>
        {error ? <div className="form-error" role="alert">{error}</div> : null}
        <div className="table-card"><div className="list-card-header"><h3>{activeSubject?.name || selectedSubject}</h3><span>{activeSubject?.question_count || 0} Questions</span></div><div className="table-wrap"><table><thead><tr><th>#</th><th>Question</th><th>Type</th><th>Difficulty</th><th>Marks</th><th>Attachment</th><th>Created Date</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={8}>Loading questions...</td></tr> : filteredQuestions.length === 0 ? <tr><td colSpan={8}>No questions added for {selectedSubject} yet.</td></tr> : filteredQuestions.map((question, index) => <tr key={question.id}><td>{index + 1}</td><td>{question.text}</td><td>{typeLabels[question.question_type] || question.question_type}</td><td><span className={`badge badge--${question.difficulty.toLowerCase()}`}>{question.difficulty}</span></td><td>{question.marks}</td><td>{question.attachments[0]?.file_name || '-'}</td><td>{new Date(question.created_at).toLocaleDateString()}</td><td><div className="action-group"><Link className="action-btn action-btn--ghost" href={`/examiner/questions/${question.id}`}>View</Link><Link className="action-btn action-btn--ghost" href={`/examiner/questions/${question.id}/edit`}>Edit</Link><button className="action-btn danger-btn" type="button" onClick={() => handleDelete(question)}>Delete</button></div></td></tr>)}</tbody></table></div></div>
      </div>
    </AppShell>
  );
}
