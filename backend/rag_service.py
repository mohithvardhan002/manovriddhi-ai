import re
import json
import httpx
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
from config import GEMINI_API_KEY, GEMINI_MODEL, GROQ_API_KEY, GROQ_MODEL, MIN_SCORE, NOT_FOUND_EN, NOT_FOUND_TE
from database import get_connection

STOP_WORDS = {
    "what", "is", "the", "a", "an", "how", "to", "who", "where", "why", "which", "are", "do", "does", 
    "did", "and", "or", "in", "on", "at", "for", "with", "about", "of", "by", "from", "make", "can", 
    "could", "would", "should", "tell", "me", "give", "explain", "i", "you", "my", "your",
    "ఇది", "ఏమిటి", "ఎలా", "ఎవరు", "ఎక్కడ", "ఎందుకు", "మరియు", "కూడా", "ఒక", "గురించి", "చెప్పండి", "మీద", "మొదటి", "అడుగు", "అడగండి"
}

def tokenize_telugu_english(text: str, filter_stops: bool = True) -> List[str]:
    """Tokenize English and Telugu text with lightweight suffix stripping for Telugu agglutination."""
    words = []
    tokens = re.findall(r"[\w\u0C00-\u0C7F]+", text.lower())
    for token in tokens:
        if filter_stops and token in STOP_WORDS:
            continue
        words.append(token)
        # Crude stem for Telugu noun suffixes (e.g., -లు, -లో, -కు, -తో, -ల)
        if len(token) > 4:
            words.append(token[:4])
    return words

class RAGService:
    def __init__(self):
        self.reload_index()

    def reload_index(self):
        conn = get_connection()
        c = conn.cursor()
        c.execute("""
        SELECT id, chapter_id, grade, board, subject, chapter, page_number, 
               topic, topic_te, text_en, text_te, keywords, source_book
        FROM textbook_chunks
        """)
        rows = [dict(r) for r in c.fetchall()]
        conn.close()

        self.chunks = rows
        corpus = []
        for chk in self.chunks:
            searchable_text = f"{chk['topic']} {chk.get('topic_te', '')} {chk['text_en']} {chk['text_te']} {chk.get('keywords', '')}"
            corpus.append(tokenize_telugu_english(searchable_text))
        
        if corpus:
            self.index = BM25Okapi(corpus)
        else:
            self.index = None

    def retrieve(self, query: str, grade: str = "", subject: str = "", chapter: str = "", top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.index or not self.chunks:
            self.reload_index()
            if not self.index:
                return []

        tokens = tokenize_telugu_english(query)
        if not tokens:
            return []

        scores = self.index.get_scores(tokens)
        scored_chunks = []
        for score, chunk in zip(scores, self.chunks):
            # Filtering criteria if provided
            if grade and chunk["grade"].lower() != grade.lower():
                continue
            if subject and chunk["subject"].lower() != subject.lower():
                continue
            if chapter and chunk["chapter"].lower() != chapter.lower():
                # Allow partial match or chapter title match
                if chapter.lower() not in chunk["chapter"].lower():
                    continue

            # Ensure at least one meaningful token matches the chunk text/topic
            chunk_full_text = f"{chunk['topic']} {chunk.get('topic_te', '')} {chunk['text_en']} {chunk['text_te']} {chunk.get('keywords', '')}".lower()
            token_match = any(t in chunk_full_text for t in tokens)
            if not token_match:
                continue

            # Additional keyword boost for exact topic matching
            exact_boost = 0.0
            q_lower = query.lower()
            if chunk["topic"].lower() in q_lower or (chunk["topic_te"] and chunk["topic_te"] in q_lower):
                exact_boost += 2.0
            
            final_score = score + exact_boost
            if final_score >= max(MIN_SCORE, 0.75):
                scored_chunks.append((final_score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for score, chunk in scored_chunks[:top_k]]

    def answer_question(self, 
                        question: str, 
                        grade: str = "Class 6", 
                        subject: str = "Science", 
                        chapter: str = "", 
                        language: str = "English",
                        mode: str = "simple") -> Dict[str, Any]:
        """Strict textbook-grounded answer generation with citations."""
        matched_chunks = self.retrieve(question, grade, subject, chapter, top_k=3)
        
        is_telugu = language.lower() in ["telugu", "te"]

        if not matched_chunks:
            return {
                "found": False,
                "answer": NOT_FOUND_TE if is_telugu else NOT_FOUND_EN,
                "sources": [],
                "confidence": 0.0,
                "mode": mode,
                "grounded": True,
                "notice": "No matching passage found in authorized textbook."
            }

        top_match = matched_chunks[0]
        sources = [{
            "source_book": c["source_book"],
            "chapter": c["chapter"],
            "topic": c["topic_te"] if is_telugu else c["topic"],
            "page_number": c["page_number"],
            "excerpt": c["text_te"] if is_telugu else c["text_en"]
        } for c in matched_chunks]

        # Check if live Gemini API is configured
        if GEMINI_API_KEY:
            try:
                passages_context = "\n\n".join(
                    f"[Source: {s['source_book']}, Chapter: {s['chapter']}, Page {s['page_number']}, Topic: {s['topic']}]\n{s['excerpt']}"
                    for s in sources
                )

                prompt_instructions = {
                    "simple": "Explain in simple, encouraging terms suitable for a school student.",
                    "step_by_step": "Explain clearly step-by-step with numbered points.",
                    "examples": "Explain with real-world examples that a school child can observe around them.",
                    "beginner": "Explain like talking to a complete beginner using gentle analogies.",
                    "exam_notes": "Format as concise, high-scoring exam revision bullet points with key definitions highlighted.",
                    "short": "Provide a direct, concise 2-sentence answer."
                }.get(mode, "Explain clearly in simple words.")

                sys_prompt = (
                    f"You are Manovriddhi AI (మనోవృద్ధి), a patient educational tutor for government school students.\n"
                    f"RULES:\n"
                    f"1. Answer ONLY using the authorized textbook passages provided below.\n"
                    f"2. Never hallucinate, guess, or invent external facts not present in the passages.\n"
                    f"3. If the passages do not contain the answer, reply exactly: 'NOT_FOUND'.\n"
                    f"4. Respond in {('Telugu' if is_telugu else 'English')}.\n"
                    f"5. Explicitly cite the textbook page number in your explanation (e.g. 'According to Page 12...').\n"
                    f"6. Style: {prompt_instructions}\n\n"
                    f"TEXTBOOK PASSAGES:\n{passages_context}\n\n"
                    f"STUDENT QUESTION: {question}"
                )

                r = httpx.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
                    params={"key": GEMINI_API_KEY},
                    json={
                        "contents": [{"parts": [{"text": sys_prompt}]}],
                        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 600}
                    },
                    timeout=25.0
                )
                if r.status_code == 200:
                    resp_json = r.json()
                    candidate_text = resp_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if "NOT_FOUND" in candidate_text:
                        return {
                            "found": False,
                            "answer": NOT_FOUND_TE if is_telugu else NOT_FOUND_EN,
                            "sources": [],
                            "confidence": 0.0,
                            "mode": mode,
                            "grounded": True
                        }
                    return {
                        "found": True,
                        "answer": candidate_text,
                        "sources": sources,
                        "primary_citation": f"{top_match['source_book']}, Page {top_match['page_number']}",
                        "confidence": 0.95,
                        "provider": "Gemini 2.5 Flash (Grounded)",
                        "mode": mode,
                        "grounded": True,
                        "related_concepts": [c["topic_te"] if is_telugu else c["topic"] for c in matched_chunks]
                    }
            except Exception as e:
                # Fall through to extractive grounded RAG
                pass

        # High-Fidelity Extractive RAG (Offline / Zero-Config fallback)
        # Formulate accurate, grounded explanation directly from authorized textbook chunks
        primary_text = top_match["text_te"] if is_telugu else top_match["text_en"]
        page_num = top_match["page_number"]
        book = top_match["source_book"]
        topic_title = top_match["topic_te"] if is_telugu else top_match["topic"]

        if is_telugu:
            formatted_answer = f"**{topic_title}** (పేజీ {page_num}):\n\n{primary_text}\n\n*ఆధార గ్రంథం: {book}, పేజీ {page_num}.*"
        else:
            formatted_answer = f"**{topic_title}** (Page {page_num}):\n\n{primary_text}\n\n*Reference: {book}, Page {page_num}.*"

        return {
            "found": True,
            "answer": formatted_answer,
            "sources": sources,
            "primary_citation": f"{book}, Page {page_num}",
            "confidence": 0.92,
            "provider": "Prescribed Textbook RAG Engine",
            "mode": mode,
            "grounded": True,
            "related_concepts": [c["topic_te"] if is_telugu else c["topic"] for c in matched_chunks]
        }

rag_service = RAGService()
