import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { WIDGET_META, WIDGET_TYPES } from '../store/constants';

const COMMANDS = [
  { id: 'toggle-editor', label: 'Toggle editor mode', group: 'Layout', run: (s) => s.setEditorMode(!s.editorMode) },
  { id: 'open-settings', label: 'Open settings', group: 'General', run: (s) => { s.setSettingsOpen(true); s.setActiveWidgetSettings(null); } },
  { id: 'export', label: 'Export configuration', group: 'Data', run: (s) => s.runExport() },
  { id: 'import', label: 'Import configuration…', group: 'Data', action: 'import' },
  { id: 'sync-up', label: 'Sync to Firefox', group: 'Data', run: (s) => s.runSyncUpload() },
  { id: 'sync-down', label: 'Load from Firefox Sync', group: 'Data', run: (s) => s.runSyncDownload() },
  { id: 'focus-toggle', label: 'Toggle focus mode', group: 'Focus', run: (s) => s.updateFocusMode({ enabled: !s.focusMode.enabled }) },
  { id: 'reset-layout', label: 'Reset layout to default', group: 'Layout', run: (s) => s.resetWidgets() },
  { id: 'save-preset', label: 'Save layout preset…', group: 'Layout', action: 'save-preset' },
];

export default function CommandPalette() {
  const open = useStore((s) => s.commandPaletteOpen);
  const setOpen = useStore((s) => s.setCommandPaletteOpen);
  const store = useStore();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const widgetCommands = WIDGET_TYPES.map((type) => ({
    id: `add-${type}`,
    label: `Add ${WIDGET_META[type].label} widget`,
    group: 'Widgets',
    run: (s) => s.addWidget(type),
  }));

  const profiles = useStore((s) => s.profiles);

  const profileCommands = useMemo(
    () =>
      profiles.map((p) => ({
        id: `profile-${p.id}`,
        label: `Switch to profile: ${p.name}`,
        group: 'Profiles',
        run: (st) => st.setActiveProfile(p.id),
      })),
    [profiles]
  );

  const all = useMemo(() => {
    const list = [...COMMANDS, ...widgetCommands, ...profileCommands];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [query, profileCommands]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  if (!open) return null;

  const run = (cmd) => {
    if (cmd.action === 'import') {
      fileRef.current?.click();
      setOpen(false);
      return;
    }
    if (cmd.action === 'save-preset') {
      const name = window.prompt('Preset name');
      if (name?.trim()) store.saveLayoutPreset(name.trim());
      setOpen(false);
      return;
    }
    cmd.run?.(store);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, all.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && all[index]) {
      e.preventDefault();
      run(all[index]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
  <>
    <div className="command-overlay" onClick={() => setOpen(false)} />
    <div className="command-palette" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        className="command-input"
        placeholder="Type a command…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <ul className="command-list">
        {all.map((cmd, i) => (
          <li key={cmd.id}>
            <button
              type="button"
              className={`command-item${i === index ? ' active' : ''}`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => run(cmd)}
            >
              <span className="command-label">{cmd.label}</span>
              <span className="command-group">{cmd.group}</span>
            </button>
          </li>
        ))}
        {all.length === 0 && <li className="command-empty">No matches</li>}
      </ul>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await store.runImport(file);
          e.target.value = '';
        }}
      />
    </div>
  </>
  );
}
