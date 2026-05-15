import React from 'react';

function favicon(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
  } catch {
    return null;
  }
}

export default function ShortcutsWidget({ config }) {
  const shortcuts = config.shortcuts || [];
  const small = config.mode === 'small';

  if (!shortcuts.length) {
    return (
      <div className="shortcuts-widget">
        <div className="empty-shortcuts">Add shortcuts in widget settings</div>
      </div>
    );
  }

  return (
    <div className={`shortcuts-widget${small ? ' mode-small' : ''}`}>
      <div className="shortcuts-grid">
        {shortcuts.map((s) => (
          <a
            key={s.id}
            className="shortcut-item"
            href={s.url}
            title={s.name}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shortcut-icon">
              <img src={favicon(s.url)} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            {!small && <span className="shortcut-name">{s.name}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
