import React, { useState, useEffect, useRef } from 'react';

// WMO Weather Interpretation Codes → emoji + label
const WMO = {
  0:  { e: '☀️',  l: 'Clear sky' },
  1:  { e: '🌤️', l: 'Mainly clear' },
  2:  { e: '⛅',  l: 'Partly cloudy' },
  3:  { e: '☁️',  l: 'Overcast' },
  45: { e: '🌫️', l: 'Foggy' },
  48: { e: '🌫️', l: 'Icy fog' },
  51: { e: '🌦️', l: 'Light drizzle' },
  53: { e: '🌦️', l: 'Drizzle' },
  55: { e: '🌧️', l: 'Heavy drizzle' },
  61: { e: '🌧️', l: 'Light rain' },
  63: { e: '🌧️', l: 'Rain' },
  65: { e: '🌧️', l: 'Heavy rain' },
  71: { e: '🌨️', l: 'Light snow' },
  73: { e: '❄️',  l: 'Snow' },
  75: { e: '❄️',  l: 'Heavy snow' },
  80: { e: '🌦️', l: 'Rain showers' },
  81: { e: '🌧️', l: 'Showers' },
  82: { e: '⛈️',  l: 'Heavy showers' },
  95: { e: '⛈️',  l: 'Thunderstorm' },
  96: { e: '⛈️',  l: 'Thunderstorm' },
  99: { e: '⛈️',  l: 'Severe storm' },
};

async function geocode(city) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  const data = await res.json();
  if (!data.results?.[0]) throw new Error('City not found');
  return data.results[0]; // { latitude, longitude, name, country }
}

async function fetchWeather(lat, lon, unit) {
  const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relative_humidity_2m` +
    `&temperature_unit=${tempUnit}&windspeed_unit=kmh&timezone=auto`
  );
  return res.json();
}

export default function WeatherWidget({ config }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const prevCity = useRef(null);
  const prevUnit = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState(s => ({ ...s, status: 'loading' }));
      try {
        const geo     = await geocode(config.city);
        const weather = await fetchWeather(geo.latitude, geo.longitude, config.unit);
        if (cancelled) return;

        const cur  = weather.current;
        const code = cur.weathercode;
        const info = WMO[code] || { e: '🌡️', l: 'Unknown' };

        setState({
          status: 'ok',
          error: null,
          data: {
            emoji:     info.e,
            label:     info.l,
            temp:      Math.round(cur.temperature_2m),
            feels:     Math.round(cur.apparent_temperature),
            humidity:  cur.relative_humidity_2m,
            wind:      Math.round(cur.windspeed_10m),
            unit:      config.unit === 'fahrenheit' ? '°F' : '°C',
            city:      geo.name,
            country:   geo.country,
          }
        });
      } catch (err) {
        if (!cancelled) setState({ status: 'error', data: null, error: err.message });
      }
    }

    load();
    // Refresh every 10 minutes
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [config.city, config.unit]);

  const { status, data, error } = state;

  if (status === 'loading') {
    return (
      <div className="weather-widget">
        <div className="weather-loading">Loading weather…</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="weather-widget">
        <div className="weather-error" style={{ flexDirection: 'column', gap: 4, textAlign: 'center' }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span>{error}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Check city name in settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <span className="weather-emoji">{data.emoji}</span>
        <div>
          <div className="weather-temp">{data.temp}{data.unit}</div>
          <div className="weather-feels">Feels like {data.feels}{data.unit}</div>
        </div>
      </div>
      <div className="weather-desc">{data.label}</div>
      <div className="weather-location">{data.city}, {data.country}</div>
      <div className="weather-details">
        <span>💧 {data.humidity}%</span>
        <span>💨 {data.wind} km/h</span>
      </div>
    </div>
  );
}