import React from 'react';
import { Terminal } from 'lucide-react';

export const ApiStatus: React.FC = () => {
  const endpoints = [
    { method: 'GET', path: '/health', desc: 'System health check (Docker, K8s & monitoring uptime status)' },
    { method: 'POST', path: '/api/auth/register', desc: 'Registers a new user (returns user_id uuid)' },
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticates user (admin/admin123 returns mock-jwt-token-777)' },
    { method: 'GET', path: '/api/auth/me', desc: 'Protected user profile (requires Bearer mock-jwt-token-777)' },
    { method: 'POST', path: '/api/vision/analyze-image', desc: 'Starts async AI image processing job (returns job_id uuid)' },
    { method: 'GET', path: '/api/vision/status/{job_id}', desc: 'Polls job status & progress_percent (transitions to completed after 5s)' },
    { method: 'GET', path: '/api/vision/result/{job_id}', desc: 'Retrieves bounding boxes (person, car, laptop) & resolution metadata' },
    { method: 'POST', path: '/api/vision/analyze-text', desc: 'Synchronous text sentiment & keyword extraction' },
  ];

  return (
    <div className="glass-card card-padding">
      <h2 className="section-title">
        <Terminal size={20} className="text-cyan" /> FastAPI Route Directory (`main.py`)
      </h2>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {endpoints.map((ep, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              background: 'rgba(9, 13, 22, 0.6)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  background: ep.method === 'POST' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: ep.method === 'POST' ? '#a5b4fc' : 'var(--emerald)',
                  border: ep.method === 'POST' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                {ep.method}
              </span>
              <code style={{ fontSize: '0.9rem', color: 'var(--cyan)', fontWeight: 600 }}>{ep.path}</code>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              <span>{ep.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
