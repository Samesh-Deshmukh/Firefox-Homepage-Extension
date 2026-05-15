import React, { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { snapPosition, snapSize, getAlignmentSnap } from '../utils/grid';

export default function WidgetWrapper({ widget, children }) {
  const editorMode = useStore((s) => s.editorMode);
  const design = useStore((s) => s.design);
  const widgets = useStore((s) => {
    const p = s.profiles.find((pr) => pr.id === s.activeProfileId) || s.profiles[0];
    return p?.widgets ?? [];
  });
  const updateWidget = useStore((s) => s.updateWidget);
  const removeWidget = useStore((s) => s.removeWidget);
  const toggleWidgetLock = useStore((s) => s.toggleWidgetLock);
  const duplicateWidget = useStore((s) => s.duplicateWidget);
  const setActiveWidgetSettings = useStore((s) => s.setActiveWidgetSettings);
  const setAlignmentGuides = useStore((s) => s.setAlignmentGuides);

  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const snap = design.snapToGrid;
  const gridSize = design.gridSize || 20;
  const alignGuides = design.showAlignmentGuides;

  const handleMouseDown = useCallback(
    (e) => {
      if (!editorMode || widget.locked) return;
      if (e.button !== 0) return;
      if (!e.target.closest('.widget-drag-handle')) return;

      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX - widget.position.x;
      const startY = e.clientY - widget.position.y;
      setIsDragging(true);

      const onMove = (ev) => {
        let x = ev.clientX - startX;
        let y = ev.clientY - startY;
        const pos = snapPosition(x, y, widget.size, gridSize, snap);
        x = pos.x;
        y = pos.y;

        if (alignGuides) {
          const moving = { ...widget, position: { x, y } };
          const others = widgets.filter((w) => w.id !== widget.id);
          const { position, guides } = getAlignmentSnap(moving, others);
          x = position.x;
          y = position.y;
          setAlignmentGuides(guides);
        }

        updateWidget(widget.id, { position: { x, y } });
      };

      const onUp = () => {
        setIsDragging(false);
        setAlignmentGuides({ x: [], y: [] });
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [widget, editorMode, snap, gridSize, alignGuides, widgets, updateWidget, setAlignmentGuides]
  );

  const handleResizeDown = useCallback(
    (e) => {
      if (!editorMode || widget.locked) return;
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = widget.size.w;
      const startH = widget.size.h;

      const onMove = (ev) => {
        const size = snapSize(
          startW + ev.clientX - startX,
          startH + ev.clientY - startY,
          gridSize,
          snap
        );
        updateWidget(widget.id, { size });
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [widget, editorMode, snap, gridSize, updateWidget]
  );

  const handleContextMenu = (e) => {
    if (!editorMode) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContext = () => setContextMenu(null);

  const WIDGET_LABELS = {
    clock: '🕐 Clock',
    date: '📅 Date',
    welcome: '👋 Welcome',
    weather: '🌤️ Weather',
    search: '🔍 Search',
    shortcuts: '⚡ Shortcuts',
    todo: '✅ Todo',
    timer: '⏱️ Timer',
    calendar: '📆 Calendar',
    clipboard: '📋 Clipboard',
    focus: '🎯 Focus',
  };

  return (
    <>
      <div
        className={`widget-wrapper${isDragging ? ' dragging' : ''}${widget.locked ? ' locked' : ''}${!editorMode ? ' view-mode' : ''}`}
        style={{
          left: widget.position.x,
          top: widget.position.y,
          width: widget.size.w,
          height: widget.size.h,
        }}
        onContextMenu={handleContextMenu}
      >
        {editorMode && !widget.locked && (
          <div className="widget-drag-handle" onMouseDown={handleMouseDown} title="Drag to move">
            <span className="widget-drag-grip" />
            <span className="widget-drag-label">{WIDGET_LABELS[widget.type] || widget.type}</span>
          </div>
        )}
        <div className="widget-content">{children}</div>
        {editorMode && !widget.locked && (
          <div className="widget-resize-handle" onMouseDown={handleResizeDown} />
        )}
        {widget.locked && editorMode && <div className="widget-lock-badge">🔒</div>}
      </div>

      {contextMenu && editorMode && (
        <>
          <div className="context-overlay" onClick={closeContext} />
          <div
            className="context-menu"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 200),
              top: Math.min(contextMenu.y, window.innerHeight - 180),
            }}
          >
            <div className="context-menu-title">{WIDGET_LABELS[widget.type] || widget.type}</div>
            <button type="button" onClick={() => { setActiveWidgetSettings(widget.id); closeContext(); }}>
              <span className="context-icon">⚙️</span> Settings
            </button>
            <button type="button" onClick={() => { toggleWidgetLock(widget.id); closeContext(); }}>
              <span className="context-icon">{widget.locked ? '🔓' : '🔒'}</span>
              {widget.locked ? 'Unlock' : 'Lock'}
            </button>
            <button type="button" onClick={() => { duplicateWidget(widget.id); closeContext(); }}>
              <span className="context-icon">⧉</span> Duplicate
            </button>
            <div className="context-divider" />
            <button type="button" className="danger" onClick={() => { removeWidget(widget.id); closeContext(); }}>
              <span className="context-icon">🗑</span> Remove
            </button>
          </div>
        </>
      )}
    </>
  );
}
