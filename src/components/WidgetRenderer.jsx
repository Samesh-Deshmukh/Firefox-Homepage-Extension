import React from 'react';
import ClockWidget from '../widgets/ClockWidget';
import DateWidget from '../widgets/DateWidget';
import WelcomeWidget from '../widgets/WelcomeWidget';
import WeatherWidget from '../widgets/WeatherWidget';
import SearchWidget from '../widgets/SearchWidget';
import ShortcutsWidget from '../widgets/ShortcutsWidget';
import TodoWidget from '../widgets/TodoWidget';
import TimerWidget from '../widgets/TimerWidget';
import CalendarWidget from '../widgets/CalendarWidget';
import ClipboardWidget from '../widgets/ClipboardWidget';
import FocusWidget from '../widgets/FocusWidget';

const MAP = {
  clock: ClockWidget,
  date: DateWidget,
  welcome: WelcomeWidget,
  weather: WeatherWidget,
  search: SearchWidget,
  shortcuts: ShortcutsWidget,
  todo: TodoWidget,
  timer: TimerWidget,
  calendar: CalendarWidget,
  clipboard: ClipboardWidget,
  focus: FocusWidget,
};

export default function WidgetRenderer({ widget }) {
  const Component = MAP[widget.type];
  if (!Component) {
    return <div style={{ padding: 16, fontSize: 12, color: 'var(--text-muted)' }}>Unknown widget: {widget.type}</div>;
  }
  return <Component widgetId={widget.id} config={widget.config} />;
}
