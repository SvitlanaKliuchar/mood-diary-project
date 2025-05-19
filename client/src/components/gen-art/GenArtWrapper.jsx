import React, { useState, useEffect, useContext } from 'react';
import EtherealGenArt from './EtherealGenArt.jsx';
import { recordCanvasAsGif } from '../../utils/recordCanvasAsGif.js';
import axiosInstance from '../../utils/axiosInstance.js';
import { uploadToSupabase } from '../../utils/uploadToSupabase.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { saveAs } from 'file-saver';
import styles from './GenArt.module.css';

export default function GenArtWrapper() {
  const [moodLogs, setMoodLogs] = useState([]);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [isSaving, setIsSaving] = useState(false)
  const [isExportingImage, setIsExportingImage] = useState(false);
  const { user } = useContext(AuthContext)

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

  const handleExportAsImage = () => {
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
    const canvas = document.querySelector('canvas');
    if (!canvas) return alert('No canvas found');

    setIsGeneratingGif(true);
    try {
      const blob = await recordCanvasAsGif(canvas);
      saveAs(blob, 'generated_art.gif');
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleSaveToGallery = async () => {
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

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Your Personal Art Piece</h1>

      <div className={styles['canvas-wrapper']}>
        <EtherealGenArt moodLogs={moodLogs} />
      </div>

      <div className={styles['button-group']}>
        <button
          onClick={handleExportAsImage}
          disabled={isExportingImage}
          className={`${styles.button} ${isExportingImage ? styles.disabled : ''}`}
        >
          {isExportingImage ? "Exporting..." : "Save as Image"}
        </button>
        <button
          onClick={handleSaveGif}
          disabled={isGeneratingGif}
          className={`${styles.button} ${isGeneratingGif ? styles.disabled : ''}`}
        >
          {isGeneratingGif ? "Generating GIF..." : "Save as GIF"}
        </button>
        <button
          onClick={handleSaveToGallery}
          disabled={isSaving}
          className={`${styles.button} ${isSaving ? styles.disabled : ''}`}
        >
          {isSaving ? "Saving..." : "Save to Gallery"}
        </button>
      </div>

    </div>
  );

}
