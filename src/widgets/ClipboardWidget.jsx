import React from 'react';
import { useStore } from '../store/useStore';

export default function ClipboardWidget({ config }) {
  const history = useStore((s) => s.clipboardHistory);
  const addClipboardItem = useStore((s) => s.addClipboardItem);
  const removeClipboardItem = useStore((s) => s.removeClipboardItem);
  const clearClipboardHistory = useStore((s) => s.clearClipboardHistory);
  const max = config.maxItems || 12;
  const items = history.slice(0, max);

  const capture = async () => {
    try {
      const text = await navigator.clipboard.readText();
      addClipboardItem(text);
    } catch {
      useStore.getState().showToast('Allow clipboard access or paste manually');
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      useStore.getState().showToast('Copied to clipboard');
    } catch {
      useStore.getState().showToast('Could not copy');
    }
  };

  return (
    <div className="clipboard-widget">
      <div className="clipboard-toolbar">
        <button type="button" onClick={capture}>Capture</button>
        {items.length > 0 && (
          <button type="button" className="clipboard-clear" onClick={clearClipboardHistory}>
            Clear
          </button>
        )}
      </div>
      <ul className="clipboard-list">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" className="clipboard-text" onClick={() => copy(item.text)} title="Click to copy">
              {item.text.length > 80 ? `${item.text.slice(0, 80)}…` : item.text}
            </button>
            <button type="button" className="clipboard-remove" onClick={() => removeClipboardItem(item.id)}>×</button>
          </li>
        ))}
        {items.length === 0 && <li className="clipboard-empty">Click Capture to save clipboard</li>}
      </ul>
    </div>
  );
}
