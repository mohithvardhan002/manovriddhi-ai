import React, { useState, useEffect } from 'react';
import { 
  Award, Flame, Trophy, Crown, Sparkles, CheckCircle2, 
  Lock, BookOpen, Brain, RotateCcw, Languages, TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchRewards } from '../services/api';

export default function RewardsView({ 
  profile, 
  language, 
  onShowToast 
}) {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    try {
      const data = await fetchRewards(profile?.id || 'student_mohith');
      setRewards(data);
    } catch (e) {
      console.warn('Failed to load rewards', e);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onShowToast?.('🎉 Keep growing your mind every day!');
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen size={20} />;
      case 'Brain': return <Brain size={20} />;
      case 'Flame': return <Flame size={20} />;
      case 'Trophy': return <Trophy size={20} />;
      case 'Crown': return <Crown size={20} />;
      case 'RotateCcw': return <RotateCcw size={20} />;
      case 'Languages': return <Languages size={20} />;
      case 'TrendingUp': return <TrendingUp size={20} />;
      default: return <Award size={20} />;
    }
  };

  const streakDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="rewards-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> ETHICAL GAMIFICATION</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'మీ సాధించిన ' : 'Rewards & '}
          <em>{language === 'Telugu' ? 'విజయాలు & బ్యాడ్జీలు' : 'Learning Badges'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu'
            ? 'ప్రతి అసలైన అభ్యాస ప్రయత్నానికి, క్రమశిక్షణకు మాత్రమే ఇచ్చే ప్రోత్సాహక పాయింట్లు మరియు పతకాలు.'
            : 'Rewards genuine comprehension, consistency, and revision rather than endless screen time.'}
        </p>
      </div>

      {/* Top Banner: XP, Level, Streak */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #184c34 0%, #2d6a4f 100%)', color: '#fff', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ color: '#d8eedf' }}>STUDENT LEVEL</span>
            <Crown size={22} color="#f5b83d" />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, margin: '8px 0', color: '#fff' }}>
            Level {rewards?.level || 3} <small style={{ fontSize: '14px', color: '#f5b83d' }}>Scholar</small>
          </div>
          <div style={{ fontSize: '11.5px', color: '#c3ded0' }}>
            {(rewards?.xp || 480) % 200} / 200 XP to Level {(rewards?.level || 3) + 1}
          </div>
          <div style={{ height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '99px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ width: `${(((rewards?.xp || 480) % 200) / 200) * 100}%`, height: '100%', background: '#f5b83d' }} />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">TOTAL XP BALANCE</span>
            <Award size={22} color="var(--brand-gold)" />
          </div>
          <div className="stat-value">{rewards?.xp || 480} <small>XP</small></div>
          <div className="stat-caption">Earned from textbook quizzes, sessions & revisions</div>
          <button 
            className="btn-gold" 
            style={{ marginTop: '12px', width: '100%', padding: '6px' }}
            onClick={triggerConfetti}
          >
            <Sparkles size={14} /> Celebrate Progress
          </button>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">CONSECUTIVE STREAK</span>
            <Flame size={22} color="var(--brand-coral)" />
          </div>
          <div className="stat-value">{rewards?.streak || 5} <small>Days</small></div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
            {streakDays.map((d, i) => (
              <div 
                key={d}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '4px 0',
                  borderRadius: '6px',
                  background: i < (rewards?.streak || 5) ? 'var(--brand-coral)' : 'var(--bg-card-subtle)',
                  color: i < (rewards?.streak || 5) ? '#fff' : 'var(--text-muted)',
                  fontSize: '9.5px',
                  fontWeight: 800
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot"></span> ACHIEVEMENTS BADGES</div>
            <h3>Mastery Collection</h3>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-green-text)' }}>
            {rewards?.achievements?.filter(a => a.is_earned).length || 3} of {rewards?.achievements?.length || 10} Unlocked
          </span>
        </div>

        <div className="grid-2">
          {(rewards?.achievements || []).map((ach) => (
            <div 
              key={ach.code} 
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                padding: '14px',
                borderRadius: '12px',
                background: ach.is_earned ? 'var(--bg-card)' : 'var(--bg-card-subtle)',
                border: `1px solid ${ach.is_earned ? 'rgba(24, 76, 52, 0.25)' : 'var(--border-subtle)'}`,
                opacity: ach.is_earned ? 1 : 0.65
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: ach.is_earned ? 'var(--brand-green-light)' : 'var(--border-subtle)',
                color: ach.is_earned ? 'var(--brand-green-text)' : 'var(--text-muted)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}>
                {ach.is_earned ? getIcon(ach.icon) : <Lock size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {language === 'Telugu' ? ach.title_te : ach.title}
                  </strong>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-gold-text)' }}>
                    +{ach.xp_reward} XP
                  </span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: 1.4 }}>
                  {ach.description}
                </p>
                {ach.is_earned && (
                  <small style={{ fontSize: '9.5px', color: 'var(--brand-green-text)', fontWeight: 700 }}>
                    ✓ Unlocked on {ach.earned_at?.split(' ')[0] || 'Recently'}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsible Gamification Guarantee Card */}
      <div className="card" style={{ background: 'var(--bg-card-accent)' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
          Our Fair Learning Principles
        </h4>
        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Manovriddhi AI will never charge money for educational rewards, introduce addictive loot mechanics, or shame students on public leaderboards. We encourage deep comprehension, healthy rest intervals, and joyful growth.
        </p>
      </div>
    </div>
  );
}
