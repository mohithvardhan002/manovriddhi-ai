-- ============================================================
-- MANOVRIDDHI AI (మనోవృద్ధి) - SUPABASE / POSTGRESQL SCHEMA
-- Designed for YUKTHI 2026 Hackathon & Production Deployment
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'guest')),
    grade TEXT DEFAULT 'Class 6',
    board TEXT DEFAULT 'AP State Board',
    preferred_language TEXT DEFAULT 'English',
    study_hours_daily NUMERIC DEFAULT 2.0,
    exam_date DATE,
    streak INT DEFAULT 1,
    xp INT DEFAULT 120,
    level INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. SUBJECTS & CURRICULUM
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    grade TEXT NOT NULL,
    board TEXT NOT NULL,
    name TEXT NOT NULL,
    name_te TEXT,
    icon TEXT DEFAULT 'BookOpen',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHAPTERS
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    title_te TEXT,
    overview TEXT,
    overview_te TEXT,
    duration_minutes INT DEFAULT 45,
    total_pages INT DEFAULT 18,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEXTBOOK GROUNDED PASSAGES (RAG Knowledge Base)
CREATE TABLE IF NOT EXISTS textbook_chunks (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    grade TEXT NOT NULL,
    board TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    page_number INT NOT NULL,
    topic TEXT NOT NULL,
    topic_te TEXT,
    text_en TEXT NOT NULL,
    text_te TEXT NOT NULL,
    keywords TEXT,
    source_book TEXT NOT NULL,
    embedding VECTOR(768), -- For pgvector support
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUIZ ENGINE & ADAPTIVE PRACTICE
CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    topic_te TEXT,
    question_en TEXT NOT NULL,
    question_te TEXT NOT NULL,
    options_en JSONB NOT NULL,
    options_te JSONB NOT NULL,
    correct_index INT NOT NULL,
    explanation_en TEXT NOT NULL,
    explanation_te TEXT NOT NULL,
    page_number INT NOT NULL,
    difficulty TEXT DEFAULT 'medium'
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL REFERENCES chapters(id),
    score INT NOT NULL,
    total_questions INT NOT NULL,
    accuracy_pct NUMERIC NOT NULL,
    time_taken_sec INT NOT NULL,
    answers_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TOPIC MASTERY (Learning-Gap Tracking)
CREATE TABLE IF NOT EXISTS topic_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    topic_te TEXT,
    total_attempts INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    mastery_pct NUMERIC DEFAULT 0,
    last_reviewed TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, topic)
);

-- 7. STUDY TIMER SESSIONS
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    activity_type TEXT DEFAULT 'reading',
    duration_minutes NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TIMETABLES
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_exam TEXT,
    daily_limit_hours NUMERIC DEFAULT 3.0,
    schedule_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FLASHCARDS & SPACED REPETITION
CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    topic_te TEXT,
    front_en TEXT NOT NULL,
    front_te TEXT NOT NULL,
    back_en TEXT NOT NULL,
    back_te TEXT NOT NULL,
    page_number INT NOT NULL
);

-- 10. ACHIEVEMENTS & GAMIFICATION
CREATE TABLE IF NOT EXISTS achievements (
    code TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_te TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INT DEFAULT 50,
    icon TEXT DEFAULT 'Trophy'
);

CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_code TEXT NOT NULL REFERENCES achievements(code),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, achievement_code)
);

-- 11. TEACHER CLASSES & CLASSROOM GAPS
CREATE TABLE IF NOT EXISTS teacher_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    total_students INT DEFAULT 24,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EVALUATION & BENCHMARKING
CREATE TABLE IF NOT EXISTS evaluation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_date TIMESTAMPTZ DEFAULT NOW(),
    model_name TEXT NOT NULL,
    total_questions INT NOT NULL,
    retrieval_accuracy NUMERIC NOT NULL,
    citation_precision NUMERIC NOT NULL,
    telugu_grounding_score NUMERIC NOT NULL,
    avg_latency_ms NUMERIC NOT NULL,
    details_json JSONB NOT NULL
);
