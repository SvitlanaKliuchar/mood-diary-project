import React, { useState } from 'react';
import EtherealGenerativeArt from './EtherealGenArt';

export default function DemoComponent() {
  //sample mood data
  const [moodLogs, setMoodLogs] = useState([
    { 
      date: '2025-05-06', 
      mood: 'great',
      notes: 'Had a wonderful day, feeling inspired and energetic.'
    },
    { 
      date: '2025-05-05', 
      mood: 'good',
      notes: 'Productive day at work, made progress on my projects.'
    },
    { 
      date: '2025-05-04', 
      mood: 'meh',
      notes: 'Nothing particularly memorable today.'
    }
  ]);

  //function to add a new mood entry
  const addMood = (mood) => {
    const today = new Date().toISOString().split('T')[0];
    const newMood = {
      date: today,
      mood: mood,
      notes: `Added ${mood} mood from demo`
    };
    
    setMoodLogs([newMood, ...moodLogs]);
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
          <button 
            onClick={() => addMood('great')}
            style={{
              padding: "8px 16px",
              backgroundColor: "#7574E1",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            Add Great Mood
          </button>
          
          <button 
            onClick={() => addMood('good')}
            style={{
              padding: "8px 16px",
              backgroundColor: "#58D68D",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            Add Good Mood
          </button>
          
          <button 
            onClick={() => addMood('meh')}
            style={{
              padding: "8px 16px",
              backgroundColor: "#AEB6BF",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            Add Meh Mood
          </button>
          
          <button 
            onClick={() => addMood('bad')}
            style={{
              padding: "8px 16px",
              backgroundColor: "#E59866",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            Add Bad Mood
          </button>
          
          <button 
            onClick={() => addMood('awful')}
            style={{
              padding: "8px 16px",
              backgroundColor: "#EC7063",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer"
            }}
          >
            Add Awful Mood
          </button>
        </div>
      </div>
      
      {/* the art visualization */}
      <div style={{
        marginBottom: "20px",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
      }}>
        <EtherealGenerativeArt moodLogs={moodLogs} />
      </div>
      
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
              borderLeft: `4px solid ${
                log.mood === 'great' ? '#7574E1' :
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