/** Snap value to grid step */
export function snapValue(value, gridSize) {
  const g = gridSize || 20;
  return Math.round(value / g) * g;
}

/** Snap position with viewport clamp */
export function snapPosition(x, y, size, gridSize, snapEnabled) {
  let nx = x;
  let ny = y;
  if (snapEnabled) {
    nx = snapValue(nx, gridSize);
    ny = snapValue(ny, gridSize);
  }
  nx = Math.max(0, Math.min(nx, window.innerWidth - size.w));
  ny = Math.max(0, Math.min(ny, window.innerHeight - size.h));
  return { x: nx, y: ny };
}

/** Snap size to grid */
export function snapSize(w, h, gridSize, snapEnabled, minW = 140, minH = 60) {
  let nw = Math.max(minW, w);
  let nh = Math.max(minH, h);
  if (snapEnabled) {
    nw = Math.max(minW, snapValue(nw, gridSize));
    nh = Math.max(minH, snapValue(nh, gridSize));
  }
  return { w: nw, h: nh };
}

/**
 * Find alignment guides when dragging — returns adjusted position + guide lines.
 * @param {object} moving - widget being moved
 * @param {object[]} others - other widgets
 * @param {number} threshold - px tolerance
 */
export function getAlignmentSnap(moving, others, threshold = 6) {
  const guides = { x: [], y: [] };
  let { x, y } = moving.position;
  const mw = moving.size.w;
  const mh = moving.size.h;
  const edges = {
    left: x,
    right: x + mw,
    centerX: x + mw / 2,
    top: y,
    bottom: y + mh,
    centerY: y + mh / 2,
  };

  let bestDx = threshold + 1;
  let bestDy = threshold + 1;
  let snapX = x;
  let snapY = y;

  for (const o of others) {
    if (o.id === moving.id) continue;
    const ox = o.position.x;
    const oy = o.position.y;
    const ow = o.size.w;
    const oh = o.size.h;
    const targetsX = [ox, ox + ow / 2, ox + ow];
    const targetsY = [oy, oy + oh / 2, oy + oh];
    const sourcesX = [edges.left, edges.centerX, edges.right];
    const sourcesY = [edges.top, edges.centerY, edges.bottom];

    for (const tx of targetsX) {
      for (let i = 0; i < sourcesX.length; i++) {
        const d = tx - sourcesX[i];
        if (Math.abs(d) < Math.abs(bestDx) && Math.abs(d) <= threshold) {
          bestDx = d;
          snapX = x + d;
          guides.x.push(tx);
        }
      }
    }
    for (const ty of targetsY) {
      for (let i = 0; i < sourcesY.length; i++) {
        const d = ty - sourcesY[i];
        if (Math.abs(d) < Math.abs(bestDy) && Math.abs(d) <= threshold) {
          bestDy = d;
          snapY = y + d;
          guides.y.push(ty);
        }
      }
    }
  }

  return {
    position: { x: snapX, y: snapY },
    guides: {
      x: [...new Set(guides.x)],
      y: [...new Set(guides.y)],
    },
  };
}
