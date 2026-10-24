/**
 * Manovriddhi AI API Client
 * Connects to FastAPI backend (/api/*) with seamless error handling and demo fallbacks.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

export async function fetchCatalog() {
  try {
    const res = await fetch(`${API_BASE}/catalog`);
    if (!res.ok) throw new Error('Failed to fetch catalog');
    return await res.json();
  } catch (err) {
    console.warn('API fetchCatalog fallback', err);
    return {
      subjects: [
        {
          id: 'sub_6_sci',
          grade: 'Class 6',
          board: 'AP State Board',
          name: 'Science',
          name_te: 'సైన్స్ (సాధారణ శాస్త్రం)',
          icon: 'Leaf',
          description: 'Explore biology, physics, and natural science fundamentals.',
          chapters: [
            {
              id: 'chap_6_sci_1',
              chapter_number: 1,
              title: 'Plants: Parts and Functions',
              title_te: 'మొక్కలు: భాగాలు మరియు విధులు',
              overview: 'Understanding root systems, stems, leaves, photosynthesis, and transpiration in plants.',
              overview_te: 'మొక్కల వేరు వ్యవస్థ, కాండం, ఆకులు, కిరణజన్య సంయోగక్రియ మరియు బాష్పోత్సేకం గురించి వివరంగా అధ్యయనం చేయడం.',
              duration_minutes: 45,
              total_pages: 18,
            },
            {
              id: 'chap_6_sci_2',
              chapter_number: 2,
              title: 'Our Food & Essential Nutrients',
              title_te: 'మన ఆహారం - ముఖ్యమైన పోషకాలు',
              overview: 'Components of food, carbohydrates, proteins, fats, vitamins, and balanced diet.',
              overview_te: 'ఆహారంలోని అంశాలు, పిండిపదార్థాలు, ప్రోటీన్లు, విటమిన్లు మరియు సమతుల్య ఆహారం ప్రాముఖ్యత.',
              duration_minutes: 40,
              total_pages: 14,
            }
          ]
        },
        {
          id: 'sub_9_sci',
          grade: 'Class 9',
          board: 'AP State Board',
          name: 'Physical Science',
          name_te: 'భౌతిక రసాయన శాస్త్రాలు',
          icon: 'Atom',
          description: 'Motion, force, atoms, and chemical reactions.',
          chapters: [
            {
              id: 'chap_9_sci_1',
              chapter_number: 1,
              title: 'Laws of Motion',
              title_te: 'చలన నియమాలు',
              overview: "Aristotle vs Galileo, Newton's first, second, and third laws of motion, inertia, and momentum.",
              overview_te: 'న్యూటన్ మొదటి, రెండవ, మూడవ చలన నియమాలు, జడత్వం మరియు ద్రవ్యవేగం భావనలు.',
              duration_minutes: 50,
              total_pages: 22,
            }
          ]
        },
        {
          id: 'sub_10_math',
          grade: 'Class 10',
          board: 'AP State Board',
          name: 'Mathematics',
          name_te: 'గణితం',
          icon: 'Binary',
          description: 'Real numbers, polynomials, trigonometry, and coordinate geometry.',
          chapters: [
            {
              id: 'chap_10_math_1',
              chapter_number: 1,
              title: 'Real Numbers',
              title_te: 'వాస్తవ సంఖ్యలు',
              overview: "Euclid's division lemma, fundamental theorem of arithmetic, rational and irrational numbers.",
              overview_te: 'యూక్లిడ్ భాగహార న్యాయం, అంకగణిత ప్రాథమిక సిద్ధాంతం, కరణీయ మరియు అకరణీయ సంఖ్యలు.',
              duration_minutes: 50,
              total_pages: 20,
            }
          ]
        }
      ]
    };
  }
}

export async function askQuestion(question, grade = 'Class 6', subject = 'Science', chapter = '', language = 'English', mode = 'simple') {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, grade, subject, chapter, language, mode }),
  });
  if (!res.ok) throw new Error('Failed to ask AI Tutor');
  return await res.json();
}

export async function translateText(text, sourceLang = 'auto', targetLang = 'Telugu') {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang }),
  });
  if (!res.ok) throw new Error('Translation failed');
  return await res.json();
}

export async function fetchQuiz(chapterId = 'chap_6_sci_1', studentId = 'student_mohith', difficulty = 'all') {
  const res = await fetch(`${API_BASE}/quiz?chapter_id=${chapterId}&student_id=${studentId}&difficulty=${difficulty}`);
  if (!res.ok) throw new Error('Failed to fetch quiz');
  return await res.json();
}

export async function submitQuiz(studentId, chapterId, answers, timeTakenSec) {
  const res = await fetch(`${API_BASE}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: studentId,
      chapter_id: chapterId,
      answers,
      time_taken_sec: timeTakenSec,
    }),
  });
  if (!res.ok) throw new Error('Failed to submit quiz');
  return await res.json();
}

export async function generateTimetable(payload) {
  const res = await fetch(`${API_BASE}/timetable/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate timetable');
  return await res.json();
}

export async function fetchLatestTimetable(studentId = 'student_mohith') {
  const res = await fetch(`${API_BASE}/timetable/latest?student_id=${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch timetable');
  return await res.json();
}

export async function saveStudySession(studentId, subject, chapter, activityType, durationMinutes, notes = '') {
  const res = await fetch(`${API_BASE}/study-timer/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: studentId,
      subject,
      chapter,
      activity_type: activityType,
      duration_minutes: durationMinutes,
      notes,
    }),
  });
  if (!res.ok) throw new Error('Failed to save study session');
  return await res.json();
}

export async function fetchStudyHistory(studentId = 'student_mohith') {
  const res = await fetch(`${API_BASE}/study-timer/history?student_id=${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch study history');
  return await res.json();
}

export async function fetchProgress(studentId = 'student_mohith') {
  const res = await fetch(`${API_BASE}/progress?student_id=${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch progress analytics');
  return await res.json();
}

export async function fetchRewards(studentId = 'student_mohith') {
  const res = await fetch(`${API_BASE}/rewards?student_id=${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch rewards');
  return await res.json();
}

export async function fetchFlashcards(chapterId = 'chap_6_sci_1', studentId = 'student_mohith') {
  const res = await fetch(`${API_BASE}/flashcards?chapter_id=${chapterId}&student_id=${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch flashcards');
  return await res.json();
}

export async function reviewFlashcard(studentId, flashcardId, rating) {
  const res = await fetch(`${API_BASE}/flashcards/review?student_id=${studentId}&flashcard_id=${flashcardId}&rating=${rating}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to review flashcard');
  return await res.json();
}

export async function fetchNotes(studentId = 'student_mohith') {
  const res = await fetch(`${API_BASE}/notes?student_id=${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return await res.json();
}

export async function createNote(studentId, title, content, chapterId = 'chap_6_sci_1', isMistakeNote = 0) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: studentId,
      chapter_id: chapterId,
      title,
      content,
      is_mistake_note: isMistakeNote,
    }),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return await res.json();
}

export async function fetchResources(chapterId = 'chap_6_sci_1') {
  const res = await fetch(`${API_BASE}/resources?chapter_id=${chapterId}`);
  if (!res.ok) throw new Error('Failed to fetch resources');
  return await res.json();
}

export async function fetchTeacherDashboard(teacherId = 'teacher_saritha') {
  const res = await fetch(`${API_BASE}/teacher/dashboard?teacher_id=${teacherId}`);
  if (!res.ok) throw new Error('Failed to fetch teacher dashboard');
  return await res.json();
}

export async function askFromPhoto(imageBase64, grade = 'Class 6', subject = 'Science', chapter = '', language = 'English') {
  const res = await fetch(`${API_BASE}/photo-ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: imageBase64,
      grade,
      subject,
      chapter,
      language,
    }),
  });
  if (!res.ok) throw new Error('Failed to process photo');
  return await res.json();
}

export async function runEvaluation() {
  const res = await fetch(`${API_BASE}/evaluation/run`);
  if (!res.ok) throw new Error('Failed to run evaluation benchmark');
  return await res.json();
}

export async function fetchProfile(userId = 'student_mohith') {
  const res = await fetch(`${API_BASE}/auth/profile?user_id=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return await res.json();
}

export async function updateProfile(payload) {
  const res = await fetch(`${API_BASE}/auth/update-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return await res.json();
}

export async function submitReport(studentId, reportType, question, answer, reason) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: studentId,
      report_type: reportType,
      question,
      answer,
      reason,
    }),
  });
  if (!res.ok) throw new Error('Failed to submit report');
  return await res.json();
}
