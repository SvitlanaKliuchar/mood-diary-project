// tiny helper that keeps numbers between min‑max (default 0–1)
// this prevents visual glitches or unexpected behavior from out-of-range values
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// mood -> base parameters
// hue/secHue in degrees, remaining props 0‑1 range
export const MOOD_BASE = {
  great: {
    hue: 255,
    secHue: 200,
    intensity: 0.8,
    flow: 0.7,
    complexity: 0.6,
    shape: "wave",
    saturation: 60,
    lightness: 60,
    secSaturation: 70,
    secLightness: 85,
  },
  good: {
    hue: 140,
    secHue: 165,
    intensity: 0.7,
    flow: 0.6,
    complexity: 0.5,
    shape: "blob",
    saturation: 55,
    lightness: 58,
    secSaturation: 65,
    secLightness: 82,
  },
  meh: {
    hue: 210,
    secHue: 210,
    intensity: 0.5,
    flow: 0.4,
    complexity: 0.3,
    shape: "square",
    saturation: 50,
    lightness: 55,
    secSaturation: 60,
    secLightness: 80,
  },
  bad: {
    hue: 30,
    secHue: 10,
    intensity: 0.6,
    flow: 0.3,
    complexity: 0.7,
    shape: "spike",
    saturation: 65,
    lightness: 50,
    secSaturation: 75,
    secLightness: 78,
  },
  awful: {
    hue: 355,
    secHue: 5,
    intensity: 0.5,
    flow: 0.2,
    complexity: 0.8,
    shape: "spike",
    saturation: 70,
    lightness: 48,
    secSaturation: 80,
    secLightness: 76,
  },
};

// emotion -> deltas (all stackable)
// optional shape overrides allow unique visual identity for strong emotions
export const EMOTION_MODIFIERS = {
  happy: {
    hueShift: 10,
    intensity: +0.1,
    flow: +0.05,
    complexity: -0.05,
    saturationShift: +5,
  },
  excited: {
    hueShift: 20,
    intensity: +0.25,
    flow: +0.1,
    complexity: +0.1,
    shape: "burst",
    shapePriority: 2,
  },
  grateful: {
    hueShift: 5,
    intensity: +0.05,
    flow: +0.05,
    complexity: -0.05,
    shape: "wave",
    shapePriority: 1,
  },
  content: { hueShift: -5, intensity: -0.05, flow: +0.05, complexity: -0.1 },
  relaxed: {
    hueShift: -20,
    intensity: -0.1,
    flow: +0.15,
    complexity: -0.15,
    shape: "ripple",
    shapePriority: 1,
  },
  bored: {
    hueShift: -30,
    intensity: -0.2,
    flow: -0.1,
    complexity: -0.15,
    shape: "flat",
    shapePriority: 1,
  },
  unsure: {
    hueShift: 35,
    intensity: +0.05,
    flow: -0.05,
    complexity: +0.1,
    shape: "swirl",
    shapePriority: 1,
  },
  tired: { hueShift: -25, intensity: -0.2, flow: -0.05, complexity: -0.05 },
  sad: {
    hueShift: -10,
    intensity: -0.15,
    flow: -0.1,
    complexity: +0.05,
    shape: "drip",
    shapePriority: 1,
  },
  stressed: { hueShift: 50, intensity: +0.15, flow: -0.2, complexity: +0.25 },
  angry: {
    hueShift: 60,
    intensity: +0.3,
    flow: -0.15,
    complexity: +0.2,
    shape: "spike",
    shapePriority: 3,
  },
  anxious: {
    hueShift: 40,
    intensity: +0.2,
    flow: -0.1,
    complexity: +0.15,
    shape: "ripple",
    shapePriority: 2,
  },
};

// export function buildArtConfig(entry) {
//   const { mood = 'meh', emotions = [] } = entry;

//   // clone base config and fill optional color parameters
//   const cfg = { ...MOOD_BASE[mood] };
//   cfg.saturation = cfg.saturation ?? 60;
//   cfg.lightness = cfg.lightness ?? 60;
//   cfg.secSaturation = cfg.secSaturation ?? 70;
//   cfg.secLightness = cfg.secLightness ?? 85;

//   let currentShape = cfg.shape;
//   let currentPriority = 0;

//   // apply each emotion delta
//   emotions.forEach(em => {
//     const mod = EMOTION_MODIFIERS[em];
//     if (!mod) return;

//     // shape priority override system
//     const priority = mod.shapePriority ?? 0;
//     if (mod.shape && priority >= currentPriority) {
//       currentShape = mod.shape;
//       currentPriority = priority;
//     }

//     cfg.hue = (cfg.hue + (mod.hueShift ?? 0) + 360) % 360;
//     cfg.secHue = (cfg.secHue + (mod.hueShift ?? 0) + 360) % 360;

//     cfg.intensity = clamp(cfg.intensity + (mod.intensity ?? 0));
//     cfg.flow = clamp(cfg.flow + (mod.flow ?? 0));
//     cfg.complexity = clamp(cfg.complexity + (mod.complexity ?? 0));

//     cfg.saturation = clamp(cfg.saturation + (mod.saturationShift ?? 0), 0, 100);
//     cfg.lightness = clamp(cfg.lightness + (mod.lightnessShift ?? 0), 0, 100);
//     cfg.secSaturation = clamp(cfg.secSaturation + (mod.secSaturationShift ?? 0), 0, 100);
//     cfg.secLightness = clamp(cfg.secLightness + (mod.secLightnessShift ?? 0), 0, 100);
//   });

//   cfg.shape = currentShape;

//   // convert to HSL color strings
//   const color = `hsl(${cfg.hue}, ${cfg.saturation}%, ${cfg.lightness}%)`;
//   const secondaryColor = `hsl(${cfg.secHue}, ${cfg.secSaturation}%, ${cfg.secLightness}%)`;

//   return Object.freeze({
//     color,
//     secondaryColor,
//     intensity: cfg.intensity,
//     flow: cfg.flow,
//     complexity: cfg.complexity,
//     shape: cfg.shape,
//     mood,
//     emotions: [...emotions],
//     date: entry.date ?? null
//   });
// }

//v2 - shape blending approach (more of a steven universe vibe)
export function buildArtConfig(entry) {
  const { mood = "meh", emotions = [] } = entry;

  // clone base config and fill optional color parameters
  const cfg = { ...MOOD_BASE[mood] };
  cfg.saturation = cfg.saturation ?? 60;
  cfg.lightness = cfg.lightness ?? 60;
  cfg.secSaturation = cfg.secSaturation ?? 70;
  cfg.secLightness = cfg.secLightness ?? 85;

  const shapeCounts = {};
  shapeCounts[cfg.shape] = 1; // start with base shape weighted once

  // apply each emotion delta
  emotions.forEach((em) => {
    const mod = EMOTION_MODIFIERS[em];
    if (!mod) return;

    if (mod.shape) {
      shapeCounts[mod.shape] = (shapeCounts[mod.shape] ?? 0) + 1;
    }

    cfg.hue = (cfg.hue + (mod.hueShift ?? 0) + 360) % 360;
    cfg.secHue = (cfg.secHue + (mod.hueShift ?? 0) + 360) % 360;

    cfg.intensity = clamp(cfg.intensity + (mod.intensity ?? 0));
    cfg.flow = clamp(cfg.flow + (mod.flow ?? 0));
    cfg.complexity = clamp(cfg.complexity + (mod.complexity ?? 0));

    cfg.saturation = clamp(cfg.saturation + (mod.saturationShift ?? 0), 0, 100);
    cfg.lightness = clamp(cfg.lightness + (mod.lightnessShift ?? 0), 0, 100);
    cfg.secSaturation = clamp(
      cfg.secSaturation + (mod.secSaturationShift ?? 0),
      0,
      100,
    );
    cfg.secLightness = clamp(
      cfg.secLightness + (mod.secLightnessShift ?? 0),
      0,
      100,
    );
  });

  // resolve shape blending
  const sortedShapes = Object.entries(shapeCounts)
    .sort((a, b) => b[1] - a[1]) // sort by count descending
    .map(([shape]) => shape);

  // blend shape names with hyphen or slash
  const blendedShape =
    sortedShapes.length === 1
      ? sortedShapes[0]
      : sortedShapes.slice(0, 3).join("/"); // limit blend to top 3 to avoid explosion

  cfg.shape = blendedShape;

  const color = `hsl(${cfg.hue}, ${cfg.saturation}%, ${cfg.lightness}%)`;
  const secondaryColor = `hsl(${cfg.secHue}, ${cfg.secSaturation}%, ${cfg.secLightness}%)`;

  return Object.freeze({
    color,
    secondaryColor,
    intensity: cfg.intensity,
    flow: cfg.flow,
    complexity: cfg.complexity,
    shape: cfg.shape,
    mood,
    emotions: [...emotions],
    date: entry.date ?? null,
  });
}
