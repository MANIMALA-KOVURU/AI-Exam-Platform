export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type ExamRecord = {
  id: string;
  title: string;
  description?: string | null;
  subject_id: string;
  subject_name: string;
  duration_minutes: number;
  start_time?: string | null;
  end_time?: string | null;
  question_count: number;
  negative_marking?: boolean;
  randomize_questions?: boolean;
  randomize_options?: boolean;
  proctoring_enabled?: boolean;
  status: string;
  created_by: string;
};

export type QuestionOption = { key: string; text: string; is_correct: boolean };
export type QuestionAttachment = { id: string; file_name: string; file_type: string; file_url: string; file_size: number };
export type QuestionRecord = {
  id: string;
  text: string;
  question_type: string;
  subject: string;
  marks: number;
  negative_marks: number;
  difficulty: string;
  expected_answer?: string | null;
  model_answer?: string | null;
  evaluation_criteria?: string | null;
  explanation?: string | null;
  options: QuestionOption[];
  attachments: QuestionAttachment[];
  created_at: string;
  created_by: string;
};

export type QuestionPayload = {
  text: string;
  question_type: string;
  subject: string;
  marks: number;
  negative_marks?: number;
  difficulty: string;
  expected_answer?: string;
  model_answer?: string;
  evaluation_criteria?: string;
  explanation?: string;
  options?: string[];
  correct_options?: number[];
  attachment_id?: string;
};

export type QuestionSubject = { id: string; name: string; code: string; question_count: number };

async function ensureExaminerSession() {
  if (typeof window === 'undefined') {
    return '';
  }

  const cachedToken = localStorage.getItem('ai_exam_access_token');
  if (cachedToken) {
    return cachedToken;
  }

  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@aiexamplatform.com',
      password: 'Admin@123',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Authentication failed: ${errorText}`);
  }

  const data = await response.json();
  localStorage.setItem('ai_exam_access_token', data.access_token);
  localStorage.setItem('access_token', data.access_token);
  return data.access_token;
}

async function apiRequest<T>(path: string, options: RequestInit = {}, hasRetried = false): Promise<T> {
  const token = await ensureExaminerSession();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    if (response.status === 401 || (response.status === 404 && errorPayload?.detail === 'User not found')) {
      if (!hasRetried && typeof window !== 'undefined') {
        localStorage.removeItem('ai_exam_access_token');
        localStorage.removeItem('access_token');
        return apiRequest<T>(path, options, true);
      }
    }
    throw new Error(errorPayload?.detail ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`, { cache: 'no-store' });
  if (!response.ok) throw new Error('API unavailable');
  return response.json() as Promise<{ status: string; service: string }>;
}

export async function getExams() {
  return apiRequest<ExamRecord[]>('/api/v1/exams/');
}

export async function getExam(examId: string) {
  return apiRequest<ExamRecord>(`/api/v1/exams/${examId}`);
}

export async function getQuestionSubjects() {
  return apiRequest<QuestionSubject[]>('/api/v1/question-bank/subjects');
}

export async function getQuestions(subject?: string) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return apiRequest<QuestionRecord[]>(`/api/v1/question-bank/questions${query}`);
}

export async function getQuestion(questionId: string) {
  return apiRequest<QuestionRecord>(`/api/v1/question-bank/questions/${questionId}`);
}

export async function createQuestion(payload: QuestionPayload) {
  return apiRequest<QuestionRecord>('/api/v1/question-bank/questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateQuestion(questionId: string, payload: Partial<QuestionPayload>) {
  return apiRequest<QuestionRecord>(`/api/v1/question-bank/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteQuestion(questionId: string) {
  return apiRequest<{ success: boolean; message: string }>(`/api/v1/question-bank/questions/${questionId}`, { method: 'DELETE' });
}

export async function uploadQuestionAttachment(file: File, questionId?: string) {
  const token = await ensureExaminerSession();
  const formData = new FormData();
  formData.append('file', file);
  if (questionId) formData.append('question_id', questionId);
  const response = await fetch(`${API_URL}/api/v1/question-bank/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    cache: 'no-store',
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.detail ?? `Upload failed: ${response.status}`);
  }
  return response.json() as Promise<QuestionAttachment>;
}

export async function deleteQuestionAttachment(attachmentId: string) {
  return apiRequest<{ success: boolean }>(`/api/v1/question-bank/attachments/${attachmentId}`, { method: 'DELETE' });
}

function normalizeDateTimeForApi(value?: string | null) {
  if (!value) return value ?? undefined;

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return timestamp.toISOString();
}

export async function createExam(payload: Partial<ExamRecord>) {
  return apiRequest<ExamRecord>('/api/v1/exams/', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      start_time: normalizeDateTimeForApi(payload.start_time),
      end_time: normalizeDateTimeForApi(payload.end_time),
    }),
  });
}

export async function updateExam(examId: string, payload: Partial<ExamRecord>) {
  return apiRequest<ExamRecord>(`/api/v1/exams/${examId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...payload,
      start_time: normalizeDateTimeForApi(payload.start_time),
      end_time: normalizeDateTimeForApi(payload.end_time),
    }),
  });
}
