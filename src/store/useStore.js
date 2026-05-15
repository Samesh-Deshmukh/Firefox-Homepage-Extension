import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loadFromFirefox } from '../utils/storage';
import {
  DEFAULT_DESIGN,
  DEFAULT_FOCUS,
  DEFAULT_PROFILES,
  DEFAULT_WIDGETS,
  WIDGET_META,
} from './constants';
import {
  applyDesignTokens,
  exportConfig,
  importConfig,
  loadFromFirefox,
  notifyBackground,
  syncToFirefox,
} from '../utils/storage';

const WIDGET_DEFAULTS = {
  clock: {
    size: { w: 320, h: 150 },
    config: { format: '24h', showSeconds: true, showDate: false },
  },
  date: {
    size: { w: 240, h: 120 },
    config: { format: 'long', showWeekday: true },
  },
  welcome: {
    size: { w: 480, h: 72 },
    config: { message: 'Good {{period}}, {{name}}!', name: 'there' },
  },
  weather: {
    size: { w: 280, h: 150 },
    config: { city: 'Rotterdam', unit: 'celsius' },
  },
  search: {
    size: { w: 560, h: 56 },
    config: { engine: 'google', placeholder: 'Search the web...' },
  },
  shortcuts: {
    size: { w: 480, h: 150 },
    config: { mode: 'large', shortcuts: [] },
  },
  todo: {
    size: { w: 320, h: 220 },
    config: { items: [] },
  },
  timer: {
    size: { w: 220, h: 160 },
    config: { defaultMinutes: 25 },
  },
  calendar: {
    size: { w: 380, h: 260 },
    config: { icalUrl: '', maxEvents: 5 },
  },
  clipboard: {
    size: { w: 220, h: 200 },
    config: { maxItems: 12 },
  },
  focus: {
    size: { w: 200, h: 140 },
    config: {},
  },
};

// Load saved data on startup
loadFromFirefox().then((data) => {
  if (!data) return;

  const state = useStore.getState();

  useStore.setState({
    ...state,
    ...data,
  });
});

function getActiveProfile(state) {
  return state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
}

export const useStore = create(
  persist(
    (set, get) => ({
      profiles: DEFAULT_PROFILES,
      activeProfileId: 'home',
      design: { ...DEFAULT_DESIGN },
      focusMode: { ...DEFAULT_FOCUS },
      clipboardHistory: [],
      layoutPresets: [],

      editorMode: false,
      commandPaletteOpen: false,
      settingsOpen: false,
      activeWidgetSettings: null,
      addMenuOpen: false,
      alignmentGuides: { x: [], y: [] },
      toast: null,

      get widgets() {
        return getActiveProfile(get())?.widgets ?? [];
      },

      get wallpaper() {
        return getActiveProfile(get())?.wallpaper ?? {};
      },

      showToast: (message) => {
        set({ toast: message });
        setTimeout(() => {
          if (get().toast === message) set({ toast: null });
        }, 2800);
      },

      setEditorMode: (editorMode) =>
        set({ editorMode, addMenuOpen: false, alignmentGuides: { x: [], y: [] } }),

      setCommandPaletteOpen: (commandPaletteOpen) =>
        set({ commandPaletteOpen, addMenuOpen: false }),

      setSettingsOpen: (settingsOpen) =>
        set({
          settingsOpen,
          addMenuOpen: false,
          commandPaletteOpen: false,
          ...(settingsOpen ? {} : { activeWidgetSettings: null }),
        }),

      closeSettings: () =>
        set({ settingsOpen: false, activeWidgetSettings: null, addMenuOpen: false }),

      setActiveWidgetSettings: (activeWidgetSettings) =>
        set(
          activeWidgetSettings
            ? { activeWidgetSettings, settingsOpen: true }
            : { activeWidgetSettings: null }
        ),

      setAddMenuOpen: (addMenuOpen) => set({ addMenuOpen }),

      setAlignmentGuides: (alignmentGuides) => set({ alignmentGuides }),

      setActiveProfile: (activeProfileId) => {
        set({ activeProfileId, activeWidgetSettings: null });
        get().showToast(`Switched to ${get().profiles.find((p) => p.id === activeProfileId)?.name}`);
      },

      updateProfileWallpaper: (updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? { ...p, wallpaper: { ...p.wallpaper, ...updates } }
              : p
          ),
        })),

      addProfile: (name) => {
        const id = `profile-${Date.now()}`;
        const base = getActiveProfile(get());
        set((state) => ({
          profiles: [
            ...state.profiles,
            {
              id,
              name,
              widgets: base.widgets.map((w) => ({
                ...w,
                id: `${w.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                config: { ...w.config },
              })),
              wallpaper: { ...base.wallpaper },
            },
          ],
          activeProfileId: id,
        }));
      },

      renameProfile: (id, name) =>
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      removeProfile: (id) => {
        const { profiles, activeProfileId } = get();
        if (profiles.length <= 1) return;
        const next = profiles.filter((p) => p.id !== id);
        set({
          profiles: next,
          activeProfileId:
            activeProfileId === id ? next[0].id : activeProfileId,
        });
      },

      patchWidgets: (fn) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === state.activeProfileId
              ? { ...p, widgets: fn(p.widgets) }
              : p
          ),
        })),

      addWidget: (type) => {
        const def = WIDGET_DEFAULTS[type];
        if (!def) return;
        const id = `${type}-${Date.now()}`;
        get().patchWidgets((widgets) => [
          ...widgets,
          {
            id,
            type,
            position: { x: 120 + Math.random() * 40, y: 120 + Math.random() * 40 },
            locked: false,
            size: { ...def.size },
            config: { ...def.config },
          },
        ]);
        set({ addMenuOpen: false });
        get().showToast(`Added ${WIDGET_META[type]?.label || type} widget`);
      },

      updateWidget: (id, updates) =>
        get().patchWidgets((widgets) =>
          widgets.map((w) => (w.id === id ? { ...w, ...updates } : w))
        ),

      updateWidgetConfig: (id, configUpdates) =>
        get().patchWidgets((widgets) =>
          widgets.map((w) =>
            w.id === id ? { ...w, config: { ...w.config, ...configUpdates } } : w
          )
        ),

      removeWidget: (id) => {
        get().patchWidgets((widgets) => widgets.filter((w) => w.id !== id));
        set((state) => ({
          activeWidgetSettings:
            state.activeWidgetSettings === id ? null : state.activeWidgetSettings,
        }));
      },

      toggleWidgetLock: (id) =>
        get().patchWidgets((widgets) =>
          widgets.map((w) => (w.id === id ? { ...w, locked: !w.locked } : w))
        ),

      duplicateWidget: (id) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (!widget) return;
        const newId = `${widget.type}-${Date.now()}`;
        get().patchWidgets((widgets) => [
          ...widgets,
          {
            ...widget,
            id: newId,
            config: { ...widget.config },
            position: {
              x: widget.position.x + 24,
              y: widget.position.y + 24,
            },
          },
        ]);
      },

      resetWidgets: () => {
        get().patchWidgets(() =>
          DEFAULT_WIDGETS.map((w) => ({
            ...w,
            config: { ...w.config },
          }))
        );
        get().showToast('Layout reset to default');
      },

      saveLayoutPreset: (name) => {
        const profile = getActiveProfile(get());
        const preset = {
          id: `preset-${Date.now()}`,
          name,
          profileId: profile.id,
          widgets: JSON.parse(JSON.stringify(profile.widgets)),
          savedAt: Date.now(),
        };
        set((state) => ({
          layoutPresets: [...state.layoutPresets, preset],
        }));
        get().showToast(`Saved preset "${name}"`);
      },

      loadLayoutPreset: (presetId) => {
        const preset = get().layoutPresets.find((p) => p.id === presetId);
        if (!preset) return;
        get().patchWidgets(() => JSON.parse(JSON.stringify(preset.widgets)));
        get().showToast(`Loaded "${preset.name}"`);
      },

      deleteLayoutPreset: (presetId) =>
        set((state) => ({
          layoutPresets: state.layoutPresets.filter((p) => p.id !== presetId),
        })),

      updateDesign: (updates) => {
        const design = { ...get().design, ...updates };
        set({ design });
        applyDesignTokens(design);
      },

      updateFocusMode: (updates) => {
        const focusMode = { ...get().focusMode, ...updates };
        set({ focusMode });
        notifyBackground('focusMode', focusMode);
      },

      addClipboardItem: (text) => {
        const trimmed = text?.trim();
        if (!trimmed) return;
        set((state) => {
          const next = [
            { id: `clip-${Date.now()}`, text: trimmed, at: Date.now() },
            ...state.clipboardHistory.filter((c) => c.text !== trimmed),
          ].slice(0, 50);
          return { clipboardHistory: next };
        });
      },

      removeClipboardItem: (id) =>
        set((state) => ({
          clipboardHistory: state.clipboardHistory.filter((c) => c.id !== id),
        })),

      clearClipboardHistory: () => set({ clipboardHistory: [] }),

      runExport: () => exportConfig(get()),

      runImport: async (file) => {
        const data = await importConfig(file);
        if (!data.profiles?.length) throw new Error('Invalid config file');
        set({
          profiles: data.profiles,
          activeProfileId: data.activeProfileId || data.profiles[0].id,
          design: { ...DEFAULT_DESIGN, ...data.design },
          focusMode: { ...DEFAULT_FOCUS, ...data.focusMode },
          clipboardHistory: data.clipboardHistory || [],
          layoutPresets: data.layoutPresets || [],
        });
        applyDesignTokens(get().design);
        notifyBackground('focusMode', get().focusMode);
        get().showToast('Config imported');
      },

      runSyncUpload: async () => {
        await syncToFirefox(get());
        get().showToast('Synced to Firefox');
      },

      runSyncDownload: async () => {
        const data = await loadFromFirefox();
        if (!data) {
          get().showToast('Nothing in Firefox Sync');
          return;
        }
        set({
          profiles: data.profiles || get().profiles,
          activeProfileId: data.activeProfileId || get().activeProfileId,
          design: { ...DEFAULT_DESIGN, ...data.design },
          focusMode: { ...DEFAULT_FOCUS, ...data.focusMode },
          layoutPresets: data.layoutPresets || [],
        });
        applyDesignTokens(get().design);
        notifyBackground('focusMode', get().focusMode);
        get().showToast('Loaded from Firefox Sync');
      },
    }),
    {
      name: 'novadash-storage',
      version: 3,
      migrate: (persisted, version) => {
        if (!persisted || version >= 3) return persisted;
        if (persisted.widgets) {
          return {
            profiles: [
              {
                id: 'home',
                name: 'Home',
                widgets: persisted.widgets,
                wallpaper: {
                  backgroundType: persisted.settings?.backgroundType || 'animated',
                  backgroundColor: persisted.settings?.backgroundColor || '#070b14',
                  backgroundImage: persisted.settings?.backgroundImage || '',
                },
              },
            ],
            activeProfileId: 'home',
            design: {
              ...DEFAULT_DESIGN,
              accentColor: persisted.settings?.accentColor || DEFAULT_DESIGN.accentColor,
              snapToGrid: persisted.settings?.snapToGrid ?? true,
              gridSize: persisted.settings?.gridSize ?? 20,
            },
            focusMode: DEFAULT_FOCUS,
            clipboardHistory: [],
            layoutPresets: [],
          };
        }
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.design) applyDesignTokens(state.design);
        if (state?.focusMode) notifyBackground('focusMode', state.focusMode);
      },
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        design: state.design,
        focusMode: state.focusMode,
        clipboardHistory: state.clipboardHistory,
        layoutPresets: state.layoutPresets,
      }),
    }
  )
);

// Zustand persist doesn't support getters on state well for widgets — expose selectors
export function useWidgets() {
  return useStore((s) => {
    const p = s.profiles.find((pr) => pr.id === s.activeProfileId) || s.profiles[0];
    return p?.widgets ?? [];
  });
}

export function useWallpaper() {
  return useStore((s) => {
    const p = s.profiles.find((pr) => pr.id === s.activeProfileId) || s.profiles[0];
    return p?.wallpaper ?? {};
  });
}
