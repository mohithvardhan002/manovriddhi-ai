import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Brain, Clock, Flame, Sparkles, ArrowRight, CheckCircle2, 
  Calendar, Award, AlertCircle, ChevronRight, BookMarked, TrendingUp,
  Volume2, Languages
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

export default function DashboardView({ 
  onNavigate, 
  profile, 
  progressData, 
  language,
  onTranslate 
}) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting(language === 'Telugu' ? 'శుభోదయం' : 'Good Morning');
    else if (hr < 17) setGreeting(language === 'Telugu' ? 'శుభ మధ్యాహ్నం' : 'Good Afternoon');
    else setGreeting(language === 'Telugu' ? 'శుభ సాయంత్రం' : 'Good Evening');
  }, [language]);

  const weeklyData = [
    { day: 'Mon', minutes: 35, score: 75 },
    { day: 'Tue', minutes: 45, score: 80 },
    { day: 'Wed', minutes: 50, score: 65 },
    { day: 'Thu', minutes: 40, score: 85 },
    { day: 'Fri', minutes: 60, score: 90 },
    { day: 'Sat', minutes: 55, score: 80 },
    { day: 'Sun', minutes: 30, score: 88 },
  ];

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <section className="card welcome-banner" style={{ background: 'linear-gradient(135deg, #123824 0%, #1a5139 100%)', color: '#fff', border: 'none', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
          <div className="eyebrow" style={{ color: '#f5b83d' }}>
            <span className="eyebrow-dot"></span> 
            {language === 'Telugu' ? 'మీ అభ్యాస ప్రయాణం' : 'LEARN BETTER · GROW EVERY DAY'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px, 2.6vw, 34px)', fontWeight: 800, margin: '8px 0 10px', letterSpacing: '-0.8px', color: '#fff' }}>
            {greeting}, <span style={{ color: '#f5b83d' }}>{profile?.full_name?.split(' ')[0] || 'Learner'}</span>!
          </h1>
          <p style={{ fontSize: '13px', color: '#c5ded0', lineHeight: 1.6, marginBottom: '20px' }}>
            {language === 'Telugu'
              ? 'ప్రతి ప్రశ్న మిమ్మల్ని మరింత స్వతంత్ర అభ్యాసకుడిగా మారుస్తుంది. మీ పాఠ్యపుస్తక ఆధారిత అంశాలను అర్థం చేసుకుంటూ ముందుకు సాగండి.'
              : 'Every question builds genuine understanding. Explore textbook-grounded lessons, clear your doubts in Telugu or English, and test your mastery.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-gold" onClick={() => onNavigate('AI Tutor')}>
              <Sparkles size={16} /> {language === 'Telugu' ? 'AI ట్యూటర్‌ను అడగండి' : 'Ask AI Tutor'}
            </button>
            <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }} onClick={() => onNavigate('Timetable')}>
              <Calendar size={16} /> {language === 'Telugu' ? 'నా టైమ్‌టేబుల్ రూపొందించు' : 'Create My Timetable'}
            </button>
          </div>
        </div>

        {/* Decorative Badge */}
        <div style={{ position: 'absolute', right: '3%', bottom: '-10px', opacity: 0.15, pointerEvents: 'none' }}>
          <BookOpen size={220} color="#f5b83d" />
        </div>
      </section>

      {/* Summary KPI Stats */}
      <section className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">{language === 'Telugu' ? 'నేటి అధ్యయన సమయం' : 'Today Study Time'}</span>
            <Clock size={16} color="var(--brand-green-text)" />
          </div>
          <div className="stat-value">55 <small>min</small></div>
          <div className="stat-caption">{language === 'Telugu' ? 'లక్ష్యం: 120 నిమిషాలు (46% పూర్తి)' : 'Goal: 120 min (46% achieved)'}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">{language === 'Telugu' ? 'అధ్యయన స్ట్రీక్' : 'Study Streak'}</span>
            <Flame size={16} color="var(--brand-coral)" />
          </div>
          <div className="stat-value">{profile?.streak || 5} <small>{language === 'Telugu' ? 'రోజులు' : 'days'}</small></div>
          <div className="stat-caption">{language === 'Telugu' ? 'క్రమశిక్షణ కొనసాగుతోంది!' : 'Consecutive study consistency'}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">{language === 'Telugu' ? 'క్విజ్ ఖచ్చితత్వం' : 'Quiz Accuracy'}</span>
            <TrendingUp size={16} color="var(--brand-gold-text)" />
          </div>
          <div className="stat-value">84 <small>%</small></div>
          <div className="stat-caption">{language === 'Telugu' ? 'గత వారం కంటే +12% మెరుగుదల' : '+12% improvement vs last test'}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">{language === 'Telugu' ? 'మొత్తం XP పాయింట్లు' : 'Total XP Earned'}</span>
            <Award size={16} color="var(--brand-gold)" />
          </div>
          <div className="stat-value">{profile?.xp || 480} <small>XP</small></div>
          <div className="stat-caption">Level {profile?.level || 3} {language === 'Telugu' ? 'స్కాలర్' : 'Scholar'}</div>
        </div>
      </section>

      {/* Main Grid: Continue Learning & Daily Missions */}
      <section className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Continue Learning Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot"></span> {language === 'Telugu' ? 'కొనసాగించండి' : 'CONTINUE LEARNING'}</div>
              <h3>{language === 'Telugu' ? 'ప్రస్తుత అధ్యాయం' : 'Active Chapter'}</h3>
            </div>
            <button className="translate-pill" onClick={() => onTranslate("Plants: Parts and Functions")}>
              <Languages size={12} /> {language === 'Telugu' ? 'ఆంగ్లంలో' : 'తెలుగు'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--brand-green-light)', color: 'var(--brand-green-text)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <BookMarked size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>
                {language === 'Telugu' ? 'మొక్కలు: భాగాలు మరియు విధులు' : 'Plants: Parts and Functions'}
              </strong>
              <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Class 6 · AP State Board · Science (Chapter 1)</small>
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-green-text)', background: 'var(--brand-green-light)', padding: '4px 8px', borderRadius: '6px' }}>
              65% Done
            </span>
          </div>

          {/* Quick Smart Recommendation */}
          <div style={{ background: 'var(--brand-gold-light)', border: '1px solid rgba(245, 184, 61, 0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-gold-text)', fontWeight: 700, fontSize: '11.5px', marginBottom: '4px' }}>
              <Sparkles size={14} /> {language === 'Telugu' ? 'స్మార్ట్ సిఫార్సు (Smart Recommendation)' : 'Smart AI Recommendation'}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {language === 'Telugu'
                ? 'గత క్విజ్‌లో "కిరణజన్య సంయోగక్రియ మరియు పత్రహరితం" పై ప్రశ్న తప్పుగా వచ్చింది. పేజీ 13 వివరణను ఒకసారి పునశ్చరణ చేయండి.'
                : 'You scored low on "Chlorophyll & Photosynthesis" in your last quiz attempt. Revise textbook Page 13 before re-taking the quiz.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => onNavigate('Learn')}>
              {language === 'Telugu' ? 'పాఠం చదవండి' : 'Resume Lesson'} <ArrowRight size={14} />
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('Quizzes')}>
              <Brain size={14} /> {language === 'Telugu' ? 'క్విజ్ ప్రారంభించండి' : 'Quick Quiz'}
            </button>
          </div>
        </div>

        {/* Daily Missions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot"></span> {language === 'Telugu' ? 'నేటి లక్ష్యాలు' : 'DAILY MISSIONS'}</div>
              <h3>{language === 'Telugu' ? 'రోజువారీ సాధన' : "Today's Milestones"}</h3>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-green-text)' }}>3/4 Completed</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <CheckCircle2 size={18} color="var(--brand-green-text)" />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '12px', display: 'block' }}>Study 1 Chapter for 20 minutes</strong>
                <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+40 XP earned</small>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--brand-green-text)' }}>DONE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <CheckCircle2 size={18} color="var(--brand-green-text)" />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '12px', display: 'block' }}>Ask AI Tutor 1 Question in Telugu</strong>
                <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+25 XP earned</small>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--brand-green-text)' }}>DONE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <CheckCircle2 size={18} color="var(--brand-green-text)" />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '12px', display: 'block' }}>Complete 5-question Chapter Quiz</strong>
                <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+50 XP earned</small>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--brand-green-text)' }}>DONE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--brand-gold-light)', borderRadius: '8px', border: '1px solid rgba(245, 184, 61, 0.4)' }}>
              <Brain size={18} color="var(--brand-gold-text)" />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '12px', display: 'block', color: 'var(--brand-gold-text)' }}>Review 4 Flashcards</strong>
                <small style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>2/4 completed · +30 XP</small>
              </div>
              <button className="btn-gold" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => onNavigate('Revision')}>
                Finish
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Learning Chart & Timetable Prompt */}
      <section className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot"></span> {language === 'Telugu' ? 'వారం విశ్లేషణ' : 'WEEKLY OVERVIEW'}</div>
              <h3>{language === 'Telugu' ? 'గత 7 రోజుల అధ్యయన నిమిషాలు' : 'Study Consistency (Minutes / Day)'}</h3>
            </div>
          </div>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#184c34" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#184c34" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="minutes" stroke="#184c34" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timetable CTA Banner */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-card-accent)' }}>
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> {language === 'Telugu' ? 'సమయపాలన ప్రణాళిక' : 'SMART STUDY PLANNER'}</div>
            <h3 style={{ marginBottom: '10px' }}>
              {language === 'Telugu' ? 'పరీక్షల కోసం మీ వ్యక్తిగత టైమ్‌టేబుల్' : 'Personalized Exam Timetable'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              {language === 'Telugu'
                ? 'మీ రోజువారీ లభ్యతను బట్టి, బలహీనమైన పాఠ్యాంశాలకు ఎక్కువ సమయం కేటాయించేలా శాస్త్రీయ టైమ్‌టేబుల్‌ను స్వయంచాలకంగా రూపొందించుకోండి.'
                : 'Generate a realistic study schedule tailored to your available hours, prioritized for upcoming exams, with automatic break schedules and extra focus on weak concepts.'}
            </p>
          </div>
          <div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => onNavigate('Timetable')}>
              <Calendar size={16} /> {language === 'Telugu' ? 'నా టైమ్‌టేబుల్ రూపొందించు' : 'Open Timetable Generator'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
