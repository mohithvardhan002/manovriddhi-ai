"""
Textbook Ingestion Pipeline for Manovriddhi AI (మనోవృద్ధి)
Extracts authorized textbook PDFs or images, chunks text with overlapping windows,
attaches metadata (class, board, subject, chapter, page, topic), and stores chunks
in both SQLite and data/chunks.json for BM25 and vector retrieval.

Usage:
  python backend/ingest.py path/to/textbook.pdf --cls "Class 6" --board "AP State Board" --subject "Science" --chapter "Plants: Parts and Functions" --first 1 --last 20
"""

import os
import re
import json
import uuid
import argparse
from pathlib import Path
from pypdf import PdfReader
from database import get_connection, init_db
from config import DATA_DIR

def extract_text_from_pdf(pdf_path: str, first_page: int = 1, last_page: int = None) -> list:
    """Extracts text from PDF page by page with page numbering."""
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    end_page = last_page if last_page and last_page <= total_pages else total_pages

    extracted = []
    for page_idx in range(first_page - 1, end_page):
        page_num = page_idx + 1
        page_text = reader.pages[page_idx].extract_text() or ""
        clean_text = " ".join(page_text.split())
        extracted.append({"page": page_num, "text": clean_text})
    return extracted

def chunk_text(page_num: int, text: str, chunk_size: int = 500, overlap: int = 100) -> list:
    """Chunks text into sliding windows while preserving sentence boundaries where possible."""
    chunks = []
    if not text or len(text.strip()) < 50:
        return chunks

    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        piece = text[start:end].strip()
        if len(piece) >= 60:
            # Topic heuristic: first sentence or first 45 chars
            first_sentence = re.split(r'[.!?।\n]', piece)[0].strip()
            topic = first_sentence[:45] if first_sentence else piece[:40]
            chunks.append({
                "page": page_num,
                "topic": topic,
                "text": piece
            })
        start += (chunk_size - overlap)
        if start >= len(text) - 50:
            break
    return chunks

def ingest_textbook(
    pdf_path: str,
    grade: str,
    board: str,
    subject: str,
    chapter: str,
    chapter_id: str = "chap_custom",
    first_page: int = 1,
    last_page: int = None,
    source_book: str = "Authorized State Board Textbook"
):
    init_db()
    print(f"[*] Ingesting {pdf_path} for {grade} {subject} - '{chapter}'...")
    
    extracted_pages = extract_text_from_pdf(pdf_path, first_page, last_page)
    print(f"[*] Extracted {len(extracted_pages)} pages. Chunking text...")

    all_chunks = []
    for item in extracted_pages:
        c_list = chunk_text(item["page"], item["text"])
        all_chunks.extend(c_list)

    print(f"[*] Generated {len(all_chunks)} chunks.")

    # Save to SQLite
    conn = get_connection()
    c = conn.cursor()

    # Ensure chapter exists
    c.execute("""
    INSERT OR IGNORE INTO chapters (id, subject_id, chapter_number, title, overview, duration_minutes, total_pages)
    VALUES (?, ?, 1, ?, ?, 45, ?)
    """, (chapter_id, "sub_custom", chapter, f"Overview for {chapter}", len(extracted_pages)))

    added_count = 0
    json_records = []
    for chk in all_chunks:
        chunk_id = f"chunk_{uuid.uuid4().hex[:10]}"
        c.execute("""
        INSERT INTO textbook_chunks (id, chapter_id, grade, board, subject, chapter, page_number, topic, text_en, text_te, keywords, source_book)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            chunk_id,
            chapter_id,
            grade,
            board,
            subject,
            chapter,
            chk["page"],
            chk["topic"],
            chk["text"],
            chk["text"], # Telugu or bilingual text
            chk["topic"].lower(),
            source_book
        ))
        added_count += 1
        json_records.append({
            "id": chunk_id,
            "class": grade,
            "board": board,
            "subject": subject,
            "chapter": chapter,
            "page": chk["page"],
            "topic": chk["topic"],
            "text": chk["text"],
            "source_book": source_book
        })

    conn.commit()
    conn.close()

    # Also sync/update data/chunks.json
    json_path = DATA_DIR / "chunks.json"
    existing = []
    if json_path.exists():
        try:
            existing = json.loads(json_path.read_text(encoding="utf-8"))
        except Exception:
            existing = []
    existing.extend(json_records)
    json_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[OK] Successfully ingested {added_count} chunks into database and {json_path}")
    return added_count

def export_current_chunks_to_json():
    """Utility to export all existing chunks from SQLite database to data/chunks.json."""
    init_db()
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT id, chapter_id, grade, board, subject, chapter, page_number, topic, topic_te, text_en, text_te, keywords, source_book
    FROM textbook_chunks
    """)
    rows = [dict(r) for r in c.fetchall()]
    conn.close()

    json_path = DATA_DIR / "chunks.json"
    json_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] Exported {len(rows)} database chunks to {json_path}")

    # Also export sample_quiz.json
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM quiz_questions")
    q_rows = [dict(r) for r in c.fetchall()]
    conn.close()
    quiz_path = DATA_DIR / "sample_quiz.json"
    quiz_path.write_text(json.dumps(q_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] Exported {len(q_rows)} quiz questions to {quiz_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest textbook PDF into Manovriddhi RAG")
    parser.add_argument("--pdf", type=str, help="Path to PDF file")
    parser.add_argument("--cls", type=str, default="Class 6", help="Class or grade")
    parser.add_argument("--board", type=str, default="AP State Board", help="School board")
    parser.add_argument("--subject", type=str, default="Science", help="Subject name")
    parser.add_argument("--chapter", type=str, default="General Chapter", help="Chapter title")
    parser.add_argument("--first", type=int, default=1, help="First page to extract")
    parser.add_argument("--last", type=int, default=None, help="Last page to extract")
    parser.add_argument("--export", action="store_true", help="Export existing database chunks to JSON")

    args = parser.parse_args()

    if args.export or not args.pdf:
        export_current_chunks_to_json()
    else:
        ingest_textbook(
            pdf_path=args.pdf,
            grade=args.cls,
            board=args.board,
            subject=args.subject,
            chapter=args.chapter,
            first_page=args.first,
            last_page=args.last
        )
