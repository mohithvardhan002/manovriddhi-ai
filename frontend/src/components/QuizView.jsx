import React, { useState, useEffect } from 'react';
import { 
  Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw, Clock, 
  BookMarked, Award, AlertCircle, Check, Languages, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchQuiz, submitQuiz, translateText } from '../services/api';

export default function QuizView({ 
  profile, 
  language, 
  onShowToast, 
  onNavigate 
}) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [translatedQuestion, setTranslatedQuestion] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const data = await fetchQuiz('chap_6_sci_1', profile?.id || 'student_mohith');
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setSelectedOption(null);
      setAnswered(false);
      setUserAnswers([]);
      setIsCompleted(false);
      setQuizResult(null);
      setTimerSeconds(0);
      setIsTimerRunning(true);
      setTranslatedQuestion(null);
    } catch (err) {
      console.error(err);
      onShowToast?.('Failed to load quiz. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx) => {
    if (answered) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || answered) return;
    const isCorrect = selectedOption === currentQ.answer;
    const ansRecord = {
      question_id: currentQ.id,
      topic: currentQ.topic,
      topic_te: currentQ.topic_te,
      page: currentQ.page_number,
      selected: selectedOption,
      correct: isCorrect,
    };
    setUserAnswers(prev => [...prev, ansRecord]);
    setAnswered(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
      setTranslatedQuestion(null);
    } else {
      // Quiz completed!
      setIsTimerRunning(false);
      setIsCompleted(true);
      try {
        const res = await submitQuiz(
          profile?.id || 'student_mohith',
          'chap_6_sci_1',
          userAnswers,
          timerSeconds
        );
        setQuizResult(res);

        if (res.accuracy_pct >= 80) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
          onShowToast?.(`🎉 Great Job! You scored ${res.score}/${res.total_questions}!`);
        } else {
          onShowToast?.(`Quiz submitted! Score: ${res.score}/${res.total_questions}`);
        }
      } catch (err) {
        console.error(err);
        onShowToast?.('Submitted locally. Sync failed.');
      }
    }
  };

  const handleTranslateQuestion = async () => {
    if (!currentQ) return;
    if (translatedQuestion) {
      setTranslatedQuestion(null);
      return;
    }
    setIsTranslating(true);
    try {
      const qText = language === 'Telugu' ? currentQ.question_te : currentQ.question_en;
      const targetLang = language === 'Telugu' ? 'English' : 'Telugu';
      const res = await translateText(qText, 'auto', targetLang);
      setTranslatedQuestion(res.translated);
    } catch (e) {
      onShowToast?.('Translation error. Please retry.');
    } finally {
      setIsTranslating(false);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <Brain size={36} color="var(--brand-green)" style={{ animation: 'bounce 1s infinite' }} />
        <h3 style={{ margin: '14px 0 6px' }}>Preparing Your Adaptive Practice Quiz...</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Targeting your weak topics based on past performance.</p>
      </div>
    );
  }

  if (isCompleted && quizResult) {
    return (
      <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '36px 24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: quizResult.accuracy_pct >= 80 ? 'var(--brand-green-light)' : 'var(--brand-gold-light)', color: quizResult.accuracy_pct >= 80 ? 'var(--brand-green-text)' : 'var(--brand-gold-text)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <Award size={36} />
        </div>
        <div className="eyebrow"><span className="eyebrow-dot"></span> QUIZ COMPLETED</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 800, margin: '8px 0 12px' }}>
          {quizResult.accuracy_pct >= 80 ? 'Outstanding Mastery!' : 'Good Effort — Learn From Mistakes'}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '24px 0' }}>
          <div className="stat-card" style={{ padding: '12px' }}>
            <span className="stat-label">SCORE</span>
            <div className="stat-value" style={{ fontSize: '24px' }}>{quizResult.score} / {quizResult.total_questions}</div>
          </div>
          <div className="stat-card" style={{ padding: '12px' }}>
            <span className="stat-label">ACCURACY</span>
            <div className="stat-value" style={{ fontSize: '24px' }}>{quizResult.accuracy_pct}%</div>
          </div>
          <div className="stat-card" style={{ padding: '12px' }}>
            <span className="stat-label">XP EARNED</span>
            <div className="stat-value" style={{ fontSize: '24px', color: 'var(--brand-gold)' }}>+{quizResult.xp_earned}</div>
          </div>
        </div>

        {/* Personalized Recommendation */}
        <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '14px', textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-green-text)', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
            <Sparkles size={14} /> Next Learning Recommendation:
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {quizResult.recommendation}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={loadQuiz}>
            <RotateCcw size={15} /> Retake Quiz
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('Progress')}>
            View Learning Insights <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const currentQuestionText = translatedQuestion || (language === 'Telugu' ? currentQ.question_te : currentQ.question_en);
  const currentOptions = language === 'Telugu' ? currentQ.options_te : currentQ.options_en;

  return (
    <div className="quiz-page" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-green-text)', letterSpacing: '0.8px' }}>
            QUESTION {currentIndex + 1} OF {questions.length}
          </span>
          {currentQ.is_weak_topic && (
            <span style={{ marginLeft: '10px', fontSize: '9.5px', fontWeight: 800, color: 'var(--brand-coral)', background: 'var(--brand-coral-light)', padding: '2px 7px', borderRadius: '4px' }}>
              TARGETED WEAK TOPIC
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Clock size={14} /> {formatTimer(timerSeconds)}
          </span>
          <button 
            className="translate-pill" 
            onClick={handleTranslateQuestion}
            disabled={isTranslating}
          >
            <Languages size={12} /> {isTranslating ? '...' : (translatedQuestion ? 'Show Original' : (language === 'Telugu' ? 'In English' : 'తెలుగు'))}
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--brand-gold)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Question Card */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-gold-text)', marginBottom: '8px' }}>
          {language === 'Telugu' ? (currentQ.topic_te || currentQ.topic) : currentQ.topic}
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: '20px' }}>
          {currentQuestionText}
        </h2>

        {/* Options */}
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          {currentOptions.map((opt, idx) => {
            let stateClass = '';
            if (selectedOption === idx) stateClass = 'selected';
            if (answered) {
              if (idx === currentQ.answer) stateClass = 'correct';
              else if (selectedOption === idx && idx !== currentQ.answer) stateClass = 'incorrect';
            }

            return (
              <button
                key={idx}
                className={`quiz-option ${stateClass}`}
                onClick={() => handleSelectOption(idx)}
                disabled={answered}
              >
                <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span style={{ flex: 1 }}>{opt}</span>
                {answered && idx === currentQ.answer && <CheckCircle2 size={18} color="#216137" />}
                {answered && selectedOption === idx && idx !== currentQ.answer && <XCircle size={18} color="#9c3b17" />}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback & Verified Textbook Citation */}
        {answered && (
          <div style={{ background: selectedOption === currentQ.answer ? '#edf8ee' : '#fdf0eb', border: `1px solid ${selectedOption === currentQ.answer ? '#bfe3ca' : '#f3c7b6'}`, borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            <strong style={{ fontSize: '12.5px', color: selectedOption === currentQ.answer ? '#216137' : '#9c3b17', display: 'block', marginBottom: '4px' }}>
              {selectedOption === currentQ.answer ? '✓ Exactly Right!' : '✗ Good Try — Learn From This'}
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.6, margin: '4px 0' }}>
              {language === 'Telugu' ? currentQ.explanation_te : currentQ.explanation_en}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
              <BookMarked size={12} />
              <span>Prescribed Textbook Citation: Page {currentQ.page_number}</span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {!answered ? (
            <button 
              className="btn-primary" 
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
            >
              Check Answer <ArrowRight size={14} />
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'View Quiz Results'} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
