import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, ShieldCheck, ArrowRight, User, 
  Mail, Lock, GraduationCap, X, CheckCircle2
} from 'lucide-react';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  language 
}) {
  const [mode, setMode] = useState('login'); // 'login', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Class 6');
  const [board, setBoard] = useState('AP State Board');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      id: mode === 'register' ? 'student_custom' : 'student_mohith',
      email: email || 'student@manovriddhi.edu',
      full_name: name || 'Mohith Vardhan (Student)',
      role: 'student',
      grade: grade,
      board: board,
      streak: 5,
      xp: 480,
      level: 3,
    };
    onLoginSuccess(user);
    onClose();
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest_user',
      email: 'guest@manovriddhi.edu',
      full_name: 'Guest Explorer',
      role: 'guest',
      grade: 'Class 6',
      board: 'AP State Board',
      streak: 1,
      xp: 50,
      level: 1,
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  const handleTeacherDemoLogin = () => {
    const teacherUser = {
      id: 'teacher_saritha',
      email: 'saritha@school.ap.gov.in',
      full_name: 'Saritha Devi (Science Teacher)',
      role: 'teacher',
      grade: 'Class 6',
      board: 'AP State Board',
      streak: 12,
      xp: 1200,
      level: 5,
    };
    onLoginSuccess(teacherUser);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px', padding: '32px' }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="brand-mark" style={{ margin: '0 auto 12px' }}>
            <BookOpen size={24} color="#123824" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, margin: '4px 0' }}>
            manovriddhi <span style={{ color: 'var(--brand-gold)' }}>AI</span>
          </h2>
          <small style={{ fontSize: '10px', letterSpacing: '1.2px', color: 'var(--text-muted)', fontWeight: 800 }}>
            YUKTHI 2026 · GROWTH OF THE MIND
          </small>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'var(--bg-card-subtle)', borderRadius: '8px', padding: '4px', marginBottom: '18px' }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              background: mode === 'login' ? 'var(--brand-green)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Student Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              background: mode === 'register' ? 'var(--brand-green)' : 'transparent',
              color: mode === 'register' ? '#fff' : 'var(--text-muted)'
            }}
          >
            New Student Onboarding
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  STUDENT NAME:
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mohith Vardhan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    CLASS:
                  </label>
                  <select 
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    BOARD:
                  </label>
                  <select 
                    value={board}
                    onChange={e => setBoard(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
                  >
                    <option value="AP State Board">AP Board</option>
                    <option value="TS State Board">TS Board</option>
                    <option value="CBSE">CBSE</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              EMAIL ADDRESS:
            </label>
            <input 
              type="email" 
              required
              placeholder="student@school.gov.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              PASSWORD:
            </label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', fontSize: '12px', color: 'var(--text-primary)' }}
            />
          </div>

          <button className="btn-primary" type="submit" style={{ width: '100%', marginTop: '6px' }}>
            {mode === 'login' ? 'Sign In as Student' : 'Complete Registration'} <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ margin: '18px 0 14px', textAlign: 'center', position: 'relative' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />
          <span style={{ position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', padding: '0 8px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
            OR INSTANT DEMO ACCESS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className="btn-gold" 
            style={{ width: '100%' }}
            onClick={handleGuestLogin}
          >
            <Sparkles size={15} /> Continue as Guest Explorer (No Signup)
          </button>

          <button 
            className="btn-secondary" 
            style={{ width: '100%', fontSize: '11.5px' }}
            onClick={handleTeacherDemoLogin}
          >
            <GraduationCap size={15} /> Open Teacher Demo Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
