const SYNC_KEY = 'novadash-sync-payload';

/** Apply design tokens to document root */
export function applyDesignTokens(design) {
  if (!design) return;
  const root = document.documentElement;
  root.style.setProperty('--accent', design.accentColor);
  root.style.setProperty(
    '--accent-dim',
    hexToRgba(design.accentColor, 0.18)
  );
  root.style.setProperty(
    '--accent-glow',
    hexToRgba(design.accentColor, 0.35)
  );
  root.style.setProperty('--glass-blur', `blur(${design.glassBlur}px) saturate(160%)`);
  const glassA = design.widgetGlassOpacity ?? design.glassOpacity ?? 0.1;
  root.style.setProperty('--widget-glass-opacity', String(glassA));
  if (!design.adaptiveWidgets) {
    root.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${glassA})`);
  }
  root.style.setProperty('--radius-md', `${design.widgetRadius}px`);
  root.style.setProperty(
    '--shadow-md',
    `0 ${8 * design.shadowIntensity}px ${32 * design.shadowIntensity}px rgba(0, 0, 0, 0.35)`
  );
  root.style.setProperty('--font-ui', `'${design.fontUi}', system-ui, sans-serif`);
  root.style.setProperty('--font-clock', `'${design.fontDisplay}', sans-serif`);
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function exportConfig(state) {
  const payload = {
    version: 3,
    exportedAt: new Date().toISOString(),
    profiles: state.profiles,
    activeProfileId: state.activeProfileId,
    design: state.design,
    focusMode: state.focusMode,
    clipboardHistory: state.clipboardHistory,
    layoutPresets: state.layoutPresets,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `novadash-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importConfig(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/** Push state to Firefox sync (settings only, size-limited) */
export async function syncToFirefox(state) {
  if (typeof browser === 'undefined' && typeof chrome === 'undefined') return;
  const api = globalThis.browser ?? globalThis.chrome;
  const payload = {
    version: 3,
    activeProfileId: state.activeProfileId,
    profiles: state.profiles.map((p) => ({
      ...p,
      wallpaper: {
        ...p.wallpaper,
        backgroundImage:
          (p.wallpaper?.backgroundImage?.length || 0) > 200
            ? ''
            : p.wallpaper?.backgroundImage,
      },
    })),
    design: state.design,
    focusMode: state.focusMode,
    layoutPresets: state.layoutPresets,
  };
  await api.storage.sync.set({ [SYNC_KEY]: payload });
}

export async function loadFromFirefox() {
  if (typeof browser === 'undefined' && typeof chrome === 'undefined') return null;
  const api = globalThis.browser ?? globalThis.chrome;
  const result = await api.storage.sync.get(SYNC_KEY);
  return result[SYNC_KEY] || null;
}

export function notifyBackground(type, payload) {
  const api = globalThis.browser ?? globalThis.chrome;
  if (!api?.runtime?.sendMessage) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      api.runtime.sendMessage({ type, payload }, (response) => {
        if (api.runtime.lastError) resolve(null);
        else resolve(response);
      });
    } catch {
      resolve(null);
    }
  });
}
