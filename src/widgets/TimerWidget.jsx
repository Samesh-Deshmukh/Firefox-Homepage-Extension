import React, { useState, useEffect, useRef } from 'react';

function formatMs(ms) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimerWidget({ config }) {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const endRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    tickRef.current = setInterval(() => {
      const left = (endRef.current || 0) - Date.now();
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        clearInterval(tickRef.current);
      }
    }, 200);
    return () => clearInterval(tickRef.current);
  }, [running]);

  const start = (minutes) => {
    const ms = minutes * 60 * 1000;
    endRef.current = Date.now() + ms;
    setRemaining(ms);
    setRunning(true);
  };

  const pause = () => {
    setRunning(false);
    if (endRef.current) setRemaining(endRef.current - Date.now());
  };

  const reset = () => {
    setRunning(false);
    setRemaining(0);
    endRef.current = null;
  };

  return (
    <div className="timer-widget">
      <div className="timer-display">{formatMs(remaining)}</div>
      <div className="timer-actions">
        {!running ? (
          <>
            <button type="button" onClick={() => start(config.defaultMinutes || 25)}>
              Start {config.defaultMinutes || 25}m
            </button>
            <button type="button" onClick={() => start(5)}>5m</button>
          </>
        ) : (
          <button type="button" onClick={pause}>Pause</button>
        )}
        <button type="button" className="timer-reset" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
