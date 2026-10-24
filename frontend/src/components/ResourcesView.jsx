import React, { useState, useEffect } from 'react';
import { 
  Youtube, ExternalLink, BookOpen, Search, CheckCircle2, 
  HelpCircle, Languages, BookMarked
} from 'lucide-react';
import { fetchResources } from '../services/api';

export default function ResourcesView({ 
  language, 
  onShowToast 
}) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await fetchResources('chap_6_sci_1');
      setResources(data.resources || []);
    } catch (e) {
      console.warn('Failed to load resources', e);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider) => {
    if (provider.includes('YouTube')) return <Youtube size={20} color="#ff0000" />;
    if (provider.includes('SCERT')) return <BookMarked size={20} color="var(--brand-green)" />;
    return <Search size={20} color="var(--brand-gold-text)" />;
  };

  return (
    <div className="resources-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> CURATED LEARNING REPOSITORY</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'వీడియోలు & ' : 'Videos & Official '}
          <em>{language === 'Telugu' ? 'అధికారిక మూలాలు' : 'Curriculum References'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu'
            ? 'ప్రతి పాఠ్యాంశానికి సంబంధించిన ధృవీకరించబడిన యూట్యూబ్ పాఠాలు మరియు ప్రభుత్వ అధికారిక ఈ-పాఠ్యపుస్తకాలు.'
            : 'Access curated educational YouTube lessons, official AP/TS SCERT e-textbooks, and focused research queries.'}
        </p>
      </div>

      <div className="grid-2">
        {resources.map((res) => (
          <div key={res.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)', display: 'grid', placeItems: 'center' }}>
                    {getProviderIcon(res.provider)}
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>{res.provider}</span>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>{res.resource_type.toUpperCase()}</strong>
                  </div>
                </div>
                <span style={{ fontSize: '9.5px', fontWeight: 800, background: 'var(--brand-green-light)', color: 'var(--brand-green-text)', padding: '3px 8px', borderRadius: '4px' }}>
                  {res.language}
                </span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '8px 0', color: 'var(--text-primary)' }}>
                {res.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {res.description}
              </p>
            </div>

            <a 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary" 
              style={{ width: '100%', textDecoration: 'none' }}
            >
              Open Resource <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
