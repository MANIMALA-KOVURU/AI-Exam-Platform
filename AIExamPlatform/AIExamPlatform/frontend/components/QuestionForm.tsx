'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { API_URL, createQuestion, QuestionPayload, QuestionRecord, QuestionSubject, updateQuestion, uploadQuestionAttachment } from '../app/api';
import { useLocale } from './LocaleProvider';

const questionTypes = [
  ['mcq', 'Multiple Choice'],
  ['multi_select', 'Multiple Select'],
  ['short_answer', 'Short Answer'],
  ['long_answer', 'Long Answer'],
  ['image_upload', 'Image Based'],
  ['pdf_upload', 'PDF Based'],
  ['csv_upload', 'CSV Based'],
] as const;

const difficulties = ['EASY', 'MEDIUM', 'HARD'];
const attachmentAccept: Record<string, string> = {
  image_upload: '.jpg,.jpeg,.png,.webp',
  pdf_upload: '.pdf',
  csv_upload: '.csv,text/csv',
};

function fileLabel(fileType: string) {
  return fileType === 'image_upload' ? 'image' : fileType === 'pdf_upload' ? 'PDF' : 'CSV';
}

function initialOptions(question?: QuestionRecord) {
  return question?.options?.length ? question.options.map((option) => option.text) : ['', ''];
}

export function QuestionForm({ subjects, initialQuestion, onSaved }: { subjects: QuestionSubject[]; initialQuestion?: QuestionRecord; onSaved: (message: string) => void }) {
  const { t } = useLocale();
  const [subject, setSubject] = useState(initialQuestion?.subject || subjects[0]?.code || 'DBMS');
  const [questionType, setQuestionType] = useState(initialQuestion?.question_type || 'mcq');
  const [text, setText] = useState(initialQuestion?.text || '');
  const [options, setOptions] = useState(initialOptions(initialQuestion));
  const [correctOptions, setCorrectOptions] = useState<number[]>(initialQuestion?.options?.map((option, index) => option.is_correct ? index : -1).filter((index) => index >= 0) || []);
  const [difficulty, setDifficulty] = useState(initialQuestion?.difficulty || 'MEDIUM');
  const [marks, setMarks] = useState(String(initialQuestion?.marks || 1));
  const [negativeMarks, setNegativeMarks] = useState(String(initialQuestion?.negative_marks || 0));
  const [expectedAnswer, setExpectedAnswer] = useState(initialQuestion?.expected_answer || '');
  const [modelAnswer, setModelAnswer] = useState(initialQuestion?.model_answer || '');
  const [evaluationCriteria, setEvaluationCriteria] = useState(initialQuestion?.evaluation_criteria || '');
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      setSubject(initialQuestion.subject);
      setQuestionType(initialQuestion.question_type);
      setText(initialQuestion.text);
      setOptions(initialOptions(initialQuestion));
      setCorrectOptions(initialQuestion.options.map((option, index) => option.is_correct ? index : -1).filter((index) => index >= 0));
      setDifficulty(initialQuestion.difficulty);
      setMarks(String(initialQuestion.marks));
      setNegativeMarks(String(initialQuestion.negative_marks));
      setExpectedAnswer(initialQuestion.expected_answer || '');
      setModelAnswer(initialQuestion.model_answer || '');
      setEvaluationCriteria(initialQuestion.evaluation_criteria || '');
      setExplanation(initialQuestion.explanation || '');
    }
  }, [initialQuestion]);

  const currentSubject = useMemo(() => subjects.find((item) => item.code === subject || item.name === subject), [subject, subjects]);
  const existingAttachment = initialQuestion?.attachments?.[0];
  const isObjective = questionType === 'mcq' || questionType === 'multi_select';
  const fileType = questionType === 'image_upload' || questionType === 'pdf_upload' || questionType === 'csv_upload';

  const selectFile = (file: File | undefined) => {
    if (!file) return;
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const accepted = attachmentAccept[questionType].split(',');
    if (!accepted.includes(extension) || file.size > 10 * 1024 * 1024) {
      setError(`${t('Choose a valid file up to 10 MB.')} (${fileLabel(questionType)})`);
      return;
    }
    setError(null);
    setSelectedFile(file);
    if (questionType === 'csv_upload') {
      file.text().then((value) => setFilePreview(value.split(/\r?\n/).filter(Boolean).slice(0, 5)));
    } else {
      setFilePreview([]);
    }
  };

  const validate = () => {
    if (!subject) return t('Subject is required.');
    if (!text.trim()) return t('Question is required.');
    if (!difficulties.includes(difficulty.toUpperCase())) return t('Select a valid difficulty.');
    if (!Number(marks) || Number(marks) <= 0) return t('Marks must be greater than 0.');
    if (isObjective) {
      const usableOptions = options.filter((option) => option.trim());
      if (usableOptions.length < 2 || usableOptions.length > 4) return t('Provide between 2 and 4 options.');
      if (questionType === 'mcq' && correctOptions.length !== 1) return t('Multiple Choice requires exactly one correct answer.');
      if (questionType === 'multi_select' && correctOptions.length < 1) return t('Select at least one correct answer.');
    }
    if (questionType === 'short_answer' && !expectedAnswer.trim()) return t('Expected answer is required.');
    if (questionType === 'long_answer' && !modelAnswer.trim()) return t('Model answer is required.');
    if (fileType && !selectedFile && !existingAttachment) return t('A file is required for this question type.');
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      let attachmentId = initialQuestion?.attachments?.[0]?.id;
      if (selectedFile) attachmentId = (await uploadQuestionAttachment(selectedFile, initialQuestion?.id)).id;
      const payload: QuestionPayload = {
        text: text.trim(),
        question_type: questionType,
        subject,
        marks: Number(marks),
        negative_marks: Number(negativeMarks) || 0,
        difficulty: difficulty.toUpperCase(),
        expected_answer: expectedAnswer.trim() || undefined,
        model_answer: modelAnswer.trim() || undefined,
        evaluation_criteria: evaluationCriteria.trim() || undefined,
        explanation: explanation.trim() || undefined,
        options: isObjective ? options.filter((option) => option.trim()) : undefined,
        correct_options: isObjective ? correctOptions : undefined,
        attachment_id: attachmentId,
      };
      if (initialQuestion) await updateQuestion(initialQuestion.id, payload);
      else await createQuestion(payload);
      onSaved(t(initialQuestion ? 'Question updated successfully.' : 'Question created successfully.'));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('Could not save question. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateOption = (index: number, value: string) => setOptions(options.map((option, optionIndex) => optionIndex === index ? value : option));
  const toggleCorrect = (index: number) => {
    if (questionType === 'mcq') setCorrectOptions([index]);
    else setCorrectOptions(correctOptions.includes(index) ? correctOptions.filter((item) => item !== index) : [...correctOptions, index]);
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <div className="question-form-summary">
        <strong>{currentSubject?.name || subject}</strong>
        <span>{currentSubject?.question_count || 0} questions</span>
      </div>
      <div className="form-grid">
        <div className="field"><label htmlFor="subject">{t('Subject')}</label><select id="subject" value={subject} onChange={(event) => setSubject(event.target.value)}>{subjects.map((item) => <option key={item.code} value={item.code}>{item.code} - {item.name}</option>)}</select></div>
        <div className="field"><label htmlFor="question-type">{t('Question Type')}</label><select id="question-type" value={questionType} onChange={(event) => { setQuestionType(event.target.value); setCorrectOptions([]); }}>{questionTypes.map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></div>
        <div className="field full-span"><label htmlFor="question-text">{t('Question')}</label><textarea id="question-text" rows={4} value={text} onChange={(event) => setText(event.target.value)} required /></div>
        {isObjective ? <div className="field full-span question-options"><label>{t('Options and correct answer')}</label>{options.map((option, index) => <div className="option-row" key={index}><input aria-label={`${t('Option')} ${String.fromCharCode(65 + index)}`} value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`${t('Option')} ${String.fromCharCode(65 + index)}`} /><label className="option-correct"><input type={questionType === 'mcq' ? 'radio' : 'checkbox'} checked={correctOptions.includes(index)} onChange={() => toggleCorrect(index)} /> {t('Correct')}</label>{options.length > 2 ? <button type="button" className="action-btn action-btn--ghost" onClick={() => { setOptions(options.filter((_, itemIndex) => itemIndex !== index)); setCorrectOptions(correctOptions.filter((item) => item !== index).map((item) => item > index ? item - 1 : item)); }}>{t('Remove')}</button> : null}</div>)}{options.length < 4 ? <button type="button" className="action-btn" onClick={() => setOptions([...options, ''])}>{t('Add option')}</button> : null}</div> : null}
        {questionType === 'short_answer' ? <div className="field full-span"><label htmlFor="expected-answer">{t('Expected answer')}</label><textarea id="expected-answer" rows={4} value={expectedAnswer} onChange={(event) => setExpectedAnswer(event.target.value)} /></div> : null}
        {questionType === 'long_answer' ? <><div className="field full-span"><label htmlFor="model-answer">{t('Model answer')}</label><textarea id="model-answer" rows={5} value={modelAnswer} onChange={(event) => setModelAnswer(event.target.value)} /></div><div className="field full-span"><label htmlFor="evaluation-criteria">{t('Answer guidelines / evaluation criteria')}</label><textarea id="evaluation-criteria" rows={3} value={evaluationCriteria} onChange={(event) => setEvaluationCriteria(event.target.value)} /></div></> : null}
        {fileType ? <div className="field full-span"><label htmlFor="attachment">{t('Upload')} {t(questionType === 'image_upload' ? 'Image' : questionType === 'pdf_upload' ? 'PDF' : 'CSV')}</label><input id="attachment" type="file" accept={attachmentAccept[questionType]} onChange={(event) => selectFile(event.target.files?.[0])} />{selectedFile ? <p className="form-hint">{t('Selected')}: {selectedFile.name} ({Math.ceil(selectedFile.size / 1024)} KB)</p> : existingAttachment ? <p className="form-hint">{t('Current file')}: <a href={`${API_URL}${existingAttachment.file_url}`} target="_blank" rel="noreferrer">{existingAttachment.file_name}</a></p> : null}{filePreview.length ? <pre className="csv-preview">{filePreview.join('\n')}</pre> : null}</div> : null}
        <div className="field"><label htmlFor="difficulty">{t('Difficulty')}</label><select id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>{difficulties.map((item) => <option key={item} value={item}>{t(item.charAt(0) + item.slice(1).toLowerCase())}</option>)}</select></div>
        <div className="field"><label htmlFor="marks">{t('Marks')}</label><input id="marks" type="number" min={1} value={marks} onChange={(event) => setMarks(event.target.value)} required /></div>
        <div className="field"><label htmlFor="negative-marks">{t('Negative marks')}</label><input id="negative-marks" type="number" min={0} value={negativeMarks} onChange={(event) => setNegativeMarks(event.target.value)} /></div>
        <div className="field full-span"><label htmlFor="explanation">{t('Explanation (optional)')}</label><textarea id="explanation" rows={3} value={explanation} onChange={(event) => setExplanation(event.target.value)} /></div>
      </div>
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <div className="form-actions"><button type="submit" className="primary-btn btn-sm" disabled={isSaving}>{isSaving ? t('Saving...') : initialQuestion ? t('Save changes') : t('Save question')}</button></div>
    </form>
  );
}
