from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from uuid import uuid4
import shutil

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .auth import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from .config import get_settings
from .database import Base, SessionLocal, engine, get_db
from .models import Exam, ExamStatus, Question, QuestionAttachment, QuestionOption, QuestionType, Subject, User, UserRole
from .question_seed import ensure_default_questions
from .schemas import AdminDashboardSummary, AuthResponse, ExamCreate, ExamOut, ExamUpdate, HealthResponse, HeartbeatPayload, QuestionCreate, QuestionOut, QuestionUpdate, SubjectOut, TokenResponse, UserCreate, UserLogin, UserOut

settings = get_settings()
security = HTTPBearer()
DEFAULT_ADMIN_EMAIL = settings.initial_admin_email
QUESTION_TYPES = {question_type.value for question_type in QuestionType}
DIFFICULTIES = {"EASY", "MEDIUM", "HARD"}
SUBJECT_SEEDS = [
    ("DBMS", "DBMS", "Database Management Systems"),
    ("Operating Systems", "OS", "Operating Systems"),
    ("JAVA", "JAVA", "Java programming"),
    ("PYTHON", "PYTHON", "Python programming"),
    ("Data Structures and Algorithms", "DSA", "Data Structures and Algorithms"),
]
UPLOAD_ROOT = Path(settings.upload_dir) if settings.upload_dir else Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def _normalize_exam_datetime(raw_value: Optional[str]) -> Optional[datetime]:
    if raw_value in (None, "", "null"):
        return None

    try:
        return datetime.fromisoformat(raw_value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid datetime value: {raw_value}") from exc


def _normalize_role(value: Optional[str]) -> str:
    if value is None:
        return UserRole.student.value
    normalized = value.strip().lower()
    allowed = {UserRole.student.value, UserRole.examiner.value, UserRole.admin.value}
    if normalized not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be student, examiner, or admin.")
    return normalized


def _validate_exam_date_range(start_time: Optional[datetime], end_time: Optional[datetime]) -> None:
    if start_time is None or end_time is None:
        return

    if end_time <= start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date/time must be after the start date/time.",
        )


def _serialize_exam(exam: Exam) -> ExamOut:
    subject_name = exam.subject_id or "General"
    return ExamOut(
        id=str(exam.id),
        title=exam.title,
        description=exam.description,
        subject_id=exam.subject_id,
        subject_name=subject_name,
        duration_minutes=exam.duration_minutes,
        start_time=exam.start_time.isoformat() if exam.start_time else None,
        end_time=exam.end_time.isoformat() if exam.end_time else None,
        question_count=exam.question_count,
        negative_marking=exam.negative_marking,
        randomize_questions=exam.randomize_questions,
        randomize_options=exam.randomize_options,
        proctoring_enabled=exam.proctoring_enabled,
        status=exam.status,
        created_by=str(exam.created_by),
    )


def ensure_default_subjects(db: Session) -> None:
    for name, code, description in SUBJECT_SEEDS:
        subject = db.execute(select(Subject).where(Subject.code == code)).scalar_one_or_none()
        if subject is None:
            db.add(Subject(name=name, code=code, description=description))
    db.commit()


def _resolve_subject(db: Session, value: str) -> Subject:
    normalized = value.strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="Subject is required.")
    subject = db.execute(
        select(Subject).where((func.lower(Subject.code) == normalized.lower()) | (func.lower(Subject.name) == normalized.lower()))
    ).scalar_one_or_none()
    if subject is None:
        subject = Subject(name=normalized, code=normalized.upper().replace(" ", "-")[:50])
        db.add(subject)
        db.flush()
    return subject


def _validate_question_payload(payload: Union[QuestionCreate, QuestionUpdate], subject: Subject, db: Session, current_question: Optional[Question] = None) -> None:
    question_type = payload.question_type or (current_question.question_type if current_question else None)
    difficulty = (payload.difficulty or (current_question.difficulty if current_question else "MEDIUM")).upper()
    if question_type not in QUESTION_TYPES:
        raise HTTPException(status_code=400, detail="Invalid question type.")
    if difficulty not in DIFFICULTIES:
        raise HTTPException(status_code=400, detail="Difficulty must be EASY, MEDIUM, or HARD.")

    text = payload.text if payload.text is not None else (current_question.question_text if current_question else "")
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Question text is required.")

    existing_options = []
    if current_question is not None and payload.options is None:
        existing_options = db.execute(select(QuestionOption).where(QuestionOption.question_id == current_question.id).order_by(QuestionOption.option_key)).scalars().all()
    options = [option.strip() for option in payload.options] if payload.options is not None else [option.option_text for option in existing_options]
    if question_type in {QuestionType.mcq.value, QuestionType.multi_select.value}:
        if not 2 <= len(options) <= 4:
            raise HTTPException(status_code=400, detail="Multiple-choice questions require 2 to 4 options.")
        if len({option.casefold() for option in options}) != len(options):
            raise HTTPException(status_code=400, detail="Options must be unique.")
        correct_options = payload.correct_options if payload.correct_options is not None else [index for index, option in enumerate(existing_options) if option.is_correct]
        if any(index < 0 or index >= len(options) for index in correct_options):
            raise HTTPException(status_code=400, detail="Correct option index is invalid.")
        if question_type == QuestionType.mcq.value and len(correct_options) != 1:
            raise HTTPException(status_code=400, detail="MCQ questions require exactly one correct answer.")
        if question_type == QuestionType.multi_select.value and len(correct_options) < 1:
            raise HTTPException(status_code=400, detail="Multiple-select questions require at least one correct answer.")
    if question_type == QuestionType.short_answer.value and not (payload.expected_answer or (current_question and current_question.expected_answer)):
        raise HTTPException(status_code=400, detail="Expected answer is required for short-answer questions.")
    if question_type == QuestionType.long_answer.value and not (payload.model_answer or (current_question and current_question.model_answer)):
        raise HTTPException(status_code=400, detail="Model answer is required for long-answer questions.")

    duplicate_query = select(Question).where(
        Question.subject_id == subject.id,
        func.lower(Question.question_text) == text.strip().lower(),
    )
    if current_question is not None:
        duplicate_query = duplicate_query.where(Question.id != current_question.id)
    if db.execute(duplicate_query).scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="A question with the same text already exists for this subject.")


def _serialize_question(question: Question, db: Session) -> QuestionOut:
    subject = db.get(Subject, question.subject_id)
    options = db.execute(select(QuestionOption).where(QuestionOption.question_id == question.id).order_by(QuestionOption.option_key)).scalars().all()
    attachments = db.execute(select(QuestionAttachment).where(QuestionAttachment.question_id == question.id)).scalars().all()
    return QuestionOut(
        id=str(question.id),
        text=question.question_text,
        question_type=question.question_type,
        subject=subject.code if subject else question.subject_id,
        marks=question.marks,
        negative_marks=question.negative_marks,
        difficulty=question.difficulty,
        expected_answer=question.expected_answer,
        model_answer=question.model_answer,
        evaluation_criteria=question.evaluation_criteria,
        explanation=question.explanation,
        options=[{"key": option.option_key, "text": option.option_text, "is_correct": option.is_correct} for option in options],
        attachments=[{"id": attachment.id, "file_name": attachment.file_name, "file_type": attachment.file_type, "file_url": attachment.file_url, "file_size": attachment.file_size} for attachment in attachments],
        created_at=question.created_at.isoformat(),
        created_by=str(question.created_by),
    )


def ensure_default_admin_user() -> None:
    if not DEFAULT_ADMIN_EMAIL or not settings.initial_admin_password:
        return

    with SessionLocal() as db:
        existing = db.execute(select(User).where(User.email == DEFAULT_ADMIN_EMAIL)).scalar_one_or_none()
        if existing is not None:
            if existing.role != UserRole.admin:
                existing.role = UserRole.admin
            existing.password_hash = hash_password(settings.initial_admin_password)
            db.commit()
            return

        db.add(
            User(
                name="Platform Administrator",
                email=DEFAULT_ADMIN_EMAIL,
                password_hash=hash_password(settings.initial_admin_password),
                role=UserRole.admin,
                preferred_language="en",
                is_active=True,
            )
        )
        db.commit()


app = FastAPI(title="AIExamPlatform API", version="0.1.0")
Base.metadata.create_all(bind=engine)
ensure_default_admin_user()
with SessionLocal() as startup_db:
    ensure_default_subjects(startup_db)
    ensure_default_questions(startup_db)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_default_admin_user()
    with SessionLocal() as startup_db:
        ensure_default_subjects(startup_db)
        ensure_default_questions(startup_db)


@app.get("/")
def root() -> Dict[str, str]:
    return {
        "service": "aiexamplatform-api",
        "message": "AIExamPlatform API is running.",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse)
@app.get("/api/v1/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="aiexamplatform-api")


@app.post("/api/v1/auth/register", response_model=AuthResponse)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> AuthResponse:
    existing = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    normalized_role = _normalize_role(payload.role)

    user = User(
        name=payload.name.strip(),
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=normalized_role,
        preferred_language="en",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id), user.role)
    return AuthResponse(
        user=UserOut(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            preferred_language=user.preferred_language,
            is_active=user.is_active,
        ),
        access_token=access_token,
        refresh_token=refresh_token,
    )


@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id), user.role)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@app.get("/api/v1/users/me", response_model=UserOut)
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> UserOut:
    try:
        payload = decode_token(credentials.credentials)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        preferred_language=user.preferred_language,
        is_active=user.is_active,
    )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(credentials.credentials)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = db.get(User, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def require_roles(*allowed_roles: str):
    allowed = {role.strip().lower() for role in allowed_roles if role}

    def _require(user: User = Depends(get_current_user)) -> User:
        actual_role = user.role.strip().lower() if isinstance(user.role, str) else str(user.role).strip().lower()
        if actual_role not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return _require


@app.get("/api/v1/admin/dashboard", response_model=AdminDashboardSummary)
def get_admin_dashboard_summary(db: Session = Depends(get_db), user: User = Depends(require_roles("admin"))) -> AdminDashboardSummary:
    recent_users = db.execute(select(User).order_by(User.created_at.desc()).limit(5)).scalars().all()
    recent_exams = db.execute(select(Exam).order_by(Exam.created_at.desc()).limit(5)).scalars().all()

    return AdminDashboardSummary(
        total_users=db.query(User).count(),
        total_students=db.query(User).filter(User.role == UserRole.student.value).count(),
        total_examiners=db.query(User).filter(User.role == UserRole.examiner.value).count(),
        total_admins=db.query(User).filter(User.role == UserRole.admin.value).count(),
        total_exams=db.query(Exam).count(),
        published_exams=db.query(Exam).filter(Exam.status == ExamStatus.published.value).count(),
        total_questions=db.query(Question).count(),
        recent_users=[
            {
                "id": str(entry.id),
                "name": entry.name,
                "email": entry.email,
                "role": entry.role,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
                "is_active": entry.is_active,
            }
            for entry in recent_users
        ],
        recent_exams=[
            {
                "id": str(entry.id),
                "title": entry.title,
                "subject_id": entry.subject_id,
                "status": entry.status,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
                "created_by": str(entry.created_by),
            }
            for entry in recent_exams
        ],
    )


@app.get("/api/v1/admin/users", response_model=List[UserOut])
def list_admin_users(db: Session = Depends(get_db), user: User = Depends(require_roles("admin"))) -> List[UserOut]:
    users = db.execute(select(User).order_by(User.created_at.desc())).scalars().all()
    return [
        UserOut(
            id=str(entry.id),
            name=entry.name,
            email=entry.email,
            role=entry.role,
            preferred_language=entry.preferred_language,
            is_active=entry.is_active,
        )
        for entry in users
    ]


def _list_question_records(db: Session, subject: Optional[str] = None) -> List[QuestionOut]:
    query = select(Question).order_by(Question.created_at.desc())
    if subject:
        resolved_subject = _resolve_subject(db, subject)
        query = query.where(Question.subject_id == resolved_subject.id)
    return [_serialize_question(question, db) for question in db.execute(query).scalars().all()]


@app.get("/api/v1/question-bank/subjects", response_model=List[SubjectOut])
def list_question_bank_subjects(db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> List[SubjectOut]:
    ensure_default_subjects(db)
    subjects = db.execute(select(Subject).order_by(Subject.code)).scalars().all()
    return [SubjectOut(id=subject.id, name=subject.name, code=subject.code, question_count=db.query(Question).filter(Question.subject_id == subject.id).count()) for subject in subjects]


@app.get("/api/v1/question-bank/counts", response_model=List[SubjectOut])
def question_bank_counts(db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> List[SubjectOut]:
    return list_question_bank_subjects(db, user)


@app.get("/api/v1/question-bank/questions", response_model=List[QuestionOut])
def list_question_bank_questions(subject: Optional[str] = None, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> List[QuestionOut]:
    return _list_question_records(db, subject)


@app.get("/api/v1/question-bank/questions/{question_id}", response_model=QuestionOut)
def get_question_bank_question(question_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> QuestionOut:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return _serialize_question(question, db)


def _create_question(payload: QuestionCreate, db: Session, user: User) -> QuestionOut:
    subject = _resolve_subject(db, payload.subject)
    _validate_question_payload(payload, subject, db)
    if payload.question_type in {QuestionType.image_upload.value, QuestionType.pdf_upload.value, QuestionType.csv_upload.value} and not payload.attachment_id:
        raise HTTPException(status_code=400, detail="A valid attachment is required for this question type.")
    question = Question(
        subject_id=subject.id,
        question_type=payload.question_type,
        question_text=payload.text.strip(),
        difficulty=payload.difficulty.upper(),
        expected_answer=payload.expected_answer,
        model_answer=payload.model_answer,
        evaluation_criteria=payload.evaluation_criteria,
        explanation=payload.explanation,
        marks=payload.marks,
        negative_marks=payload.negative_marks,
        created_by=str(user.id),
    )
    db.add(question)
    db.flush()
    if payload.options:
        correct_options = payload.correct_options or []
        for index, option in enumerate(payload.options):
            db.add(QuestionOption(question_id=question.id, option_key=chr(65 + index), option_text=option.strip(), is_correct=index in correct_options))
    if payload.attachment_id:
        attachment = db.get(QuestionAttachment, payload.attachment_id)
        if attachment is None or attachment.question_id is not None:
            raise HTTPException(status_code=400, detail="Attachment is invalid or already linked.")
        attachment.question_id = question.id
    db.commit()
    db.refresh(question)
    return _serialize_question(question, db)


@app.post("/api/v1/question-bank/questions", response_model=QuestionOut)
def create_question_bank_question(payload: QuestionCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> QuestionOut:
    return _create_question(payload, db, user)


@app.post("/api/v1/questions/", response_model=QuestionOut)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> QuestionOut:
    return _create_question(payload, db, user)


def _update_question(question_id: str, payload: QuestionUpdate, db: Session, user: User) -> QuestionOut:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    subject = db.get(Subject, question.subject_id) if payload.subject is None else _resolve_subject(db, payload.subject)
    if subject is None:
        raise HTTPException(status_code=400, detail="Question subject not found.")
    _validate_question_payload(payload, subject, db, question)
    if payload.question_type in {QuestionType.image_upload.value, QuestionType.pdf_upload.value, QuestionType.csv_upload.value} and payload.attachment_id is None:
        has_attachment = db.query(QuestionAttachment).filter(QuestionAttachment.question_id == question.id).first() is not None
        if not has_attachment:
            raise HTTPException(status_code=400, detail="A valid attachment is required for this question type.")

    if payload.text is not None:
        question.question_text = payload.text.strip()
    if payload.question_type is not None:
        question.question_type = payload.question_type
    question.subject_id = subject.id
    if payload.marks is not None:
        question.marks = payload.marks
    if payload.negative_marks is not None:
        question.negative_marks = payload.negative_marks
    if payload.difficulty is not None:
        question.difficulty = payload.difficulty.upper()
    if payload.expected_answer is not None:
        question.expected_answer = payload.expected_answer
    if payload.model_answer is not None:
        question.model_answer = payload.model_answer
    if payload.evaluation_criteria is not None:
        question.evaluation_criteria = payload.evaluation_criteria
    if payload.explanation is not None:
        question.explanation = payload.explanation
    if payload.options is not None:
        db.query(QuestionOption).filter(QuestionOption.question_id == question.id).delete(synchronize_session=False)
        for index, option in enumerate(payload.options):
            db.add(QuestionOption(question_id=question.id, option_key=chr(65 + index), option_text=option.strip(), is_correct=index in (payload.correct_options or [])))
    if payload.attachment_id is not None:
        attachment = db.get(QuestionAttachment, payload.attachment_id)
        if attachment is None or attachment.question_id not in (None, question.id):
            raise HTTPException(status_code=400, detail="Attachment is invalid or already linked.")
        attachment.question_id = question.id
    db.commit()
    db.refresh(question)
    return _serialize_question(question, db)


@app.put("/api/v1/question-bank/questions/{question_id}", response_model=QuestionOut)
def update_question_bank_question(question_id: str, payload: QuestionUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> QuestionOut:
    return _update_question(question_id, payload, db, user)


@app.put("/api/v1/questions/{question_id}", response_model=QuestionOut)
def update_question(question_id: str, payload: QuestionUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> QuestionOut:
    return _update_question(question_id, payload, db, user)


@app.delete("/api/v1/question-bank/questions/{question_id}")
def delete_question_bank_question(question_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> Dict[str, Any]:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    attachments = db.query(QuestionAttachment).filter(QuestionAttachment.question_id == question.id).all()
    for attachment in attachments:
        (UPLOAD_ROOT / attachment.stored_name).unlink(missing_ok=True)
    db.query(QuestionOption).filter(QuestionOption.question_id == question.id).delete(synchronize_session=False)
    db.query(QuestionAttachment).filter(QuestionAttachment.question_id == question.id).delete(synchronize_session=False)
    db.delete(question)
    db.commit()
    return {"success": True, "message": "Question deleted successfully."}


@app.delete("/api/v1/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> Dict[str, Any]:
    return delete_question_bank_question(question_id, db, user)


@app.post("/api/v1/question-bank/upload")
def upload_question_attachment(question_id: Optional[str] = None, file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> Dict[str, Any]:
    allowed = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf", ".csv": "text/csv"}
    extension = Path(file.filename or "").suffix.lower()
    if extension not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported attachment format.")
    if file.content_type and file.content_type not in {allowed[extension], "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Attachment MIME type does not match its file extension.")
    contents = file.file.read()
    if not contents or len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Attachment must be between 1 byte and 10 MB.")
    if extension == ".pdf" and not contents.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file.")
    if extension == ".csv" and b"\n" not in contents and b"," not in contents:
        raise HTTPException(status_code=400, detail="Invalid CSV file.")
    if question_id is not None and db.get(Question, question_id) is None:
        raise HTTPException(status_code=404, detail="Question not found")
    stored_name = f"{uuid4().hex}{extension}"
    with (UPLOAD_ROOT / stored_name).open("wb") as output:
        output.write(contents)
    attachment = QuestionAttachment(
        question_id=question_id,
        file_name=Path(file.filename or stored_name).name,
        stored_name=stored_name,
        file_type=allowed[extension],
        file_url=f"/uploads/{stored_name}",
        file_size=len(contents),
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return {"id": attachment.id, "file_name": attachment.file_name, "file_type": attachment.file_type, "file_url": attachment.file_url, "file_size": attachment.file_size}


@app.delete("/api/v1/question-bank/attachments/{attachment_id}")
def delete_question_attachment(attachment_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> Dict[str, Any]:
    attachment = db.get(QuestionAttachment, attachment_id)
    if attachment is None:
        raise HTTPException(status_code=404, detail="Attachment not found")
    (UPLOAD_ROOT / attachment.stored_name).unlink(missing_ok=True)
    db.delete(attachment)
    db.commit()
    return {"success": True}


@app.get("/api/v1/exams/", response_model=List[ExamOut])
def list_exams(db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin", "student"))) -> List[ExamOut]:
    exams = db.execute(select(Exam)).scalars().all()
    return [_serialize_exam(exam) for exam in exams]


@app.get("/api/v1/exams/{exam_id}", response_model=ExamOut)
def get_exam(exam_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin", "student"))) -> ExamOut:
    exam = db.get(Exam, exam_id)
    if exam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    return _serialize_exam(exam)


@app.post("/api/v1/exams/", response_model=ExamOut)
def create_exam(payload: ExamCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("examiner", "admin"))) -> ExamOut:
    subject_id = payload.subject_name or payload.subject_id or "General"
    start_time = _normalize_exam_datetime(payload.start_time)
    end_time = _normalize_exam_datetime(payload.end_time)
    _validate_exam_date_range(start_time, end_time)

    exam = Exam(
        title=payload.title,
        description=payload.description,
        subject_id=subject_id,
        duration_minutes=payload.duration_minutes,
        start_time=start_time,
        end_time=end_time,
        question_count=payload.question_count,
        negative_marking=payload.negative_marking,
        randomize_questions=payload.randomize_questions,
        randomize_options=payload.randomize_options,
        proctoring_enabled=payload.proctoring_enabled,
        gaze_tracking_enabled=payload.gaze_tracking_enabled,
        multiple_face_detection=payload.multiple_face_detection,
        max_tab_switches=payload.max_tab_switches,
        status=payload.status,
        created_by=str(user.id),
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return _serialize_exam(exam)


@app.put("/api/v1/exams/{exam_id}", response_model=ExamOut)
def update_exam(
    exam_id: str,
    payload: ExamUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("examiner", "admin")),
) -> ExamOut:
    exam = db.get(Exam, exam_id)
    if exam is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    start_time = exam.start_time
    end_time = exam.end_time

    if payload.title is not None:
        exam.title = payload.title
    if payload.description is not None:
        exam.description = payload.description
    if payload.subject_id is not None or payload.subject_name is not None:
        exam.subject_id = payload.subject_name or payload.subject_id or exam.subject_id
    if payload.duration_minutes is not None:
        exam.duration_minutes = payload.duration_minutes
    if payload.start_time is not None:
        start_time = _normalize_exam_datetime(payload.start_time)
        exam.start_time = start_time
    if payload.end_time is not None:
        end_time = _normalize_exam_datetime(payload.end_time)
        exam.end_time = end_time
    if payload.question_count is not None:
        exam.question_count = payload.question_count
    if payload.negative_marking is not None:
        exam.negative_marking = payload.negative_marking
    if payload.randomize_questions is not None:
        exam.randomize_questions = payload.randomize_questions
    if payload.randomize_options is not None:
        exam.randomize_options = payload.randomize_options
    if payload.proctoring_enabled is not None:
        exam.proctoring_enabled = payload.proctoring_enabled
    if payload.gaze_tracking_enabled is not None:
        exam.gaze_tracking_enabled = payload.gaze_tracking_enabled
    if payload.multiple_face_detection is not None:
        exam.multiple_face_detection = payload.multiple_face_detection
    if payload.max_tab_switches is not None:
        exam.max_tab_switches = payload.max_tab_switches
    if payload.status is not None:
        exam.status = payload.status

    _validate_exam_date_range(exam.start_time, exam.end_time)

    db.commit()
    db.refresh(exam)
    return _serialize_exam(exam)


@app.websocket("/ws/proctor/{session_id}")
async def proctor_heartbeat(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    try:
        while True:
            payload = HeartbeatPayload.model_validate(await websocket.receive_json())
            if payload.session_id != session_id:
                await websocket.send_json({"error": "session_id mismatch"})
                continue
            await websocket.send_json(
                {
                    "type": "heartbeat_ack",
                    "session_id": session_id,
                    "suspicion_score": payload.suspicion_score,
                    "status": "ok",
                }
            )
    except WebSocketDisconnect:
        return
