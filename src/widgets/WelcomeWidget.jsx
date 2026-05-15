import React from 'react';

function periodOfDay(h) {
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

export default function WelcomeWidget({ config }) {
  const h = new Date().getHours();
  const period = periodOfDay(h);
  const text = (config.message || 'Good {{period}}, {{name}}!')
    .replace(/\{\{period\}\}/gi, period)
    .replace(/\{\{name\}\}/gi, config.name || 'there');

  return (
    <div className="welcome-widget">
      <h1 className="welcome-text">{text}</h1>
    </div>
  );
}
