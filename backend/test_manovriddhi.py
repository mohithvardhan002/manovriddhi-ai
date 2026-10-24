import unittest
import json
from fastapi.testclient import TestClient
from main import app
from database import init_db
from seed_data import seed_all

class TestManovriddhiPlatform(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_all()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["platform"], "Manovriddhi AI (మనోవృద్ధి)")

    def test_02_catalog_retrieval(self):
        r = self.client.get("/api/catalog")
        self.assertEqual(r.status_code, 200)
        subjects = r.json()["subjects"]
        self.assertGreaterEqual(len(subjects), 3)
        # Check Class 6 Science exists with chapters
        sci = next((s for s in subjects if s["id"] == "sub_6_sci"), None)
        self.assertIsNotNone(sci)
        self.assertGreaterEqual(len(sci["chapters"]), 1)

    def test_03_grounded_rag_english(self):
        # Ask question directly grounded in Class 6 textbook Page 12
        r = self.client.post("/api/ask", json={
            "question": "What is photosynthesis?",
            "grade": "Class 6",
            "subject": "Science",
            "chapter": "Plants: Parts and Functions",
            "language": "English",
            "mode": "simple"
        })
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertTrue(res["found"])
        self.assertIn("Page 12", res.get("primary_citation", ""))
        self.assertIn("Photosynthesis", res["answer"])

    def test_04_grounded_rag_telugu(self):
        # Ask question in Telugu
        r = self.client.post("/api/ask", json={
            "question": "కిరణజన్య సంయోగక్రియ అంటే ఏమిటి?",
            "grade": "Class 6",
            "subject": "Science",
            "language": "Telugu",
            "mode": "simple"
        })
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertTrue(res["found"])
        self.assertIn("పేజీ 12", res["answer"])
        self.assertIn("కిరణజన్య", res["answer"])

    def test_05_strict_fallback_out_of_domain(self):
        # Unsupported query that MUST return polite fallback without hallucinating
        r = self.client.post("/api/ask", json={
            "question": "Who won the FIFA world cup in 2022?",
            "grade": "Class 6",
            "subject": "Science",
            "language": "English"
        })
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertFalse(res["found"])
        self.assertIn("couldn't find", res["answer"].lower())
        self.assertEqual(len(res["sources"]), 0)

    def test_06_working_translation(self):
        # Test translation between English and Telugu
        r = self.client.post("/api/translate", json={
            "text": "Photosynthesis is vital for green plants.",
            "source_lang": "English",
            "target_lang": "Telugu"
        })
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(len(data["translated"]) > 0)
        self.assertIn("కిరణజన్య", data["translated"])

    def test_07_adaptive_quiz_and_submission(self):
        # 1. Fetch adaptive quiz questions
        r = self.client.get("/api/quiz?chapter_id=chap_6_sci_1&student_id=student_mohith")
        self.assertEqual(r.status_code, 200)
        questions = r.json()["questions"]
        self.assertGreaterEqual(len(questions), 4)

        # 2. Submit quiz attempt
        answers = [
            {"topic": "Photosynthesis", "correct": True, "page": 12},
            {"topic": "Chlorophyll and Leaf Structure", "correct": True, "page": 13},
            {"topic": "Root System and Functions", "correct": True, "page": 14},
            {"topic": "Stem and Vascular Conduction", "correct": False, "page": 15},
            {"topic": "Transpiration through Stomata", "correct": True, "page": 16}
        ]
        sub_res = self.client.post("/api/quiz/submit", json={
            "student_id": "student_mohith",
            "chapter_id": "chap_6_sci_1",
            "answers": answers,
            "time_taken_sec": 145
        })
        self.assertEqual(sub_res.status_code, 200)
        res_data = sub_res.json()
        self.assertEqual(res_data["score"], 4)
        self.assertEqual(res_data["total_questions"], 5)
        self.assertEqual(res_data["accuracy_pct"], 80.0)
        self.assertGreater(res_data["xp_earned"], 0)

    def test_08_study_timer_session_logging(self):
        # Log study session
        r = self.client.post("/api/study-timer/save", json={
            "student_id": "student_mohith",
            "subject": "Science",
            "chapter": "Plants: Parts and Functions",
            "activity_type": "textbook_reading",
            "duration_minutes": 45.0,
            "notes": "Reviewed leaves and stomata section."
        })
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["success"])

        # Verify in history
        hist = self.client.get("/api/study-timer/history?student_id=student_mohith").json()
        self.assertGreaterEqual(len(hist["recent_sessions"]), 1)
        self.assertGreaterEqual(hist["total_minutes_studied"], 45.0)

    def test_09_conflict_free_timetable_generation(self):
        r = self.client.post("/api/timetable/generate", json={
            "student_id": "student_mohith",
            "title": "Exam Prep Timetable",
            "available_days": ["Monday", "Tuesday", "Wednesday"],
            "daily_limit_hours": 2.0,
            "study_start_time": "18:00",
            "session_duration_minutes": 45,
            "break_duration_minutes": 15,
            "subjects": [
                {"name": "Science", "confidence": "Low"},
                {"name": "Mathematics", "confidence": "High"}
            ]
        })
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("Monday", data["schedule"])
        monday_sessions = data["schedule"]["Monday"]
        self.assertEqual(len(monday_sessions), 2)
        # Verify no overlapping sessions: session 1 ends before session 2 starts
        self.assertNotEqual(monday_sessions[0]["start_time"], monday_sessions[1]["start_time"])

    def test_10_teacher_dashboard_learning_gaps(self):
        r = self.client.get("/api/teacher/dashboard?teacher_id=teacher_saritha")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreaterEqual(data["metrics"]["participating_students"], 24)
        # Verify learning gaps contain struggle rate
        gaps = data["learning_gaps"]
        self.assertGreater(len(gaps), 0)
        # Chlorophyll or Photosynthesis should be flagged as high struggle
        top_struggle = gaps[0]
        self.assertGreaterEqual(top_struggle["struggled_pct"], 50.0)

    def test_11_evaluation_benchmark_precision(self):
        r = self.client.get("/api/evaluation/run")
        self.assertEqual(r.status_code, 200)
        summary = r.json()
        self.assertEqual(summary["total_benchmark_questions"], 25)
        self.assertEqual(summary["passed_tests"], 25)
        self.assertEqual(summary["retrieval_accuracy_pct"], 100.0)
        self.assertEqual(summary["citation_precision_pct"], 100.0)
        self.assertEqual(summary["anti_hallucination_fallback_rate_pct"], 100.0)

if __name__ == "__main__":
    unittest.main()
