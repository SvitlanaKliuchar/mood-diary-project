import React, { useState, useEffect, useContext } from 'react';
import EtherealGenArt from './EtherealGenArt';
import { recordCanvasAsGif } from '../../utils/recordCanvasAsGif.js'; 
import axiosInstance from '../../utils/axiosInstance.js';
import { uploadToSupabase } from '../../utils/uploadToSupabase';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { saveAs } from 'file-saver'; 

export default function DemoComponent() {
  const [moodLogs, setMoodLogs] = useState([]);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [isSaving, setIsSaving] = useState(false)
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


  const addMood = (mood, emotions = []) => {
    setMoodLogs(prev => [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        mood,
        emotions,
        notes: `added ${mood} mood from demo`
      },
      ...prev
    ]);
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
    if (!canvas)          return alert('No canvas found');
    if (!user?.id)        return alert('User not authenticated');

    setIsSaving(true);
    try {
      const ts  = Date.now();
      const uid = user.id;

      const thumbnailBlob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const thumbnailUrl  = await uploadToSupabase(
        thumbnailBlob, `user_${uid}/thumb-${ts}.png`
      );

      const gifBlob = await recordCanvasAsGif(canvas);
      const gifUrl  = await uploadToSupabase(
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
    <div className="demo-container" style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h1 style={{
        fontSize: "24px",
        marginBottom: "20px",
        color: "#333",
        fontWeight: "500"
      }}>Ethereal Mood Art</h1>

      <div style={{
        marginBottom: "20px",
        padding: "16px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px"
      }}>
        <p style={{ marginBottom: "12px" }}>
          Visualize your emotions through flowing, organic art. Add different moods to see how the visualization changes.
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {['great', 'good', 'meh', 'bad', 'awful'].map(mood => (
            <button
              key={mood}
              onClick={() => addMood(mood)}
              style={{
                padding: "8px 16px",
                backgroundColor: {
                  great: "#7574E1",
                  good: "#58D68D",
                  meh: "#AEB6BF",
                  bad: "#E59866",
                  awful: "#EC7063"
                }[mood],
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer"
              }}
            >
              Add {mood.charAt(0).toUpperCase() + mood.slice(1)} Mood
            </button>
          ))}
        </div>
      </div>

      {/* the art visualization */}
      <div style={{
        marginBottom: "12px",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        <EtherealGenArt moodLogs={moodLogs} />
      </div>

      <button
        onClick={handleSaveGif}
        disabled={isGeneratingGif}
        style={{
          marginBottom: "30px",
          padding: "10px 20px",
          backgroundColor: isGeneratingGif ? "#ccc" : "#FF6F61",
          color: "white",
          border: "none",
          borderRadius: "20px",
          fontWeight: "bold",
          cursor: isGeneratingGif ? "not-allowed" : "pointer"
        }}
      >
        {isGeneratingGif ? "Generating GIF..." : "Save as GIF"}
      </button>
      <button
        onClick={handleSaveToGallery}
        disabled={isSaving}
        style={{
          marginBottom: "30px",
          padding: "10px 20px",
          backgroundColor: isSaving ? "#ccc" : "#FF6F61",
          color: "white",
          border: "none",
          borderRadius: "20px",
          fontWeight: "bold",
          cursor: isGeneratingGif ? "not-allowed" : "pointer"
        }}
      >
        {isSaving ? "Saving..." : "Save to Gallery"}
      </button>


      {/* mood log display */}
      <div>
        <h2 style={{
          fontSize: "18px",
          marginBottom: "12px",
          color: "#555"
        }}>Mood History</h2>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          {moodLogs.map((log, index) => (
            <div key={index} style={{
              padding: "12px",
              backgroundColor: "#f9f9f9",
              borderRadius: "6px",
              borderLeft: `4px solid ${log.mood === 'great' ? '#7574E1' :
                log.mood === 'good' ? '#58D68D' :
                  log.mood === 'meh' ? '#AEB6BF' :
                    log.mood === 'bad' ? '#E59866' : '#EC7063'
                }`
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px"
              }}>
                <span style={{ fontWeight: "500" }}>{log.mood}</span>
                <span style={{ color: "#777", fontSize: "14px" }}>{log.date}</span>
              </div>
              <div style={{ fontSize: "14px", color: "#555" }}>{log.notes}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
