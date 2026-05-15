/** Relative luminance 0–1 */
export function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function parseHexColor(hex) {
  const h = (hex || '#070b14').replace('#', '');
  if (h.length < 6) return { r: 7, g: 11, b: 20 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToAccent(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const sat = 55;
  const light = Math.min(72, Math.max(42, l * 100 + 18));
  return `hsl(${Math.round(h * 360)}, ${sat}%, ${Math.round(light)}%)`;
}

/**
 * Apply widget/text glass tokens from sampled background color.
 * @param {{ r: number, g: number, b: number }} rgb
 * @param {{ widgetGlassOpacity?: number, adaptiveWidgets?: boolean, accentColor?: string }} design
 */
export function applyAdaptiveTheme(rgb, design) {
  if (!design?.adaptiveWidgets) return;
  const root = document.documentElement;
  const lum = luminance(rgb.r, rgb.g, rgb.b);
  const isLight = lum > 0.45;
  const glassA = design.widgetGlassOpacity ?? 0.12;

  if (isLight) {
    root.style.setProperty('--text-primary', 'rgba(18, 22, 32, 0.94)');
    root.style.setProperty('--text-secondary', 'rgba(18, 22, 32, 0.62)');
    root.style.setProperty('--text-muted', 'rgba(18, 22, 32, 0.38)');
    root.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${glassA})`);
    root.style.setProperty('--glass-border', `rgba(18, 22, 32, ${Math.min(0.22, glassA + 0.08)})`);
    root.style.setProperty('--glass-border-hover', 'rgba(18, 22, 32, 0.32)');
    root.style.setProperty('--shadow-md', '0 8px 32px rgba(0, 0, 0, 0.12)');
    root.dataset.adaptiveTheme = 'light';
  } else {
    root.style.setProperty('--text-primary', 'rgba(255, 255, 255, 0.95)');
    root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.5)');
    root.style.setProperty('--text-muted', 'rgba(255, 255, 255, 0.28)');
    root.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${glassA})`);
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.11)');
    root.style.setProperty('--glass-border-hover', 'rgba(255, 255, 255, 0.22)');
    root.style.setProperty('--shadow-md', '0 8px 32px rgba(0, 0, 0, 0.35)');
    root.dataset.adaptiveTheme = 'dark';
  }

  if (design.adaptiveAccent !== false) {
    const accent = rgbToAccent(rgb.r, rgb.g, rgb.b);
    root.style.setProperty('--accent', accent);
  }
}

export function sampleImageColors(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 40;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n += 1;
        }
        if (!n) {
          reject(new Error('empty'));
          return;
        }
        resolve({ r: r / n, g: g / n, b: b / n });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('load failed'));
    img.src = src;
  });
}

export async function resolveBackgroundRgb(wallpaper) {
  if (wallpaper.backgroundType === 'solid') {
    return parseHexColor(wallpaper.backgroundColor);
  }
  if (wallpaper.backgroundType === 'image' && wallpaper.backgroundImage) {
    try {
      return await sampleImageColors(wallpaper.backgroundImage);
    } catch {
      return parseHexColor('#1a2030');
    }
  }
  return parseHexColor('#070b14');
}
