import React, { useEffect, useRef, useState } from "react";

// helper function to generate art configuration based on mood data
const generateArtFromMood = (moodLogs) => {
  if (!moodLogs || moodLogs.length === 0) {
    return [{
      mood: "good",
      color: "#58D68D",
      secondaryColor: "#B3E6D1",
      intensity: 0.7,
      flow: 0.5,
      complexity: 0.6
    }];
  }

  // map moods to art configurations
  return moodLogs.map(log => {
    // base configurations for different moods
    const moodConfigs = {
      great: {
        color: "#7574E1", //purple
        secondaryColor: "#B6DCFF", //light blue
        intensity: 0.8,
        flow: 0.7,
        complexity: 0.6
      },
      good: {
        color: "#58D68D", // green
        secondaryColor: "#D3F8EC", // light mint
        intensity: 0.7,
        flow: 0.6,
        complexity: 0.5
      },
      meh: {
        color: "#AEB6BF", // gray
        secondaryColor: "#E5E8E8", // light gray
        intensity: 0.5,
        flow: 0.4,
        complexity: 0.3
      },
      bad: {
        color: "#E59866", // orange
        secondaryColor: "#FADBD8", // light pink
        intensity: 0.6,
        flow: 0.3,
        complexity: 0.7
      },
      awful: {
        color: "#EC7063", // red
        secondaryColor: "#F5B7B1", // light red
        intensity: 0.5,
        flow: 0.2,
        complexity: 0.8
      }
    };

    // get base config for the mood, defaulting to "meh" if not found
    const baseConfig = moodConfigs[log.mood] || moodConfigs.meh;
    
    // combine with additional data from the log
    return {
      mood: log.mood,
      date: log.date,
      notes: log.notes || "",
      ...baseConfig
    };
  });
};

export default function EtherealGenerativeArt({ moodLogs }) {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const animationRef = useRef(null);
  const artConfigs = useRef(generateArtFromMood(moodLogs));

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
    artConfigs.current = generateArtFromMood(moodLogs);
    
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
          type: "organicBlob",
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
        case "organicBlob":
          // render organic blob shape
          ctx.globalAlpha = layer.alpha;
          ctx.fillStyle = layer.color;
          
          // create a pulsating blob
          const phase = time * layer.speed + layer.offset;
          
          ctx.beginPath();
          
          // calculate points around the center
          for (let i = 0; i <= layer.points * 2; i++) {
            const angle = (i / (layer.points * 2)) * Math.PI * 2;
            const radius = layer.size + 
              Math.sin(angle * layer.points + phase) * layer.amplitude + 
              Math.cos(angle * (layer.points / 2) + phase) * (layer.amplitude / 2);
            
            const x = layer.x + Math.cos(angle) * radius;
            const y = layer.y + Math.sin(angle) * radius;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.closePath();
          ctx.fill();
          break;
          
        case "flowingLine":
          // render flowing line
          ctx.globalAlpha = layer.alpha;
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = layer.thickness;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          
          // find the nearest flow field
          const flowField = animationState.current.flowFields[0]; // just use the first one for simplicity
          
          // starting point
          let x = layer.startX;
          let y = layer.startY;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          
          // draw the line following the flow field
          for (let i = 0; i < layer.segments; i++) {
            // get flow direction at this point
            const flowAngle = getFlowAngleAt(x, y, flowField);
            
            // calculate next point based on flow
            const length = layer.length / layer.segments;
            const nextX = x + Math.cos(flowAngle) * length * layer.flowScale;
            const nextY = y + Math.sin(flowAngle) * length * layer.flowScale;
            
            // add some gentle curves with control points
            const controlX = x + Math.cos(flowAngle + 0.2) * length * 0.8;
            const controlY = y + Math.sin(flowAngle + 0.2) * length * 0.8;
            
            ctx.quadraticCurveTo(controlX, controlY, nextX, nextY);
            
            x = nextX;
            y = nextY;
          }
          
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    });
  };

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
      
      // use a gradient for soft particles
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, pulseSize * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, particle.color + "00"); // transparent
      
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
    
    // find the closest grid point
    const res = flowField.resolution;
    const gridX = Math.floor(x / res);
    const gridY = Math.floor(y / res);
    
    // find the index in the grid array
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
}