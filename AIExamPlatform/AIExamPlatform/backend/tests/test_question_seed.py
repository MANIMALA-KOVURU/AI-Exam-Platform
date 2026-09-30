from collections import Counter

import pytest

from app.database import Base, SessionLocal, engine
from app.main import ensure_default_admin_user, ensure_default_subjects
from app.models import Question, QuestionAttachment, Subject
from app.question_seed import ensure_default_questions
from sqlalchemy import select


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    ensure_default_admin_user()
    with SessionLocal() as db:
        ensure_default_subjects(db)
    yield
    Base.metadata.drop_all(bind=engine)


def test_seed_creates_exact_150_questions_with_required_distribution_and_is_idempotent():
    with SessionLocal() as db:
        ensure_default_questions(db)
        first_total = db.query(Question).count()
        ensure_default_questions(db)
        assert first_total == 150
        assert db.query(Question).count() == 150

        subjects = db.execute(select(Subject).where(Subject.code.in_(["DBMS", "OS", "JAVA", "PYTHON", "DSA"]))).scalars().all()
        assert len(subjects) == 5
        for subject in subjects:
            questions = db.query(Question).filter(Question.subject_id == subject.id).all()
            assert len(questions) == 30
            assert Counter(question.question_type.value for question in questions) == {
                "mcq": 10,
                "multi_select": 5,
                "short_answer": 4,
                "long_answer": 4,
                "image_upload": 3,
                "pdf_upload": 2,
                "csv_upload": 2,
            }
            assert Counter(question.difficulty for question in questions) == {"EASY": 10, "MEDIUM": 10, "HARD": 10}
            assert db.query(QuestionAttachment).join(Question, QuestionAttachment.question_id == Question.id).filter(Question.subject_id == subject.id).count() == 7


def test_seed_does_not_overwrite_an_edited_default_question():
    with SessionLocal() as db:
        ensure_default_questions(db)
        question = db.execute(select(Question).where(Question.seed_key == "DBMS-01")).scalar_one()
        question.question_text = "Examiner edited this seeded question"
        db.commit()
        ensure_default_questions(db)
        db.refresh(question)
        assert question.question_text == "Examiner edited this seeded question"
