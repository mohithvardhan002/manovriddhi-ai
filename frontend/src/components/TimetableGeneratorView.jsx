import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, RotateCcw, Printer, Plus, 
  Trash2, AlertCircle, Sparkles, ArrowRight, Save
} from 'lucide-react';
import { generateTimetable, fetchLatestTimetable } from '../services/api';

export default function TimetableGeneratorView({ 
  profile, 
  language, 
  onShowToast 
}) {
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState(null);

  // Form states
  const [title, setTitle] = useState('My Midterm Prep Timetable');
  const [targetExam, setTargetExam] = useState('Midterm Examination 2026');
  const [dailyHours, setDailyHours] = useState(2.5);
  const [startTime, setStartTime] = useState('17:30');
  const [sessionMin, setSessionMin] = useState(45);
  const [breakMin, setBreakMin] = useState(15);
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [subjects, setSubjects] = useState([
    { name: 'Science', confidence: 'Low', topics: 'Plants, Nutrition, Motion' },
    { name: 'Mathematics', confidence: 'Medium', topics: 'Real Numbers, Algebra' },
    { name: 'Social Studies', confidence: 'High', topics: 'Our Earth & Governance' },
  ]);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const data = await fetchLatestTimetable(profile?.id || 'student_mohith');
      if (data) setTimetable(data);
    } catch (e) {
      console.warn('Timetable load error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload = {
        student_id: profile?.id || 'student_mohith',
        title,
        target_exam: targetExam,
        available_days: selectedDays,
        daily_limit_hours: parseFloat(dailyHours),
        study_start_time: startTime,
        session_duration_minutes: parseInt(sessionMin),
        break_duration_minutes: parseInt(breakMin),
        subjects,
      };
      const res = await generateTimetable(payload);
      setTimetable(res);
      onShowToast?.('✓ Conflict-free timetable generated and saved to your account!');
    } catch (err) {
      console.error(err);
      onShowToast?.('Failed to generate timetable. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const updateSubjectConfidence = (idx, conf) => {
    const updated = [...subjects];
    updated[idx].confidence = conf;
    setSubjects(updated);
  };

  const toggleSessionComplete = (day, sessId) => {
    if (!timetable?.schedule?.[day]) return;
    const updatedSchedule = { ...timetable.schedule };
    updatedSchedule[day] = updatedSchedule[day].map(s => {
      if (s.id === sessId) return { ...s, completed: !s.completed };
      return s;
    });
    setTimetable({ ...timetable, schedule: updatedSchedule });
    onShowToast?.('Session status updated!');
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="timetable-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> SMART TIMETABLE GENERATOR</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'వ్యక్తిగత ' : 'Personalized '}
          <em>{language === 'Telugu' ? 'అధ్యయన టైమ్‌టేబుల్' : 'Study Timetable'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu'
            ? 'శాస్త్రీయ ప్రణాళికతో బలహీనమైన అంశాలకు ప్రాధాన్యతనిస్తూ, విరామాలతో కూడిన సమర్థవంతమైన టైమ్‌టేబుల్‌ను రూపొందించుకోండి.'
            : 'Generates a realistic, conflict-free timetable tailored to your availability, exam dates, and subject weaknesses.'}
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '28px' }}>
        {/* Input Questionnaire Card */}
        <div className="card">
          <div className="card-header">
            <h3>Timetable Preferences</h3>
            <span style={{ fontSize: '11px', color: 'var(--brand-green-text)', fontWeight: 700 }}>Step-by-Step Optimizer</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                TIMETABLE TITLE & TARGET EXAM:
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  DAILY STUDY HOURS:
                </label>
                <select 
                  value={dailyHours} 
                  onChange={e => setDailyHours(parseFloat(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
                >
                  <option value={1.5}>1.5 Hours / day</option>
                  <option value={2.0}>2.0 Hours / day</option>
                  <option value={2.5}>2.5 Hours / day</option>
                  <option value={3.0}>3.0 Hours / day</option>
                  <option value={4.0}>4.0 Hours / day</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  STUDY START TIME:
                </label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Days selector */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                AVAILABLE STUDY DAYS:
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {allDays.map(d => {
                  const isSel = selectedDays.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      style={{
                        padding: '5px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: isSel ? 'var(--brand-green)' : 'var(--bg-card-subtle)',
                        color: isSel ? '#ffffff' : 'var(--text-muted)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subjects and Confidence */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                SUBJECT CONFIDENCE (Low Confidence gets 2x revision slots!):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subjects.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['Low', 'Medium', 'High'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => updateSubjectConfidence(idx, lvl)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700,
                            background: s.confidence === lvl ? (lvl === 'Low' ? 'var(--brand-coral)' : (lvl === 'Medium' ? 'var(--brand-gold)' : 'var(--brand-green)')) : 'transparent',
                            color: s.confidence === lvl ? '#fff' : 'var(--text-muted)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleGenerate}
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Sparkles size={16} /> {loading ? 'Generating...' : 'Generate Optimized Timetable'}
            </button>
          </div>
        </div>

        {/* Timetable Features & Algorithm Explanation */}
        <div className="card" style={{ background: 'var(--bg-card-subtle)' }}>
          <div className="card-header">
            <h3>Algorithmic Guardrails</h3>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-green-text)' }}>ZERO CONFLICTS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--brand-green-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><b>Weak-Topic Weighting:</b> Low confidence subjects automatically receive double study slots.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--brand-green-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><b>Healthy Break Integration:</b> Built-in 15-minute cognitive breaks between every 45-minute focused study block.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--brand-green-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><b>Activity Rotation:</b> Rotates between concept study, chapter quizzes, and flashcard review to maintain retention.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--brand-green-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><b>Persistent Database Storage:</b> Your schedule is preserved in SQLite/Supabase and synchronizes across sessions.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Timetable Display */}
      {timetable && (
        <div className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '18px' }}>
            <div>
              <div className="eyebrow"><span className="eyebrow-dot"></span> CURRENT SCHEDULE</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, margin: '4px 0' }}>
                {timetable.title}
              </h2>
              <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Target: {timetable.target_exam} · {timetable.total_weekly_hours} Hours Total / Week
              </small>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => window.print()}>
                <Printer size={14} /> Print Schedule
              </button>
              <button className="btn-primary" onClick={handleGenerate}>
                <RotateCcw size={14} /> Regenerate
              </button>
            </div>
          </div>

          {/* Daily Schedule Slots */}
          <div className="timetable-grid">
            {Object.entries(timetable.schedule || {}).map(([day, slots]) => (
              <div key={day} className="day-schedule-card">
                <div className="day-header">
                  <span>{day}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {slots.filter(s => s.completed).length} / {slots.length} Completed
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {slots.map(slot => (
                    <div 
                      key={slot.id} 
                      className={`session-slot ${slot.completed ? 'completed' : ''}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={slot.completed} 
                        onChange={() => toggleSessionComplete(day, slot.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--brand-green)' }}
                      />
                      <span style={{ fontWeight: 700, color: 'var(--brand-green-text)', minWidth: '130px' }}>
                        {slot.start_time} - {slot.end_time}
                      </span>
                      <strong style={{ minWidth: '120px' }}>{slot.subject}</strong>
                      <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{slot.activity}</span>
                      <span className={`priority-pill ${slot.priority.toLowerCase()}`}>
                        {slot.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
