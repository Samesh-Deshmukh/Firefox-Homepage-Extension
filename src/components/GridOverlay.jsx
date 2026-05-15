import React from 'react';
import { useStore } from '../store/useStore';

export default function GridOverlay() {
  const editorMode = useStore((s) => s.editorMode);
  const design = useStore((s) => s.design);
  const guides = useStore((s) => s.alignmentGuides);

  if (!editorMode || !design.snapToGrid) return null;

  const g = design.gridSize || 20;

  return (
    <>
      <svg className="grid-overlay" aria-hidden>
        <defs>
          <pattern id="novadash-grid" width={g} height={g} patternUnits="userSpaceOnUse">
            <path d={`M ${g} 0 L 0 0 0 ${g}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#novadash-grid)" />
      </svg>
      {design.showAlignmentGuides && (
        <>
          {guides.x.map((x, i) => (
            <div key={`gx-${i}`} className="align-guide align-guide-v" style={{ left: x }} />
          ))}
          {guides.y.map((y, i) => (
            <div key={`gy-${i}`} className="align-guide align-guide-h" style={{ top: y }} />
          ))}
        </>
      )}
    </>
  );
}
