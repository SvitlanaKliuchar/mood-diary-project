import React, { useState, useEffect, useContext } from 'react';
import EtherealGenArt from './EtherealGenArt.jsx';
import { recordCanvasAsGif } from '../../utils/recordCanvasAsGif.js';
import axiosInstance from '../../utils/axiosInstance.js';
import { uploadToSupabase } from '../../utils/uploadToSupabase.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { saveAs } from 'file-saver';
import styles from './GenArt.module.css';

// global function to start the animation
window.startArtGeneration = null;

export default function GenArtWrapper() {
  const [moodLogs, setMoodLogs] = useState([]);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [isSaving, setIsSaving] = useState(false)
  const [isExportingImage, setIsExportingImage] = useState(false);
  const { user } = useContext(AuthContext)

  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);

  // make startArtGeneration available globally
  useEffect(() => {
    window.startArtGeneration = () => {
      setIsGenerating(true);
      setGenerationProgress(0);
    };

    return () => {
      window.startArtGeneration = null;
    };
  }, []);

  // fetch mood entries
  useEffect(() => {
    const fetchMoodEntries = async () => {
      try {
        const { data } = await axiosInstance.get('/moods');
        const normalized = data.map(e => ({
          ...e,
          date: typeof e.date === 'string'
            ? e.date
            : new Date(e.date).toISOString().slice(0, 10),
        }));
        setMoodLogs(normalized);
      } catch (error) {
        console.error('Error fetching mood entries:', error);
      }
    };
    fetchMoodEntries();
  }, []);

  // handle generation progress animation
  useEffect(() => {
    if (isGenerating) {
      const simulateProgress = () => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            setTimeout(() => setIsGenerating(false), 600);
            return 100;
          }
          // slightly slower progress for better visual effect
          const increment = Math.max(1, Math.floor((100 - prev) / 15));
          return Math.min(prev + increment, 100);
        });
      };

      const interval = setInterval(simulateProgress, 250);
      return () => clearInterval(interval);
    }
  }, [isGenerating, generationProgress]);

  const handleExportAsImage = () => {
    if (isGenerating) return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return alert('No canvas found');

    setIsExportingImage(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "ethereal-mood-art.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting image:", error);
      alert("Image export failed");
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleSaveGif = async () => {
    if (isGenerating) return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return alert('No canvas found');

    setIsGeneratingGif(true);
    try {
      // pass customized options for better quality/length
      const options = {
        duration: 2000, 
        fps: 24         
      };

      const blob = await recordCanvasAsGif(canvas, options);
      saveAs(blob, 'generated_art.gif');
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (isGenerating) return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return alert('No canvas found');
    if (!user?.id) return alert('User not authenticated');

    setIsSaving(true);
    try {
      const ts = Date.now();
      const uid = user.id;

      const thumbnailBlob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const thumbnailUrl = await uploadToSupabase(
        thumbnailBlob, `user_${uid}/thumb-${ts}.png`
      );

      const gifBlob = await recordCanvasAsGif(canvas);
      const gifUrl = await uploadToSupabase(
        gifBlob, `user_${uid}/art-${ts}.gif`
      );

      // metadata
      await axiosInstance.post('/gen-art', {
        title: `Art ${new Date().toLocaleDateString()}`,
        gifUrl,
        thumbnailUrl,
      });

      alert('Saved to gallery!');
    } catch (err) {
      console.error(err);
      alert(err.message ?? 'Upload failed');
    } finally {
      setIsSaving(false);
    }
  };

  const pastelColors = [
    'rgba(253, 215, 232, 0.6)', // pink
    'rgba(160, 220, 255, 0.6)', // blue
    'rgba(214, 188, 250, 0.6)', // purple
    'rgba(199, 250, 215, 0.6)', // green
    'rgba(253, 253, 188, 0.6)'  // yellow
  ];

  // generate dynamic elements for the animation
  const generateLines = () => {
    const lines = [];
    for (let i = 0; i < 20; i++) {
      const isHorizontal = Math.random() > 0.5;
      const left = Math.random() * 80 + 10; // 10-90%
      const top = Math.random() * 80 + 10; // 10-90%
      const length = Math.random() * 20 + 10; // 10-30%
      const delay = Math.random() * 3; // 0-3s delay

      lines.push({
        isHorizontal,
        left: `${left}%`,
        top: `${top}%`,
        length: `${length}%`,
        delay: `${delay}s`,
        color: pastelColors[Math.floor(Math.random() * pastelColors.length)]
      });
    }
    return lines;
  };

  const generateShapes = () => {
    const shapes = [];
    for (let i = 0; i < 15; i++) {
      const left = Math.random() * 80 + 10;
      const top = Math.random() * 80 + 10;
      const size = Math.random() * 60 + 20; // 20-80px
      const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
      const delay = Math.random() * 4;
      const duration = Math.random() * 2 + 3; // 3-5s

      shapes.push({ left, top, size, color, delay, duration });
    }
    return shapes;
  };

  const generateDots = () => {
    const dots = [];
    for (let i = 0; i < 30; i++) {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;

      dots.push({ left, top, delay });
    }
    return dots;
  };

  const generateBeams = () => {
    const beams = [];
    for (let i = 0; i < 8; i++) {
      const top = Math.random() * 100;
      const width = Math.random() * 30 + 70; // 70-100% width
      const delay = i * 0.5; // stagger the beams

      beams.push({ top, width, delay });
    }
    return beams;
  };

  // generate connectors between dots
  const generateConnectors = (dots) => {
    const connectors = [];
    // connect some dots with lines
    for (let i = 0; i < 20; i++) {
      const startDot = Math.floor(Math.random() * dots.length);
      const endDot = Math.floor(Math.random() * dots.length);

      if (startDot !== endDot) {
        const startLeft = dots[startDot].left;
        const startTop = dots[startDot].top;
        const endLeft = dots[endDot].left;
        const endTop = dots[endDot].top;

        // calculate length and angle
        const length = Math.sqrt(Math.pow(endLeft - startLeft, 2) + Math.pow(endTop - startTop, 2));
        const angle = Math.atan2(endTop - startTop, endLeft - startLeft) * (180 / Math.PI);

        connectors.push({
          left: `${startLeft}%`,
          top: `${startTop}%`,
          length: `${length}%`,
          angle,
          delay: Math.random() * 3
        });
      }
    }
    return connectors;
  };

  const [lines] = useState(() => generateLines());
  const [shapes] = useState(() => generateShapes());
  const [dots] = useState(() => generateDots());
  const [beams] = useState(() => generateBeams());
  const [connectors] = useState(() => generateConnectors(dots));

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Your Personal Art Piece</h1>

      <div className={styles['canvas-wrapper']}>
        {isGenerating ? (
          <div className={styles['generation-container']}>
            <div className={styles['grid-background']}></div>

            {/* animated lines that form patterns */}
            {lines.map((line, i) => (
              <div
                key={`line-${i}`}
                className={`${styles.line} ${line.isHorizontal ? styles['line-h'] : styles['line-v']}`}
                style={{
                  left: line.left,
                  top: line.top,
                  width: line.isHorizontal ? line.length : '2px',
                  height: line.isHorizontal ? '2px' : line.length,
                  backgroundColor: line.color,
                  animationDelay: line.delay
                }}
              ></div>
            ))}

            {/* floating geometric shapes */}
            {shapes.map((shape, i) => (
              <div
                key={`shape-${i}`}
                className={styles['geo-shape']}
                style={{
                  left: `${shape.left}%`,
                  top: `${shape.top}%`,
                  width: `${shape.size}px`,
                  height: `${shape.size}px`,
                  backgroundColor: shape.color,
                  animationDelay: `${shape.delay}s`,
                  animationDuration: `${shape.duration}s`,
                  clipPath: [
                    'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // diamond
                    'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', // hexagon
                    'polygon(50% 0%, 100% 100%, 0% 100%)', // triangle
                    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' // star
                  ][Math.floor(i % 4)]
                }}
              ></div>
            ))}

            {/* connecting dots */}
            {dots.map((dot, i) => (
              <div
                key={`dot-${i}`}
                className={styles.dot}
                style={{
                  left: `${dot.left}%`,
                  top: `${dot.top}%`,
                  animationDelay: `${dot.delay}s`
                }}
              ></div>
            ))}

            {/* connectors between dots */}
            {connectors.map((conn, i) => (
              <div
                key={`conn-${i}`}
                className={styles.connector}
                style={{
                  left: conn.left,
                  top: conn.top,
                  width: conn.length,
                  transform: `rotate(${conn.angle}deg)`,
                  animationDelay: `${conn.delay}s`
                }}
              ></div>
            ))}

            {/* light beams */}
            {beams.map((beam, i) => (
              <div
                key={`beam-${i}`}
                className={styles['light-beam']}
                style={{
                  top: `${beam.top}%`,
                  width: `${beam.width}%`,
                  animationDelay: `${beam.delay}s`
                }}
              ></div>
            ))}

            {/* progress overlay */}
            <div className={styles['generation-overlay']}>
              <div className={styles['progress-container']}>
                <div
                  className={styles['progress-bar']}
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <div className={styles['generation-text']}>
                {generationProgress < 25 && "Sketching geometric patterns..."}
                {generationProgress >= 25 && generationProgress < 50 && "Weaving light pathways..."}
                {generationProgress >= 50 && generationProgress < 75 && "Harmonizing lines and shapes..."}
                {generationProgress >= 75 && "Transforming your mood into art..."}
              </div>
            </div>
          </div>
        ) : (
          <EtherealGenArt moodLogs={moodLogs} />
        )}
      </div>

      <div className={styles['button-group']}>
        <button
          onClick={handleExportAsImage}
          disabled={isExportingImage || isGenerating}
          className={`${styles.button} ${(isExportingImage || isGenerating) ? styles.disabled : ''}`}
        >
          {isExportingImage ? "Exporting..." : "Save as Image"}
        </button>
        <button
          onClick={handleSaveGif}
          disabled={isGeneratingGif || isGenerating}
          className={`${styles.button} ${(isGeneratingGif || isGenerating) ? styles.disabled : ''}`}
        >
          {isGeneratingGif ? "Generating GIF..." : "Save as GIF"}
        </button>
        <button
          onClick={handleSaveToGallery}
          disabled={isSaving || isGenerating}
          className={`${styles.button} ${(isSaving || isGenerating) ? styles.disabled : ''}`}
        >
          {isSaving ? "Saving..." : "Save to Gallery"}
        </button>
      </div>
    </div>
  );
}