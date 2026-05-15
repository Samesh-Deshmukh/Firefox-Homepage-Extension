# NovaDash — Custom Firefox New Tab

A customizable glass-style new tab dashboard for Firefox. Drag widgets on a snap grid, switch profiles (work/home), block distracting sites with Focus Mode, and sync settings via Firefox Sync.

## Features

- **Widgets:** clock, date, welcome, weather (Open-Meteo), search, shortcuts, todo, timer, calendar (Google iCal), clipboard
- **Editor mode:** toggle layout editing (Ctrl+E) — drag, resize, snap to grid, alignment guides
- **Command palette:** Ctrl+K — add widgets, switch profiles, export/import, focus mode
- **Profiles:** separate layouts and wallpapers per profile
- **Design system:** accent color, glass blur, radius, shadow intensity
- **Focus mode:** block configurable sites (Instagram, YouTube, etc.)
- **Data:** export/import JSON, Firefox Sync for settings

## Development

```bash
npm install
npm run dev      # Vite dev server (widgets only; not a full new tab)
npm run build    # Output to dist/
```

### Load in Firefox

1. Run `npm run build`
2. Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**
3. Select `dist/manifest.json`
4. Open a new tab

### Publish to AMO

1. Zip the **contents** of `dist/` (not the folder itself)
2. Submit at [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
3. Choose **On your own** for self-distribution or public listing

## Google Calendar (read-only)

1. Google Calendar → Settings → your calendar → **Secret address in iCal format**
2. Paste the URL into the Calendar widget settings

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K | Command palette |
| Ctrl+E | Toggle editor mode |
| Escape | Close panels / exit editor |

## Privacy

Weather uses [Open-Meteo](https://open-meteo.com/) (no API key). Settings are stored locally; optional Firefox Sync sends profile/layout JSON only (not large images).

## License

MIT — fork and customize freely.
