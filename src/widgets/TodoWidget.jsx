import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function TodoWidget({ widgetId, config }) {
  const updateWidgetConfig = useStore((s) => s.updateWidgetConfig);
  const [input, setInput] = useState('');
  const items = config.items || [];

  const add = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    updateWidgetConfig(widgetId, {
      items: [...items, { id: `todo-${Date.now()}`, text, done: false }],
    });
    setInput('');
  };

  const toggle = (id) => {
    updateWidgetConfig(widgetId, {
      items: items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    });
  };

  const remove = (id) => {
    updateWidgetConfig(widgetId, { items: items.filter((i) => i.id !== id) });
  };

  return (
    <div className="todo-widget">
      <form className="todo-form" onSubmit={add}>
        <input
          className="todo-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task..."
        />
        <button type="submit" className="todo-add-btn">+</button>
      </form>
      <ul className="todo-list">
        {items.map((item) => (
          <li key={item.id} className={item.done ? 'done' : ''}>
            <label className="todo-check">
              <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} />
              <span>{item.text}</span>
            </label>
            <button type="button" className="todo-remove" onClick={() => remove(item.id)} aria-label="Remove">
              ×
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="todo-empty">No tasks yet</li>}
      </ul>
    </div>
  );
}
