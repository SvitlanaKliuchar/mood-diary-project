import React, { useEffect, useRef, useState } from "react";
import { buildArtConfig } from "@/data/gen-art-mapping.js"

const EtherealGenArt = ({ moodLogs }) => {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const animationRef = useRef(null);
  const artConfigs = useRef(moodLogs.map(buildArtConfig));

  // animation state
  const animationState = useRef({
    time: 0,
    flowFields: [],
    layers: [],
    particles: [],
    lastFrameTime: 0
  });

  useEffect(() => {
    // update art configurations when moodLogs change
    const cfg = moodLogs.map(buildArtConfig);
    // console.table(cfg);
    artConfigs.current = cfg;

    // initialize canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;

    // set canvas dimensions with higher resolution for better quality
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (container.clientWidth || 800) * dpr;
    canvas.height = 500 * dpr;
    canvas.style.width = `${container.clientWidth || 800}px`;
    canvas.style.height = "500px";
    ctx.scale(dpr, dpr);

    // initialize the art
    setupArt(artConfigs.current);

    // start animation loop
    if (isAnimating) {
      startAnimationLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [moodLogs, isAnimating]);

  const setupArt = (configs) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // reset animation state
    animationState.current = {
      time: 0,
      flowFields: [],
      layers: [],
      particles: [],
      lastFrameTime: 0
    };

    // generate flow fields based on moods
    animationState.current.flowFields = createFlowFields(configs, width, height);

    // create background layers
    animationState.current.layers = createLayers(configs, width, height);

    // generate particles for motion
    animationState.current.particles = createParticles(configs, width, height);
  };

  const createFlowFields = (configs, width, height) => {
    const flowFields = [];

    // create flow fields based on mood configurations
    configs.forEach(config => {
      const field = {
        resolution: 20, // grid size for the flow field
        grid: [],
        color: config.color,
        secondaryColor: config.secondaryColor,
        intensity: config.intensity,
        flow: config.flow,
        noiseScale: 0.003 + (config.complexity * 0.005), // affects flow complexity
        noiseSpeed: 0.0005 + (config.flow * 0.001) // affects flow movement speed
      };

      // initialize flow field grid
      for (let y = 0; y < height; y += field.resolution) {
        for (let x = 0; x < width; x += field.resolution) {
          field.grid.push({
            x: x,
            y: y,
            angle: Math.random() * Math.PI * 2
          });
        }
      }

      flowFields.push(field);
    });

    return flowFields;
  };

  const createLayers = (configs, width, height) => {
    const layers = [];

    // create background gradient layers
    configs.forEach((config, index) => {
      // create a few organic shapes for each mood
      for (let i = 0; i < 3; i++) {
        layers.push({
          //type: "organicBlob",
          type: config.shape || "organicBlob",
          x: Math.random() * width,
          y: Math.random() * height,
          size: 100 + Math.random() * 200,
          color: i % 2 === 0 ? config.color : config.secondaryColor,
          alpha: 0.05 + (Math.random() * 0.1),
          points: 5 + Math.floor(Math.random() * 3),
          amplitude: 20 + (Math.random() * 40),
          speed: 0.0003 + (Math.random() * 0.0005),
          offset: Math.random() * Math.PI * 2
        });
      }

      // create flowing lines
      for (let i = 0; i < 5; i++) {
        layers.push({
          type: "flowingLine",
          startX: Math.random() * width,
          startY: Math.random() * height,
          length: 200 + Math.random() * 300,
          segments: 10 + Math.floor(Math.random() * 15),
          thickness: 0.5 + (Math.random() * 1.5),
          color: i % 2 === 0 ? config.color : config.secondaryColor,
          alpha: 0.1 + (Math.random() * 0.2),
          speed: 0.0002 + (config.flow * 0.0006),
          flowScale: 0.5 + (config.flow * 0.5)
        });
      }
    });

    return layers;
  };

  const createParticles = (configs, width, height) => {
    const particles = [];

    configs.forEach(config => {
      // create floating particles
      const particleCount = Math.floor(30 + (config.intensity * 50));

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1 + Math.random() * 3,
          color: Math.random() > 0.5 ? config.color : config.secondaryColor,
          alpha: 0.3 + Math.random() * 0.4,
          speed: 0.2 + (config.flow * 0.8),
          flowInfluence: 0.5 + (config.flow * 0.5),
          angle: Math.random() * Math.PI * 2,
          pulse: 0.01 + (Math.random() * 0.03)
        });
      }
    });

    return particles;
  };

  const startAnimationLoop = () => {
    const animate = (timestamp) => {
      if (!isAnimating) return;

      const deltaTime = timestamp - (animationState.current.lastFrameTime || timestamp);
      animationState.current.lastFrameTime = timestamp;
      animationState.current.time += deltaTime;

      renderFrame(deltaTime / 1000); // convert to seconds

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const renderFrame = (deltaTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // clear with fading effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(0, 0, width, height);

    // update flow fields
    updateFlowFields(deltaTime);

    // render base layers
    renderLayers(ctx, width, height, deltaTime);

    // update and render particles
    updateAndRenderParticles(ctx, width, height, deltaTime);

    // apply final effects
    applyFinalEffects(ctx, width, height);
  };

  const updateFlowFields = (deltaTime) => {
    const time = animationState.current.time;

    // update all flow fields
    animationState.current.flowFields.forEach(field => {
      field.grid.forEach(point => {
        // use noise to evolve the flow field over time
        // this simplified version just uses sine waves as a replacement for perlin noise
        const xOffset = point.x * field.noiseScale;
        const yOffset = point.y * field.noiseScale;
        const timeOffset = time * field.noiseSpeed;

        const noiseValue = Math.sin(xOffset + timeOffset) * Math.cos(yOffset - timeOffset);
        point.angle = noiseValue * Math.PI * 2;
      });
    });
  };

  const renderLayers = (ctx, width, height, deltaTime) => {
    const time = animationState.current.time;

    animationState.current.layers.forEach(layer => {
      ctx.save();

      switch (layer.type) {
        case "organicBlob":   renderBlob(ctx, layer, time);    break;
        case "flowingLine":   renderFlowLine(ctx, layer, time);break;
        case "spike":         renderSpike(ctx, layer, time);   break;
        case "burst":         renderBurst(ctx, layer, time);   break;
        case "ripple":        renderRipple(ctx, layer, time);  break;
        case "drip":          renderDrip(ctx, layer, time);    break;
        default:              renderBlob(ctx, layer, time);    break;
      }
      
      ctx.restore();
    });
  };

  // Define the missing render functions
  const renderBlob = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = l.color;
    
    ctx.beginPath();
    const points = l.points || 5;
    
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = l.size + Math.sin(angle * 3 + t * l.speed + l.offset) * l.amplitude;
      const x = l.x + Math.cos(angle) * radius;
      const y = l.y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
  };

  const renderFlowLine = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.strokeStyle = l.color;
    ctx.lineWidth = l.thickness;
    
    // Create flowing line with segments
    ctx.beginPath();
    let x = l.startX;
    let y = l.startY;
    ctx.moveTo(x, y);
    
    const segmentLength = l.length / l.segments;
    
    for (let i = 0; i < l.segments; i++) {
      const angle = Math.sin(t * l.speed + i * 0.5) * Math.PI * l.flowScale;
      x += Math.cos(angle) * segmentLength;
      y += Math.sin(angle) * segmentLength;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  };

  const renderDrip = (ctx, l, t) => {
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = l.color;
    
    // Draw a dripping effect
    const drips = 5;
    const maxLength = l.size;
    
    for (let i = 0; i < drips; i++) {
      const angle = (i / drips) * Math.PI * 2;
      const xBase = l.x + Math.cos(angle) * l.size * 0.5;
      const yBase = l.y + Math.sin(angle) * l.size * 0.5;
      
      const dripLength = maxLength * (0.3 + Math.sin(t * l.speed + i) * 0.7);
      
      ctx.beginPath();
      ctx.moveTo(xBase, yBase);
      ctx.quadraticCurveTo(
        xBase + Math.cos(angle) * dripLength * 0.5,
        yBase + Math.sin(angle) * dripLength * 1.5,
        xBase + Math.cos(angle) * dripLength,
        yBase + Math.sin(angle) * dripLength
      );
      ctx.lineTo(xBase, yBase);
      ctx.fill();
    }
  };

  function renderSpike(ctx,l,t){
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle   = l.color;
    const pts = 24;                     // sharp star
    ctx.beginPath();
    for(let i=0;i<=pts;i++){
      const a = (i/pts)*Math.PI*2;
      const r = l.size + Math.sin(a*pts + t*l.speed)*l.amplitude;
      ctx.lineTo(l.x + Math.cos(a)*r, l.y + Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill();
  }
  
  function renderBurst(ctx,l,t){
    ctx.globalAlpha = l.alpha;
    ctx.strokeStyle = l.color;
    ctx.lineWidth   = 1;
    const rays = 40;
    ctx.beginPath();
    for(let i=0;i<rays;i++){
      const a = (i/rays)*Math.PI*2;
      const r = l.size + Math.sin(t*l.speed+i)*l.amplitude;
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x + Math.cos(a)*r, l.y + Math.sin(a)*r);
    }
    ctx.stroke();
  }
  
  function renderRipple(ctx,l,t){
    ctx.globalAlpha = l.alpha;
    ctx.strokeStyle = l.color;
    ctx.lineWidth   = 1;
    const rings = 4;
    for(let i=1;i<=rings;i++){
      const r = l.size*i*0.4 + Math.sin(t*l.speed+i)*l.amplitude*0.1;
      ctx.beginPath();
      ctx.arc(l.x, l.y, r, 0, Math.PI*2);
      ctx.stroke();
    }
  }
  
  const updateAndRenderParticles = (ctx, width, height, deltaTime) => {
    const time = animationState.current.time;

    // get the first flow field for particle movement
    const flowField = animationState.current.flowFields[0];

    animationState.current.particles.forEach(particle => {
      // get flow direction at particle position
      const flowAngle = getFlowAngleAt(particle.x, particle.y, flowField);

      // update particle position based on flow field
      const flowInfluence = particle.flowInfluence;
      const combinedAngle = (flowAngle * flowInfluence) + (particle.angle * (1 - flowInfluence));

      particle.x += Math.cos(combinedAngle) * particle.speed * deltaTime;
      particle.y += Math.sin(combinedAngle) * particle.speed * deltaTime;

      // wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // pulsating size effect
      const pulseSize = particle.size * (0.8 + Math.sin(time * particle.pulse) * 0.2);

      // render particle
      ctx.globalAlpha = particle.alpha;

      // Create transparent color properly
      let baseColor = particle.color;
      let transparentColor;
      
      // Check if the color is an RGB/RGBA string
      if (baseColor.startsWith('rgb')) {
        // Extract RGB values and create transparent version
        const rgbMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (rgbMatch) {
          transparentColor = `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, 0)`;
        } else {
          transparentColor = 'rgba(255, 255, 255, 0)'; // Fallback
        }
      } else {
        // For hex or named colors, use rgba with opacity 0
        transparentColor = 'rgba(255, 255, 255, 0)'; // Fallback
      }

      // use a gradient for soft particles
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, pulseSize * 2
      );
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, transparentColor);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const getFlowAngleAt = (x, y, flowField) => {
    if (!flowField || !flowField.grid || flowField.grid.length === 0) {
      return 0;
    }

    // find the closest grid point more efficiently
    const res = flowField.resolution;
    const gridX = Math.floor(x / res);
    const gridY = Math.floor(y / res);
    
    // Calculate index directly instead of linear search
    // This assumes grid points are laid out in a regular grid
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    
    const width = Math.ceil(canvas.width / (window.devicePixelRatio || 1) / res);
    
    if (gridX >= 0 && gridY >= 0 && gridX < width) {
      const index = gridY * width + gridX;
      if (index < flowField.grid.length) {
        return flowField.grid[index].angle;
      }
    }

    // Fallback to linear search if direct indexing fails
    for (let i = 0; i < flowField.grid.length; i++) {
      const point = flowField.grid[i];
      if (Math.floor(point.x / res) === gridX && Math.floor(point.y / res) === gridY) {
        return point.angle;
      }
    }

    // if not found, return a default angle
    return 0;
  };

  const applyFinalEffects = (ctx, width, height) => {
    // add subtle vignette for depth
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.min(width, height) * 0.8
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'rgba(250, 250, 250, 0.2)');

    ctx.globalAlpha = 0.3;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // add very subtle grain texture
    ctx.globalAlpha = 0.01;
    for (let i = 0; i < width * height * 0.0003; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)";
      ctx.fillRect(x, y, 1, 1);
    }
  };

  // function to toggle pause/play animation
  const toggleAnimation = () => {
    if (isAnimating) {
      cancelAnimationFrame(animationRef.current);
    } else {
      startAnimationLoop();
    }
    setIsAnimating(!isAnimating);
  };

  // function to export the current canvas as an image
  const exportAsImage = () => {
    setIsExporting(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas not available");
      }
      
      const dataUrl = canvas.toDataURL("image/png");

      // create temporary link to download the image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'ethereal-mood-art.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('error exporting image:', error);
      // Could add user notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="ethereal-art-container" style={{ width: "100%", height: "500px", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        }}
      />
      <div
        className="art-controls"
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          display: "flex",
          gap: "10px"
        }}
      >
        <button
          onClick={toggleAnimation}
          className="art-control-btn"
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            backgroundColor: isAnimating ? "#f0f0f0" : "#e0e0e0",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          {isAnimating ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={exportAsImage}
          className="art-control-btn"
          disabled={isExporting}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            backgroundColor: isExporting ? "#e0e0e0" : "#f0f0f0",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: isExporting ? "default" : "pointer",
            transition: "all 0.2s ease"
          }}
        >
          {isExporting ? 'Exporting...' : 'Save as Image'}
        </button>
      </div>
    </div>
  );
};

export default EtherealGenArt;