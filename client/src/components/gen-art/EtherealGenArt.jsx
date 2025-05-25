import React, { useEffect, useRef, useState, useCallback } from "react";
import { buildArtConfig } from "@/data/gen-art-mapping.js";
import {
  fitCanvasToContainer,
  createFlowFields,
  createLayers,
  createParticles,
} from "../../utils/genArtHelpers";

const EtherealGenArt = ({ moodLogs }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const artConfigs = useRef(moodLogs.map(buildArtConfig));
  const isMountedRef = useRef(true); // track component mount status

  const [isAnimating, setIsAnimating] = useState(true);

  const animationState = useRef({
    time: 0,
    flowFields: [],
    layers: [],
    particles: [],
    lastFrameTime: 0,
  });

  // safe cleanup function
  const cleanupAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // safe animation loop
  const startLoop = useCallback(() => {
    // cancel any existing animation first
    cleanupAnimation();
    
    const animate = (ts) => {
      // double check: component still mounted AND should animate
      if (!isMountedRef.current || !isAnimating) {
        cleanupAnimation();
        return;
      }

      const prev = animationState.current.lastFrameTime || ts;
      const dt = ts - prev;
      animationState.current.lastFrameTime = ts;
      animationState.current.time += dt;
      
      try {
        renderFrame(dt / 1000);
      } catch (error) {
        console.error('Animation frame error:', error);
        cleanupAnimation();
        return;
      }

      // safe recursive call: only schedule if still mounted and animating
      if (isMountedRef.current && isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // initial animation frame
    if (isMountedRef.current && isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimating, cleanupAnimation]);

  //mount + mood updates
  useEffect(() => {
    artConfigs.current = moodLogs.map(buildArtConfig);

    const canvas = canvasRef.current;
    if (!canvas) return;

    fitCanvasToContainer(canvas);
    setupArt(artConfigs.current);
    if (isAnimating) startLoop();

    // cleanup
    return cleanupAnimation;
  }, [moodLogs, isAnimating, startLoop, cleanupAnimation]);

  //resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ro = new ResizeObserver(() => {
      if (isMountedRef.current && fitCanvasToContainer(canvas)) {
        setupArt(artConfigs.current);
      }
    });
    
    ro.observe(canvas.parentElement);
    
    return () => {
      ro.disconnect();
    };
  }, []);

  // component unmount cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false; // mark as unmounted
      cleanupAnimation(); // clean up animations
    };
  }, [cleanupAnimation]);

  //setup
  const setupArt = (cfgs) => {
    const canvas = canvasRef.current;
    if (!canvas || !isMountedRef.current) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    animationState.current = {
      time: 0,
      flowFields: createFlowFields(cfgs, w, h),
      layers: createLayers(cfgs, w, h),
      particles: createParticles(cfgs, w, h),
      lastFrameTime: 0,
    };
  };

  //frame render
  const renderFrame = (dt) => {
    const canvas = canvasRef.current;
    if (!canvas || !isMountedRef.current) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    //fade clear
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(0, 0, w, h);

    updateFlowFields(dt);
    renderLayers(ctx, w, h);
    updateAndRenderParticles(ctx, w, h, dt);
    applyFinalEffects(ctx, w, h);
  };

  //simulation helpers
  const updateFlowFields = (dt) => {
    if (!isMountedRef.current) return;
    
    const { time, flowFields } = animationState.current;
    flowFields.forEach((f) => {
      f.grid.forEach((p) => {
        const n =
          Math.sin(p.x * f.noiseScale + time * f.noiseSpeed) *
          Math.cos(p.y * f.noiseScale - time * f.noiseSpeed);
        p.angle = n * Math.PI * 2;
      });
    });
  };

  const renderLayers = (ctx, w, h) => {
    if (!isMountedRef.current) return;
    
    const t = animationState.current.time;
    animationState.current.layers.forEach((l) => {
      ctx.save();
      switch (l.type) {
        case "organicBlob":
          renderBlob(ctx, l, t);
          break;
        case "flowingLine":
          renderFlowLine(ctx, l, t);
          break;
        case "spike":
          renderSpike(ctx, l, t);
          break;
        case "burst":
          renderBurst(ctx, l, t);
          break;
        case "ripple":
          renderRipple(ctx, l, t);
          break;
        case "drip":
          renderDrip(ctx, l, t);
          break;
        default:
          renderBlob(ctx, l, t);
          break;
      }
      ctx.restore();
    });
  };

  const updateAndRenderParticles = (ctx, w, h, dt) => {
    if (!isMountedRef.current) return;
    
    const t = animationState.current.time;
    const fld = animationState.current.flowFields[0];

    animationState.current.particles.forEach((p) => {
      //move
      const res = fld.resolution;
      const gx = Math.floor(p.x / res);
      const gy = Math.floor(p.y / res);
      const cols = Math.ceil(w / res);
      const idx = gy * cols + gx;
      const flowA = fld.grid[idx]?.angle || 0;
      const ang = flowA * p.flowInfluence + p.angle * (1 - p.flowInfluence);

      p.x += Math.cos(ang) * p.speed * dt;
      p.y += Math.sin(ang) * p.speed * dt;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      //draw
      const pulse = p.size * (0.8 + Math.sin(t * p.pulse) * 0.2);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulse * 2);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulse * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const renderBlob = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = l.color;
    const pts = l.points || 5;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const r = l.size + Math.sin(a * 3 + t * l.speed + l.offset) * l.amplitude;
      ctx[i ? "lineTo" : "moveTo"](
        l.x + Math.cos(a) * r,
        l.y + Math.sin(a) * r,
      );
    }
    ctx.closePath();
    ctx.fill();
  };

  const renderFlowLine = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.strokeStyle = l.color;
    ctx.lineWidth = l.thickness;
    const seg = l.length / l.segments;
    let x = l.startX,
      y = l.startY;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < l.segments; i++) {
      const a = Math.sin(t * l.speed + i * 0.5) * Math.PI * l.flowScale;
      x += Math.cos(a) * seg;
      y += Math.sin(a) * seg;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const renderSpike = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = l.color;
    const n = 24;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = l.size + Math.sin(a * n + t * l.speed) * l.amplitude;
      ctx.lineTo(l.x + Math.cos(a) * r, l.y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  };

  const renderBurst = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.strokeStyle = l.color;
    ctx.lineWidth = 1;
    const rays = 40;
    ctx.beginPath();
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2;
      const r = l.size + Math.sin(t * l.speed + i) * l.amplitude;
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x + Math.cos(a) * r, l.y + Math.sin(a) * r);
    }
    ctx.stroke();
  };

  const renderRipple = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.strokeStyle = l.color;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const r =
        l.size * i * 0.4 + Math.sin(t * l.speed + i) * l.amplitude * 0.1;
      ctx.beginPath();
      ctx.arc(l.x, l.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const renderDrip = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = l.color;
    const drips = 5;
    for (let i = 0; i < drips; i++) {
      const a = (i / drips) * Math.PI * 2;
      const xb = l.x + Math.cos(a) * l.size * 0.5;
      const yb = l.y + Math.sin(a) * l.size * 0.5;
      const len = l.size * (0.3 + Math.sin(t * l.speed + i) * 0.7);
      ctx.beginPath();
      ctx.moveTo(xb, yb);
      ctx.quadraticCurveTo(
        xb + Math.cos(a) * len * 0.5,
        yb + Math.sin(a) * len * 1.5,
        xb + Math.cos(a) * len,
        yb + Math.sin(a) * len,
      );
      ctx.closePath();
      ctx.fill();
    }
  };

  const applyFinalEffects = (ctx, w, h) => {
    //vignette
    const g = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.3,
      w / 2,
      h / 2,
      Math.min(w, h) * 0.8,
    );
    g.addColorStop(0, "transparent");
    g.addColorStop(1, "rgba(250,250,250,0.2)");
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    //grain
    ctx.globalAlpha = 0.01;
    for (let i = 0; i < w * h * 0.0003; i++) {
      ctx.fillStyle =
        Math.random() > 0.5 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  };

  return (
    <div style={{ width: "100%", height: "500px", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      />
    </div>
  );
};

export default EtherealGenArt;