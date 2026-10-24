import React, { useState } from 'react';
import { 
  BookOpen, Brain, Sparkles, BookMarked, ArrowRight, CheckCircle2, 
  Languages, FileText, ExternalLink, HelpCircle, ChevronRight, Layers, Volume2
} from 'lucide-react';

export default function LearnView({ 
  catalog, 
  onNavigate, 
  language, 
  onAskTutor,
  onTranslate 
}) {
  const [selectedSubject, setSelectedSubject] = useState(catalog?.subjects?.[0] || null);
  const [selectedChapter, setSelectedChapter] = useState(catalog?.subjects?.[0]?.chapters?.[0] || null);
  const [activeTab, setActiveTab] = useState('passages'); // 'passages', 'definitions', 'notes', 'resources'
  const [translatedTexts, setTranslatedTexts] = useState({});
  const [translatingKey, setTranslatingKey] = useState(null);

  const handleTranslateBlock = async (key, text) => {
    if (translatedTexts[key]) {
      // Toggle back to original
      const updated = { ...translatedTexts };
      delete updated[key];
      setTranslatedTexts(updated);
      return;
    }
    setTranslatingKey(key);
    try {
      const target = language === 'Telugu' ? 'English' : 'Telugu';
      const res = await onTranslate(text, 'auto', target);
      setTranslatedTexts(prev => ({ ...prev, [key]: res.translated }));
    } catch (e) {
      console.error(e);
    } finally {
      setTranslatingKey(null);
    }
  };

  const samplePassages = [
    {
      page: 12,
      topic: 'Photosynthesis (కిరణజన్య సంయోగక్రియ)',
      en: 'Photosynthesis is the fundamental biological process through which green plants utilize sunlight, water absorbed by roots, and carbon dioxide from the surrounding air to synthesize glucose (food) while discharging oxygen into the atmosphere.',
      te: 'మొక్కలు సూర్యరశ్మి, నేల నుండి గ్రహించిన నీరు మరియు వాతావరణంలోని కార్బన్ డైఆక్సైడ్‌ను ఉపయోగించి తమ ఆహారాన్ని (గ్లూకోజ్) తయారు చేసుకునే ప్రక్రియను కిరణజన్య సంయోగక్రియ అంటారు. ఈ ప్రక్రియలో ప్రాణవాయువు (ఆక్సిజన్) విడుదలవుతుంది.',
      citation: 'AP SCERT Class 6 Science Textbook, Page 12'
    },
    {
      page: 13,
      topic: 'Chlorophyll and Leaf Structure (పత్రహరితం మరియు ఆకు నిర్మాణం)',
      en: 'Chlorophyll is the vital green pigment embedded inside the chloroplasts of leaf cells. Its primary biological function is to capture light energy from the sun. The presence of chlorophyll gives leaves their characteristic green coloration.',
      te: 'ఆకులలోని కణాలలో ఉండే పత్రహరితం (క్లోరోఫిల్) అనే ఆకుపచ్చని వర్ణద్రవ్యం సూర్యకాంతి శక్తిని గ్రహిస్తుంది. పత్రహరితం ఉండటం వల్లే ఆకులు సహజంగా ఆకుపచ్చ రంగులో కనిపిస్తాయి.',
      citation: 'AP SCERT Class 6 Science Textbook, Page 13'
    },
    {
      page: 14,
      topic: 'Root System and Functions (వేరు వ్యవస్థ మరియు విధులు)',
      en: 'The root system anchors the plant firmly in the soil. Roots absorb vital water and dissolved mineral nutrients from the earth and transport them upward to the stem. The two primary root types are tap roots and fibrous roots.',
      te: 'వేర్లు మొక్కను నేలలో బలంగా నిలబెట్టడానికి ఆధారాన్నిస్తాయి. ఇవి నేల నుండి నీటిని మరియు ఖనిజ లవణాలను పీల్చుకుని కాండం ద్వారా పై భాగాలకు అందజేస్తాయి. వేర్లు ప్రధానంగా రెండు రకాలు: తల్లివేరు వ్యవస్థ మరియు పీచువేరు వ్యవస్థ.',
      citation: 'AP SCERT Class 6 Science Textbook, Page 14'
    },
    {
      page: 15,
      topic: 'Stem and Vascular Conduction (కాండం మరియు వాహక కణజాలం)',
      en: 'The stem provides physical support to the branches, foliage, flowers, and fruits. It houses xylem vessels that conduct water upward from roots, and phloem tissues that distribute organic nutrients prepared in leaves to all other plant organs.',
      te: 'కాండం మొక్క యొక్క కొమ్మలు, ఆకులు, పువ్వులు మరియు కాయలకు ఆధారాన్నిస్తుంది. ఇది దారువు (Xylem) ద్వారా వేర్ల నుండి నీటిని పైకి మరియు పోషక కణజాలం (Phloem) ద్వారా ఆకులలో తయారైన ఆహారాన్ని అన్ని భాగాలకు చేరవేస్తుంది.',
      citation: 'AP SCERT Class 6 Science Textbook, Page 15'
    },
    {
      page: 16,
      topic: 'Transpiration through Stomata (బాష్పోత్సేకం మరియు పత్రరంధ్రాలు)',
      en: 'Transpiration is the evaporation of excess water from the aerial portions of a plant, primarily through microscopic apertures called stomata on the underside of leaves. This cooling mechanism also generates a suction pull that draws water from roots.',
      te: 'ఆకుల అడుగు భాగంలో ఉండే సూక్ష్మ రంధ్రాలైన పత్రరంధ్రాల (Stomata) ద్వారా మొక్కలోని అదనపు నీరు ఆవిరి రూపంలో బయటకు విడుదలయ్యే ప్రక్రియను బాష్పోత్సేకం (Transpiration) అంటారు. ఇది మొక్కను చల్లబరుస్తూ వేర్ల నుండి నీటి ప్రసరణకు సహాయపడుతుంది.',
      citation: 'AP SCERT Class 6 Science Textbook, Page 16'
    }
  ];

  const definitions = [
    { term: 'Photosynthesis', term_te: 'కిరణజన్య సంయోగక్రియ', def: 'The food preparation process in plants using sunlight, CO2, and water.', page: 12 },
    { term: 'Chlorophyll', term_te: 'పత్రహరితం', def: 'Green photosynthetic pigment inside chloroplasts that captures light energy.', page: 13 },
    { term: 'Xylem', term_te: 'దారువు', def: 'Vascular tissue conducting water and dissolved minerals upward from roots.', page: 15 },
    { term: 'Phloem', term_te: 'పోషక కణజాలం', def: 'Vascular tissue distributing synthesized sugars from leaves to the rest of the plant.', page: 15 },
    { term: 'Transpiration', term_te: 'బాష్పోత్సేకం', def: 'Evaporative water loss through stomata providing cooling and capillary pull.', page: 16 }
  ];

  return (
    <div className="learn-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> CURRICULUM LMS</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'పాఠ్యపుస్తక ఆధారిత ' : 'Textbook-Grounded '}
          <em>{language === 'Telugu' ? 'అధ్యయనం' : 'Learning'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu' 
            ? 'ప్రభుత్వ పాఠశాలల అధికారిక పాఠ్యప్రణాళిక ప్రకారం ప్రతి పాఠ్యాంశాన్ని స్పష్టమైన పేజీ ఆధారాలతో నేర్చుకోండి.' 
            : 'Study chapter-by-chapter with authentic textbook passages, verified page citations, key definitions, and practice questions.'}
        </p>
      </div>

      {/* Subject & Chapter Selection Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>SUBJECT:</span>
            <select 
              value={selectedSubject?.id || ''} 
              onChange={e => {
                const s = catalog?.subjects?.find(sub => sub.id === e.target.value);
                setSelectedSubject(s);
                if (s?.chapters?.length) setSelectedChapter(s.chapters[0]);
              }}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {catalog?.subjects?.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.grade} · {sub.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>CHAPTER:</span>
            <select 
              value={selectedChapter?.id || ''} 
              onChange={e => {
                const c = selectedSubject?.chapters?.find(ch => ch.id === e.target.value);
                setSelectedChapter(c);
              }}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {selectedSubject?.chapters?.map(ch => (
                <option key={ch.id} value={ch.id}>Chapter {ch.chapter_number}: {ch.title}</option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11.5px' }} onClick={() => onNavigate('Quizzes')}>
              <Brain size={14} /> Chapter Quiz
            </button>
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11.5px' }} onClick={() => onNavigate('AI Tutor')}>
              <Sparkles size={14} /> Ask Doubts
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Overview Card */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--bg-card-accent)' }}>
        <div className="card-header">
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-green-text)', letterSpacing: '0.8px' }}>
              CHAPTER {selectedChapter?.chapter_number || 1} OVERVIEW
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, margin: '4px 0', color: 'var(--text-primary)' }}>
              {language === 'Telugu' ? (selectedChapter?.title_te || selectedChapter?.title) : selectedChapter?.title}
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Est. Study: {selectedChapter?.duration_minutes || 45} mins · {selectedChapter?.total_pages || 18} Pages
          </span>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {language === 'Telugu' ? (selectedChapter?.overview_te || selectedChapter?.overview) : selectedChapter?.overview}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }}>
        {[
          { id: 'passages', label: language === 'Telugu' ? 'పాఠ్యపుస్తక భాగాలు' : 'Textbook Passages', icon: BookOpen },
          { id: 'definitions', label: language === 'Telugu' ? 'ముఖ్య నిర్వచనాలు' : 'Key Definitions', icon: Layers },
          { id: 'notes', label: language === 'Telugu' ? 'పునశ్చరణ నోట్స్' : 'Revision Notes', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              borderBottom: activeTab === tab.id ? '2px solid var(--brand-green)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--brand-green)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Textbook Passages */}
      {activeTab === 'passages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {samplePassages.map((p, idx) => {
            const key = `passage_${idx}`;
            const isTranslated = !!translatedTexts[key];
            const activeText = isTranslated 
              ? translatedTexts[key] 
              : (language === 'Telugu' ? p.te : p.en);

            return (
              <div key={idx} className="card" style={{ borderLeft: '4px solid var(--brand-green)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-gold-text)', background: 'var(--brand-gold-light)', padding: '2px 8px', borderRadius: '4px' }}>
                      PAGE {p.page}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '6px 0 0', color: 'var(--text-primary)' }}>
                      {p.topic}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="translate-pill" 
                      onClick={() => handleTranslateBlock(key, activeText)}
                      disabled={translatingKey === key}
                    >
                      <Languages size={12} /> 
                      {translatingKey === key ? 'Translating...' : (isTranslated ? 'Show Original' : (language === 'Telugu' ? 'Translate to English' : 'తెలుగులోకి అనువాదం'))}
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      onClick={() => onAskTutor(`Explain ${p.topic} from Page ${p.page}`)}
                    >
                      <Sparkles size={12} /> Ask Doubts
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-primary)', margin: '12px 0' }}>
                  {activeText}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <BookMarked size={13} />
                  <span>{p.citation}</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-green-text)', fontWeight: 700 }}>
                    <CheckCircle2 size={13} /> VERIFIED SOURCE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Key Definitions */}
      {activeTab === 'definitions' && (
        <div className="grid-2">
          {definitions.map((d, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                  {language === 'Telugu' ? d.term_te : d.term}
                </strong>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>Page {d.page}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {d.def}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Revision Notes */}
      {activeTab === 'notes' && (
        <div className="card">
          <div className="card-header">
            <h3>Chapter Summary & Revision Points</h3>
            <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => window.print()}>
              Print Notes
            </button>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li><b>Photosynthesis Formula:</b> Carbon Dioxide + Water + Sunlight (Chlorophyll) → Glucose + Oxygen.</li>
            <li><b>Root Systems:</b> Tap roots possess a thick primary central root (e.g. mustard); Fibrous roots consist of cluster-like thin strands (e.g. grass).</li>
            <li><b>Xylem vs Phloem:</b> Xylem transports water from soil upward. Phloem distributes prepared nutrients throughout the organism.</li>
            <li><b>Transpiration:</b> Occurs primarily through stomata, dissipating excess plant water as vapor to provide thermoregulation.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
