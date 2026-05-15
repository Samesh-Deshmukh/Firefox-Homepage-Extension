import React from 'react';
import { useStore } from '../store/useStore';

export default function FocusWidget() {
  const focusMode = useStore((s) => s.focusMode);
  const updateFocusMode = useStore((s) => s.updateFocusMode);
  const hosts = focusMode.blockedHosts || [];
  const enabled = focusMode.enabled;

  return (
    <div className="focus-widget">
      <div className={`focus-status${enabled ? ' on' : ''}`}>
        <span className="focus-status-dot" />
        {enabled ? 'Focus active' : 'Focus off'}
      </div>
      <p className="focus-desc">
        {enabled
          ? `Blocking ${hosts.length} site${hosts.length === 1 ? '' : 's'}`
          : 'Block distracting sites while you work'}
      </p>
      <button
        type="button"
        className={`focus-toggle-btn${enabled ? ' active' : ''}`}
        onClick={() => updateFocusMode({ enabled: !enabled })}
      >
        {enabled ? 'Turn off focus' : 'Turn on focus'}
      </button>
      {hosts.length > 0 && (
        <ul className="focus-host-preview">
          {hosts.slice(0, 4).map((h) => (
            <li key={h}>{h.replace(/^www\./, '')}</li>
          ))}
          {hosts.length > 4 && <li className="focus-more">+{hosts.length - 4} more</li>}
        </ul>
      )}
    </div>
  );
}
