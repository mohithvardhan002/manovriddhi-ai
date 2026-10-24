import React, { useState, useEffect } from 'react';
import { 
  BookMarked, Brain, RotateCcw, Plus, CheckCircle2, 
  Languages, FileText, ChevronLeft, ChevronRight, Sparkles, Save
} from 'lucide-react';
import { fetchFlashcards, reviewFlashcard, fetchNotes, createNote } from '../services/api';

export default function RevisionView({ 
  profile, 
  language, 
  onShowToast 
}) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards', 'mistakes', 'notes'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const fcData = await fetchFlashcards('chap_6_sci_1', profile?.id || 'student_mohith');
      setFlashcards(fcData.flashcards || []);
      const nData = await fetchNotes(profile?.id || 'student_mohith');
      setNotes(nData.notes || []);
    } catch (e) {
      console.warn('Failed to load revision data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (rating) => {
    if (!flashcards.length) return;
    const card = flashcards[currentIndex];
    try {
      await reviewFlashcard(profile?.id || 'student_mohith', card.id, rating);
      onShowToast?.(`Card rated as "${rating}". (+5 XP)`);
      setIsFlipped(false);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setCurrentIndex(0);
        onShowToast?.('✓ Completed this flashcard deck!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      await createNote(profile?.id || 'student_mohith', newNoteTitle, newNoteContent);
      onShowToast?.('✓ Revision note saved successfully!');
      setNewNoteTitle('');
      setNewNoteContent('');
      loadData();
    } catch (e) {
      onShowToast?.('Failed to save note.');
    }
  };

  const currentCard = flashcards[currentIndex];

  const mistakeNotes = [
    {
      topic: 'Chlorophyll Function',
      question: 'Which substance in leaves captures sunlight energy?',
      mistake: 'Selected "Calcium" instead of "Chlorophyll"',
      correction: 'Chlorophyll is the green pigment in leaf chloroplasts that absorbs light photons. Prescribed textbook Page 13.',
      page: 13
    },
    {
      topic: 'Photosynthesis By-Product',
      question: 'Which gas is released into the atmosphere during photosynthesis?',
      mistake: 'Selected "Carbon dioxide" instead of "Oxygen"',
      correction: 'Plants absorb carbon dioxide and water, and discharge oxygen as a byproduct. Prescribed textbook Page 12.',
      page: 12
    }
  ];

  return (
    <div className="revision-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> SPACED REPETITION & ACTIVE RECALL</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'పునశ్చరణ ' : 'Smart '}
          <em>{language === 'Telugu' ? 'కేంద్రం & ఫ్లాష్‌కార్డులు' : 'Revision Center'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu'
            ? 'శాస్త్రీయ అంతరాల పునశ్చరణ పద్ధతి ద్వారా బలహీనమైన భావనలను సులభంగా గుర్తుంచుకోండి.'
            : 'Strengthen memory retention with interactive 3D flashcards, personal revision notes, and mistake intelligence.'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }}>
        {[
          { id: 'flashcards', label: 'Flashcards Deck', icon: Brain },
          { id: 'mistakes', label: 'Mistake Notebook', icon: BookMarked },
          { id: 'notes', label: 'Personal Study Notes', icon: FileText },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 16px',
              borderBottom: activeTab === t.id ? '2px solid var(--brand-green)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--brand-green)' : 'var(--text-muted)',
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 3D FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          {currentCard ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>CARD {currentIndex + 1} OF {flashcards.length}</span>
                <span>Page {currentCard.page_number} Citation</span>
              </div>

              {/* 3D Flip Card */}
              <div 
                className="flashcard-container" 
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
                  {/* Front */}
                  <div className="flashcard-front">
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-gold-text)', background: 'var(--brand-gold-light)', padding: '3px 8px', borderRadius: '5px', marginBottom: '12px' }}>
                      {language === 'Telugu' ? (currentCard.topic_te || currentCard.topic) : currentCard.topic}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, margin: '8px 0', color: 'var(--text-primary)' }}>
                      {language === 'Telugu' ? currentCard.front_te : currentCard.front_en}
                    </h3>
                    <small style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Click or tap to reveal explanation</small>
                  </div>

                  {/* Back */}
                  <div className="flashcard-back">
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#f5b83d', textTransform: 'uppercase', marginBottom: '8px' }}>
                      EXPLANATION · PAGE {currentCard.page_number}
                    </span>
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#ffffff' }}>
                      {language === 'Telugu' ? currentCard.back_te : currentCard.back_en}
                    </p>
                    <small style={{ color: '#d0ebd8', marginTop: '14px' }}>Click to flip back</small>
                  </div>
                </div>
              </div>

              {/* Spaced Repetition Buttons */}
              <div style={{ marginTop: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                  RATE HOW WELL YOU REMEMBERED THIS:
                </span>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button 
                    className="topbar-btn" 
                    onClick={() => handleReview('again')}
                    style={{ borderColor: 'var(--brand-coral)', color: 'var(--brand-coral)' }}
                  >
                    Again (1d)
                  </button>
                  <button 
                    className="topbar-btn" 
                    onClick={() => handleReview('hard')}
                    style={{ borderColor: 'var(--brand-gold)', color: 'var(--brand-gold-text)' }}
                  >
                    Hard (2d)
                  </button>
                  <button 
                    className="topbar-btn" 
                    onClick={() => handleReview('good')}
                    style={{ borderColor: 'var(--brand-green)', color: 'var(--brand-green-text)' }}
                  >
                    Good (4d)
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleReview('easy')}
                    style={{ padding: '6px 14px', fontSize: '11px' }}
                  >
                    Easy (7d)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No flashcards available for this chapter.</p>
          )}
        </div>
      )}

      {/* TAB 2: MISTAKE NOTEBOOK */}
      {activeTab === 'mistakes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card" style={{ background: 'var(--brand-gold-light)', border: '1px solid rgba(245, 184, 61, 0.3)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Brain size={20} color="var(--brand-gold-text)" />
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--brand-gold-text)' }}>Mistake Intelligence</strong>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Reviewing previous quiz mistakes creates durable cognitive connections and eliminates recurring errors.
                </p>
              </div>
            </div>
          </div>

          {mistakeNotes.map((m, idx) => (
            <div key={idx} className="card" style={{ borderLeft: '4px solid var(--brand-coral)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{m.topic}</strong>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Page {m.page}</span>
              </div>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Q: {m.question}
              </p>
              <div style={{ padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: '6px', fontSize: '11.5px', marginBottom: '8px', color: 'var(--brand-coral)' }}>
                ✗ Past error: {m.mistake}
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--brand-green-light)', borderRadius: '6px', fontSize: '11.5px', color: 'var(--brand-green-text)', lineHeight: 1.5 }}>
                ✓ Correction & Concept: {m.correction}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: PERSONAL NOTES */}
      {activeTab === 'notes' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Creator */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Create New Study Note</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Note Title (e.g. Stomata Function Notes)"
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
              />
              <textarea 
                placeholder="Write your personal notes, formulas, or mnemonic tricks..."
                rows={5}
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)', resize: 'vertical' }}
              />
              <button className="btn-primary" onClick={handleSaveNote}>
                <Save size={14} /> Save to Revision Notebook
              </button>
            </div>
          </div>

          {/* List */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Saved Notes ({notes.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notes.length ? notes.map(n => (
                <div key={n.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>{n.title}</strong>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{n.content}</p>
                  <small style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>{n.created_at?.split(' ')[0]}</small>
                </div>
              )) : (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No personal notes created yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
