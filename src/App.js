import React, { useCallback, useEffect, useState } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import './App.css';
import { fetchPicsumImages } from './sources/picsum';
import { fetchGitLabImages } from './sources/gitlab';

const STORAGE_KEY = 'photo-gallery-config-v1';

const loadConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const saveConfig = (cfg) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch {} };

const DEFAULT_CONFIG = {
  source: 'picsum',
  gitlab: { projectPath: '', branch: 'main', token: '' },
};

const SunIcon = () => <svg className="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg className="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

function useTheme() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initial);
    setTheme(initial);
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setTheme(next);
  };
  return { theme, toggle };
}

function LoadingSkeleton() {
  return (
    <div className="skel-grid" aria-busy="true" aria-label="Loading photos">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skel" />)}
    </div>
  );
}

function EmptyState({ message = 'No photos to show yet.' }) {
  return (
    <div className="state">
      <div className="icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>
      <div className="title">No photos found</div>
      <div>{message}</div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="state error">
      <div className="icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div className="title">Couldn't load photos</div>
      <div style={{ marginBottom: '1rem' }}><code>{error}</code></div>
      {onRetry && <button className="btn btn-primary btn-sm" onClick={onRetry}>Retry</button>}
    </div>
  );
}

function GitLabConfig({ value, onChange }) {
  const update = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  return (
    <div className="panel">
      <h3>GitLab source</h3>
      <p className="help">
        Point at any GitLab repo with image files. Public repos work without a token; private repos need a Personal Access Token with the <code>read_api</code> scope.
        Your token is stored only in your browser's localStorage — never sent anywhere except gitlab.com.
      </p>
      <div className="field-row">
        <div className="field" style={{ flex: '2 1 280px' }}>
          <label>Project path</label>
          <input className="input" placeholder="group-or-user/repo-name" value={value.projectPath} onChange={update('projectPath')} />
          <span className="hint">e.g. <code>gitlab-org/gitlab</code></span>
        </div>
        <div className="field" style={{ flex: '1 1 140px' }}>
          <label>Branch</label>
          <input className="input" placeholder="main" value={value.branch} onChange={update('branch')} />
        </div>
      </div>
      <div className="field">
        <label>Personal access token (optional for private repos)</label>
        <input className="input" type="password" placeholder="glpat-…" value={value.token} onChange={update('token')} />
        <span className="hint">Create one at gitlab.com → User Settings → Access Tokens → scope <code>read_api</code>.</span>
      </div>
    </div>
  );
}

export default function App() {
  const { toggle } = useTheme();
  const [config, setConfig] = useState(() => loadConfig() || DEFAULT_CONFIG);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | error | ready
  const [error, setError] = useState('');

  const load = useCallback(async (cfg) => {
    setStatus('loading');
    setError('');
    try {
      const next = cfg.source === 'gitlab'
        ? await fetchGitLabImages(cfg.gitlab)
        : await fetchPicsumImages();
      setImages(next);
      setStatus('ready');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unknown error.';
      setError(msg);
      setStatus('error');
      setImages([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (config.source === 'gitlab' && !config.gitlab.projectPath) {
      setStatus('idle');
      return;
    }
    load(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchSource = (source) => {
    const next = { ...config, source };
    setConfig(next); saveConfig(next);
    if (source === 'gitlab' && !next.gitlab.projectPath) {
      setStatus('idle');
      setImages([]);
    } else {
      load(next);
    }
  };

  const handleGitlabChange = (gitlab) => {
    const next = { ...config, gitlab };
    setConfig(next); saveConfig(next);
  };

  const handleApply = () => load(config);

  return (
    <div className="app">
      <header className="nav">
        <div className="nav-inner">
          <span className="brand">
            <span className="brand-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </span>
            <span>Photo Gallery</span>
          </span>

          <div className="nav-actions">
            <div className="source-row">
              <button className={`source-chip ${config.source === 'picsum' ? 'active' : ''}`} onClick={() => switchSource('picsum')}>Picsum</button>
              <button className={`source-chip ${config.source === 'gitlab' ? 'active' : ''}`} onClick={() => switchSource('gitlab')}>GitLab</button>
            </div>
            <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
              <SunIcon /><MoonIcon />
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="header-bar">
          <div>
            <h1 className="header-title">
              {config.source === 'picsum' ? 'Curated photos from Lorem Picsum' : 'Photos from your GitLab repo'}
            </h1>
            <p className="header-sub">
              {config.source === 'picsum'
                ? 'A zero-config public source — no API key, no setup.'
                : 'Recursively walks the repo tree and shows every image it finds.'}
            </p>
          </div>
          {config.source === 'gitlab' && (
            <button className="btn btn-primary" onClick={handleApply} disabled={status === 'loading' || !config.gitlab.projectPath}>
              {status === 'loading' ? 'Loading…' : 'Load photos'}
            </button>
          )}
        </div>

        {config.source === 'gitlab' && (
          <GitLabConfig value={config.gitlab} onChange={handleGitlabChange} />
        )}

        <div className="gallery-card">
          {status === 'loading' && <LoadingSkeleton />}
          {status === 'error' && <ErrorState error={error} onRetry={() => load(config)} />}
          {status === 'idle' && (
            <EmptyState message={config.source === 'gitlab'
              ? 'Enter a project path above and click "Load photos".'
              : 'Nothing to load.'} />
          )}
          {status === 'ready' && (images.length === 0
            ? <EmptyState message={config.source === 'gitlab' ? 'No image files were found in this repo / branch.' : 'No photos returned.'} />
            : <ImageGallery items={images} showFullscreenButton showPlayButton={false} lazyLoad slideInterval={4000} showThumbnails />
          )}
        </div>
      </main>

      <footer className="footer">
        Built with React · {config.source === 'picsum' ? 'Photos from picsum.photos' : 'Photos from gitlab.com'}
      </footer>
    </div>
  );
}
