/** Minimal iCal parser for VEVENT summaries (Google Calendar public feed) */
export function parseIcalEvents(icsText, maxEvents = 8) {
  const blocks = icsText.split('BEGIN:VEVENT');
  const events = [];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const summary = extractField(block, 'SUMMARY');
    const dtstart = extractField(block, 'DTSTART');
    if (!summary || !dtstart) continue;
    const start = parseIcalDate(dtstart);
    if (!start || Number.isNaN(start.getTime())) continue;
    events.push({ summary: unescapeIcal(summary), start });
  }

  const now = Date.now();
  return events
    .filter((e) => e.start.getTime() >= now - 3600000)
    .sort((a, b) => a.start - b.start)
    .slice(0, maxEvents);
}

function extractField(block, name) {
  const re = new RegExp(`^${name}[^:]*:(.+)$`, 'm');
  const m = block.match(re);
  return m ? m[1].trim().replace(/\r?\n /g, '') : null;
}

function parseIcalDate(raw) {
  const v = raw.replace(/;.*$/, '').trim();
  if (/^\d{8}T\d{6}Z?$/.test(v)) {
    const y = v.slice(0, 4);
    const mo = v.slice(4, 6);
    const d = v.slice(6, 8);
    const h = v.slice(9, 11);
    const mi = v.slice(11, 13);
    const s = v.slice(13, 15);
    const utc = v.endsWith('Z');
    if (utc) {
      return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
    }
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`);
  }
  if (/^\d{8}$/.test(v)) {
    const y = v.slice(0, 4);
    const mo = v.slice(4, 6);
    const d = v.slice(6, 8);
    return new Date(`${y}-${mo}-${d}T12:00:00`);
  }
  return new Date(v);
}

function unescapeIcal(s) {
  return s.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
}
