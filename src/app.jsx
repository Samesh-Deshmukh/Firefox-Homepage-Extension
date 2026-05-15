import React, { useEffect } from 'react';
import { useStore, useWidgets, useWallpaper } from './store/useStore';
import WidgetWrapper from './components/WidgetWrapper';
import WidgetRenderer from './components/WidgetRenderer';
import SettingsPanel from './components/SettingsPanel';
import CommandPalette from './components/CommandPalette';
import GridOverlay from './components/GridOverlay';
import { WIDGET_META, WIDGET_TYPES } from './store/constants';
import { notifyBackground } from './utils/storage';
import { useAdaptiveBackground } from './hooks/useAdaptiveBackground';

export default function App() {
  useAdaptiveBackground();
  const widgets = useWidgets();
  const wallpaper = useWallpaper();
  const editorMode = useStore((s) => s.editorMode);
  const setEditorMode = useStore((s) => s.setEditorMode);
  const settingsOpen = useStore((s) => s.settingsOpen);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const closeSettings = useStore((s) => s.closeSettings);
  const addMenuOpen = useStore((s) => s.addMenuOpen);
  const setAddMenuOpen = useStore((s) => s.setAddMenuOpen);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const commandPaletteOpen = useStore((s) => s.commandPaletteOpen);
  const focusMode = useStore((s) => s.focusMode);
  const toast = useStore((s) => s.toast);

  useEffect(() => {
    notifyBackground('focusMode', focusMode);
  }, [focusMode]);

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (mod && e.key === 'e') {
        e.preventDefault();
        setEditorMode(!editorMode);
      }
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        if (settingsOpen) {
          closeSettings();
          return;
        }
        if (addMenuOpen) {
          setAddMenuOpen(false);
          return;
        }
        setEditorMode(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    commandPaletteOpen,
    editorMode,
    settingsOpen,
    addMenuOpen,
    setCommandPaletteOpen,
    setEditorMode,
    setAddMenuOpen,
    closeSettings,
  ]);

  const bgClass = [
    'bg-layer',
    wallpaper.backgroundType === 'animated' ? 'bg-animated' : '',
    wallpaper.backgroundType === 'solid' ? 'bg-solid' : '',
    wallpaper.backgroundType === 'image' ? 'bg-image' : '',
  ].join(' ');

  const bgStyle = {};
  if (wallpaper.backgroundType === 'solid') {
    bgStyle.background = wallpaper.backgroundColor;
  }
  if (wallpaper.backgroundType === 'image' && wallpaper.backgroundImage) {
    bgStyle.backgroundImage = `url(${wallpaper.backgroundImage})`;
  }

  return (
    <div className={`app${editorMode ? ' editor-mode' : ''}`}>
      <div className={bgClass} style={bgStyle} />
      <GridOverlay />
      <div className="canvas">
        {widgets.map((w) => (
          <WidgetWrapper key={w.id} widget={w}>
            <WidgetRenderer widget={w} />
          </WidgetWrapper>
        ))}
      </div>

      {focusMode.enabled && (
        <div className="focus-banner" title="Focus mode is blocking configured sites">
          Focus mode on
        </div>
      )}

      {editorMode && (
        <div className="editor-badge">Editing layout — drag widgets to move · drag corner to resize</div>
      )}

      <div className="fab-container">
        <button
          type="button"
          className={`fab${editorMode ? ' active' : ''}`}
          title="Toggle editor (Ctrl+E)"
          onClick={() => setEditorMode(!editorMode)}
        >
          ✥
        </button>
        <button
          type="button"
          className="fab"
          title="Command palette (Ctrl+K)"
          onClick={() => setCommandPaletteOpen(true)}
        >
          ⌘
        </button>
        {editorMode && (
          <button
            type="button"
            className={`fab${addMenuOpen ? ' active' : ''}`}
            title="Add widget"
            onClick={() => setAddMenuOpen(!addMenuOpen)}
          >
            +
          </button>
        )}
        <button
          type="button"
          className={`fab${settingsOpen ? ' active' : ''}`}
          title="Settings"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          ⚙
        </button>
      </div>

      {addMenuOpen && editorMode && (
        <>
          <div className="overlay" onClick={() => setAddMenuOpen(false)} />
          <div className="add-widget-menu">
            <h3>Add widget</h3>
            {WIDGET_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className="add-widget-option"
                onClick={() => useStore.getState().addWidget(type)}
              >
                <span className="add-widget-label">
                  {WIDGET_META[type].emoji} {WIDGET_META[type].label}
                </span>
                <span className="add-widget-desc">{WIDGET_META[type].desc}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <SettingsPanel />
      <CommandPalette />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
