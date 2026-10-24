import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from database import get_connection

class TimetableService:
    def generate_schedule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deterministic, conflict-free study schedule algorithm.
        Distributes study slots according to subject confidence, upcoming exams, and break preferences.
        """
        student_id = data.get("student_id", "student_mohith")
        title = data.get("title", "My Personalized Study Plan")
        available_days = data.get("available_days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
        daily_hours = float(data.get("daily_limit_hours", 2.5))
        study_start_time = data.get("study_start_time", "17:30")  # 5:30 PM
        session_duration = int(data.get("session_duration_minutes", 45))
        break_duration = int(data.get("break_duration_minutes", 15))
        target_exam = data.get("target_exam", "Midterm Exams 2026")
        subjects_input = data.get("subjects", [
            {"name": "Science", "confidence": "Low", "topics": "Plants, Nutrition"},
            {"name": "Mathematics", "confidence": "Medium", "topics": "Real Numbers"},
            {"name": "Social Studies", "confidence": "High", "topics": "Natural Resources"}
        ])

        # Weight subjects: Low confidence gets 3 units, Medium gets 2 units, High gets 1 unit
        weights = {"low": 3, "medium": 2, "high": 1}
        weighted_subjects = []
        for s in subjects_input:
            name = s.get("name", "General")
            conf = str(s.get("confidence", "Medium")).lower()
            w = weights.get(conf, 2)
            weighted_subjects.extend([s] * w)

        if not weighted_subjects:
            weighted_subjects = subjects_input

        # Calculate sessions per day
        slot_minutes = session_duration + break_duration
        total_daily_minutes = int(daily_hours * 60)
        sessions_per_day = max(1, total_daily_minutes // slot_minutes)

        schedule_by_day = {}
        subject_idx = 0

        start_dt = datetime.strptime(study_start_time, "%H:%M")

        for day in available_days:
            daily_sessions = []
            curr_time = start_dt
            for i in range(sessions_per_day):
                subj = weighted_subjects[subject_idx % len(weighted_subjects)]
                subject_idx += 1

                end_session = curr_time + timedelta(minutes=session_duration)
                
                # Activity type rotates: Concept Learning -> Practice Quiz -> Revision & Notes
                activities = ["Textbook Concept Study", "Practice Quiz & Doubts", "Revision Flashcards & Notes", "Formula & Definition Review"]
                activity = activities[i % len(activities)]

                priority = "High" if str(subj.get("confidence", "")).lower() == "low" else "Medium"

                daily_sessions.append({
                    "id": f"sess_{uuid.uuid4().hex[:8]}",
                    "day": day,
                    "start_time": curr_time.strftime("%I:%M %p"),
                    "end_time": end_session.strftime("%I:%M %p"),
                    "subject": subj.get("name", "Science"),
                    "chapter_or_topics": subj.get("topics", "Key concepts and questions"),
                    "activity": activity,
                    "duration_min": session_duration,
                    "priority": priority,
                    "completed": False
                })

                # Move time forward including break
                curr_time = end_session + timedelta(minutes=break_duration)

            schedule_by_day[day] = daily_sessions

        timetable_record = {
            "id": f"tt_{uuid.uuid4().hex[:10]}",
            "student_id": student_id,
            "title": title,
            "target_exam": target_exam,
            "daily_limit_hours": daily_hours,
            "sessions_per_day": sessions_per_day,
            "break_duration_minutes": break_duration,
            "days_count": len(available_days),
            "total_weekly_hours": round(daily_hours * len(available_days), 1),
            "schedule": schedule_by_day,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        # Save to database
        conn = get_connection()
        c = conn.cursor()
        c.execute("""
        INSERT OR REPLACE INTO timetables (id, student_id, title, target_exam, daily_limit_hours, schedule_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (timetable_record["id"], student_id, title, target_exam, daily_hours, json.dumps(timetable_record)))
        conn.commit()
        conn.close()

        return timetable_record

    def get_latest_timetable(self, student_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT schedule_json FROM timetables WHERE student_id = ? ORDER BY created_at DESC LIMIT 1", (student_id,))
        row = c.fetchone()
        conn.close()
        if row:
            return json.loads(row["schedule_json"])
        return None

timetable_service = TimetableService()
