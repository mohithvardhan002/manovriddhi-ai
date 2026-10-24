import time
import json
from typing import Dict, Any, List
from rag_service import rag_service
from database import get_connection

TEST_BENCHMARK_SET = [
    # In-domain questions (Ground truth available)
    {"q": "What is photosynthesis?", "grade": "Class 6", "subject": "Science", "expected_page": 12, "should_find": True},
    {"q": "కిరణజన్య సంయోగక్రియ అంటే ఏమిటి?", "grade": "Class 6", "subject": "Science", "expected_page": 12, "should_find": True},
    {"q": "What is the green pigment in leaves?", "grade": "Class 6", "subject": "Science", "expected_page": 13, "should_find": True},
    {"q": "పత్రహరితం అంటే ఏమిటి?", "grade": "Class 6", "subject": "Science", "expected_page": 13, "should_find": True},
    {"q": "What do roots absorb from the soil?", "grade": "Class 6", "subject": "Science", "expected_page": 14, "should_find": True},
    {"q": "వేర్లు నేల నుండి ఏమి గ్రహిస్తాయి?", "grade": "Class 6", "subject": "Science", "expected_page": 14, "should_find": True},
    {"q": "Which tissue conducts water upward in a plant?", "grade": "Class 6", "subject": "Science", "expected_page": 15, "should_find": True},
    {"q": "దారువు (Xylem) విధి ఏమిటి?", "grade": "Class 6", "subject": "Science", "expected_page": 15, "should_find": True},
    {"q": "What is transpiration?", "grade": "Class 6", "subject": "Science", "expected_page": 16, "should_find": True},
    {"q": "బాష్పోత్సేకం ఎక్కడ జరుగుతుంది?", "grade": "Class 6", "subject": "Science", "expected_page": 16, "should_find": True},
    {"q": "What does Newton's first law state?", "grade": "Class 9", "subject": "Physical Science", "expected_page": 4, "should_find": True},
    {"q": "జడత్వం అంటే ఏమిటి?", "grade": "Class 9", "subject": "Physical Science", "expected_page": 4, "should_find": True},
    {"q": "What is Euclid's division lemma?", "grade": "Class 10", "subject": "Mathematics", "expected_page": 3, "should_find": True},
    {"q": "యూక్లిడ్ భాగహార న్యాయం ఏమిటి?", "grade": "Class 10", "subject": "Mathematics", "expected_page": 3, "should_find": True},
    {"q": "What is the function of stomata?", "grade": "Class 6", "subject": "Science", "expected_page": 16, "should_find": True},
    {"q": "Why do plants need carbon dioxide?", "grade": "Class 6", "subject": "Science", "expected_page": 12, "should_find": True},
    {"q": "What nutrients do carbohydrates provide?", "grade": "Class 6", "subject": "Science", "expected_page": 21, "should_find": True},
    {"q": "Which pigment absorbs sunlight energy?", "grade": "Class 6", "subject": "Science", "expected_page": 13, "should_find": True},

    # Out-of-domain questions (Testing strict "Not found" grounding, NO hallucination!)
    {"q": "Who won the FIFA world cup in 2022?", "grade": "Class 6", "subject": "Science", "expected_page": None, "should_find": False},
    {"q": "How to make chocolate cake at home?", "grade": "Class 6", "subject": "Science", "expected_page": None, "should_find": False},
    {"q": "What is the capital of France?", "grade": "Class 6", "subject": "Science", "expected_page": None, "should_find": False},
    {"q": "How to invest in cryptocurrency?", "grade": "Class 6", "subject": "Science", "expected_page": None, "should_find": False},
    {"q": "చంద్రుడి మీద మొదటిసారి ఎవరు అడుగుపెట్టారు?", "grade": "Class 6", "subject": "Science", "expected_page": None, "should_find": False},
    {"q": "What are quantum black holes?", "grade": "Class 6", "subject": "Science", "expected_page": None, "should_find": False},
    {"q": "What is Python machine learning code?", "grade": "Class 6", "subject": "Science", "expected_page": None, "should_find": False}
]

class EvaluationService:
    def run_benchmark(self) -> Dict[str, Any]:
        """Runs the 25-question evaluation suite against the RAG pipeline."""
        start_time = time.time()
        results = []
        correct_retrievals = 0
        correct_citations = 0
        correct_fallbacks = 0

        for item in TEST_BENCHMARK_SET:
            t0 = time.time()
            res = rag_service.answer_question(
                question=item["q"],
                grade=item["grade"],
                subject=item["subject"],
                language="Telugu" if any('\u0c00' <= char <= '\u0c7f' for char in item["q"]) else "English"
            )
            lat_ms = round((time.time() - t0) * 1000, 1)

            found = res["found"]
            sources = res.get("sources", [])
            retrieved_pages = [s["page_number"] for s in sources]

            # Evaluation checks
            if item["should_find"]:
                retrieval_ok = found and (item["expected_page"] in retrieved_pages)
                citation_ok = found and bool(res.get("primary_citation")) and (str(item["expected_page"]) in res.get("primary_citation", ""))
                fallback_ok = True
                if retrieval_ok:
                    correct_retrievals += 1
                if citation_ok:
                    correct_citations += 1
            else:
                # Must NOT be found (Strict anti-hallucination check)
                retrieval_ok = not found
                citation_ok = len(sources) == 0
                fallback_ok = (not found) and ("couldn't find" in res["answer"].lower() or "లభించలేదు" in res["answer"] or not found)
                if fallback_ok:
                    correct_fallbacks += 1

            passed = retrieval_ok and citation_ok and fallback_ok

            results.append({
                "question": item["q"],
                "should_find": item["should_find"],
                "actual_found": found,
                "expected_page": item["expected_page"],
                "retrieved_pages": retrieved_pages,
                "passed": passed,
                "latency_ms": lat_ms,
                "answer_snippet": res["answer"][:120] + "..." if len(res["answer"]) > 120 else res["answer"]
            })

        total = len(TEST_BENCHMARK_SET)
        in_domain_count = sum(1 for item in TEST_BENCHMARK_SET if item["should_find"])
        out_domain_count = total - in_domain_count

        duration_sec = round(time.time() - start_time, 2)
        retrieval_pct = round((correct_retrievals / in_domain_count) * 100, 1) if in_domain_count > 0 else 100.0
        citation_pct = round((correct_citations / in_domain_count) * 100, 1) if in_domain_count > 0 else 100.0
        fallback_pct = round((correct_fallbacks / out_domain_count) * 100, 1) if out_domain_count > 0 else 100.0
        overall_score = round((retrieval_pct * 0.4) + (citation_pct * 0.3) + (fallback_pct * 0.3), 1)

        summary = {
            "model_tested": "Manovriddhi Hybrid RAG (BM25 + Telugu Stemming)",
            "total_benchmark_questions": total,
            "in_domain_questions": 18,
            "out_of_domain_unsupported_questions": 7,
            "passed_tests": sum(1 for r in results if r["passed"]),
            "failed_tests": sum(1 for r in results if not r["passed"]),
            "retrieval_accuracy_pct": retrieval_pct,
            "citation_precision_pct": citation_pct,
            "anti_hallucination_fallback_rate_pct": fallback_pct,
            "overall_grounding_score_pct": overall_score,
            "average_latency_ms": round(sum(r["latency_ms"] for r in results) / total, 1),
            "benchmark_duration_sec": duration_sec,
            "details": results
        }

        # Persist to evaluation_runs table
        conn = get_connection()
        c = conn.cursor()
        c.execute("""
        INSERT INTO evaluation_runs (id, model_name, total_questions, retrieval_accuracy, citation_precision, telugu_grounding_score, avg_latency_ms, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"eval_{int(time.time())}",
            summary["model_tested"],
            total,
            retrieval_pct,
            citation_pct,
            overall_score,
            summary["average_latency_ms"],
            json.dumps(summary)
        ))
        conn.commit()
        conn.close()

        return summary

evaluation_service = EvaluationService()
