// src/pages/ClusteringPage.tsx
import React, { useState, useRef } from 'react';
import { InteractiveGraphBuilder, GraphNode, GraphEdge } from '../components/common/InteractiveGraphBuilder';
import { CodeDisplay } from '../components/common/CodeDisplay';

interface ClusteringPageProps {
  onBack: () => void;
}

export const ClusteringPage: React.FC<ClusteringPageProps> = ({ onBack }) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [builderMode, setBuilderMode] = useState<'add-node' | 'add-edge' | 'delete' | 'move' | 'view'>('add-node');
  const [edgeType, setEdgeType] = useState<'positive' | 'negative'>('positive');
  const [algorithm, setAlgorithm] = useState<'pivot' | 'kmeans'>('pivot');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentLine, setCurrentLine] = useState(-1);
  const [k, setK] = useState(3); // For K-means
  const speedRef = useRef(500);
  speedRef.current = speed;

  const styles = {
    container: {
      background: 'white',
      borderRadius: '12px',
      padding: '32px',
      maxWidth: '1400px',
      margin: '0 auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    backButton: {
      background: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    toolbar: {
      display: 'flex',
      gap: '10px',
      padding: '15px',
      background: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '20px',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    },
    modeButton: (isActive: boolean) => ({
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      backgroundColor: isActive ? '#8b5cf6' : '#e5e7eb',
      color: isActive ? 'white' : '#374151',
      transition: 'all 0.2s',
    }),
    edgeTypeButton: (isActive: boolean, type: string) => ({
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      backgroundColor: isActive ? (type === 'positive' ? '#10b981' : '#ef4444') : '#e5e7eb',
      color: isActive ? 'white' : '#374151',
      transition: 'all 0.2s',
    }),
    select: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      backgroundColor: 'white',
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '850px 1fr',
      gap: '20px',
    },
    controlButton: {
      padding: '10px 20px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      backgroundColor: '#10b981',
      color: 'white',
      marginRight: '10px',
    }
  };

  const pivotAlgorithmCode = [
    'function pivotClustering(nodes, edges) {',
    '  let clusters = {}',
    '  let unclustered = new Set(nodes)',
    '  let clusterIndex = 0',
    '  ',
    '  while (unclustered.size > 0) {',
    '    // Pick random pivot',
    '    let pivot = randomChoice(unclustered)',
    '    ',
    '    // Create new cluster with pivot',
    '    clusters[pivot] = clusterIndex',
    '    unclustered.delete(pivot)',
    '    ',
    '    // Add positive neighbors to cluster',
    '    for (let neighbor of getPositiveNeighbors(pivot)) {',
    '      if (unclustered.has(neighbor)) {',
    '        clusters[neighbor] = clusterIndex',
    '        unclustered.delete(neighbor)',
    '      }',
    '    }',
    '    ',
    '    clusterIndex++',
    '  }',
    '  return clusters',
    '}'
  ];

  const kmeansCode = [
    'function kMeans(points, k) {',
    '  // Initialize k random centroids',
    '  let centroids = selectRandomPoints(points, k)',
    '  let assignments = []',
    '  let changed = true',
    '  ',
    '  while (changed) {',
    '    changed = false',
    '    ',
    '    // Assignment step',
    '    for (let point of points) {',
    '      let nearest = findNearestCentroid(point, centroids)',
    '      if (assignments[point] !== nearest) {',
    '        assignments[point] = nearest',
    '        changed = true',
    '      }',
    '    }',
    '    ',
    '    // Update step',
    '    for (let i = 0; i < k; i++) {',
    '      let clusterPoints = getClusterPoints(i, assignments)',
    '      centroids[i] = calculateMean(clusterPoints)',
    '    }',
    '  }',
    '  ',
    '  return assignments',
    '}'
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runPivotAlgorithm = async () => {
    setRunning(true);
    setBuilderMode('view');
    
    const clusters: Record<string, number> = {};
    const unclustered = new Set(nodes.map(n => n.id));
    let clusterIndex = 0;

    setCurrentLine(2); // let unclustered = ...
    await sleep(speedRef.current);

    while (unclustered.size > 0) {
      setCurrentLine(7); // let pivot = ...
      await sleep(speedRef.current);
      
      const pivotArray = Array.from(unclustered);
      const pivot = pivotArray[Math.floor(Math.random() * pivotArray.length)];
      
      setCurrentLine(10); // clusters[pivot] = ...
      clusters[pivot] = clusterIndex;
      unclustered.delete(pivot);
      
      setNodes(prev => prev.map(n => 
        n.id === pivot ? {...n, cluster: clusterIndex} : n
      ));
      await sleep(speedRef.current);

      setCurrentLine(14); // for (let neighbor...)
      const positiveEdges = edges.filter(e => 
        e.type === 'positive' && (e.from === pivot || e.to === pivot)
      );

      for (const edge of positiveEdges) {
        const neighbor = edge.from === pivot ? edge.to : edge.from;
        
        if (unclustered.has(neighbor)) {
          setCurrentLine(16); // clusters[neighbor] = ...
          await sleep(speedRef.current);
          
          clusters[neighbor] = clusterIndex;
          unclustered.delete(neighbor);
          
          setNodes(prev => prev.map(n => 
            n.id === neighbor ? {...n, cluster: clusterIndex} : n
          ));
        }
      }

      clusterIndex++;
      setCurrentLine(21); // clusterIndex++
      await sleep(speedRef.current);
    }

    setCurrentLine(-1);
    setRunning(false);
  };

  const runKMeans = async () => {
    if (nodes.length < k) {
      alert(`Need at least ${k} nodes for K-means`);
      return;
    }

    setRunning(true);
    setBuilderMode('view');
    
    // Initialize random centroids
    setCurrentLine(2);
    await sleep(speedRef.current);
    
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    const centroids = shuffled.slice(0, k).map(n => ({...n}));
    
    let assignments: number[] = new Array(nodes.length).fill(-1);
    let changed = true;
    let iterations = 0;

    while (changed && iterations < 50) {
      changed = false;
      
      // Assignment step
      setCurrentLine(10);
      await sleep(speedRef.current);
      
      for (let i = 0; i < nodes.length; i++) {
        setCurrentLine(11);
        await sleep(speedRef.current / 2);
        
        const node = nodes[i];
        let minDist = Infinity;
        let nearest = 0;
        
        for (let j = 0; j < k; j++) {
          const dist = Math.sqrt(
            Math.pow(node.x - centroids[j].x, 2) + 
            Math.pow(node.y - centroids[j].y, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            nearest = j;
          }
        }
        
        if (assignments[i] !== nearest) {
          assignments[i] = nearest;
          changed = true;
          
          setNodes(prev => prev.map((n, idx) => 
            idx === i ? {...n, cluster: nearest} : n
          ));
        }
      }
      
      // Update centroids
      setCurrentLine(20);
      await sleep(speedRef.current);
      
      for (let i = 0; i < k; i++) {
        const clusterNodes = nodes.filter((_, idx) => assignments[idx] === i);
        if (clusterNodes.length > 0) {
          centroids[i].x = clusterNodes.reduce((sum, n) => sum + n.x, 0) / clusterNodes.length;
          centroids[i].y = clusterNodes.reduce((sum, n) => sum + n.y, 0) / clusterNodes.length;
        }
      }
      
      iterations++;
    }

    setCurrentLine(-1);
    setRunning(false);
  };

  const runAlgorithm = () => {
    if (algorithm === 'pivot') {
      runPivotAlgorithm();
    } else {
      runKMeans();
    }
  };

  const resetClusters = () => {
    setNodes(nodes.map(n => ({...n, cluster: undefined})));
    setCurrentLine(-1);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setCurrentLine(-1);
  };

  // Predefined example datasets
  const loadPivotExample = () => {
    // Create a graph with 3 clear communities
    const exampleNodes: GraphNode[] = [
      // Community 1 (top-left)
      { id: 'n1', x: 150, y: 150, label: '1' },
      { id: 'n2', x: 100, y: 200, label: '2' },
      { id: 'n3', x: 200, y: 200, label: '3' },
      { id: 'n4', x: 150, y: 250, label: '4' },
      
      // Community 2 (top-right)
      { id: 'n5', x: 450, y: 150, label: '5' },
      { id: 'n6', x: 400, y: 200, label: '6' },
      { id: 'n7', x: 500, y: 200, label: '7' },
      { id: 'n8', x: 450, y: 250, label: '8' },
      
      // Community 3 (bottom-center)
      { id: 'n9', x: 300, y: 350, label: '9' },
      { id: 'n10', x: 250, y: 400, label: '10' },
      { id: 'n11', x: 350, y: 400, label: '11' },
      { id: 'n12', x: 300, y: 450, label: '12' },
      
      // Bridge nodes
      { id: 'n13', x: 250, y: 300, label: '13' },
      { id: 'n14', x: 350, y: 300, label: '14' },
    ];

    const exampleEdges: GraphEdge[] = [
      // Community 1 internal (positive)
      { from: 'n1', to: 'n2', type: 'positive' },
      { from: 'n1', to: 'n3', type: 'positive' },
      { from: 'n2', to: 'n4', type: 'positive' },
      { from: 'n3', to: 'n4', type: 'positive' },
      
      // Community 2 internal (positive)
      { from: 'n5', to: 'n6', type: 'positive' },
      { from: 'n5', to: 'n7', type: 'positive' },
      { from: 'n6', to: 'n8', type: 'positive' },
      { from: 'n7', to: 'n8', type: 'positive' },
      
      // Community 3 internal (positive)
      { from: 'n9', to: 'n10', type: 'positive' },
      { from: 'n9', to: 'n11', type: 'positive' },
      { from: 'n10', to: 'n12', type: 'positive' },
      { from: 'n11', to: 'n12', type: 'positive' },
      
      // Bridge connections (mixed)
      { from: 'n13', to: 'n1', type: 'positive' },
      { from: 'n13', to: 'n9', type: 'positive' },
      { from: 'n14', to: 'n5', type: 'positive' },
      { from: 'n14', to: 'n9', type: 'positive' },
      
      // Negative edges between communities
      { from: 'n2', to: 'n6', type: 'negative' },
      { from: 'n3', to: 'n7', type: 'negative' },
      { from: 'n4', to: 'n10', type: 'negative' },
      { from: 'n8', to: 'n11', type: 'negative' },
      { from: 'n13', to: 'n14', type: 'negative' },
    ];

    setNodes(exampleNodes);
    setEdges(exampleEdges);
    setAlgorithm('pivot');
    setCurrentLine(-1);
  };

  const loadKMeansExample = () => {
    // Create 4 natural clusters of points
    const exampleNodes: GraphNode[] = [];
    let nodeId = 1;

    // Cluster 1 (top-left) - tight cluster
    const cluster1Center = { x: 200, y: 180 };
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 30 + Math.random() * 20;
      exampleNodes.push({
        id: `n${nodeId}`,
        x: cluster1Center.x + Math.cos(angle) * radius,
        y: cluster1Center.y + Math.sin(angle) * radius,
        label: String(nodeId++)
      });
    }

    // Cluster 2 (top-right) - spread cluster
    const cluster2Center = { x: 500, y: 200 };
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 40 + Math.random() * 30;
      exampleNodes.push({
        id: `n${nodeId}`,
        x: cluster2Center.x + Math.cos(angle) * radius,
        y: cluster2Center.y + Math.sin(angle) * radius,
        label: String(nodeId++)
      });
    }

    // Cluster 3 (bottom-left) - elongated cluster
    const cluster3Center = { x: 180, y: 380 };
    for (let i = 0; i < 6; i++) {
      exampleNodes.push({
        id: `n${nodeId}`,
        x: cluster3Center.x + (Math.random() - 0.5) * 100,
        y: cluster3Center.y + (Math.random() - 0.5) * 40,
        label: String(nodeId++)
      });
    }

    // Cluster 4 (bottom-right) - dense cluster
    const cluster4Center = { x: 500, y: 380 };
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const radius = 20 + Math.random() * 15;
      exampleNodes.push({
        id: `n${nodeId}`,
        x: cluster4Center.x + Math.cos(angle) * radius,
        y: cluster4Center.y + Math.sin(angle) * radius,
        label: String(nodeId++)
      });
    }

    // Add some outliers
    exampleNodes.push(
      { id: `n${nodeId++}`, x: 350, y: 100, label: String(nodeId-1) },
      { id: `n${nodeId++}`, x: 350, y: 280, label: String(nodeId-1) },
      { id: `n${nodeId++}`, x: 650, y: 300, label: String(nodeId-1) }
    );

    setNodes(exampleNodes);
    setEdges([]); // K-means doesn't use edges
    setAlgorithm('kmeans');
    setK(4); // Set K to match the natural clusters
    setCurrentLine(-1);
  };

  const loadSocialNetworkExample = () => {
    // Create a more complex social network with multiple communities
    const exampleNodes: GraphNode[] = [
      // Friend group 1 (top)
      { id: 'p1', x: 300, y: 100, label: 'A' },
      { id: 'p2', x: 250, y: 150, label: 'B' },
      { id: 'p3', x: 350, y: 150, label: 'C' },
      { id: 'p4', x: 300, y: 200, label: 'D' },
      
      // Friend group 2 (left)
      { id: 'p5', x: 150, y: 250, label: 'E' },
      { id: 'p6', x: 100, y: 300, label: 'F' },
      { id: 'p7', x: 200, y: 300, label: 'G' },
      { id: 'p8', x: 150, y: 350, label: 'H' },
      
      // Friend group 3 (right)
      { id: 'p9', x: 550, y: 250, label: 'I' },
      { id: 'p10', x: 500, y: 300, label: 'J' },
      { id: 'p11', x: 600, y: 300, label: 'K' },
      { id: 'p12', x: 550, y: 350, label: 'L' },
      
      // Friend group 4 (bottom)
      { id: 'p13', x: 350, y: 400, label: 'M' },
      { id: 'p14', x: 300, y: 450, label: 'N' },
      { id: 'p15', x: 400, y: 450, label: 'O' },
      
      // Connectors/influencers
      { id: 'p16', x: 350, y: 275, label: 'P' },
      { id: 'p17', x: 250, y: 350, label: 'Q' },
      { id: 'p18', x: 450, y: 350, label: 'R' },
    ];

    const exampleEdges: GraphEdge[] = [
      // Group 1 internal
      { from: 'p1', to: 'p2', type: 'positive' },
      { from: 'p1', to: 'p3', type: 'positive' },
      { from: 'p2', to: 'p4', type: 'positive' },
      { from: 'p3', to: 'p4', type: 'positive' },
      { from: 'p1', to: 'p4', type: 'positive' },
      
      // Group 2 internal
      { from: 'p5', to: 'p6', type: 'positive' },
      { from: 'p5', to: 'p7', type: 'positive' },
      { from: 'p6', to: 'p8', type: 'positive' },
      { from: 'p7', to: 'p8', type: 'positive' },
      { from: 'p5', to: 'p8', type: 'positive' },
      
      // Group 3 internal
      { from: 'p9', to: 'p10', type: 'positive' },
      { from: 'p9', to: 'p11', type: 'positive' },
      { from: 'p10', to: 'p12', type: 'positive' },
      { from: 'p11', to: 'p12', type: 'positive' },
      { from: 'p9', to: 'p12', type: 'positive' },
      
      // Group 4 internal
      { from: 'p13', to: 'p14', type: 'positive' },
      { from: 'p13', to: 'p15', type: 'positive' },
      { from: 'p14', to: 'p15', type: 'positive' },
      
      // Connector relationships
      { from: 'p16', to: 'p1', type: 'positive' },
      { from: 'p16', to: 'p9', type: 'positive' },
      { from: 'p16', to: 'p13', type: 'positive' },
      { from: 'p17', to: 'p5', type: 'positive' },
      { from: 'p17', to: 'p13', type: 'positive' },
      { from: 'p18', to: 'p9', type: 'positive' },
      { from: 'p18', to: 'p13', type: 'positive' },
      
      // Conflicts (negative edges)
      { from: 'p2', to: 'p10', type: 'negative' },
      { from: 'p6', to: 'p11', type: 'negative' },
      { from: 'p7', to: 'p12', type: 'negative' },
      { from: 'p3', to: 'p5', type: 'negative' },
      { from: 'p16', to: 'p17', type: 'negative' },
      { from: 'p16', to: 'p18', type: 'negative' },
      { from: 'p17', to: 'p18', type: 'negative' },
    ];

    setNodes(exampleNodes);
    setEdges(exampleEdges);
    setAlgorithm('pivot');
    setCurrentLine(-1);
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Home
      </button>
      
      <h2 style={styles.title}>🔗 Clustering Algorithms</h2>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            style={styles.modeButton(builderMode === 'add-node')}
            onClick={() => setBuilderMode('add-node')}
            disabled={running}
          >
            Add Node
          </button>
          <button
            style={styles.modeButton(builderMode === 'add-edge')}
            onClick={() => setBuilderMode('add-edge')}
            disabled={running}
          >
            Add Edge
          </button>
          <button
            style={styles.modeButton(builderMode === 'move')}
            onClick={() => setBuilderMode('move')}
            disabled={running}
          >
            Move
          </button>
          <button
            style={styles.modeButton(builderMode === 'delete')}
            onClick={() => setBuilderMode('delete')}
            disabled={running}
          >
            Delete
          </button>
        </div>

        {builderMode === 'add-edge' && algorithm === 'pivot' && (
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              style={styles.edgeTypeButton(edgeType === 'positive', 'positive')}
              onClick={() => setEdgeType('positive')}
            >
              + Positive
            </button>
            <button
              style={styles.edgeTypeButton(edgeType === 'negative', 'negative')}
              onClick={() => setEdgeType('negative')}
            >
              − Negative
            </button>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>Algorithm:</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'pivot' | 'kmeans')}
            style={styles.select}
            disabled={running}
          >
            <option value="pivot">Pivot (Correlation)</option>
            <option value="kmeans">K-Means</option>
          </select>

          {algorithm === 'kmeans' && (
            <>
              <label>K:</label>
              <input
                type="number"
                min="2"
                max="5"
                value={k}
                onChange={(e) => setK(parseInt(e.target.value) || 3)}
                style={{ width: '50px', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                disabled={running}
              />
            </>
          )}

          <label>Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            style={styles.select}
            disabled={running}
          >
            <option value="2000">Very Slow (2s)</option>
            <option value="1000">Slow (1s)</option>
            <option value="500">Normal (0.5s)</option>
            <option value="200">Fast (0.2s)</option>
            <option value="50">Very Fast (0.05s)</option>
          </select>
        </div>
      </div>

      {/* Example Data Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        padding: '15px',
        background: '#e5e7eb',
        borderRadius: '8px'
      }}>
        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>📊 Load Example:</span>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#8b5cf6',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onClick={loadPivotExample}
          disabled={running}
        >
          🔗 Correlation Clustering
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onClick={loadKMeansExample}
          disabled={running}
        >
          📍 K-Means Points
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#10b981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onClick={loadSocialNetworkExample}
          disabled={running}
        >
          👥 Social Network
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div>
          <InteractiveGraphBuilder
            width={800}
            height={500}
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            mode={builderMode}
            edgeType={edgeType}
            showWeights={false}
            showInstructions={true}
          />

          {/* Control Buttons */}
          <div style={{ marginTop: '20px' }}>
            <button
              style={styles.controlButton}
              onClick={runAlgorithm}
              disabled={running || nodes.length === 0}
            >
              {running ? 'Running...' : '▶ Run Algorithm'}
            </button>
            <button
              style={{ ...styles.controlButton, backgroundColor: '#6b7280' }}
              onClick={resetClusters}
              disabled={running}
            >
              🔄 Reset Clusters
            </button>
            <button
              style={{ ...styles.controlButton, backgroundColor: '#ef4444' }}
              onClick={clearAll}
              disabled={running}
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Code Display */}
        <div>
          <CodeDisplay
            code={algorithm === 'pivot' ? pivotAlgorithmCode : kmeansCode}
            currentLine={currentLine}
            title={algorithm === 'pivot' ? 'Pivot Algorithm' : 'K-Means Algorithm'}
          />

          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f9fafb', 
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              {algorithm === 'pivot' ? '📚 How Pivot Clustering Works:' : '📚 How K-Means Works:'}
            </h3>
            {algorithm === 'pivot' ? (
              <div style={{ color: '#6b7280' }}>
                <p>1. Start with all nodes unclustered</p>
                <p>2. Pick a random node as "pivot"</p>
                <p>3. Create a new cluster with the pivot</p>
                <p>4. Add all nodes connected to pivot with <strong style={{color: '#10b981'}}>positive edges</strong> to the same cluster</p>
                <p>5. Repeat until all nodes are clustered</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Goal:</strong> Minimize mistakes (positive edges between clusters, negative edges within clusters)
                </p>
              </div>
            ) : (
              <div style={{ color: '#6b7280' }}>
                <p>1. Initialize K random points as centroids</p>
                <p>2. <strong>Assignment:</strong> Assign each point to nearest centroid</p>
                <p>3. <strong>Update:</strong> Move centroids to mean of their cluster</p>
                <p>4. Repeat steps 2-3 until convergence</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Goal:</strong> Minimize within-cluster sum of squares
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};