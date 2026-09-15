import React, { useState } from 'react';
import { MessageSquareText, Send, Sparkles, Tag, Smile, AlertCircle } from 'lucide-react';
import { analyzeText } from '../services/api';
import type { TextAnalyzeResponse } from '../types/api';

const SAMPLE_TEXTS = [
  'AI vision models integrated with DevOps CI/CD pipelines automate quality testing and visual inspection seamlessly.',
  'The image processing service completed object detection with high accuracy and low latency.',
  'Monitoring system alerts indicated temporary processing delay during peak workload.'
];

export const TextSection: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0]);
  const [result, setResult] = useState<TextAnalyzeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await analyzeText({ text });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-2">
      {/* Input Card */}
      <div className="glass-card card-padding">
        <h2 className="section-title">
          <MessageSquareText size={20} className="text-cyan" /> NLP Text Analysis (`/api/vision/analyze-text`)
        </h2>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleAnalyzeText}>
          <div className="form-group">
            <label className="form-label">Input Text</label>
            <textarea
              className="input-field"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to analyze..."
              required
            />
            <div className="preset-pills">
              {SAMPLE_TEXTS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  className="pill"
                  onClick={() => setText(sample)}
                >
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            <Send size={16} /> {loading ? 'Analyzing...' : 'Analyze Text Content'}
          </button>
        </form>
      </div>

      {/* Result Visualization Card */}
      <div className="glass-card card-padding">
        <h2 className="section-title">
          <Sparkles size={20} style={{ color: 'var(--amber)' }} /> Extracted Insights
        </h2>

        {result ? (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SENTIMENT</div>
                <div style={{ color: 'var(--emerald)', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Smile size={18} /> {result.sentiment.toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={14} /> EXTRACTED KEYWORDS
              </div>
              <div className="tag-cloud">
                {result.keywords.map((kw, idx) => (
                  <span key={idx} className="keyword-tag">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                RAW JSON PAYLOAD
              </div>
              <div className="code-block">
                {JSON.stringify(result, null, 2)}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Sparkles size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>Submit text to see sentiment extraction & keyword tags.</p>
          </div>
        )}
      </div>
    </div>
  );
};
