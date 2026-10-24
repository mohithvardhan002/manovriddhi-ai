import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Send, Mic, MicOff, Volume2, VolumeX, BookMarked, CheckCircle2, 
  X, Languages, ThumbsUp, ThumbsDown, AlertCircle, Camera, RotateCcw, 
  HelpCircle, ChevronRight, Info, Eye
} from 'lucide-react';
import { askQuestion, translateText, submitReport } from '../services/api';

export default function AITutorView({ 
  language, 
  initialQuestion = '', 
  onShowToast 
}) {
  const [question, setQuestion] = useState(initialQuestion || 'What is photosynthesis?');
  const [mode, setMode] = useState('simple'); // simple, step_by_step, examples, beginner, exam_notes, short
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([
    {
      q: 'What is photosynthesis?',
      found: true,
      answer: 'Photosynthesis is the fundamental biological process through which green plants utilize sunlight, water absorbed by roots, and carbon dioxide from the surrounding air to synthesize glucose (food) while discharging oxygen into the atmosphere.',
      primary_citation: 'AP SCERT Class 6 Science Textbook, Page 12',
      sources: [{ page_number: 12, chapter: 'Plants: Parts and Functions', source_book: 'AP SCERT Class 6 Science Textbook', excerpt: 'Photosynthesis is the fundamental biological process...' }]
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeModalSource, setActiveModalSource] = useState(null);
  const [translatedAnswer, setTranslatedAnswer] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  // Speech Recognition (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onShowToast?.('Voice speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'Telugu' ? 'te-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
        onShowToast?.(`Voice detected: "${transcript}"`);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        onShowToast?.('Voice capture interrupted. Please try again or type.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text to Speech
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      onShowToast?.('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'Telugu' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleAsk = async (queryText = question) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setAnswer(null);
    setTranslatedAnswer(null);
    setFeedbackGiven(false);

    try {
      const res = await askQuestion(
        queryText,
        'Class 6',
        'Science',
        'Plants: Parts and Functions',
        language,
        mode
      );
      setAnswer(res);
      setHistory(prev => [{ q: queryText, ...res }, ...prev].slice(0, 6));
    } catch (err) {
      console.error(err);
      onShowToast?.('Failed to get answer. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateCurrentAnswer = async () => {
    if (!answer?.answer) return;
    if (translatedAnswer) {
      setTranslatedAnswer(null);
      return;
    }
    setIsTranslating(true);
    try {
      const targetLang = language === 'Telugu' ? 'English' : 'Telugu';
      const res = await translateText(answer.answer, 'auto', targetLang);
      setTranslatedAnswer(res.translated);
      onShowToast?.(`Answer translated to ${targetLang}!`);
    } catch (e) {
      onShowToast?.('Translation service unavailable. Please retry.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFeedback = (type) => {
    setFeedbackGiven(true);
    if (type === 'up') {
      onShowToast?.('Thank you for rating! Answer accuracy recorded.');
    } else {
      submitReport('student_mohith', 'incorrect_answer', question, answer?.answer, 'Student flagged this answer.');
      onShowToast?.('Feedback reported to teacher for curriculum review.');
    }
  };

  const promptChips = [
    'What is photosynthesis?',
    'What do roots absorb from soil?',
    'Why are leaves green?',
    'What is transpiration?',
    'How does stem conduct water?',
    'Who won the 2022 World Cup?' // Deliberate out-of-domain test
  ];

  return (
    <div className="ai-tutor-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> STRICT TEXTBOOK RAG ENGINE</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'పాఠ్యపుస్తక ఆధారిత ' : 'Your AI '}
          <em>{language === 'Telugu' ? 'వ్యక్తిగత ట్యూటర్' : 'Personal Tutor'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu'
            ? 'మీ పాఠశాల పాఠ్యపుస్తకంలోని పేజీలను మాత్రమే ఆధారంగా చేసుకుని సమాధానాలు ఇస్తుంది. పుస్తకంలో లేని విషయాలపై తప్పుడు సమాచారం ఇవ్వదు.'
            : 'Answers strictly from your prescribed school textbook with page citations. If a concept is not in your textbook, it tells you directly.'}
        </p>
      </div>

      <div className="tutor-layout">
        {/* Left Column: Ask Input & Answer */}
        <div className="chat-box">
          {/* Explanation Mode Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>EXPLANATION STYLE:</span>
            <span style={{ fontSize: '10px', color: 'var(--brand-green-text)', fontWeight: 700 }}>Class 6 · Science · Plants</span>
          </div>

          <div className="mode-pills">
            {[
              { id: 'simple', label: 'Explain Simply' },
              { id: 'step_by_step', label: 'Step by Step' },
              { id: 'examples', label: 'With Examples' },
              { id: 'beginner', label: 'Like a Beginner' },
              { id: 'exam_notes', label: 'Exam Notes' },
              { id: 'short', label: 'Short Answer' },
            ].map(m => (
              <button
                key={m.id}
                className={`mode-pill ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Prompt Chips */}
          <div className="prompt-chips">
            {promptChips.map((chip, idx) => (
              <button 
                key={idx} 
                className="chip-btn"
                onClick={() => {
                  setQuestion(chip);
                  handleAsk(chip);
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Question Textarea Box */}
          <div className="textarea-box">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder={language === 'Telugu' ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...' : 'Ask any question from this chapter...'}
              aria-label="Ask Question"
            />
            <div className="chat-tools">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <HelpCircle size={13} /> {language === 'Telugu' ? 'తెలుగు లేదా ఇంగ్లీషులో అడగండి' : 'Ask in Telugu or English'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`topbar-btn ${isListening ? 'running' : ''}`}
                  onClick={handleVoiceInput}
                  title="Speak your question (Web Speech API)"
                  style={{ background: isListening ? '#fbf3dd' : 'var(--bg-card)' }}
                >
                  {isListening ? <MicOff size={15} color="var(--brand-coral)" /> : <Mic size={15} />}
                  <span>{isListening ? 'Listening...' : 'Voice'}</span>
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => handleAsk()}
                  disabled={loading || !question.trim()}
                  style={{ padding: '7px 14px', fontSize: '11.5px' }}
                >
                  <Send size={14} /> {loading ? 'Searching...' : 'Ask'}
                </button>
              </div>
            </div>
          </div>

          {/* Answer Display Card */}
          {loading && (
            <div className="answer-card" style={{ textAlign: 'center', padding: '28px' }}>
              <div style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite', marginBottom: '8px' }}>
                <Sparkles size={24} color="var(--brand-green)" />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Scanning authorized textbook passages for "{question}"...
              </p>
            </div>
          )}

          {answer && !loading && (
            <div className={`answer-card ${answer.found ? '' : 'not-found'}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: answer.found ? 'var(--brand-green)' : 'var(--brand-coral)', color: '#fff', display: 'grid', placeItems: 'center' }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>
                      {answer.found 
                        ? (language === 'Telugu' ? 'పాఠ్యపుస్తక ఆధారిత వివరణ' : 'Textbook-Grounded Explanation')
                        : (language === 'Telugu' ? 'పాఠ్యపుస్తకంలో లభించలేదు' : 'Not Found in Prescribed Textbook')}
                    </strong>
                    <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {answer.found ? 'Strictly grounded · No external speculation' : 'Strict anti-hallucination guard'}
                    </small>
                  </div>
                </div>

                {/* Translation Button on Answer */}
                {answer.found && (
                  <button 
                    className="translate-pill" 
                    onClick={handleTranslateCurrentAnswer}
                    disabled={isTranslating}
                  >
                    <Languages size={12} />
                    {isTranslating ? 'Translating...' : (translatedAnswer ? 'Show Original' : (language === 'Telugu' ? 'Translate to English' : 'తెలుగులోకి అనువాదం'))}
                  </button>
                )}
              </div>

              {/* Answer Text */}
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                {translatedAnswer || answer.answer}
              </p>

              {/* Verified Page Citation */}
              {answer.primary_citation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <div className="citation-pill">
                    <BookMarked size={14} />
                    <span>{answer.primary_citation}</span>
                    <CheckCircle2 size={13} color="var(--brand-green-text)" />
                  </div>
                  {answer.sources?.[0] && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '10.5px' }}
                      onClick={() => setActiveModalSource(answer.sources[0])}
                    >
                      <Eye size={12} /> View Textbook Page Excerpt
                    </button>
                  )}
                </div>
              )}

              {/* Action Bar (Listen, Thumbs, Report) */}
              {answer.found && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(24, 76, 52, 0.12)', paddingTop: '10px', marginTop: '14px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '5px 10px', fontSize: '11px' }}
                    onClick={() => speakText(translatedAnswer || answer.answer)}
                  >
                    {isSpeaking ? <VolumeX size={14} color="var(--brand-coral)" /> : <Volume2 size={14} />}
                    {isSpeaking ? 'Stop Speech' : 'Listen to Explanation'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Helpful?</span>
                    <button 
                      className="topbar-btn" 
                      style={{ padding: '4px 8px' }} 
                      onClick={() => handleFeedback('up')}
                      disabled={feedbackGiven}
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button 
                      className="topbar-btn" 
                      style={{ padding: '4px 8px' }} 
                      onClick={() => handleFeedback('down')}
                      disabled={feedbackGiven}
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Grounding Note & Recent Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Trust & Grounding Card */}
          <div className="card" style={{ background: 'var(--brand-green-light)', borderColor: 'rgba(24, 76, 52, 0.2)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand-green)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--brand-green-text)', display: 'block' }}>
                  Responsible AI Guarantee
                </strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                  Manovriddhi AI answers only from authorized SCERT/Board textbooks. It never searches generic internet forums or invents page citations.
                </p>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Recently Asked</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(h.q);
                    setAnswer(h);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'left',
                    fontSize: '11.5px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {h.q}
                  </span>
                  <ChevronRight size={13} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Textbook Source Viewer Modal */}
      {activeModalSource && (
        <div className="modal-overlay" onClick={() => setActiveModalSource(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <span className="eyebrow"><span className="eyebrow-dot"></span> ORIGINAL TEXTBOOK PASSAGE</span>
                <h3 style={{ fontSize: '17px', margin: 0 }}>{activeModalSource.chapter} · Page {activeModalSource.page_number}</h3>
              </div>
              <button className="topbar-btn" onClick={() => setActiveModalSource(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '13px', lineHeight: 1.8 }}>
              {activeModalSource.excerpt}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Source: {activeModalSource.source_book}</span>
              <button className="btn-primary" onClick={() => setActiveModalSource(null)}>Close Excerpt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
