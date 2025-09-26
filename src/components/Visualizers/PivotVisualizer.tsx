// src/components/Visualizers/PivotVisualizer.tsx
import React, { useState } from 'react';

export const PivotVisualizer = () => {
  const [mode, setMode] = useState<'add-node' | 'add-edge' | 'visualize'>('add-node');

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    header: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '1.5rem',
      textAlign: 'center' as const,
    },
    controls: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      justifyContent: 'center',
    },
    modeButton: (isActive: boolean) => ({
      padding: '0.625rem 1.25rem',
      backgroundColor: isActive ? '#8b5cf6' : '#e5e7eb',
      color: isActive ? 'white' : '#6b7280',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s',
    }),
    canvas: {
      width: '100%',
      height: '400px',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      backgroundColor: '#f9fafb',
      position: 'relative' as const,
      marginBottom: '1.5rem',
    },
    statsPanel: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      padding: '1.5rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.75rem',
    },
    statItem: {
      textAlign: 'center' as const,
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#8b5cf6',
    },
    statLabel: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem',
    },
    playbackControls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    playButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1rem',
      transition: 'all 0.2s',
    },
  };

  // Your existing graph visualization logic here
  // For now, showing the placeholder with nice styling

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Correlation Clustering Visualizer</h2>
      
      <div style={styles.controls}>
        <button
          style={styles.modeButton(mode === 'add-node')}
          onClick={() => setMode('add-node')}
        >
          Add Nodes
        </button>
        <button
          style={styles.modeButton(mode === 'add-edge')}
          onClick={() => setMode('add-edge')}
        >
          Add Edges
        </button>
        <button
          style={styles.modeButton(mode === 'visualize')}
          onClick={() => setMode('visualize')}
        >
          Visualize
        </button>
      </div>

      <div style={styles.canvas}>
        <svg width="100%" height="100%">
          {/* Your existing SVG content here */}
          <text x="50%" y="50%" textAnchor="middle" fill="#9ca3af" fontSize="18">
            Click "Add Nodes" to start building your graph
          </text>
        </svg>
      </div>

      <div style={styles.statsPanel}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>CLUSTERS</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>POSITIVE MISTAKES</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>NEGATIVE MISTAKES</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>TOTAL COST</div>
        </div>
      </div>

      <div style={styles.playbackControls}>
        <button style={styles.playButton}>
          ▶ Start Algorithm
        </button>
      </div>
    </div>
  );
};