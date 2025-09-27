// src/pages/Home.tsx
import React from 'react';
import { PageType } from '../App';

interface HomeProps {
  onNavigate: (page: PageType) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const algorithms = [
    {
      id: 'sorting',
      title: '📊 Sorting Algorithms',
      description: 'Bubble, Quick, Merge, Heap',
      algorithms: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Heap Sort'],
      color: '#10b981'
    },
    {
      id: 'clustering',
      title: '🔗 Clustering',
      description: 'Pivot, K-Means, k-pivot, Balanced Pivot(online)',
      algorithms: ['Pivot (Correlation)', 'K-Means', 'k-pivot', 'Balanced Pivot (Online)'],
      color: '#8b5cf6'
    },
    {
      id: 'graph',
      title: '🌐 Graph Algorithms',
      description: 'DFS, BFS, Dijkstra, Bellman-Ford, Kruskal',
      algorithms: ['DFS', 'BFS', 'Dijkstra', 'Bellman-Ford', 'Kruskal'],
      color: '#3b82f6'
    },
    {
      id: 'search',
      title: '🔍 Search Algorithms',
      description: 'Binary Search, Linear Search, Jump Search',
      algorithms: ['Binary Search', 'Linear Search', 'Jump Search', 'Exponential Search'],
      color: '#f59e0b'
    }
  ];

  const styles = {
    backButton: {
      position: 'fixed' as const,
      top: '20px',
      left: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '30px',
      marginBottom: '30px',
      textAlign: 'center' as const,
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 10px 0',
    },
    subtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: '16px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    colorBar: (color: string) => ({
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: color,
    }),
    cardTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      marginBottom: '10px',
      marginTop: '8px',
    },
    description: {
      color: '#6b7280',
      fontSize: '14px',
      marginBottom: '15px',
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '6px',
    },
    tag: {
      background: '#f3f4f6',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      color: '#4b5563',
    },
    authorCredit: {
      marginTop: '20px',
      textAlign: 'center' as const,
      color: 'rgba(255,255,255,0.7)',
      fontSize: '14px',
    },
    authorLink: {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'none',
      fontWeight: 'bold',
      transition: 'color 0.3s ease',
    }
  };

  const handleBackClick = () => {
    window.location.href = 'https://andisheghs.github.io/writing.html';
  };

  return (
    <>
      <button 
        style={styles.backButton}
        onClick={handleBackClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(-5px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
      >
        ← Back to Portfolio
      </button>

      <header style={styles.header}>
        <h1 style={styles.title}>🎯 Algorithm Visualizer</h1>
        <p style={styles.subtitle}>
          Interactive visualization of computer science algorithms
        </p>
        <div style={styles.authorCredit}>
          Created by <a href="https://andisheghs.github.io" style={styles.authorLink}>Andisheh Ghasemi</a>
        </div>
      </header>
      
      <div style={styles.grid}>
        {algorithms.map(category => (
          <div
            key={category.id}
            style={styles.card}
            onClick={() => onNavigate(category.id as PageType)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={styles.colorBar(category.color)} />
            <h3 style={styles.cardTitle}>{category.title}</h3>
            <p style={styles.description}>{category.description}</p>
            <div style={styles.tagContainer}>
              {category.algorithms.map(algo => (
                <span key={algo} style={styles.tag}>{algo}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};