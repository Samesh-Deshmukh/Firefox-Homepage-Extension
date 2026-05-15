import React, { useState, useEffect } from 'react';
import { parseIcalEvents } from '../utils/ical';
import { notifyBackground } from '../utils/storage';

export default function CalendarWidget({ config }) {
  const [state, setState] = useState({ status: 'idle', events: [], error: null });

  useEffect(() => {
    const url = config.icalUrl?.trim();
    if (!url) {
      setState({ status: 'empty', events: [], error: null });
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, status: 'loading' }));
      try {
        let text;
        const proxied = await notifyBackground('fetchUrl', { url });
        if (proxied?.text) text = proxied.text;
        else if (proxied?.error) throw new Error(proxied.error);
        if (!text) {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Could not load calendar feed');
          text = await res.text();
        }
        if (cancelled) return;
        const events = parseIcalEvents(text, config.maxEvents || 5);
        setState({ status: 'ok', events, error: null });
      } catch (err) {
        if (!cancelled) setState({ status: 'error', events: [], error: err.message });
      }
    }

    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [config.icalUrl, config.maxEvents]);

  if (!config.icalUrl?.trim()) {
    return (
      <div className="calendar-widget">
        <p className="calendar-hint">
          Add your Google Calendar <strong>public iCal URL</strong> in widget settings.
        </p>
      </div>
    );
  }

  if (state.status === 'loading') {
    return <div className="calendar-widget"><p className="calendar-loading">Loading events…</p></div>;
  }

  if (state.status === 'error') {
    return (
      <div className="calendar-widget">
        <p className="calendar-error">{state.error}</p>
      </div>
    );
  }

  return (
    <div className="calendar-widget">
      <ul className="calendar-events">
        {state.events.map((ev, i) => (
          <li key={`${ev.start}-${i}`}>
            <span className="calendar-event-time">
              {ev.start.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            <span className="calendar-event-title">{ev.summary}</span>
          </li>
        ))}
        {state.events.length === 0 && (
          <li className="calendar-empty">No upcoming events</li>
        )}
      </ul>
    </div>
  );
}
