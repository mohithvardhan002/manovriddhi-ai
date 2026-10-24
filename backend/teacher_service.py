import json
from typing import Dict, Any, List
from database import get_connection

class TeacherService:
    def get_dashboard_data(self, teacher_id: str = "teacher_saritha") -> Dict[str, Any]:
        conn = get_connection()
        c = conn.cursor()

        # Get classes managed
        c.execute("SELECT * FROM teacher_classes WHERE teacher_id = ?", (teacher_id,))
        classes = [dict(r) for r in c.fetchall()]

        # Get all quiz attempts for the teacher's class
        c.execute("""
        SELECT student_id, chapter_id, score, total_questions, accuracy_pct, answers_json, created_at
        FROM quiz_attempts
        WHERE chapter_id = 'chap_6_sci_1'
        ORDER BY created_at DESC
        """)
        attempts = [dict(r) for r in c.fetchall()]
        conn.close()

        total_attempts = len(attempts)
        unique_students = len({a["student_id"] for a in attempts})
        avg_class_accuracy = round(sum(a["accuracy_pct"] for a in attempts) / total_attempts, 1) if total_attempts > 0 else 0.0

        # Topic level aggregation
        topic_metrics: Dict[str, Dict[str, Any]] = {}
        for a in attempts:
            answers = json.loads(a["answers_json"]) if isinstance(a["answers_json"], str) else a["answers_json"]
            for ans in answers:
                topic = ans.get("topic", "General")
                page = ans.get("page", 12)
                is_correct = bool(ans.get("correct"))

                if topic not in topic_metrics:
                    topic_metrics[topic] = {
                        "topic": topic,
                        "page": page,
                        "total_answers": 0,
                        "correct_answers": 0,
                        "wrong_answers": 0
                    }
                
                topic_metrics[topic]["total_answers"] += 1
                if is_correct:
                    topic_metrics[topic]["correct_answers"] += 1
                else:
                    topic_metrics[topic]["wrong_answers"] += 1

        topic_breakdown = []
        for t, m in topic_metrics.items():
            tot = m["total_answers"]
            wrong = m["wrong_answers"]
            correct = m["correct_answers"]
            pct_wrong = round((wrong / tot * 100), 1) if tot > 0 else 0.0
            pct_correct = round((correct / tot * 100), 1) if tot > 0 else 0.0
            topic_breakdown.append({
                "topic": t,
                "page": m["page"],
                "total_students_tested": tot,
                "correct_pct": pct_correct,
                "struggled_pct": pct_wrong,
                "status": "Critical Gap" if pct_wrong >= 50 else ("Needs Attention" if pct_wrong >= 30 else "Well Understood")
            })

        # Sort with most struggled topics on top
        topic_breakdown.sort(key=lambda x: x["struggled_pct"], reverse=True)

        # Generate evidence-grounded revision plans for teacher
        revision_plans = []
        for item in topic_breakdown:
            if item["struggled_pct"] >= 40:
                revision_plans.append({
                    "topic": item["topic"],
                    "page": item["page"],
                    "struggle_rate": f"{item['struggled_pct']}% of class",
                    "action": f"Re-read textbook page {item['page']} in class and conduct a live demonstration of {item['topic']}.",
                    "priority": "High" if item["struggled_pct"] >= 60 else "Medium"
                })

        return {
            "teacher_id": teacher_id,
            "classes": classes,
            "active_class": classes[0] if classes else {"class_name": "Class 6A", "grade": "Class 6", "subject": "Science"},
            "metrics": {
                "total_students_enrolled": classes[0]["total_students"] if classes else 24,
                "participating_students": unique_students,
                "participation_rate_pct": round((unique_students / (classes[0]["total_students"] if classes else 24)) * 100, 1),
                "total_quizzes_evaluated": total_attempts,
                "average_class_score_pct": avg_class_accuracy,
                "critical_gap_topics_count": sum(1 for t in topic_breakdown if t["struggled_pct"] >= 50)
            },
            "learning_gaps": topic_breakdown,
            "recommended_revision_actions": revision_plans,
            "latest_attempts": attempts[:10]
        }

teacher_service = TeacherService()
