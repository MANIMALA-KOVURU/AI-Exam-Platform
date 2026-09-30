from io import BytesIO

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app, ensure_default_admin_user, ensure_default_subjects
from app.database import SessionLocal


@pytest.fixture(autouse=True)
def reset_database() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    ensure_default_admin_user()
    with SessionLocal() as db:
        ensure_default_subjects(db)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def examiner_token() -> str:
    response = client.post("/api/v1/auth/register", json={"name": "Examiner", "email": "qb@example.com", "password": "Password123!", "role": "examiner"})
    return response.json()["access_token"]


def headers(token: str):
    return {"Authorization": f"Bearer {token}"}


def question_payload(index: int, subject: str = "DBMS"):
    return {
        "text": f"Question {index} for {subject}",
        "question_type": "mcq",
        "subject": subject,
        "marks": 2,
        "difficulty": "EASY",
        "options": ["Option one", "Option two"],
        "correct_options": [0],
    }


def test_subjects_are_seeded_and_question_crud_uses_normalized_options() -> None:
    token = examiner_token()
    response = client.get("/api/v1/question-bank/subjects", headers=headers(token))
    assert response.status_code == 200
    assert [subject["code"] for subject in response.json()] == ["DBMS", "DSA", "JAVA", "OS", "PYTHON"]

    created = client.post("/api/v1/question-bank/questions", headers=headers(token), json=question_payload(1))
    assert created.status_code == 200, created.text
    data = created.json()
    assert data["subject"] == "DBMS"
    assert data["options"] == [{"key": "A", "text": "Option one", "is_correct": True}, {"key": "B", "text": "Option two", "is_correct": False}]

    updated = client.put(f"/api/v1/question-bank/questions/{data['id']}", headers=headers(token), json={"difficulty": "HARD", "marks": 5})
    assert updated.status_code == 200, updated.text
    assert updated.json()["difficulty"] == "HARD"

    deleted = client.delete(f"/api/v1/question-bank/questions/{data['id']}", headers=headers(token))
    assert deleted.status_code == 200
    assert client.get(f"/api/v1/question-bank/questions/{data['id']}", headers=headers(token)).status_code == 404


def test_questions_can_exceed_seeded_count_and_subject_moves_remain_supported() -> None:
    token = examiner_token()
    for index in range(30):
        response = client.post("/api/v1/question-bank/questions", headers=headers(token), json=question_payload(index, "DBMS"))
        assert response.status_code == 200, response.text
    question_31 = client.post("/api/v1/question-bank/questions", headers=headers(token), json=question_payload(31, "DBMS"))
    assert question_31.status_code == 200, question_31.text
    question_32 = client.post("/api/v1/question-bank/questions", headers=headers(token), json=question_payload(32, "DBMS"))
    assert question_32.status_code == 200, question_32.text
    counts = client.get("/api/v1/question-bank/subjects", headers=headers(token)).json()
    assert next(subject["question_count"] for subject in counts if subject["code"] == "DBMS") == 32

    movable = client.post("/api/v1/question-bank/questions", headers=headers(token), json=question_payload(100, "OS"))
    assert movable.status_code == 200
    moved = client.put(f"/api/v1/question-bank/questions/{movable.json()['id']}", headers=headers(token), json={"subject": "JAVA"})
    assert moved.status_code == 200, moved.text
    assert moved.json()["subject"] == "JAVA"


def test_question_type_validation_and_attachments() -> None:
    token = examiner_token()
    invalid = client.post("/api/v1/question-bank/questions", headers=headers(token), json={**question_payload(1), "question_type": "mcq", "options": ["only one"], "correct_options": [0]})
    assert invalid.status_code == 400

    multi = client.post("/api/v1/question-bank/questions", headers=headers(token), json={"text": "Choose languages", "question_type": "multi_select", "subject": "JAVA", "marks": 2, "difficulty": "MEDIUM", "options": ["Java", "Python", "HTML"], "correct_options": [0, 1]})
    assert multi.status_code == 200, multi.text
    assert sum(option["is_correct"] for option in multi.json()["options"]) == 2

    short_answer = client.post("/api/v1/question-bank/questions", headers=headers(token), json={"text": "Define normalization", "question_type": "short_answer", "subject": "DBMS", "marks": 1, "difficulty": "EASY", "expected_answer": "Reduce redundancy"})
    assert short_answer.status_code == 200, short_answer.text

    upload = client.post("/api/v1/question-bank/upload", headers=headers(token), files={"file": ("notes.pdf", b"%PDF-1.7 test", "application/pdf")})
    assert upload.status_code == 200, upload.text
    attachment_id = upload.json()["id"]
    image_without_file = client.post("/api/v1/question-bank/questions", headers=headers(token), json={"text": "Identify image", "question_type": "image_upload", "subject": "DSA", "marks": 1, "difficulty": "HARD"})
    assert image_without_file.status_code == 400
    image = client.post("/api/v1/question-bank/questions", headers=headers(token), json={"text": "Identify PDF", "question_type": "pdf_upload", "subject": "DSA", "marks": 1, "difficulty": "HARD", "attachment_id": attachment_id})
    assert image.status_code == 200, image.text


def test_question_bank_rejects_student_access() -> None:
    response = client.post("/api/v1/auth/register", json={"name": "Student", "email": "student-qb@example.com", "password": "Password123!", "role": "student"})
    token = response.json()["access_token"]
    assert client.get("/api/v1/question-bank/subjects", headers=headers(token)).status_code == 403
    assert client.post("/api/v1/question-bank/questions", headers=headers(token), json=question_payload(1)).status_code == 403
