import json
import uuid
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import NOT_FOUND_EN, NOT_FOUND_TE
from database import get_connection
from rag_service import rag_service
from translation_service import translation_service
from quiz_service import quiz_service
from timetable_service import timetable_service
from teacher_service import teacher_service
from ocr_service import ocr_service
from evaluation_service import evaluation_service

app = FastAPI(
    title="Manovriddhi AI (మనోవృద్ధి) API",
    version="2.0.0",
    description="YUKTHI 2026 — Advanced AI-Powered Personalized Learning Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- SCHEMAS -----------------
class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1500)
    grade: str = "Class 6"
    subject: str = "Science"
    chapter: str = ""
    language: str = "English"
    mode: str = "simple"

class TranslateRequest(BaseModel):
    text: str = Field(min_length=1)
    source_lang: str = "auto"
    target_lang: str = "Telugu"

class QuizSubmitRequest(BaseModel):
    student_id: str = "student_mohith"
    chapter_id: str = "chap_6_sci_1"
    answers: List[Dict[str, Any]]
    time_taken_sec: int = 60

class StudySessionRequest(BaseModel):
    student_id: str = "student_mohith"
    subject: str = "Science"
    chapter: str = "Plants: Parts and Functions"
    activity_type: str = "tutor_and_quiz"
    duration_minutes: float = Field(gt=0, le=720)
    notes: Optional[str] = ""

class TimetableGenerateRequest(BaseModel):
    student_id: str = "student_mohith"
    title: str = "My Personalized Study Plan"
    available_days: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    daily_limit_hours: float = 2.5
    study_start_time: str = "17:30"
    session_duration_minutes: int = 45
    break_duration_minutes: int = 15
    target_exam: str = "Midterm Exams 2026"
    subjects: List[Dict[str, Any]] = [
        {"name": "Science", "confidence": "Low", "topics": "Plants, Nutrition"},
        {"name": "Mathematics", "confidence": "Medium", "topics": "Real Numbers"},
        {"name": "Social Studies", "confidence": "High", "topics": "Natural Resources"}
    ]

class NoteCreateRequest(BaseModel):
    student_id: str = "student_mohith"
    chapter_id: Optional[str] = "chap_6_sci_1"
    title: str
    content: str
    is_mistake_note: int = 0

class ReportCreateRequest(BaseModel):
    student_id: Optional[str] = "student_mohith"
    report_type: str = "incorrect_answer"
    question: Optional[str] = ""
    answer: Optional[str] = ""
    reason: str

class PhotoAskRequest(BaseModel):
    image_base64: str
    grade: str = "Class 6"
    subject: str = "Science"
    chapter: str = ""
    language: str = "English"

class ProfileUpdateRequest(BaseModel):
    student_id: str = "student_mohith"
    full_name: str
    grade: str
    board: str
    preferred_language: str
    study_hours_daily: float
    exam_date: Optional[str] = None


# ----------------- ROUTES -----------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "platform": "Manovriddhi AI (మనోవృద్ధి)",
        "competition": "YUKTHI 2026",
        "grounding": "Textbook RAG Verified",
        "default_language": "Telugu & English"
    }

# 1. CATALOG (Grades, Subjects, Chapters)
@app.get("/api/catalog")
def get_catalog():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM subjects ORDER BY grade, name")
    subjects = [dict(r) for r in c.fetchall()]

    c.execute("SELECT * FROM chapters ORDER BY chapter_number")
    chapters = [dict(r) for r in c.fetchall()]
    conn.close()

    # Group chapters under subjects
    grouped = []
    for s in subjects:
        chaps = [ch for ch in chapters if ch["subject_id"] == s["id"]]
        grouped.append({
            **s,
            "chapters": chaps
        })
    return {"subjects": grouped}

# 2. AI TUTOR (Strict Textbook-Grounded RAG)
@app.post("/api/ask")
def ask_question(req: AskRequest):
    return rag_service.answer_question(
        question=req.question,
        grade=req.grade,
        subject=req.subject,
        chapter=req.chapter,
        language=req.language,
        mode=req.mode
    )

# 3. WORKING TRANSLATION (Telugu <-> English)
@app.post("/api/translate")
def translate_content(req: TranslateRequest):
    return translation_service.translate(
        text=req.text,
        source_lang=req.source_lang,
        target_lang=req.target_lang
    )

# 4. QUIZ ENGINE & ADAPTIVE PRACTICE
@app.get("/api/quiz")
def get_quiz_questions(chapter_id: str = "chap_6_sci_1", student_id: str = "student_mohith", difficulty: str = "all", count: int = 5):
    questions = quiz_service.get_questions(chapter_id=chapter_id, student_id=student_id, difficulty=difficulty, count=count)
    return {"chapter_id": chapter_id, "questions": questions}

@app.post("/api/quiz/submit")
def submit_quiz_attempt(req: QuizSubmitRequest):
    return quiz_service.submit_attempt(
        student_id=req.student_id,
        chapter_id=req.chapter_id,
        answers=req.answers,
        time_taken_sec=req.time_taken_sec
    )

# 5. TIMETABLE GENERATOR
@app.post("/api/timetable/generate")
def generate_timetable(req: TimetableGenerateRequest):
    return timetable_service.generate_schedule(req.model_dump())

@app.get("/api/timetable/latest")
def get_latest_timetable(student_id: str = "student_mohith"):
    tt = timetable_service.get_latest_timetable(student_id)
    if not tt:
        # Generate default schedule on first call
        return timetable_service.generate_schedule({"student_id": student_id})
    return tt

# 6. STUDY TIMER & PERSISTENT SESSION TRACKING
@app.post("/api/study-timer/save")
def save_study_session(req: StudySessionRequest):
    conn = get_connection()
    c = conn.cursor()
    session_id = f"sess_{uuid.uuid4().hex[:10]}"
    c.execute("""
    INSERT INTO study_sessions (id, student_id, subject, chapter, activity_type, duration_minutes, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (session_id, req.student_id, req.subject, req.chapter, req.activity_type, req.duration_minutes, req.notes))

    # Award 10 XP for every 20 minutes studied
    xp_earned = int((req.duration_minutes / 20.0) * 10)
    if xp_earned > 0:
        c.execute("UPDATE profiles SET xp = xp + ? WHERE id = ?", (xp_earned, req.student_id))
        c.execute("""
        INSERT INTO xp_transactions (id, student_id, amount, reason)
        VALUES (?, ?, ?, ?)
        """, (f"xp_{uuid.uuid4().hex[:8]}", req.student_id, xp_earned, f"Study session: {req.duration_minutes} min"))

    conn.commit()
    conn.close()

    return {"success": True, "session_id": session_id, "xp_earned": xp_earned}

@app.get("/api/study-timer/history")
def get_study_history(student_id: str = "student_mohith"):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT id, subject, chapter, activity_type, duration_minutes, notes, created_at
    FROM study_sessions
    WHERE student_id = ?
    ORDER BY created_at DESC
    LIMIT 20
    """, (student_id,))
    rows = [dict(r) for r in c.fetchall()]

    c.execute("""
    SELECT DATE(created_at) as study_date, SUM(duration_minutes) as total_min
    FROM study_sessions
    WHERE student_id = ?
    GROUP BY DATE(created_at)
    ORDER BY study_date DESC
    LIMIT 7
    """, (student_id,))
    daily_totals = [dict(r) for r in c.fetchall()]
    conn.close()

    total_minutes_all = sum(r["duration_minutes"] for r in rows)
    return {
        "recent_sessions": rows,
        "daily_totals": daily_totals,
        "total_minutes_studied": round(total_minutes_all, 1),
        "total_sessions_count": len(rows)
    }

# 7. DAY-BY-DAY IMPROVEMENT & PROGRESS ANALYTICS
@app.get("/api/progress")
def get_progress_analytics(student_id: str = "student_mohith"):
    conn = get_connection()
    c = conn.cursor()

    # Student Profile
    c.execute("SELECT * FROM profiles WHERE id = ?", (student_id,))
    profile = dict(c.fetchone()) if c.fetchone else {}

    # Quiz Attempts (Trend over time)
    c.execute("""
    SELECT id, chapter_id, score, total_questions, accuracy_pct, time_taken_sec, created_at
    FROM quiz_attempts
    WHERE student_id = ?
    ORDER BY created_at ASC
    """, (student_id,))
    attempts = [dict(r) for r in c.fetchall()]

    # Topic Mastery Heatmap
    c.execute("""
    SELECT topic, topic_te, total_attempts, correct_attempts, mastery_pct, last_reviewed
    FROM topic_mastery
    WHERE student_id = ?
    ORDER BY mastery_pct ASC
    """, (student_id,))
    mastery = [dict(r) for r in c.fetchall()]

    # Study Sessions (Last 7 Days)
    c.execute("""
    SELECT DATE(created_at) as date, SUM(duration_minutes) as minutes
    FROM study_sessions
    WHERE student_id = ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
    LIMIT 7
    """, (student_id,))
    study_time_data = [dict(r) for r in c.fetchall()]

    # Subject performance
    c.execute("""
    SELECT c.subject_id, s.name as subject_name, AVG(qa.accuracy_pct) as avg_score, COUNT(qa.id) as attempts_count
    FROM quiz_attempts qa
    JOIN chapters c ON qa.chapter_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE qa.student_id = ?
    GROUP BY c.subject_id, s.name
    """, (student_id,))
    subject_perf = [dict(r) for r in c.fetchall()]
    conn.close()

    # Compare latest vs previous attempt for delta
    improvement_delta = None
    if len(attempts) >= 2:
        latest = attempts[-1]
        prev = attempts[-2]
        improvement_delta = {
            "previous_score_pct": prev["accuracy_pct"],
            "latest_score_pct": latest["accuracy_pct"],
            "delta_pct": round(latest["accuracy_pct"] - prev["accuracy_pct"], 1),
            "improved": latest["accuracy_pct"] >= prev["accuracy_pct"]
        }

    weak_topics = [m["topic"] for m in mastery if m["mastery_pct"] < 60]
    mastered_topics = [m["topic"] for m in mastery if m["mastery_pct"] >= 80]

    return {
        "profile": profile,
        "attempts_history": attempts,
        "topic_mastery": mastery,
        "study_time_trend": study_time_data,
        "subject_performance": subject_perf,
        "improvement_delta": improvement_delta,
        "weak_topics": weak_topics,
        "mastered_topics": mastered_topics,
        "total_quizzes_taken": len(attempts),
        "overall_quiz_accuracy_pct": round(sum(a["accuracy_pct"] for a in attempts) / len(attempts), 1) if attempts else 0.0
    }

# 8. GAMIFICATION & REWARDS
@app.get("/api/rewards")
def get_rewards(student_id: str = "student_mohith"):
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT streak, xp, level FROM profiles WHERE id = ?", (student_id,))
    p = c.fetchone()
    streak = p["streak"] if p else 1
    xp = p["xp"] if p else 100
    level = max(1, xp // 200)

    # All achievements with earned flag
    c.execute("""
    SELECT a.*, (sa.id IS NOT NULL) as is_earned, sa.earned_at
    FROM achievements a
    LEFT JOIN student_achievements sa ON a.code = sa.achievement_code AND sa.student_id = ?
    ORDER BY a.xp_reward ASC
    """, (student_id,))
    achievements = [dict(r) for r in c.fetchall()]

    # XP Transactions
    c.execute("""
    SELECT amount, reason, created_at FROM xp_transactions
    WHERE student_id = ? ORDER BY created_at DESC LIMIT 10
    """, (student_id,))
    transactions = [dict(r) for r in c.fetchall()]

    conn.close()

    # Pre-configured daily missions
    missions = [
        {"id": "m1", "title": "Complete 1 Practice Quiz", "title_te": "1 క్విజ్ పూర్తి చేయండి", "target": 1, "current": 1, "completed": True, "xp": 40},
        {"id": "m2", "title": "Study for 30 Minutes", "title_te": "30 నిమిషాలు చదవండి", "target": 30, "current": 30, "completed": True, "xp": 50},
        {"id": "m3", "title": "Revise 3 Flashcards", "title_te": "3 ఫ్లాష్‌కార్డులను పునశ్చరణ చేయండి", "target": 3, "current": 2, "completed": False, "xp": 30},
        {"id": "m4", "title": "Ask AI Tutor 1 Question in Telugu", "title_te": "తెలుగులో 1 ప్రశ్న అడగండి", "target": 1, "current": 1, "completed": True, "xp": 25}
    ]

    return {
        "student_id": student_id,
        "xp": xp,
        "level": level,
        "streak": streak,
        "next_level_xp": (level) * 200,
        "achievements": achievements,
        "daily_missions": missions,
        "recent_xp_activity": transactions
    }

# 9. FLASHCARDS & REVISION CENTER
@app.get("/api/flashcards")
def get_flashcards(chapter_id: str = "chap_6_sci_1", student_id: str = "student_mohith"):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM flashcards WHERE chapter_id = ?", (chapter_id,))
    cards = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"chapter_id": chapter_id, "flashcards": cards}

@app.post("/api/flashcards/review")
def review_flashcard(student_id: str = "student_mohith", flashcard_id: str = "fc_1", rating: str = "good"):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO flashcard_reviews (id, student_id, flashcard_id, rating)
    VALUES (?, ?, ?, ?)
    """, (f"fcr_{uuid.uuid4().hex[:8]}", student_id, flashcard_id, rating))
    # Give 5 XP per flashcard reviewed
    c.execute("UPDATE profiles SET xp = xp + 5 WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()
    return {"success": True, "rating": rating}

# 10. SAVED NOTES & MISTAKE NOTEBOOK
@app.get("/api/notes")
def get_saved_notes(student_id: str = "student_mohith"):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM saved_notes WHERE student_id = ? ORDER BY created_at DESC", (student_id,))
    notes = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"notes": notes}

@app.post("/api/notes")
def create_saved_note(req: NoteCreateRequest):
    conn = get_connection()
    c = conn.cursor()
    note_id = f"note_{uuid.uuid4().hex[:8]}"
    c.execute("""
    INSERT INTO saved_notes (id, student_id, chapter_id, title, content, is_mistake_note)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (note_id, req.student_id, req.chapter_id, req.title, req.content, req.is_mistake_note))
    conn.commit()
    conn.close()
    return {"success": True, "note_id": note_id}

# 11. EDUCATIONAL RESOURCES (YouTube, Official SCERT, Google References)
@app.get("/api/resources")
def get_educational_resources(chapter_id: str = "chap_6_sci_1"):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM educational_resources WHERE chapter_id = ?", (chapter_id,))
    res = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"chapter_id": chapter_id, "resources": res}

# 12. TEACHER DASHBOARD
@app.get("/api/teacher/dashboard")
def get_teacher_dashboard(teacher_id: str = "teacher_saritha"):
    return teacher_service.get_dashboard_data(teacher_id)

# 13. PHOTO-BASED LEARNING
@app.post("/api/photo-ask")
def ask_from_photo(req: PhotoAskRequest):
    return ocr_service.process_image_and_ask(
        image_data=req.image_base64,
        grade=req.grade,
        subject=req.subject,
        chapter=req.chapter,
        language=req.language
    )

# 14. EVALUATION DASHBOARD (Benchmark Test Suite)
@app.get("/api/evaluation/run")
def run_evaluation_benchmark():
    return evaluation_service.run_benchmark()

# 15. PROFILE & ROLES
@app.get("/api/auth/profile")
def get_user_profile(user_id: str = "student_mohith"):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM profiles WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User profile not found")
    return dict(row)

@app.post("/api/auth/update-profile")
def update_user_profile(req: ProfileUpdateRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    UPDATE profiles 
    SET full_name = ?, grade = ?, board = ?, preferred_language = ?, study_hours_daily = ?, exam_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (req.full_name, req.grade, req.board, req.preferred_language, req.study_hours_daily, req.exam_date, req.student_id))
    conn.commit()
    conn.close()
    return {"success": True}

# 16. CONTENT REPORTS & FEEDBACK
@app.post("/api/reports")
def submit_content_report(req: ReportCreateRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO content_reports (id, student_id, report_type, question, answer, reason)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (f"rep_{uuid.uuid4().hex[:8]}", req.student_id, req.report_type, req.question, req.answer, req.reason))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Feedback submitted successfully for educator review."}

# 17. STATIC SPA SERVING (Production & Standalone Run)
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        target = DIST_DIR / full_path
        if target.exists() and target.is_file():
            return FileResponse(target)
        return FileResponse(DIST_DIR / "index.html")
