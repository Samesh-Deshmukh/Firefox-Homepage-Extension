import { useEffect } from 'react';
import { useStore, useWallpaper } from '../store/useStore';
import { applyDesignTokens } from '../utils/storage';
import { applyAdaptiveTheme, resolveBackgroundRgb } from '../utils/adaptiveTheme';

/** Re-apply design + adaptive widget colors when wallpaper or design changes */
export function useAdaptiveBackground() {
  const wallpaper = useWallpaper();
  const design = useStore((s) => s.design);

  useEffect(() => {
    applyDesignTokens(design);
    document.documentElement.style.setProperty(
      '--bg-overlay',
      String(wallpaper.backgroundOverlay ?? 0.35)
    );

    let cancelled = false;

    (async () => {
      if (!design.adaptiveWidgets) {
        delete document.documentElement.dataset.adaptiveTheme;
        applyDesignTokens(design);
        return;
      }
      const rgb = await resolveBackgroundRgb(wallpaper);
      if (cancelled) return;
      applyAdaptiveTheme(rgb, design);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    wallpaper.backgroundType,
    wallpaper.backgroundColor,
    wallpaper.backgroundImage,
    wallpaper.backgroundOverlay,
    design.adaptiveWidgets,
    design.adaptiveAccent,
    design.widgetGlassOpacity,
    design.glassBlur,
    design.widgetRadius,
    design.shadowIntensity,
    design.accentColor,
  ]);
}
