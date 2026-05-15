export const GRID_COLS = 24;
export const GRID_ROW_HEIGHT = 40;
export const GRID_GAP = 8;
export const GRID_MARGIN = 24;

export const WIDGET_TYPES = [
  'clock',
  'date',
  'welcome',
  'weather',
  'search',
  'shortcuts',
  'focus',
  'todo',
  'timer',
  'calendar',
  'clipboard',
];

export const WIDGET_META = {
  clock: { label: 'Clock', emoji: '🕐', desc: 'Time with 12/24h and seconds' },
  date: { label: 'Date', emoji: '📅', desc: 'Standalone date display' },
  welcome: { label: 'Welcome', emoji: '👋', desc: 'Personalized greeting' },
  weather: { label: 'Weather', emoji: '🌤️', desc: 'Open-Meteo, no API key' },
  search: { label: 'Search', emoji: '🔍', desc: 'Web search bar' },
  shortcuts: { label: 'Shortcuts', emoji: '⚡', desc: 'Small or large site links' },
  focus: { label: 'Focus', emoji: '🎯', desc: 'Block distracting sites' },
  todo: { label: 'Todo', emoji: '✅', desc: 'Task list' },
  timer: { label: 'Timer', emoji: '⏱️', desc: 'Countdown timer' },
  calendar: { label: 'Calendar', emoji: '📆', desc: 'Google Calendar (iCal)' },
  clipboard: { label: 'Clipboard', emoji: '📋', desc: 'Recent clipboard items' },
};

export const DEFAULT_DESIGN = {
  accentColor: '#4f9eff',
  fontUi: 'Outfit',
  fontDisplay: 'Bebas Neue',
  glassBlur: 22,
  glassOpacity: 0.055,
  widgetGlassOpacity: 0.1,
  widgetRadius: 16,
  shadowIntensity: 1,
  snapToGrid: true,
  gridSize: 20,
  showAlignmentGuides: true,
  adaptiveWidgets: true,
  adaptiveAccent: true,
};

export const DEFAULT_WALLPAPER = {
  backgroundType: 'animated',
  backgroundColor: '#070b14',
  backgroundImage: '',
  backgroundOverlay: 0.35,
};

export const DEFAULT_FOCUS = {
  enabled: false,
  blockedHosts: [
    'instagram.com',
    'www.instagram.com',
    'youtube.com',
    'www.youtube.com',
    'tiktok.com',
    'www.tiktok.com',
    'twitter.com',
    'x.com',
    'reddit.com',
    'www.reddit.com',
  ],
};

const defaultShortcuts = [
  { id: 'sc1', name: 'GitHub', url: 'https://github.com' },
  { id: 'sc2', name: 'Gmail', url: 'https://mail.google.com' },
  { id: 'sc3', name: 'YouTube', url: 'https://youtube.com' },
  { id: 'sc4', name: 'Reddit', url: 'https://reddit.com' },
];

/** Minimal starter layout — add more widgets from the + menu */
export const DEFAULT_WIDGETS = [
  {
    id: 'welcome-default',
    type: 'welcome',
    position: { x: 120, y: 72 },
    size: { w: 520, h: 68 },
    locked: false,
    config: { message: 'Good {{period}}, {{name}}!', name: 'there' },
  },
  {
    id: 'search-default',
    type: 'search',
    position: { x: 120, y: 168 },
    size: { w: 560, h: 56 },
    locked: false,
    config: { engine: 'google', placeholder: 'Search the web...' },
  },
  {
    id: 'shortcuts-default',
    type: 'shortcuts',
    position: { x: 120, y: 248 },
    size: { w: 560, h: 128 },
    locked: false,
    config: { mode: 'large', shortcuts: defaultShortcuts },
  },
  {
    id: 'clock-default',
    type: 'clock',
    position: { x: 120, y: 400 },
    size: { w: 300, h: 140 },
    locked: false,
    config: { format: '24h', showSeconds: true, showDate: true },
  },
  {
    id: 'weather-default',
    type: 'weather',
    position: { x: 440, y: 400 },
    size: { w: 260, h: 140 },
    locked: false,
    config: { city: 'Rotterdam', unit: 'celsius' },
  },
  {
    id: 'focus-default',
    type: 'focus',
    position: { x: 720, y: 400 },
    size: { w: 200, h: 140 },
    locked: false,
    config: {},
  },
];

export const DEFAULT_PROFILES = [
  {
    id: 'home',
    name: 'Home',
    widgets: DEFAULT_WIDGETS,
    wallpaper: { ...DEFAULT_WALLPAPER },
  },
  {
    id: 'work',
    name: 'Work',
    widgets: DEFAULT_WIDGETS.map((w) => ({
      ...w,
      id: `${w.id}-work`,
      config: { ...w.config },
    })),
    wallpaper: {
      backgroundType: 'solid',
      backgroundColor: '#0a0f1a',
      backgroundImage: '',
      backgroundOverlay: 0.35,
    },
  },
];
