import React, { useState } from 'react';
import { 
  Sun, Moon, Globe, Clock, ShieldCheck, LogOut, 
  RotateCcw, Save, CheckCircle2, User, Key, Bell
} from 'lucide-react';
import { updateProfile } from '../services/api';

export default function SettingsView({ 
  profile, 
  theme, 
  onToggleTheme, 
  language, 
  onChangeLanguage, 
  onSwitchRole, 
  onLogout, 
  onShowToast 
}) {
  const [fullName, setFullName] = useState(profile?.full_name || 'Mohith Vardhan');
  const [grade, setGrade] = useState(profile?.grade || 'Class 6');
  const [board, setBoard] = useState(profile?.board || 'AP State Board');
  const [studyHours, setStudyHours] = useState(profile?.study_hours_daily || 2.5);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        student_id: profile?.id || 'student_mohith',
        full_name: fullName,
        grade,
        board,
        preferred_language: language,
        study_hours_daily: parseFloat(studyHours),
        exam_date: '2026-03-15'
      });
      onShowToast?.('✓ Profile and learning preferences updated!');
    } catch (e) {
      onShowToast?.('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> CONFIGURATION & PREFERENCES</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'ఖాతా & ' : 'Account & '}
          <em>{language === 'Telugu' ? 'అభిరుచులు' : 'Settings'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu'
            ? 'మీ అభ్యాస భాష, థీమ్, తరగతి మరియు పాత్రను మీ అవసరాలకు తగినట్లుగా మార్చుకోండి.'
            : 'Customize your theme, language, school grade, daily focus targets, and switch user roles.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Appearance & Language */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Appearance & Language</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                THEME COLOR MODE:
              </label>
              <button 
                className="btn-secondary" 
                onClick={onToggleTheme}
                style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {theme === 'dark' ? <Moon size={16} color="var(--brand-gold)" /> : <Sun size={16} color="var(--brand-gold)" />}
                  {theme === 'dark' ? 'Dark Mode' : 'Light Warm Mode'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Toggle</span>
              </button>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                PRIMARY LANGUAGE:
              </label>
              <select 
                value={language} 
                onChange={e => onChangeLanguage(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600 }}
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu-First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Profile & Grade */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Student Profile & Curriculum</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                DISPLAY NAME:
              </label>
              <input 
                type="text" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  GRADE / CLASS:
                </label>
                <select 
                  value={grade} 
                  onChange={e => setGrade(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
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
                  SCHOOL BOARD:
                </label>
                <select 
                  value={board} 
                  onChange={e => setBoard(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option value="AP State Board">Andhra Pradesh State Board (SCERT)</option>
                  <option value="TS State Board">Telangana State Board (SCERT)</option>
                  <option value="CBSE">CBSE (NCERT)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                DAILY STUDY TARGET (HOURS):
              </label>
              <input 
                type="number" 
                step="0.5" 
                min="0.5" 
                max="8" 
                value={studyHours} 
                onChange={e => setStudyHours(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', color: 'var(--text-primary)', fontSize: '12px' }}
              />
            </div>

            <button className="btn-primary" onClick={handleSaveProfile} disabled={saving} style={{ alignSelf: 'flex-start' }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>

        {/* Demo Role Switcher (For Judges and Evaluators) */}
        <div className="card" style={{ background: 'var(--brand-gold-light)', border: '1px solid rgba(245, 184, 61, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--brand-gold-text)' }}><span className="eyebrow-dot"></span> HACKATHON DEMO CONTROL</span>
              <h3 style={{ margin: 0, color: 'var(--brand-gold-text)' }}>Switch Active User Persona</h3>
            </div>
            <span style={{ fontSize: '10px', background: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>LIVE DEMO</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Seamlessly test the student view, educator learning-gap dashboard, or guest mode without needing separate registrations.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <button className="btn-secondary" style={{ background: '#fff' }} onClick={() => onSwitchRole('guest')}>
              Guest Explorer
            </button>
            <button className="btn-secondary" style={{ background: '#fff', borderColor: 'var(--brand-green)' }} onClick={() => onSwitchRole('student')}>
              Mohith (Student)
            </button>
            <button className="btn-secondary" style={{ background: '#fff', borderColor: 'var(--brand-coral)' }} onClick={() => onSwitchRole('teacher')}>
              Saritha (Teacher)
            </button>
            <button className="btn-secondary" style={{ background: '#fff' }} onClick={() => onSwitchRole('admin')}>
              Vidyavriksha (Admin)
            </button>
          </div>
        </div>

        {/* Logout Card */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>End Current Session</strong>
            <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Securely clear active credentials and return to login screen.</small>
          </div>
          <button 
            className="topbar-btn" 
            onClick={onLogout}
            style={{ color: 'var(--brand-coral)', borderColor: 'var(--brand-coral)' }}
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
