import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "manovriddhi.db"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

MIN_SCORE = float(os.getenv("MIN_SCORE", "0.45"))

NOT_FOUND_EN = "I couldn't find a reliable answer in the selected textbook. Try another chapter or consult your teacher."
NOT_FOUND_TE = "ఈ ప్రశ్నకు సమాధానం ఎంచుకున్న పాఠ్యపుస్తకంలో లభించలేదు. దయచేసి మరొక పాఠ్యాంశాన్ని ఎంచుకోండి లేదా మీ ఉపాధ్యాయుడిని సంప్రదించండి."
