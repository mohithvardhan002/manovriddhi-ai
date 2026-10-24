import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, Square, RotateCcw, CheckCircle2, 
  Calendar, Flame, Sparkles, BookOpen, Award, Save
} from 'lucide-react';
import { saveStudySession, fetchStudyHistory } from '../services/api';

export default function StudyTimerView({ 
  profile, 
  language, 
  onShowToast, 
  onSessionSaved 
}) {
  const [seconds, setSeconds] = useState(25 * 60); // Default Pomodoro 25 min
  const [initialDuration, setInitialDuration] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('pomodoro'); // 'pomodoro' (25m), 'standard' (45m), 'deep' (60m)
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [selectedChapter, setSelectedChapter] = useState('Plants: Parts and Functions');
  const [sessionNotes, setSessionNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(55);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      handleSaveSession(initialDuration);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const loadHistory = async () => {
    try {
      const data = await fetchStudyHistory(profile?.id || 'student_mohith');
      setHistory(data.recent_sessions || []);
      setTotalMinutes(data.total_minutes_studied || 55);
    } catch (e) {
      console.warn('Failed to load study history', e);
    }
  };

  const handleSetMode = (modeName, mins) => {
    setIsRunning(false);
    setTimerMode(modeName);
    setInitialDuration(mins);
    setSeconds(mins * 60);
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSeconds(initialDuration * 60);
  };

  const handleSaveSession = async (explicitMins = null) => {
    const elapsedMinutes = explicitMins || Math.max(1, Math.round((initialDuration * 60 - seconds) / 60));
    setSaving(true);
    try {
      const res = await saveStudySession(
        profile?.id || 'student_mohith',
        selectedSubject,
        selectedChapter,
        'focused_reading',
        elapsedMinutes,
        sessionNotes || 'Completed textbook study session.'
      );
      onShowToast?.(`✓ Logged ${elapsedMinutes} minutes studied! (+${res.xp_earned} XP)`);
      handleResetTimer();
      setSessionNotes('');
      loadHistory();
      onSessionSaved?.();
    } catch (err) {
      console.error(err);
      onShowToast?.('Failed to save study session.');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = ((initialDuration * 60 - seconds) / (initialDuration * 60)) * 100;

  return (
    <div className="study-timer-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> DAILY STUDY TRACKER</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'అధ్యయన ' : 'Focus Study '}
          <em>{language === 'Telugu' ? 'సమయ రికార్డర్' : 'Timer & Sessions'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu'
            ? 'మీ అభ్యాస సమయాన్ని రికార్డు చేయండి. ప్రతి 20 నిమిషాల అధ్యయనానికి అదనపు XP పాయింట్లు మరియు స్ట్రీక్ క్రెడిట్ పొందండి.'
            : 'Track your real textbook study sessions. Earn XP rewards for dedicated focus and maintain a healthy daily study streak.'}
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '24px' }}>
        {/* Main Clock Card */}
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          {/* Mode Selector */}
          <div style={{ display: 'inline-flex', gap: '6px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', padding: '4px', borderRadius: '10px', marginBottom: '24px' }}>
            <button
              onClick={() => handleSetMode('pomodoro', 25)}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                background: timerMode === 'pomodoro' ? 'var(--brand-green)' : 'transparent',
                color: timerMode === 'pomodoro' ? '#fff' : 'var(--text-muted)'
              }}
            >
              Pomodoro (25m)
            </button>
            <button
              onClick={() => handleSetMode('standard', 45)}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                background: timerMode === 'standard' ? 'var(--brand-green)' : 'transparent',
                color: timerMode === 'standard' ? '#fff' : 'var(--text-muted)'
              }}
            >
              Standard (45m)
            </button>
            <button
              onClick={() => handleSetMode('deep', 60)}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                background: timerMode === 'deep' ? 'var(--brand-green)' : 'transparent',
                color: timerMode === 'deep' ? '#fff' : 'var(--text-muted)'
              }}
            >
              Deep Study (60m)
            </button>
          </div>

          {/* Big Circular Styled Display */}
          <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 24px', borderRadius: '50%', background: 'var(--bg-card-subtle)', border: '8px solid var(--border-subtle)', display: 'grid', placeItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                {formatTime(seconds)}
              </div>
              <small style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                {isRunning ? 'FOCUS SESSION ACTIVE' : 'PAUSED'}
              </small>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button 
              className={isRunning ? 'btn-gold' : 'btn-primary'}
              onClick={handleToggleTimer}
              style={{ minWidth: '130px', padding: '12px 20px', fontSize: '13px' }}
            >
              {isRunning ? <Pause size={17} /> : <Play size={17} />}
              {isRunning ? 'Pause Timer' : 'Start Focus'}
            </button>

            <button 
              className="btn-secondary" 
              onClick={() => handleSaveSession()}
              disabled={seconds === initialDuration * 60 || saving}
              style={{ padding: '12px 18px' }}
            >
              <Save size={16} /> Save Session
            </button>

            <button 
              className="topbar-btn" 
              onClick={handleResetTimer}
              style={{ padding: '12px' }}
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Subject Assignment */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '400px', margin: '0 auto' }}>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', fontSize: '11.5px', color: 'var(--text-primary)' }}
            >
              <option value="Science">Class 6 Science</option>
              <option value="Physical Science">Class 9 Physical Science</option>
              <option value="Mathematics">Class 10 Mathematics</option>
              <option value="Social Studies">Class 8 Social Studies</option>
            </select>

            <input 
              type="text" 
              placeholder="Session notes (optional)..."
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              style={{ flex: 1, minWidth: '180px', padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', fontSize: '11.5px', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Study Insights & Session History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Stat Banner */}
          <div className="card" style={{ background: 'var(--brand-green-light)', borderColor: 'rgba(24, 76, 52, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="stat-label">TOTAL STUDY TIME RECORDED</span>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: 'var(--brand-green-text)', margin: '4px 0' }}>
                  {totalMinutes} <small style={{ fontSize: '14px' }}>Minutes</small>
                </div>
                <small style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Across {history.length} verified study sessions
                </small>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--brand-green)', color: '#fff', display: 'grid', placeItems: 'center' }}>
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Recent Study Sessions Table */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Recent Saved Sessions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.slice(0, 5).map((sess, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{sess.subject}</strong>
                    <small style={{ color: 'var(--text-muted)' }}>{sess.created_at?.split(' ')[0]} · {sess.chapter}</small>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--brand-green-text)' }}>
                    +{sess.duration_minutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
