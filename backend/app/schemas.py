from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class HealthResponse(BaseModel):
    status: str
    service: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class HeartbeatPayload(BaseModel):
    session_id: str
    face_present: bool = True
    face_count: int = Field(default=1, ge=0, le=10)
    gaze_away: bool = False
    tab_switches: int = Field(default=0, ge=0)
    suspicion_score: int = Field(default=0, ge=0, le=100)


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = "student"

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        normalized = value.strip().lower()
        allowed_roles = {"student", "examiner", "admin"}
        if normalized not in allowed_roles:
            raise ValueError("Role must be one of: student, examiner, admin")
        return normalized


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    role: str
    preferred_language: str = "en"
    is_active: bool = True


class AuthResponse(BaseModel):
    user: UserOut
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AdminDashboardSummary(BaseModel):
    total_users: int
    total_students: int
    total_examiners: int
    total_admins: int
    total_exams: int
    published_exams: int
    total_questions: int
    recent_users: List[dict] = Field(default_factory=list)
    recent_exams: List[dict] = Field(default_factory=list)


class QuestionCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    question_type: str = Field(..., min_length=1)
    subject: str = Field(..., min_length=1)
    marks: int = Field(default=1, gt=0)
    expected_answer: Optional[str] = None
    model_answer: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    explanation: Optional[str] = None
    negative_marks: int = Field(default=0, ge=0)
    difficulty: str = "MEDIUM"
    options: Optional[List[str]] = None
    correct_options: Optional[List[int]] = None
    attachment_id: Optional[str] = None


class QuestionUpdate(BaseModel):
    text: Optional[str] = Field(default=None, min_length=1, max_length=10000)
    question_type: Optional[str] = None
    subject: Optional[str] = None
    marks: Optional[int] = Field(default=None, gt=0)
    expected_answer: Optional[str] = None
    model_answer: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    explanation: Optional[str] = None
    negative_marks: Optional[int] = Field(default=None, ge=0)
    difficulty: Optional[str] = None
    options: Optional[List[str]] = None
    correct_options: Optional[List[int]] = None
    attachment_id: Optional[str] = None


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    text: str
    question_type: str
    subject: str
    marks: int
    negative_marks: int
    difficulty: str
    expected_answer: Optional[str] = None
    model_answer: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    explanation: Optional[str] = None
    options: List[dict] = Field(default_factory=list)
    attachments: List[dict] = Field(default_factory=list)
    created_at: str
    created_by: str


class SubjectOut(BaseModel):
    id: str
    name: str
    code: str
    question_count: int


class ExamCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    subject_id: Optional[str] = "General"
    subject_name: Optional[str] = None
    duration_minutes: int = Field(default=60, gt=0)
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    question_count: int = Field(default=0, ge=0)
    negative_marking: bool = False
    randomize_questions: bool = False
    randomize_options: bool = False
    proctoring_enabled: bool = False
    gaze_tracking_enabled: bool = False
    multiple_face_detection: bool = False
    max_tab_switches: int = Field(default=0, ge=0)
    status: str = "draft"


class ExamUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    duration_minutes: Optional[int] = Field(default=None, gt=0)
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    question_count: Optional[int] = Field(default=None, ge=0)
    negative_marking: Optional[bool] = None
    randomize_questions: Optional[bool] = None
    randomize_options: Optional[bool] = None
    proctoring_enabled: Optional[bool] = None
    gaze_tracking_enabled: Optional[bool] = None
    multiple_face_detection: Optional[bool] = None
    max_tab_switches: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = None


class ExamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str]
    subject_id: str
    subject_name: str
    duration_minutes: int
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    question_count: int
    negative_marking: bool
    randomize_questions: bool
    randomize_options: bool
    proctoring_enabled: bool
    status: str
    created_by: str
