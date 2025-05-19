export const createFlowFields = (configs, w, h) => {
  const res = 20;
  return configs.map(cfg => {
    const grid = [];
    for (let y = 0; y < h; y += res) {
      for (let x = 0; x < w; x += res) {
        grid.push({ x, y, angle: Math.random() * Math.PI * 2 });
      }
    }
    return {
      resolution: res,
      grid,
      color: cfg.color,
      secondaryColor: cfg.secondaryColor,
      intensity: cfg.intensity,
      flow: cfg.flow,
      noiseScale: 0.003 + cfg.complexity * 0.005,
      noiseSpeed: 0.0005 + cfg.flow * 0.001
    };
  });
};

export const createLayers = (configs, w, h) => {
  const layers = [];
  configs.forEach(cfg => {
    /* organic blobs */
    for (let i = 0; i < 3; i++) {
      layers.push({
        type: cfg.shape || "organicBlob",
        x: Math.random() * w,
        y: Math.random() * h,
        size: 100 + Math.random() * 200,
        color: i % 2 ? cfg.color : cfg.secondaryColor,
        alpha: 0.05 + Math.random() * 0.1,
        points: 5 + Math.floor(Math.random() * 3),
        amplitude: 20 + Math.random() * 40,
        speed: 0.0003 + Math.random() * 0.0005,
        offset: Math.random() * Math.PI * 2
      });
    }
    /* flowing lines */
    for (let i = 0; i < 5; i++) {
      layers.push({
        type: "flowingLine",
        startX: Math.random() * w,
        startY: Math.random() * h,
        length: 200 + Math.random() * 300,
        segments: 10 + Math.floor(Math.random() * 15),
        thickness: 0.5 + Math.random() * 1.5,
        color: i % 2 ? cfg.color : cfg.secondaryColor,
        alpha: 0.1 + Math.random() * 0.2,
        speed: 0.0002 + cfg.flow * 0.0006,
        flowScale: 0.5 + cfg.flow * 0.5
      });
    }
  });
  return layers;
};

export const createParticles = (configs, w, h) => {
  const particles = [];
  configs.forEach(cfg => {
    const n = Math.floor(30 + cfg.intensity * 50);
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * 3,
        color: Math.random() > 0.5 ? cfg.color : cfg.secondaryColor,
        alpha: 0.3 + Math.random() * 0.4,
        speed: 0.2 + cfg.flow * 0.8,
        flowInfluence: 0.5 + cfg.flow * 0.5,
        angle: Math.random() * Math.PI * 2,
        pulse: 0.01 + Math.random() * 0.03
      });
    }
  });
  return particles;
};

//resizes the canvas to match its parent, returns true if dimensions changed
export function fitCanvasToContainer(canvas, fixedHeight = 500) {
  if (!canvas) return false;

  const dpr       = window.devicePixelRatio || 1;
  const parent    = canvas.parentElement;
  const cssWidth  = parent?.clientWidth || 800;
  const cssHeight = fixedHeight;

  if (canvas.style.width !== `${cssWidth}px`) {
    const ctx = canvas.getContext("2d");

    canvas.width       = cssWidth  * dpr;   // bitmap
    canvas.height      = cssHeight * dpr;
    canvas.style.width  = `${cssWidth}px`;  // css
    canvas.style.height = `${cssHeight}px`;

    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);
    return true;
  }
  return false;
}
