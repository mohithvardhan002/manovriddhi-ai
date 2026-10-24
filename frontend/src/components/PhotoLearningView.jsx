import React, { useState } from 'react';
import { 
  Camera, Upload, Sparkles, BookMarked, CheckCircle2, 
  X, RefreshCw, Eye, ArrowRight, AlertCircle, FileText
} from 'lucide-react';
import { askFromPhoto } from '../services/api';

export default function PhotoLearningView({ 
  language, 
  onShowToast, 
  onNavigate 
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Sample quick test photos for hackathon demonstration
  const samplePhotos = [
    {
      title: 'Class 6 Plant Biology Question',
      preview: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=300&q=80',
      mockB64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...'
    },
    {
      title: 'Leaf Stomata Diagram',
      preview: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=300&q=80',
      mockB64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast?.('Please upload a valid image file (JPG or PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setImagePreview(reader.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessPhoto = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const res = await askFromPhoto(
        selectedImage,
        'Class 6',
        'Science',
        'Plants: Parts and Functions',
        language
      );
      setResult(res);
      onShowToast?.('✓ Photo processed and verified against textbook!');
    } catch (err) {
      console.error(err);
      onShowToast?.('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedImage(sample.mockB64);
    setImagePreview(sample.preview);
    setResult(null);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
  };

  return (
    <div className="photo-learning-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="eyebrow"><span className="eyebrow-dot"></span> MULTIMODAL VISION LEARNING</div>
        <h1 className="page-title">
          {language === 'Telugu' ? 'ఫోటో ఆధారిత ' : 'Snap & '}
          <em>{language === 'Telugu' ? 'ప్రశ్నల పరిష్కారం' : 'Learn From Photo'}</em>
        </h1>
        <p className="page-subtitle">
          {language === 'Telugu'
            ? 'మీ పాఠ్యపుస్తకంలోని పేజీ లేదా హోంవర్క్ ప్రశ్న ఫోటో తీయండి. AI ట్యూటర్ దానిలోని ప్రశ్నను చదివి, పాఠ్యపుస్తకం ఆధారంగా సరైన పేజీతో సమాధానం ఇస్తుంది.'
            : 'Capture or upload a picture of a textbook page or homework exercise. Manovriddhi extracts the question and grounds the solution in your syllabus.'}
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '24px' }}>
        {/* Upload / Capture Card */}
        <div className="card">
          <div className="card-header">
            <h3>Upload Question Photograph</h3>
            <span style={{ fontSize: '11px', color: 'var(--brand-green-text)', fontWeight: 700 }}>OCR Vision Pipeline</span>
          </div>

          {!imagePreview ? (
            <div style={{ border: '2px dashed var(--border-light)', borderRadius: '12px', padding: '36px 20px', textAlign: 'center', background: 'var(--bg-card-subtle)', marginBottom: '16px' }}>
              <Camera size={38} color="var(--brand-green)" style={{ margin: '0 auto 12px' }} />
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Take photo or drop textbook image here
              </strong>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Supports PNG, JPG, JPEG up to 10MB
              </p>
              <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <Upload size={14} /> Select Photograph
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <div style={{ position: 'relative', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
              <button 
                className="topbar-btn" 
                onClick={handleClear}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: '6px' }}
                title="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Demonstration Sample Photos */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              OR TRY A DEMO PHOTO:
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {samplePhotos.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(s)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-light)',
                    fontSize: '11px',
                    textAlign: 'left'
                  }}
                >
                  <img src={s.preview} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontWeight: 600 }}>{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={handleProcessPhoto}
            disabled={!selectedImage || loading}
          >
            <Sparkles size={16} /> {loading ? 'Extracting & Grounding Solution...' : 'Analyze & Solve Question'}
          </button>
        </div>

        {/* Processing Results Display */}
        <div className="card" style={{ background: result ? 'var(--bg-card)' : 'var(--bg-card-subtle)' }}>
          <div className="card-header">
            <h3>Textbook Solution & Citation</h3>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-green-text)' }}>
              {result ? 'ANALYSIS COMPLETE' : 'AWAITING PHOTO'}
            </span>
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>EXTRACTED QUESTION (OCR):</span>
                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  "{result.extracted_text}"
                </strong>
              </div>

              <div style={{ padding: '14px', background: 'var(--brand-green-light)', borderRadius: '10px', border: '1px solid rgba(24, 76, 52, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-green-text)', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>
                  <Sparkles size={14} /> Grounded Textbook Solution:
                </div>
                <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--text-primary)', margin: '6px 0' }}>
                  {result.rag_result?.answer}
                </p>
                {result.rag_result?.primary_citation && (
                  <div className="citation-pill" style={{ marginTop: '8px' }}>
                    <BookMarked size={13} />
                    <span>{result.rag_result.primary_citation}</span>
                    <CheckCircle2 size={13} />
                  </div>
                )}
              </div>

              <button className="btn-secondary" onClick={() => onNavigate('AI Tutor')}>
                Ask Follow-Up Question in AI Tutor <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <FileText size={36} color="var(--border-light)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '12px' }}>
                Upload a photograph of a textbook question or diagram to extract text, find the matching chapter page, and view step-by-step verified explanations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
