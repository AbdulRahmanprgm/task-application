import React, { useState, useEffect } from 'react';
import { Cpu, Server, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { pingBackendHealth, getApiBaseUrl, setApiBaseUrl } from '../services/api';

interface NavbarProps {
  token: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ token }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [baseUrlInput, setBaseUrlInput] = useState<string>(getApiBaseUrl());
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const checkHealth = async () => {
    setChecking(true);
    const healthy = await pingBackendHealth();
    setIsOnline(healthy);
    setChecking(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveBaseUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(baseUrlInput);
    setShowConfig(false);
    checkHealth();
  };

  return (
    <header className="header-bar glass-card">
      <div className="brand">
        <div className="brand-icon">
          <Cpu size={24} />
        </div>
        <div>
          <div className="brand-title">AI Vision DevOps Engine</div>
          <div className="brand-subtitle">FastAPI TypeScript Portal</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {token ? (
          <div className="status-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Key size={14} /> Bearer Authenticated
          </div>
        ) : (
          <div className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            Guest Session
          </div>
        )}

        <div className={`status-badge ${isOnline ? 'online' : 'offline'}`} onClick={checkHealth} style={{ cursor: 'pointer' }} title="Click to refresh connection check">
          <span className="pulse-dot"></span>
          {checking ? (
            <span>Connecting...</span>
          ) : isOnline ? (
            <>
              <CheckCircle2 size={14} /> Backend Online (8000)
            </>
          ) : (
            <>
              <AlertCircle size={14} /> Backend Offline
            </>
          )}
        </div>

        <button className="btn btn-secondary" onClick={() => setShowConfig(!showConfig)} style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>
          <Server size={14} /> Endpoint Config
        </button>
      </div>

      {showConfig && (
        <div className="glass-card" style={{ position: 'absolute', top: '80px', right: '2rem', zIndex: 100, padding: '1.25rem', width: '320px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={16} /> Backend Server URL
          </h4>
          <form onSubmit={handleSaveBaseUrl}>
            <div className="form-group">
              <label className="form-label">FastAPI Host</label>
              <input
                type="text"
                className="input-field"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder="http://127.0.0.1:8000"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowConfig(false)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                Save & Test
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};
