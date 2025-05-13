// tiny helper that keeps numbers between 0‑1
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

//mood -> base parameters
//hue/secHue in degrees, remaining props 0‑1 range
export const MOOD_BASE = {
  great: { hue: 255, secHue: 200, intensity: 0.80, flow: 0.70, complexity: 0.60, shape: 'wave'  },
  good:  { hue: 140, secHue: 165, intensity: 0.70, flow: 0.60, complexity: 0.50, shape: 'blob'  },
  meh:   { hue: 210, secHue: 210, intensity: 0.50, flow: 0.40, complexity: 0.30, shape: 'square'},
  bad:   { hue:  30, secHue:  10, intensity: 0.60, flow: 0.30, complexity: 0.70, shape: 'spike' },
  awful: { hue: 355, secHue:   5, intensity: 0.50, flow: 0.20, complexity: 0.80, shape: 'spike' }
};


// emotion -> deltas (all stackable)
export const EMOTION_MODIFIERS = {
  happy:     { hueShift:  10, intensity: +0.10, flow: +0.05, complexity: -0.05                         },
  excited:   { hueShift:  20, intensity: +0.25, flow: +0.10, complexity: +0.10, shape: 'burst'        },
  grateful:  { hueShift:   5, intensity: +0.05, flow: +0.05, complexity: -0.05, shape: 'wave'         },
  content:   { hueShift:  -5, intensity: -0.05, flow: +0.05, complexity: -0.10                         },
  relaxed:   { hueShift: -20, intensity: -0.10, flow: +0.15, complexity: -0.15, shape: 'ripple'       },
  bored:     { hueShift: -30, intensity: -0.20, flow: -0.10, complexity: -0.15, shape: 'flat'         },
  unsure:    { hueShift:  35, intensity: +0.05, flow: -0.05, complexity: +0.10, shape: 'swirl'        },
  tired:     { hueShift: -25, intensity: -0.20, flow: -0.05, complexity: -0.05                         },
  sad:       { hueShift: -10, intensity: -0.15, flow: -0.10, complexity: +0.05, shape: 'drip'         },
  stressed:  { hueShift:  50, intensity: +0.15, flow: -0.20, complexity: +0.25                         },
  angry:     { hueShift:  60, intensity: +0.30, flow: -0.15, complexity: +0.20, shape: 'spike'        },
  anxious:   { hueShift:  40, intensity: +0.20, flow: -0.10, complexity: +0.15, shape: 'ripple'       }
};


export function buildArtConfig(entry) {
  const { mood = 'meh', emotions = [] } = entry;

  // clone base so original stays immutable
  const cfg = { ...MOOD_BASE[mood] };

  // apply each emotion delta
  emotions.forEach(em => {
    const mod = EMOTION_MODIFIERS[em];
    if (!mod) return; // ignore unknown tags

    if (mod.shape) cfg.shape = mod.shape;
    cfg.hue        = (cfg.hue    + (mod.hueShift ?? 0) + 360) % 360;
    cfg.secHue     = (cfg.secHue + (mod.hueShift ?? 0) + 360) % 360;
    cfg.intensity  = clamp(cfg.intensity  + (mod.intensity  ?? 0));
    cfg.flow       = clamp(cfg.flow       + (mod.flow       ?? 0));
    cfg.complexity = clamp(cfg.complexity + (mod.complexity ?? 0));
  });

  // convert to hsl strings once
  const color          = `hsl(${cfg.hue}, 60%, 60%)`;
  const secondaryColor = `hsl(${cfg.secHue}, 70%, 85%)`;

  return Object.freeze({
    color,
    secondaryColor,
    intensity : cfg.intensity,
    flow      : cfg.flow,
    complexity: cfg.complexity,
    shape     : cfg.shape,
    mood,
    emotions: [...emotions],
    date     : entry.date ?? null
  });
}
