// src/components/ProblemSelector.tsx
import React from 'react';

interface ProblemSelectorProps {
  onSelectProblem: (problem: 'sorting' | 'clustering' | 'shortest-path' | 'search') => void;
}

export const ProblemSelector: React.FC<ProblemSelectorProps> = ({ onSelectProblem }) => {
  const problems = [
    {
      id: 'sorting',
      title: '📊 Sorting Algorithms',
      description: 'Compare different sorting algorithms: Merge Sort, Quick Sort, Tim Sort, Heap Sort, and more',
      color: '#10b981',
      algorithms: ['Merge Sort', 'Quick Sort', 'Tim Sort', 'Heap Sort', 'Bubble Sort'],
    },
    {
      id: 'clustering',
      title: '🔗 Correlation Clustering',
      description: 'Visualize the Pivot algorithm for correlation clustering with signed graphs',
      color: '#8b5cf6',
      algorithms: ['Pivot Algorithm', 'K-means'],
    },
    {
      id: 'shortest-path',
      title: '🛤️ Shortest Path',
      description: 'Find the shortest path in graphs using Dijkstra, A*, and Bellman-Ford',
      color: '#3b82f6',
      algorithms: ['Dijkstra', 'A*', 'Bellman-Ford'],
    },
    {
      id: 'search',
      title: '🔍 Search Algorithms',
      description: 'Explore searching techniques: Binary Search, BFS, DFS, and more',
      color: '#f59e0b',
      algorithms: ['Binary Search', 'Linear Search', 'BFS', 'DFS'],
    },
  ];

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      padding: '20px',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    cardHeader: {
      marginBottom: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    description: {
      color: '#6b7280',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '16px',
    },
    algorithmList: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
      marginTop: '12px',
    },
    algorithmTag: {
      backgroundColor: '#f3f4f6',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      color: '#4b5563',
    },
    colorBar: (color: string) => ({
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: color,
    }),
    comingSoon: {
      position: 'absolute' as const,
      top: '12px',
      right: '12px',
      backgroundColor: '#fbbf24',
      color: '#78350f',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 'bold',
    }
  };

  return (
    <div style={styles.container}>
      {problems.map((problem) => (
        <div
          key={problem.id}
          style={styles.card}
          onClick={() => onSelectProblem(problem.id as any)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={styles.colorBar(problem.color)} />
          {(problem.id === 'shortest-path' || problem.id === 'search') && (
            <div style={styles.comingSoon}>COMING SOON</div>
          )}
          <div style={styles.cardHeader}>
            <h3 style={styles.title}>{problem.title}</h3>
            <p style={styles.description}>{problem.description}</p>
          </div>
          <div style={styles.algorithmList}>
            {problem.algorithms.map((algo) => (
              <span key={algo} style={styles.algorithmTag}>
                {algo}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};