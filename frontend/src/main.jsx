import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, Brain, Clock, Flame, Sparkles, ArrowRight, CheckCircle2, 
  Calendar, Award, AlertCircle, ChevronRight, BookMarked, TrendingUp,
  Volume2, Languages, Sun, Moon, LogIn, LogOut, Menu, X, ShieldCheck, 
  Leaf, GraduationCap, Layers, Search, Camera, FileText, Settings, User
} from 'lucide-react';
import './styles.css';

import { fetchCatalog, fetchProfile, translateText } from './services/api';
import DashboardView from './components/DashboardView';
import LearnView from './components/LearnView';
import AITutorView from './components/AITutorView';
import QuizView from './components/QuizView';
import TimetableGeneratorView from './components/TimetableGeneratorView';
import StudyTimerView from './components/StudyTimerView';
import ProgressView from './components/ProgressView';
import RewardsView from './components/RewardsView';
import RevisionView from './components/RevisionView';
import ResourcesView from './components/ResourcesView';
import PhotoLearningView from './components/PhotoLearningView';
import TeacherDashboardView from './components/TeacherDashboardView';
import EvaluationView from './components/EvaluationView';
import SettingsView from './components/SettingsView';
import AuthModal from './components/AuthModal';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('manovriddhi_theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('manovriddhi_lang') || 'English');
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  // User session state
  const [profile, setProfile] = useState({
    id: 'student_mohith',
    full_name: 'Mohith Vardhan (Student)',
    role: 'student',
    grade: 'Class 6',
    board: 'AP State Board',
    streak: 5,
    xp: 480,
    level: 3,
  });

  const [catalog, setCatalog] = useState(null);
  const [tutorQuery, setTutorQuery] = useState('');

  // Topbar quick timer state
  const [quickTimerActive, setQuickTimerActive] = useState(false);
  const [quickTimerSec, setQuickTimerSec] = useState(0);

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('manovriddhi_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('manovriddhi_lang', language);
  }, [language]);

  useEffect(() => {
    // Load catalog
    fetchCatalog().then(data => setCatalog(data)).catch(console.error);
    // Load student profile
    fetchProfile(profile.id).then(p => {
      if (p) setProfile(prev => ({ ...prev, ...p }));
    }).catch(console.error);
  }, [profile.id]);

  // Quick timer ticker
  useEffect(() => {
    let int = null;
    if (quickTimerActive) {
      int = setInterval(() => setQuickTimerSec(s => s + 1), 1000);
    }
    return () => clearInterval(int);
  }, [quickTimerActive]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const toggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
    showToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light Warm'} Mode`);
  };

  const handleRoleSwitch = (role) => {
    if (role === 'guest') {
      setProfile({
        id: 'guest_user',
        full_name: 'Guest Explorer',
        role: 'guest',
        grade: 'Class 6',
        board: 'AP State Board',
        streak: 1,
        xp: 50,
        level: 1,
      });
      setActiveTab('Dashboard');
      showToast('Switched to Guest Mode');
    } else if (role === 'teacher') {
      setProfile({
        id: 'teacher_saritha',
        full_name: 'Saritha Devi (Science Teacher)',
        role: 'teacher',
        grade: 'Class 6',
        board: 'AP State Board',
        streak: 12,
        xp: 1200,
        level: 5,
      });
      setActiveTab('Teacher');
      showToast('Switched to Teacher Persona');
    } else if (role === 'admin') {
      setProfile({
        id: 'admin_vidya',
        full_name: 'Admin Vidyavriksha',
        role: 'admin',
        grade: 'All Classes',
        board: 'All Boards',
        streak: 30,
        xp: 3500,
        level: 10,
      });
      setActiveTab('Evaluation');
      showToast('Switched to Administrator Persona');
    } else {
      setProfile({
        id: 'student_mohith',
        full_name: 'Mohith Vardhan (Student)',
        role: 'student',
        grade: 'Class 6',
        board: 'AP State Board',
        streak: 5,
        xp: 480,
        level: 3,
      });
      setActiveTab('Dashboard');
      showToast('Switched to Student Persona');
    }
  };

  const handleAskTutorWithQuery = (q) => {
    setTutorQuery(q);
    setActiveTab('AI Tutor');
  };

  const handleTranslateGlobal = async (text, sl = 'auto', tl = 'Telugu') => {
    return await translateText(text, sl, tl);
  };

  const navItems = [
    { id: 'Dashboard', name: language === 'Telugu' ? 'డాష్‌బోర్డ్' : 'Dashboard', icon: BookOpen },
    { id: 'Learn', name: language === 'Telugu' ? 'పాఠ్యాంశాలు' : 'Learn (LMS)', icon: BookMarked },
    { id: 'AI Tutor', name: language === 'Telugu' ? 'AI ట్యూటర్' : 'AI Tutor', icon: Sparkles, badge: 'RAG' },
    { id: 'Quizzes', name: language === 'Telugu' ? 'క్విజ్‌లు' : 'Quizzes & Practice', icon: Brain },
    { id: 'Timetable', name: language === 'Telugu' ? 'టైమ్‌టేబుల్' : 'Study Planner', icon: Calendar, badge: 'PLAN' },
    { id: 'Timer', name: language === 'Telugu' ? 'అధ్యయన టైమర్' : 'Focus Timer', icon: Clock },
    { id: 'Progress', name: language === 'Telugu' ? 'పురోగతి విశ్లేషణ' : 'My Progress', icon: TrendingUp },
    { id: 'Rewards', name: language === 'Telugu' ? 'రివార్డులు' : 'Rewards & Badges', icon: Award },
    { id: 'Revision', name: language === 'Telugu' ? 'పునశ్చరణ' : 'Flashcards & Notes', icon: Layers },
    { id: 'Resources', name: language === 'Telugu' ? 'వీడియో వనరులు' : 'Videos & References', icon: Search },
    { id: 'Photo Ask', name: language === 'Telugu' ? 'ఫోటో లెర్నింగ్' : 'Photo Question', icon: Camera },
    { id: 'Teacher', name: language === 'Telugu' ? 'ఉపాధ్యాయ డ్యాష్‌బోర్డ్' : 'Teacher Insights', icon: GraduationCap },
    { id: 'Evaluation', name: language === 'Telugu' ? 'మూల్యాంకనం' : 'Benchmark Eval', icon: ShieldCheck },
    { id: 'Settings', name: language === 'Telugu' ? 'అభిరుచులు' : 'Settings', icon: Settings },
  ];

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Leaf size={24} />
          </div>
          <div>
            <div className="brand-name">
              manovriddhi<span> AI</span>
            </div>
            <div className="brand-tag">GROWTH OF THE MIND · YUKTHI</div>
          </div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="user-role-card">
          <div className="user-avatar">{profile.full_name?.charAt(0) || 'S'}</div>
          <div>
            <strong>{profile.full_name}</strong>
            <small>{profile.role === 'teacher' ? 'Educator Space' : `${profile.grade} · Science`}</small>
          </div>
          <span className="role-badge">{profile.role}</span>
        </div>

        {/* Navigation Items */}
        <div className="nav-section-title">NAVIGATION</div>
        <nav className="nav-menu">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileNav(false);
                }}
              >
                <Icon size={17} />
                <span>{item.name}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom (Streak & Responsible Note) */}
        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-card-top">
              <Flame size={16} />
              <span>{profile.streak} DAY STREAK</span>
            </div>
            <p>Every textbook question builds your cognitive confidence.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9cbba5', fontSize: '9.5px', padding: '0 4px' }}>
            <ShieldCheck size={14} color="#f5b83d" />
            <span>Strict Textbook Grounded RAG</span>
          </div>
        </div>
      </aside>

      {/* Main App Area */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="menu-toggle-btn" onClick={() => setMobileNav(true)}>
              <Menu size={22} />
            </button>
            <div className="breadcrumb">
              <span>Manovriddhi</span>
              <span>/</span>
              <b>{activeTab}</b>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Quick Study Timer Pill */}
            <button 
              className={`topbar-timer ${quickTimerActive ? 'running' : ''}`}
              onClick={() => {
                setQuickTimerActive(!quickTimerActive);
                showToast(quickTimerActive ? 'Focus timer paused.' : 'Focus timer started!');
              }}
              title="Click to toggle quick focus timer"
            >
              <Clock size={14} />
              <span>{quickTimerActive ? `Focusing: ${formatTimer(quickTimerSec)}` : 'Study Timer'}</span>
            </button>

            {/* Persona Switcher Dropdown (Judges Quick Access) */}
            <select
              value={profile.role}
              onChange={e => handleRoleSwitch(e.target.value)}
              className="role-switcher-select"
              title="Switch user persona for testing"
            >
              <option value="student">Persona: Student (Mohith)</option>
              <option value="teacher">Persona: Teacher (Saritha)</option>
              <option value="guest">Persona: Guest Explorer</option>
              <option value="admin">Persona: Admin (Vidyavriksha)</option>
            </select>

            {/* Working Language Toggle */}
            <div className="topbar-btn" style={{ padding: '4px 8px' }}>
              <Languages size={15} color="var(--brand-green-text)" />
              <select
                value={language}
                onChange={e => {
                  setLanguage(e.target.value);
                  showToast(`Switched interface to ${e.target.value}`);
                }}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '11.5px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button className="topbar-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? <Sun size={16} color="var(--brand-gold)" /> : <Moon size={16} color="var(--brand-green)" />}
            </button>

            {/* Auth / Avatar Button */}
            {profile.role === 'guest' ? (
              <button className="btn-gold" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => setAuthOpen(true)}>
                <LogIn size={13} /> Sign In
              </button>
            ) : (
              <div 
                className="user-avatar" 
                style={{ cursor: 'pointer', width: '32px', height: '32px' }} 
                onClick={() => setActiveTab('Settings')}
                title="Open Settings"
              >
                {profile.full_name?.charAt(0) || 'S'}
              </div>
            )}
          </div>
        </header>

        {/* View Router */}
        <main className="page-content">
          {activeTab === 'Dashboard' && (
            <DashboardView 
              profile={profile} 
              language={language} 
              onNavigate={setActiveTab} 
              onTranslate={handleTranslateGlobal}
            />
          )}

          {activeTab === 'Learn' && (
            <LearnView 
              catalog={catalog} 
              language={language} 
              onNavigate={setActiveTab} 
              onAskTutor={handleAskTutorWithQuery}
              onTranslate={handleTranslateGlobal}
            />
          )}

          {activeTab === 'AI Tutor' && (
            <AITutorView 
              language={language} 
              initialQuestion={tutorQuery}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'Quizzes' && (
            <QuizView 
              profile={profile} 
              language={language} 
              onShowToast={showToast} 
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Timetable' && (
            <TimetableGeneratorView 
              profile={profile} 
              language={language} 
              onShowToast={showToast}
            />
          )}

          {activeTab === 'Timer' && (
            <StudyTimerView 
              profile={profile} 
              language={language} 
              onShowToast={showToast}
            />
          )}

          {activeTab === 'Progress' && (
            <ProgressView 
              profile={profile} 
              language={language} 
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Rewards' && (
            <RewardsView 
              profile={profile} 
              language={language} 
              onShowToast={showToast}
            />
          )}

          {activeTab === 'Revision' && (
            <RevisionView 
              profile={profile} 
              language={language} 
              onShowToast={showToast}
            />
          )}

          {activeTab === 'Resources' && (
            <ResourcesView 
              language={language} 
              onShowToast={showToast}
            />
          )}

          {activeTab === 'Photo Ask' && (
            <PhotoLearningView 
              language={language} 
              onShowToast={showToast} 
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Teacher' && (
            <TeacherDashboardView 
              profile={profile} 
              language={language} 
              onShowToast={showToast}
            />
          )}

          {activeTab === 'Evaluation' && (
            <EvaluationView 
              language={language} 
              onShowToast={showToast}
            />
          )}

          {activeTab === 'Settings' && (
            <SettingsView 
              profile={profile} 
              theme={theme} 
              onToggleTheme={toggleTheme} 
              language={language} 
              onChangeLanguage={setLanguage}
              onSwitchRole={handleRoleSwitch}
              onLogout={() => {
                handleRoleSwitch('guest');
                showToast('Logged out successfully.');
              }}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onLoginSuccess={(user) => {
          setProfile(user);
          showToast(`Welcome, ${user.full_name}!`);
        }}
        language={language}
      />

      {/* Global Toast */}
      {toast && (
        <div className="toast-msg">
          <CheckCircle2 size={16} color="#f5b83d" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
