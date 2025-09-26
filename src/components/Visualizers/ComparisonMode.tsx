// src/components/Visualizers/ComparisonMode.tsx
import React from 'react';

export const ComparisonMode = () => {
  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      textAlign: 'center' as const,
      marginBottom: '32px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    },
    box: {
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '24px',
      backgroundColor: '#f9fafb',
    },
    boxTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textAlign: 'center' as const,
    },
    placeholder: {
      height: '200px',
      backgroundColor: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sorting Algorithm Race</h2>
      
      <div style={styles.grid}>
        <div style={styles.box}>
          <h3 style={{ ...styles.boxTitle, color: '#10b981' }}>Merge Sort</h3>
          <div style={styles.placeholder}>
            Visualization will appear here
          </div>
        </div>
        
        <div style={styles.box}>
          <h3 style={{ ...styles.boxTitle, color: '#3b82f6' }}>Quick Sort</h3>
          <div style={styles.placeholder}>
            Visualization will appear here
          </div>
        </div>
      </div>
    </div>
  );
};