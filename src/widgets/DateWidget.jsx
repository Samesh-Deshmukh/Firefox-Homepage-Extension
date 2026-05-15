import React, { useState, useEffect } from 'react';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DateWidget({ config }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const weekday = WEEKDAYS[now.getDay()];
  const day = now.getDate();
  const month = config.format === 'short' ? MONTHS_SHORT[now.getMonth()] : MONTHS_LONG[now.getMonth()];
  const year = now.getFullYear();

  return (
    <div className="date-widget">
      {config.showWeekday && <div className="date-weekday">{weekday}</div>}
      <div className="date-main">
        <span className="date-day">{day}</span>
        <span className="date-month-year">
          {month} {year}
        </span>
      </div>
    </div>
  );
}
