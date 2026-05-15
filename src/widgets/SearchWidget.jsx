import React, { useState } from 'react';
import { useStore } from '../store/useStore';

const ENGINES = {
  google: { label: 'Google', logo: '🔍', url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  duckduckgo: { label: 'DuckDuckGo', logo: '🦆', url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  bing: { label: 'Bing', logo: '🔎', url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  brave: { label: 'Brave', logo: '🦁', url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}` },
};

export default function SearchWidget({ widgetId, config }) {
  const updateWidgetConfig = useStore((s) => s.updateWidgetConfig);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const engine = ENGINES[config.engine] || ENGINES.google;

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = engine.url(q);
  };

  return (
    <div className="search-widget">
      <form className="search-bar" onSubmit={submit}>
        <button type="button" className="engine-toggle" onClick={() => setMenuOpen((o) => !o)} title="Change search engine">
          {engine.logo}
        </button>
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={config.placeholder || 'Search the web...'}
          autoComplete="off"
        />
        <button type="submit" className="search-submit" title="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L16 16" />
          </svg>
        </button>
      </form>
      {menuOpen && (
        <>
          <div
            className="overlay"
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            onClick={() => setMenuOpen(false)}
          />
          <div className="engine-dropdown">
            {Object.entries(ENGINES).map(([key, eng]) => (
              <button
                key={key}
                type="button"
                className={`engine-option${config.engine === key ? ' active' : ''}`}
                onClick={() => {
                  updateWidgetConfig(widgetId, { engine: key });
                  setMenuOpen(false);
                }}
              >
                <span className="engine-logo">{eng.logo}</span>
                {eng.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
