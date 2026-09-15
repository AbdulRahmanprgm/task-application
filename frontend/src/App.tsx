import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthSection } from './components/AuthSection';
import { VisionSection } from './components/VisionSection';
import { TextSection } from './components/TextSection';
import { ApiStatus } from './components/ApiStatus';
import { KeyRound, Camera, MessageSquareText, Terminal, Code2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'auth' | 'vision' | 'text' | 'routes'>('vision');
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  return (
    <div className="app-container">
      <Navbar token={token} />

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'vision' ? 'active' : ''}`}
          onClick={() => setActiveTab('vision')}
        >
          <Camera size={18} /> Image Vision Workspace
        </button>

        <button
          className={`tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          <KeyRound size={18} /> Auth & Profile
        </button>

        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <MessageSquareText size={18} /> Text Sentiment
        </button>

        <button
          className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          <Terminal size={18} /> API Endpoints
        </button>
      </nav>

      {/* Active Tab Panel */}
      <main>
        {activeTab === 'auth' && <AuthSection token={token} setToken={setToken} />}
        {activeTab === 'vision' && <VisionSection />}
        {activeTab === 'text' && <TextSection />}
        {activeTab === 'routes' && <ApiStatus />}
      </main>

      <footer style={{ marginTop: '3rem', textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Code2 size={16} />
          <span>Vite + TypeScript Application for Python FastAPI Backend (<code style={{ color: 'var(--cyan)' }}>devops_int_app/main.py</code>)</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
