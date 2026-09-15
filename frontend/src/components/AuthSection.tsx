import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck, User, Mail, Key, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { loginUser, registerUser, fetchUserProfile } from '../services/api';
import type { UserProfile } from '../types/api';

interface AuthSectionProps {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({ token, setToken }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form states
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [email, setEmail] = useState<string>('developer@visionapp.com');
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fillDemoAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await loginUser({ username, password });
      setToken(res.access_token);
      setSuccess('Successfully authenticated! Bearer token stored.');
      // Auto fetch profile
      handleFetchProfile(res.access_token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await registerUser({ email, username, password });
      setSuccess(`Registration successful! User ID: ${res.user_id}`);
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProfile = async (authToken?: string) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setError('No active authentication token found.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userProfile = await fetchUserProfile(activeToken);
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
    setSuccess('Logged out successfully.');
  };

  return (
    <div className="grid-2">
      {/* Auth Control Form Card */}
      <div className="glass-card card-padding">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            {mode === 'login' ? <LogIn size={20} className="text-cyan" /> : <UserPlus size={20} className="text-cyan" />}
            {mode === 'login' ? 'System Authentication' : 'Create API Account'}
          </h2>

          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(9, 13, 22, 0.5)', padding: '3px', borderRadius: '8px' }}>
            <button
              className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
            >
              Login
            </button>
            <button
              className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
            >
              Register
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{success}</div>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={fillDemoAdmin} style={{ fontSize: '0.8rem' }}>
                <Zap size={14} style={{ color: 'var(--amber)' }} /> Fill Demo Admin
              </button>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-cyan" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Registering...' : 'Register Account'}
            </button>
          </form>
        )}
      </div>

      {/* User Profile & Token Status Card */}
      <div className="glass-card card-padding" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 className="section-title">
            <ShieldCheck size={20} style={{ color: 'var(--emerald)' }} /> Active Auth Profile (`/api/auth/me`)
          </h2>

          {token ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(9, 13, 22, 0.7)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                  ACTIVE BEARER TOKEN
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--cyan)', wordBreak: 'break-all' }}>
                  {token}
                </div>
              </div>

              {profile ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USERNAME</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={16} /> {profile.username}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ROLE</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '2px', color: 'var(--emerald)' }}>
                      {profile.role.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EMAIL</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={16} /> {profile.email}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Token stored. Click below to query the `/api/auth/me` endpoint.
                </p>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <Key size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p>No active token. Log in with <code style={{ color: 'var(--cyan)' }}>admin / admin123</code> to test authenticated requests.</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          {token && (
            <>
              <button className="btn btn-secondary" onClick={() => handleFetchProfile()} disabled={loading} style={{ flex: 1 }}>
                Refresh Profile
              </button>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: 'var(--rose)' }}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
