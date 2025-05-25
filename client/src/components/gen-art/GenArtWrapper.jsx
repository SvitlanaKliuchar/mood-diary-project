import React, { useState, useEffect, useContext, useRef } from "react";
import EtherealGenArt from "./EtherealGenArt.jsx";
import { recordCanvasAsGif } from "../../utils/recordCanvasAsGif.js";
import axiosInstance from "../../utils/axiosInstance.js";
import { uploadToSupabase } from "../../utils/uploadToSupabase.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { EntriesContext } from "../../contexts/EntriesContext.jsx";
import { saveAs } from "file-saver";
import styles from "./GenArt.module.css";

export default function GenArtWrapper() {
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
  const { entries } = useContext(EntriesContext);

  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);

  const canvasRef = useRef();

  useEffect(() => {
    const startArtGeneration = () => {
      setIsGenerating(true);
      setGenerationProgress(0);
    };

    window.startArtGeneration = startArtGeneration;

    return () => {
      delete window.startArtGeneration;
    };
  }, []);

  useEffect(() => {
    if (isGenerating) {
      const simulateProgress = () => {
        setGenerationProgress((prev) => {
          if (prev >= 100) {
            setTimeout(() => setIsGenerating(false), 600);
            return 100;
          }
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
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("No canvas found");
      return;
    }

    setIsExportingImage(true);
    setError(null);

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
      setError("Image export failed");
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleSaveGif = async () => {
    if (isGenerating) return;
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("No canvas found");
      return;
    }

    setIsGeneratingGif(true);
    setError(null);

    try {
      const options = {
        duration: 2000,
        fps: 24,
      };

      const blob = await recordCanvasAsGif(canvas, options);
      saveAs(blob, "generated_art.gif");
    } catch (error) {
      console.error("Error generating GIF:", error);
      setError("GIF generation failed");
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (isGenerating) return;
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("No canvas found");
      return;
    }
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const ts = Date.now();
      const uid = user.id;

      const thumbnailBlob = await new Promise((res) =>
        canvas.toBlob(res, "image/png"),
      );
      const thumbnailUrl = await uploadToSupabase(
        thumbnailBlob,
        `user_${uid}/thumb-${ts}.png`,
      );

      const gifBlob = await recordCanvasAsGif(canvas);
      const gifUrl = await uploadToSupabase(
        gifBlob,
        `user_${uid}/art-${ts}.gif`,
      );

      await axiosInstance.post("/gen-art", {
        title: `Art ${new Date().toLocaleDateString()}`,
        gifUrl,
        thumbnailUrl,
      });

      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message ?? "Upload failed");
    } finally {
      setIsSaving(false);
    }
  };

  const pastelColors = [
    "rgba(253, 215, 232, 0.6)", // pink
    "rgba(160, 220, 255, 0.6)", // blue
    "rgba(214, 188, 250, 0.6)", // purple
    "rgba(199, 250, 215, 0.6)", // green
    "rgba(253, 253, 188, 0.6)", // yellow
  ];

  const generateLines = () => {
    const lines = [];
    for (let i = 0; i < 20; i++) {
      const isHorizontal = Math.random() > 0.5;
      const left = Math.random() * 80 + 10;
      const top = Math.random() * 80 + 10;
      const length = Math.random() * 20 + 10;
      const delay = Math.random() * 3;

      lines.push({
        isHorizontal,
        left: `${left}%`,
        top: `${top}%`,
        length: `${length}%`,
        delay: `${delay}s`,
        color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      });
    }
    return lines;
  };

  const generateShapes = () => {
    const shapes = [];
    for (let i = 0; i < 15; i++) {
      const left = Math.random() * 80 + 10;
      const top = Math.random() * 80 + 10;
      const size = Math.random() * 60 + 20;
      const color =
        pastelColors[Math.floor(Math.random() * pastelColors.length)];
      const delay = Math.random() * 4;
      const duration = Math.random() * 2 + 3;

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
      const width = Math.random() * 30 + 70;
      const delay = i * 0.5;
      beams.push({ top, width, delay });
    }
    return beams;
  };

  const generateConnectors = (dots) => {
    const connectors = [];
    for (let i = 0; i < 20; i++) {
      const startDot = Math.floor(Math.random() * dots.length);
      const endDot = Math.floor(Math.random() * dots.length);

      if (startDot !== endDot) {
        const startLeft = dots[startDot].left;
        const startTop = dots[startDot].top;
        const endLeft = dots[endDot].left;
        const endTop = dots[endDot].top;

        const length = Math.sqrt(
          Math.pow(endLeft - startLeft, 2) + Math.pow(endTop - startTop, 2),
        );
        const angle =
          Math.atan2(endTop - startTop, endLeft - startLeft) * (180 / Math.PI);

        connectors.push({
          left: `${startLeft}%`,
          top: `${startTop}%`,
          length: `${length}%`,
          angle,
          delay: Math.random() * 3,
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

      {error && (
        <div
          className={styles.error}
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
              fontSize: "1.25rem",
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles["canvas-wrapper"]}>
        {isGenerating ? (
          <div className={styles["generation-container"]}>
            <div className={styles["grid-background"]}></div>

            {lines.map((line, i) => (
              <div
                key={`line-${i}`}
                className={`${styles.line} ${line.isHorizontal ? styles["line-h"] : styles["line-v"]}`}
                style={{
                  left: line.left,
                  top: line.top,
                  width: line.isHorizontal ? line.length : "2px",
                  height: line.isHorizontal ? "2px" : line.length,
                  backgroundColor: line.color,
                  animationDelay: line.delay,
                }}
              ></div>
            ))}

            {shapes.map((shape, i) => (
              <div
                key={`shape-${i}`}
                className={styles["geo-shape"]}
                style={{
                  left: `${shape.left}%`,
                  top: `${shape.top}%`,
                  width: `${shape.size}px`,
                  height: `${shape.size}px`,
                  backgroundColor: shape.color,
                  animationDelay: `${shape.delay}s`,
                  animationDuration: `${shape.duration}s`,
                  clipPath: [
                    "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                    "polygon(50% 0%, 100% 100%, 0% 100%)",
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  ][Math.floor(i % 4)],
                }}
              ></div>
            ))}

            {dots.map((dot, i) => (
              <div
                key={`dot-${i}`}
                className={styles.dot}
                style={{
                  left: `${dot.left}%`,
                  top: `${dot.top}%`,
                  animationDelay: `${dot.delay}s`,
                }}
              ></div>
            ))}

            {connectors.map((conn, i) => (
              <div
                key={`conn-${i}`}
                className={styles.connector}
                style={{
                  left: conn.left,
                  top: conn.top,
                  width: conn.length,
                  transform: `rotate(${conn.angle}deg)`,
                  animationDelay: `${conn.delay}s`,
                }}
              ></div>
            ))}

            {beams.map((beam, i) => (
              <div
                key={`beam-${i}`}
                className={styles["light-beam"]}
                style={{
                  top: `${beam.top}%`,
                  width: `${beam.width}%`,
                  animationDelay: `${beam.delay}s`,
                }}
              ></div>
            ))}

            <div className={styles["generation-overlay"]}>
              <div className={styles["progress-container"]}>
                <div
                  className={styles["progress-bar"]}
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <div className={styles["generation-text"]}>
                {generationProgress < 25 && "Sketching geometric patterns..."}
                {generationProgress >= 25 &&
                  generationProgress < 50 &&
                  "Weaving light pathways..."}
                {generationProgress >= 50 &&
                  generationProgress < 75 &&
                  "Harmonizing lines and shapes..."}
                {generationProgress >= 75 &&
                  "Transforming your mood into art..."}
              </div>
            </div>
          </div>
        ) : (
          <EtherealGenArt moodLogs={entries} ref={canvasRef} />
        )}
      </div>

      <div className={styles["button-group"]}>
        <button
          onClick={handleExportAsImage}
          disabled={isExportingImage || isGenerating}
          className={`${styles.button} ${isExportingImage || isGenerating ? styles.disabled : ""}`}
        >
          {isExportingImage ? "Exporting..." : "Save as Image"}
        </button>
        <button
          onClick={handleSaveGif}
          disabled={isGeneratingGif || isGenerating}
          className={`${styles.button} ${isGeneratingGif || isGenerating ? styles.disabled : ""}`}
        >
          {isGeneratingGif ? "Generating GIF..." : "Save as GIF"}
        </button>
        <button
          onClick={handleSaveToGallery}
          disabled={isSaving || isGenerating}
          className={`${styles.button} ${isSaving || isGenerating ? styles.disabled : ""}`}
        >
          {isSaving ? "Saving..." : "Save to Gallery"}
        </button>
      </div>
    </div>
  );
}
