import React, { useState, useRef } from 'react';
import { useStore, useWidgets } from '../store/useStore';
import { WIDGET_META } from '../store/constants';

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" />
    </label>
  );
}

function BtnGroup({ options, value, onChange }) {
  return (
    <div className="btn-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`btn-group-btn${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="settings-row">
      <span className="settings-label">{label}</span>
      {children}
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, format = (v) => v }) {
  return (
    <div className="settings-slider-row">
      <div className="settings-row">
        <span className="settings-label">{label}</span>
        <span className="settings-slider-value">{format(value)}</span>
      </div>
      <input
        type="range"
        className="settings-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

function ClockSettings({ config, onUpdate }) {
  return (
    <>
      <Row label="Format">
        <BtnGroup
          options={[{ value: '24h', label: '24h' }, { value: '12h', label: '12h' }]}
          value={config.format}
          onChange={(v) => onUpdate({ format: v })}
        />
      </Row>
      <Row label="Show seconds"><Toggle checked={config.showSeconds} onChange={(v) => onUpdate({ showSeconds: v })} /></Row>
      <Row label="Show date"><Toggle checked={config.showDate} onChange={(v) => onUpdate({ showDate: v })} /></Row>
    </>
  );
}

function DateSettings({ config, onUpdate }) {
  return (
    <>
      <Row label="Format">
        <BtnGroup
          options={[{ value: 'long', label: 'Long' }, { value: 'short', label: 'Short' }]}
          value={config.format}
          onChange={(v) => onUpdate({ format: v })}
        />
      </Row>
      <Row label="Weekday"><Toggle checked={config.showWeekday} onChange={(v) => onUpdate({ showWeekday: v })} /></Row>
    </>
  );
}

function WelcomeSettings({ config, onUpdate }) {
  return (
    <>
      <div className="settings-label" style={{ marginBottom: 4 }}>Message (use {'{{name}}'} and {'{{period}}'})</div>
      <input className="settings-input" value={config.message} onChange={(e) => onUpdate({ message: e.target.value })} />
      <div className="settings-label" style={{ marginTop: 10, marginBottom: 4 }}>Your name</div>
      <input className="settings-input" value={config.name} onChange={(e) => onUpdate({ name: e.target.value })} />
    </>
  );
}

function WeatherSettings({ config, onUpdate }) {
  const [cityInput, setCityInput] = useState(config.city);
  return (
    <>
      <div className="settings-label" style={{ marginBottom: 4 }}>City</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="settings-input" style={{ marginTop: 0, flex: 1 }} value={cityInput} onChange={(e) => setCityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onUpdate({ city: cityInput })} />
        <button type="button" className="shortcut-add-submit" style={{ flexShrink: 0 }} onClick={() => onUpdate({ city: cityInput })}>Apply</button>
      </div>
      <div style={{ marginTop: 14 }}>
        <Row label="Unit">
          <BtnGroup options={[{ value: 'celsius', label: '°C' }, { value: 'fahrenheit', label: '°F' }]} value={config.unit} onChange={(v) => onUpdate({ unit: v })} />
        </Row>
      </div>
    </>
  );
}

function SearchSettings({ config, onUpdate }) {
  const ENGINES = [
    { value: 'google', label: 'Google' },
    { value: 'duckduckgo', label: 'DDG' },
    { value: 'bing', label: 'Bing' },
    { value: 'brave', label: 'Brave' },
  ];
  return (
    <>
      <Row label="Engine"><BtnGroup options={ENGINES} value={config.engine} onChange={(v) => onUpdate({ engine: v })} /></Row>
      <div style={{ marginTop: 8 }}>
        <div className="settings-label" style={{ marginBottom: 4 }}>Placeholder</div>
        <input className="settings-input" value={config.placeholder} onChange={(e) => onUpdate({ placeholder: e.target.value })} />
      </div>
    </>
  );
}

function ShortcutsSettings({ config, onUpdate }) {
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const shortcuts = config.shortcuts || [];
  const getFavicon = (url) => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { return null; }
  };
  const addShortcut = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    onUpdate({ shortcuts: [...shortcuts, { id: `sc-${Date.now()}`, name: newName.trim(), url }] });
    setNewName(''); setNewUrl('');
  };
  return (
    <>
      <Row label="Display">
        <BtnGroup options={[{ value: 'large', label: 'Large' }, { value: 'small', label: 'Small' }]} value={config.mode} onChange={(v) => onUpdate({ mode: v })} />
      </Row>
      <div className="settings-section-title" style={{ marginTop: 14 }}>Shortcuts ({shortcuts.length})</div>
      <div className="shortcut-manager-list">
        {shortcuts.map((s) => (
          <div key={s.id} className="shortcut-manager-item">
            <img className="shortcut-manager-favicon" src={getFavicon(s.url)} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="shortcut-manager-info">
              <div className="shortcut-manager-name">{s.name}</div>
              <div className="shortcut-manager-url">{s.url}</div>
            </div>
            <button type="button" className="shortcut-remove-btn" onClick={() => onUpdate({ shortcuts: shortcuts.filter((x) => x.id !== s.id) })}>✕</button>
          </div>
        ))}
      </div>
      <div className="shortcut-add-form">
        <input className="settings-input" style={{ marginTop: 0 }} placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input className="settings-input" style={{ marginTop: 0 }} placeholder="URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addShortcut()} />
        <button type="button" className="shortcut-add-submit" onClick={addShortcut}>+ Add shortcut</button>
      </div>
    </>
  );
}

function CalendarSettings({ config, onUpdate }) {
  return (
    <>
      <div className="settings-label" style={{ marginBottom: 4 }}>Google Calendar iCal URL</div>
      <input className="settings-input" placeholder="https://calendar.google.com/calendar/ical/..." value={config.icalUrl} onChange={(e) => onUpdate({ icalUrl: e.target.value })} />
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
        In Google Calendar → Settings → your calendar → Secret address in iCal format. Read-only.
      </p>
      <Row label="Max events">
        <input className="settings-number-input" type="number" min={1} max={20} value={config.maxEvents} onChange={(e) => onUpdate({ maxEvents: parseInt(e.target.value, 10) || 5 })} />
      </Row>
    </>
  );
}

function TimerSettings({ config, onUpdate }) {
  return (
    <Row label="Default minutes">
      <input className="settings-number-input" type="number" min={1} max={180} value={config.defaultMinutes} onChange={(e) => onUpdate({ defaultMinutes: parseInt(e.target.value, 10) || 25 })} />
    </Row>
  );
}

function ClipboardSettings({ config, onUpdate }) {
  return (
    <Row label="Max items shown">
      <input className="settings-number-input" type="number" min={3} max={30} value={config.maxItems} onChange={(e) => onUpdate({ maxItems: parseInt(e.target.value, 10) || 12 })} />
    </Row>
  );
}

function WidgetSettings({ widget }) {
  const updateWidgetConfig = useStore((s) => s.updateWidgetConfig);
  const onUpdate = (updates) => updateWidgetConfig(widget.id, updates);
  const MAP = {
    clock: <ClockSettings config={widget.config} onUpdate={onUpdate} />,
    date: <DateSettings config={widget.config} onUpdate={onUpdate} />,
    welcome: <WelcomeSettings config={widget.config} onUpdate={onUpdate} />,
    weather: <WeatherSettings config={widget.config} onUpdate={onUpdate} />,
    search: <SearchSettings config={widget.config} onUpdate={onUpdate} />,
    shortcuts: <ShortcutsSettings config={widget.config} onUpdate={onUpdate} />,
    calendar: <CalendarSettings config={widget.config} onUpdate={onUpdate} />,
    timer: <TimerSettings config={widget.config} onUpdate={onUpdate} />,
    clipboard: <ClipboardSettings config={widget.config} onUpdate={onUpdate} />,
    todo: <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Edit tasks directly on the widget.</p>,
    focus: (
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Toggle focus on the widget. Manage blocked sites under Settings → Focus mode.
      </p>
    ),
  };
  return MAP[widget.type] || <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No settings for this widget.</p>;
}

function GlobalSettings() {
  const design = useStore((s) => s.design);
  const updateDesign = useStore((s) => s.updateDesign);
  const profiles = useStore((s) => s.profiles);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const setActiveProfile = useStore((s) => s.setActiveProfile);
  const addProfile = useStore((s) => s.addProfile);
  const renameProfile = useStore((s) => s.renameProfile);
  const removeProfile = useStore((s) => s.removeProfile);
  const updateProfileWallpaper = useStore((s) => s.updateProfileWallpaper);
  const wallpaper = useStore((s) => {
    const p = s.profiles.find((pr) => pr.id === s.activeProfileId) || s.profiles[0];
    return p?.wallpaper ?? {};
  });
  const focusMode = useStore((s) => s.focusMode);
  const updateFocusMode = useStore((s) => s.updateFocusMode);
  const widgets = useWidgets();
  const setActiveWidgetSettings = useStore((s) => s.setActiveWidgetSettings);
  const resetWidgets = useStore((s) => s.resetWidgets);
  const runExport = useStore((s) => s.runExport);
  const runImport = useStore((s) => s.runImport);
  const runSyncUpload = useStore((s) => s.runSyncUpload);
  const runSyncDownload = useStore((s) => s.runSyncDownload);
  const layoutPresets = useStore((s) => s.layoutPresets);
  const saveLayoutPreset = useStore((s) => s.saveLayoutPreset);
  const loadLayoutPreset = useStore((s) => s.loadLayoutPreset);
  const deleteLayoutPreset = useStore((s) => s.deleteLayoutPreset);
  const fileRef = useRef(null);

  const [hostInput, setHostInput] = useState('');

  return (
    <>
      <div className="settings-section">
        <div className="settings-section-title">Profiles</div>
        {profiles.map((p) => (
          <div key={p.id} className="widget-list-item" onClick={() => setActiveProfile(p.id)}>
            <div>
              <div className="widget-list-name">{p.name}{p.id === activeProfileId ? ' (active)' : ''}</div>
              <div className="widget-list-type">{p.widgets.length} widgets</div>
            </div>
          </div>
        ))}
        <button type="button" className="settings-action-btn" onClick={() => { const n = window.prompt('Profile name', 'New profile'); if (n) addProfile(n); }}>+ New profile</button>
        {profiles.length > 1 && (
          <button type="button" className="settings-action-btn danger" onClick={() => { if (window.confirm('Delete active profile?')) removeProfile(activeProfileId); }}>Delete active profile</button>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Wallpaper (this profile)</div>
        <Row label="Style">
          <BtnGroup
            options={[
              { value: 'animated', label: 'Dynamic' },
              { value: 'solid', label: 'Solid' },
              { value: 'image', label: 'Image' },
            ]}
            value={wallpaper.backgroundType}
            onChange={(v) => updateProfileWallpaper({ backgroundType: v })}
          />
        </Row>
        {wallpaper.backgroundType === 'solid' && (
          <div className="color-picker-row" style={{ marginTop: 8 }}>
            <div className="color-swatch" style={{ background: wallpaper.backgroundColor }}>
              <input type="color" value={wallpaper.backgroundColor} onChange={(e) => updateProfileWallpaper({ backgroundColor: e.target.value })} />
            </div>
          </div>
        )}
        {wallpaper.backgroundType === 'image' && (
          <>
            <div className="settings-label" style={{ marginTop: 10, marginBottom: 4 }}>Image URL</div>
            <input
              className="settings-input"
              placeholder="https://..."
              value={wallpaper.backgroundImage?.startsWith('data:') ? '' : (wallpaper.backgroundImage || '')}
              onChange={(e) => updateProfileWallpaper({ backgroundImage: e.target.value, backgroundType: 'image' })}
            />
            <div className="settings-label" style={{ marginTop: 10, marginBottom: 4 }}>Or upload from device</div>
            <label className="settings-upload-btn">
              Choose image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    updateProfileWallpaper({ backgroundType: 'image', backgroundImage: reader.result });
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
            </label>
            {wallpaper.backgroundImage && (
              <button
                type="button"
                className="settings-action-btn"
                style={{ marginTop: 8 }}
                onClick={() => updateProfileWallpaper({ backgroundImage: '' })}
              >
                Remove background image
              </button>
            )}
            <SliderRow
              label="Image dim overlay"
              value={wallpaper.backgroundOverlay ?? 0.35}
              min={0}
              max={0.85}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => updateProfileWallpaper({ backgroundOverlay: v })}
            />
          </>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Design system</div>
        <Row label="Accent">
          <div className="color-swatch" style={{ background: design.accentColor }}>
            <input
              type="color"
              value={design.accentColor}
              onChange={(e) => updateDesign({ accentColor: e.target.value, adaptiveAccent: false })}
            />
          </div>
        </Row>
        <SliderRow
          label="Widget transparency"
          value={design.widgetGlassOpacity ?? 0.1}
          min={0.02}
          max={0.45}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => updateDesign({ widgetGlassOpacity: v })}
        />
        <Row label="Adapt widgets to background">
          <Toggle checked={design.adaptiveWidgets !== false} onChange={(v) => updateDesign({ adaptiveWidgets: v })} />
        </Row>
        <Row label="Adapt accent to background">
          <Toggle checked={design.adaptiveAccent !== false} onChange={(v) => updateDesign({ adaptiveAccent: v })} />
        </Row>
        <Row label="Widget radius">
          <input className="settings-number-input" type="number" min={0} max={40} value={design.widgetRadius} onChange={(e) => updateDesign({ widgetRadius: parseInt(e.target.value, 10) || 16 })} />
        </Row>
        <Row label="Glass blur">
          <input className="settings-number-input" type="number" min={0} max={48} value={design.glassBlur} onChange={(e) => updateDesign({ glassBlur: parseInt(e.target.value, 10) || 22 })} />
        </Row>
        <Row label="Shadow intensity">
          <input className="settings-number-input" type="number" min={0} max={3} step={0.1} value={design.shadowIntensity} onChange={(e) => updateDesign({ shadowIntensity: parseFloat(e.target.value) || 1 })} />
        </Row>
        <Row label="Snap to grid"><Toggle checked={design.snapToGrid} onChange={(v) => updateDesign({ snapToGrid: v })} /></Row>
        {design.snapToGrid && (
          <Row label="Grid size">
            <input className="settings-number-input" type="number" min={8} max={80} step={4} value={design.gridSize} onChange={(e) => updateDesign({ gridSize: parseInt(e.target.value, 10) || 20 })} />
          </Row>
        )}
        <Row label="Alignment guides"><Toggle checked={design.showAlignmentGuides} onChange={(v) => updateDesign({ showAlignmentGuides: v })} /></Row>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Focus mode</div>
        <Row label="Enabled"><Toggle checked={focusMode.enabled} onChange={(v) => updateFocusMode({ enabled: v })} /></Row>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Blocks main-frame visits to listed hosts.</p>
        <ul className="focus-host-list">
          {(focusMode.blockedHosts || []).map((h) => (
            <li key={h}>
              <span>{h}</span>
              <button type="button" onClick={() => updateFocusMode({ blockedHosts: focusMode.blockedHosts.filter((x) => x !== h) })}>×</button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="settings-input" style={{ marginTop: 0 }} placeholder="instagram.com" value={hostInput} onChange={(e) => setHostInput(e.target.value)} />
          <button type="button" className="shortcut-add-submit" onClick={() => {
            const h = hostInput.trim();
            if (!h) return;
            updateFocusMode({ blockedHosts: [...new Set([...(focusMode.blockedHosts || []), h])] });
            setHostInput('');
          }}>Add</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Layout presets</div>
        {layoutPresets.map((p) => (
          <div key={p.id} className="preset-row">
            <span className="settings-label">{p.name}</span>
            <button type="button" className="btn-group-btn" onClick={() => loadLayoutPreset(p.id)}>Load</button>
            <button type="button" className="btn-group-btn danger" onClick={() => deleteLayoutPreset(p.id)}>Del</button>
          </div>
        ))}
        <button type="button" className="settings-action-btn" onClick={() => { const n = window.prompt('Preset name'); if (n) saveLayoutPreset(n); }}>Save current layout</button>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Widgets</div>
        {widgets.map((w) => (
          <div key={w.id} className="widget-list-item" onClick={() => setActiveWidgetSettings(w.id)}>
            <div>
              <div className="widget-list-name">{WIDGET_META[w.type]?.emoji} {w.type}</div>
              <div className="widget-list-type">{w.size.w}×{w.size.h}</div>
            </div>
            <span className="widget-list-arrow">›</span>
          </div>
        ))}
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Data</div>
        <button type="button" className="settings-action-btn" onClick={runExport}>Export JSON</button>
        <button type="button" className="settings-action-btn" onClick={() => fileRef.current?.click()}>Import JSON</button>
        <button type="button" className="settings-action-btn" onClick={runSyncUpload}>Sync to Firefox</button>
        <button type="button" className="settings-action-btn" onClick={runSyncDownload}>Load from Firefox Sync</button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) await runImport(f); e.target.value = ''; }} />
        <button type="button" className="settings-action-btn danger" onClick={resetWidgets}>Reset layout</button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>Ctrl+K command palette · Ctrl+E editor</p>
    </>
  );
}

export default function SettingsPanel() {
  const settingsOpen = useStore((s) => s.settingsOpen);
  const closeSettings = useStore((s) => s.closeSettings);
  const activeWidgetSettings = useStore((s) => s.activeWidgetSettings);
  const setActiveWidgetSettings = useStore((s) => s.setActiveWidgetSettings);
  const widgets = useWidgets();
  const removeWidget = useStore((s) => s.removeWidget);
  const toggleWidgetLock = useStore((s) => s.toggleWidgetLock);

  if (!settingsOpen) return null;

  const activeWidget = activeWidgetSettings ? widgets.find((w) => w.id === activeWidgetSettings) : null;

  return (
    <>
      <div className="settings-overlay" onClick={closeSettings} />
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-header-left">
            {activeWidget && (
              <button type="button" className="settings-back-btn" onClick={() => setActiveWidgetSettings(null)}>←</button>
            )}
            <span className="settings-title">
              {activeWidget ? `${WIDGET_META[activeWidget.type]?.emoji || ''} ${activeWidget.type}` : 'Settings'}
            </span>
          </div>
          <button type="button" className="settings-close" onClick={closeSettings}>✕</button>
        </div>
        <div className="settings-content">
          {activeWidget ? (
            <>
              <WidgetSettings widget={activeWidget} />
              <div className="settings-section">
                <button type="button" className="settings-action-btn" onClick={() => toggleWidgetLock(activeWidget.id)}>
                  {activeWidget.locked ? 'Unlock' : 'Lock'}
                </button>
                <button type="button" className="settings-action-btn danger" onClick={() => { removeWidget(activeWidget.id); setActiveWidgetSettings(null); }}>Remove widget</button>
              </div>
            </>
          ) : (
            <GlobalSettings />
          )}
        </div>
      </div>
    </>
  );
}
