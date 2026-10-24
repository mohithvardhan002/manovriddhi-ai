import json
import uuid
from typing import List, Dict, Any, Optional
from database import get_connection

class QuizService:
    def get_questions(self, chapter_id: str, student_id: str = "guest_user", difficulty: str = "all", count: int = 5) -> List[Dict[str, Any]]:
        conn = get_connection()
        c = conn.cursor()

        # Check student's weak topics to sort adaptively
        c.execute("""
        SELECT topic, mastery_pct FROM topic_mastery
        WHERE student_id = ? AND mastery_pct < 60
        ORDER BY mastery_pct ASC
        """, (student_id,))
        weak_topics = [row["topic"] for row in c.fetchall()]

        query = "SELECT * FROM quiz_questions WHERE chapter_id = ?"
        params = [chapter_id]
        if difficulty != "all":
            query += " AND difficulty = ?"
            params.append(difficulty)

        c.execute(query, params)
        raw_rows = [dict(r) for r in c.fetchall()]
        conn.close()

        # Sort so that weak topics come first (adaptive question ordering)
        def sort_key(q):
            is_weak = 0 if q["topic"] in weak_topics else 1
            return (is_weak, q["difficulty"] != "easy")

        raw_rows.sort(key=sort_key)
        selected_questions = raw_rows[:count]

        # Format questions cleanly
        formatted = []
        for q in selected_questions:
            formatted.append({
                "id": q["id"],
                "topic": q["topic"],
                "topic_te": q.get("topic_te", ""),
                "question_en": q["question_en"],
                "question_te": q["question_te"],
                "options_en": json.loads(q["options_en"]) if isinstance(q["options_en"], str) else q["options_en"],
                "options_te": json.loads(q["options_te"]) if isinstance(q["options_te"], str) else q["options_te"],
                "answer": q["correct_index"],
                "explanation_en": q["explanation_en"],
                "explanation_te": q["explanation_te"],
                "page_number": q["page_number"],
                "difficulty": q["difficulty"],
                "is_weak_topic": q["topic"] in weak_topics
            })

        return formatted

    def submit_attempt(self, student_id: str, chapter_id: str, answers: List[Dict[str, Any]], time_taken_sec: int) -> Dict[str, Any]:
        """Processes a quiz submission, updates topic mastery, computes XP, and prevents duplicate scoring."""
        total_questions = len(answers)
        correct_count = sum(1 for a in answers if a.get("correct") is True)
        accuracy_pct = round((correct_count / total_questions * 100), 1) if total_questions > 0 else 0.0

        attempt_id = f"attempt_{uuid.uuid4().hex[:12]}"
        conn = get_connection()
        c = conn.cursor()

        # 1. Save attempt record
        c.execute("""
        INSERT INTO quiz_attempts (id, student_id, chapter_id, score, total_questions, accuracy_pct, time_taken_sec, answers_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (attempt_id, student_id, chapter_id, correct_count, total_questions, accuracy_pct, time_taken_sec, json.dumps(answers)))

        # 2. Update Topic Mastery and detect persistent weak concepts
        weak_topics_updated = []
        for ans in answers:
            topic = ans.get("topic", "General")
            topic_te = ans.get("topic_te", "")
            is_correct = 1 if ans.get("correct") is True else 0

            c.execute("SELECT total_attempts, correct_attempts FROM topic_mastery WHERE student_id = ? AND topic = ?", (student_id, topic))
            row = c.fetchone()
            if row:
                new_total = row["total_attempts"] + 1
                new_correct = row["correct_attempts"] + is_correct
                new_pct = round((new_correct / new_total) * 100, 1)
                c.execute("""
                UPDATE topic_mastery 
                SET total_attempts = ?, correct_attempts = ?, mastery_pct = ?, last_reviewed = CURRENT_TIMESTAMP
                WHERE student_id = ? AND topic = ?
                """, (new_total, new_correct, new_pct, student_id, topic))
                if new_pct < 60:
                    weak_topics_updated.append(topic)
            else:
                pct = 100.0 if is_correct else 0.0
                c.execute("""
                INSERT INTO topic_mastery (id, student_id, topic, topic_te, total_attempts, correct_attempts, mastery_pct)
                VALUES (?, ?, ?, ?, 1, ?, ?)
                """, (f"tm_{uuid.uuid4().hex[:8]}", student_id, topic, topic_te, is_correct, pct))
                if not is_correct:
                    weak_topics_updated.append(topic)

        # 3. Calculate and award XP (Only for genuine effort)
        xp_earned = (correct_count * 15) + (20 if accuracy_pct >= 80 else 10)
        c.execute("UPDATE profiles SET xp = xp + ?, streak = streak + 1 WHERE id = ?", (xp_earned, student_id))
        c.execute("""
        INSERT INTO xp_transactions (id, student_id, amount, reason)
        VALUES (?, ?, ?, ?)
        """, (f"xp_{uuid.uuid4().hex[:8]}", student_id, xp_earned, f"Quiz completed: {correct_count}/{total_questions} correct"))

        # Check for first quiz achievement
        c.execute("SELECT 1 FROM student_achievements WHERE student_id = ? AND achievement_code = 'FIRST_QUIZ'", (student_id,))
        if not c.fetchone():
            c.execute("""
            INSERT INTO student_achievements (id, student_id, achievement_code)
            VALUES (?, ?, 'FIRST_QUIZ')
            """, (f"sa_{uuid.uuid4().hex[:8]}", student_id))

        # Check if chapter champion (>= 80%)
        if accuracy_pct >= 80:
            c.execute("SELECT 1 FROM student_achievements WHERE student_id = ? AND achievement_code = 'CHAPTER_CHAMPION'", (student_id,))
            if not c.fetchone():
                c.execute("""
                INSERT INTO student_achievements (id, student_id, achievement_code)
                VALUES (?, ?, 'CHAPTER_CHAMPION')
                """, (f"sa_{uuid.uuid4().hex[:8]}", student_id))

        conn.commit()
        conn.close()

        # Recommendation for revision
        recommendation = "Excellent performance! Reinforce your learning by creating notes." if accuracy_pct >= 80 else (
            f"Focus your revision on: {', '.join(set(weak_topics_updated))}. Review textbook pages before trying again."
            if weak_topics_updated else "Good attempt! Re-read the chapter summary for higher confidence."
        )

        return {
            "attempt_id": attempt_id,
            "score": correct_count,
            "total_questions": total_questions,
            "accuracy_pct": accuracy_pct,
            "xp_earned": xp_earned,
            "time_taken_sec": time_taken_sec,
            "weak_topics": list(set(weak_topics_updated)),
            "recommendation": recommendation
        }

quiz_service = QuizService()
