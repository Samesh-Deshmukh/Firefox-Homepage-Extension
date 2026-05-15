import React, { useState, useEffect } from 'react';

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ClockWidget({ config }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const is24 = config.format === '24h';
  const rawH = now.getHours();
  const h = is24 ? rawH : (rawH % 12 || 12);
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ampm = !is24 ? (rawH >= 12 ? 'PM' : 'AM') : null;

  const pad = n => String(n).padStart(2, '0');

  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="clock-widget">
      <div className="clock-time">
        <span className="clock-h">{pad(h)}</span>
        <span className="clock-colon">:</span>
        <span className="clock-m">{pad(m)}</span>

        {(config.showSeconds || ampm) && (
          <div className="clock-s-block">
            {config.showSeconds && <span className="clock-s">{pad(s)}</span>}
            {ampm             && <span className="clock-ampm">{ampm}</span>}
          </div>
        )}
      </div>

      {config.showDate && (
        <div className="clock-date">{dateStr}</div>
      )}
    </div>
  );
}