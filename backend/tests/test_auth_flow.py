import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app, ensure_default_admin_user


@pytest.fixture(autouse=True)
def reset_database() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    ensure_default_admin_user()
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_register_and_login_flow() -> None:
    unique_email = "student+flow@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": unique_email,
            "password": "Password123!",
            "role": "student",
        },
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["user"]["email"] == unique_email
    assert "access_token" in data

    login = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": "Password123!"},
    )
    assert login.status_code == 200, login.text
    assert "access_token" in login.json()


def test_question_creation_requires_examiner_role() -> None:
    unique_email = "examiner+role@example.com"
    register = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Examiner User",
            "email": unique_email,
            "password": "Password123!",
            "role": "examiner",
        },
    )
    token = register.json()["access_token"]
    response = client.post(
        "/api/v1/questions/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "text": "What is 2 + 2?",
            "question_type": "mcq",
            "subject": "Mathematics",
            "marks": 5,
            "model_answer": "4",
            "options": ["2", "3", "4", "5"],
            "correct_options": ["3"],
        },
    )
    assert response.status_code == 200, response.text
    assert response.json()["text"] == "What is 2 + 2?"


def test_exam_create_and_update_flow() -> None:
    register = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Examiner User",
            "email": "examiner+exam@example.com",
            "password": "Password123!",
            "role": "examiner",
        },
    )
    assert register.status_code == 200, register.text
    token = register.json()["access_token"]

    create = client.post(
        "/api/v1/exams/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Math Quiz",
            "description": "Initial math exam",
            "subject_id": "Mathematics",
            "duration_minutes": 60,
            "question_count": 12,
            "status": "draft",
            "start_time": "2026-10-01T09:00:00",
            "end_time": "2026-10-01T10:00:00",
        },
    )
    assert create.status_code == 200, create.text
    created = create.json()
    assert created["title"] == "Math Quiz"
    assert created["subject_name"] == "Mathematics"

    update = client.put(
        f"/api/v1/exams/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Advanced Math Quiz",
            "description": "Updated math exam",
            "subject_id": "Mathematics",
            "duration_minutes": 90,
            "question_count": 20,
            "status": "published",
            "start_time": "2026-10-02T09:00:00",
            "end_time": "2026-10-02T10:30:00",
        },
    )
    assert update.status_code == 200, update.text
    updated = update.json()
    assert updated["title"] == "Advanced Math Quiz"
    assert updated["duration_minutes"] == 90
    assert updated["question_count"] == 20
    assert updated["status"] == "published"

    list_response = client.get(
        "/api/v1/exams/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_response.status_code == 200, list_response.text
    exams = list_response.json()
    assert any(exam["id"] == created["id"] and exam["title"] == "Advanced Math Quiz" for exam in exams)


def test_exam_date_validation_rejects_end_before_start() -> None:
    register = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Examiner User",
            "email": "examiner+date-validation@example.com",
            "password": "Password123!",
            "role": "examiner",
        },
    )
    assert register.status_code == 200, register.text
    token = register.json()["access_token"]

    response = client.post(
        "/api/v1/exams/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Invalid Date Exam",
            "description": "Should fail validation",
            "subject_id": "Mathematics",
            "duration_minutes": 60,
            "question_count": 12,
            "status": "draft",
            "start_time": "2026-09-25T12:00:00",
            "end_time": "2026-09-25T11:00:00",
        },
    )
    assert response.status_code == 400, response.text
    assert "End date/time must be after the start date/time." in response.json()["detail"]


def test_default_admin_account_exists() -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@aiexamplatform.com", "password": "Admin@123"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["access_token"]


def test_public_registration_cannot_create_admin() -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Unapproved Admin",
            "email": "unapproved-admin@example.com",
            "password": "Password123!",
            "role": "admin",
        },
    )
    assert response.status_code == 400


def test_refresh_token_cannot_access_authenticated_api() -> None:
    register = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Refresh Token User",
            "email": "refresh-token@example.com",
            "password": "Password123!",
            "role": "student",
        },
    )
    refresh_token = register.json()["refresh_token"]

    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert response.status_code == 401
