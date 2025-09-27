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
  const [algorithm, setAlgorithm] = useState<'pivot' | 'k-pivot' | 'balanced-pivot' | 'kmeans'>('pivot');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentLine, setCurrentLine] = useState(-1);
  const [k, setK] = useState(3); // For K-means and K-pivot
  const [currentPivot, setCurrentPivot] = useState<string | null>(null);
  const [pivots, setPivots] = useState<Set<string>>(new Set());
  const [arrivedNodes, setArrivedNodes] = useState<Set<string>>(new Set());
  const speedRef = useRef(500);
  speedRef.current = speed;
  const stopSignal = useRef(false);

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
    },
    stopButton: {
      padding: '10px 20px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      backgroundColor: '#ef4444',
      color: 'white',
      marginRight: '10px',
    }
  };

  const pivotAlgorithmCode = [
    'function pivotClustering(nodes, edges) {',
    '  let clusters = {}',
    '  let permutation = shuffle(nodes)',
    '  let clusterIndex = 0',
    '  ',
    '  for (let pivot of permutation) {',
    '    if (!clusters.hasOwnProperty(pivot)) {',
    '      // Create new cluster with pivot',
    '      clusters[pivot] = clusterIndex',
    '      ',
    '      // Add all neighbors to cluster',
    '      for (let neighbor of getNeighbors(pivot, edges)) {',
    '        if (!clusters.hasOwnProperty(neighbor)) {',
    '          clusters[neighbor] = clusterIndex',
    '        }',
    '      }',
    '      ',
    '      clusterIndex++',
    '    }',
    '  }',
    '  return clusters',
    '}'
  ];

  const kPivotAlgorithmCode = [
    'function kPivotClustering(nodes, edges, k) {',
    '  let clusters = {}',
    '  let clusterSizes = new Array(k).fill(0)',
    '  let permutation = shuffle(nodes)',
    '  let pivotCount = 0',
    '  ',
    '  for (let pivot of permutation) {',
    '    if (!clusters.hasOwnProperty(pivot)) {',
    '      let clusterId',
    '      ',
    '      if (pivotCount < k) {',
    '        // First k pivots create new clusters',
    '        clusterId = pivotCount',
    '        pivotCount++',
    '      } else {',
    '        // Find cluster with minimum size',
    '        clusterId = clusterSizes.indexOf(Math.min(...clusterSizes))',
    '      }',
    '      ',
    '      clusters[pivot] = clusterId',
    '      clusterSizes[clusterId]++',
    '      ',
    '      // Add neighbors to same cluster',
    '      for (let neighbor of getNeighbors(pivot, edges)) {',
    '        if (!clusters.hasOwnProperty(neighbor)) {',
    '          clusters[neighbor] = clusterId',
    '          clusterSizes[clusterId]++',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return clusters',
    '}'
  ];

  const balancedPivotCode = [
    'function balancedPivot(nodes, edges, k) {',
    '  let clusters = {}',
    '  let pivots = new Set()',
    '  let clusterSizes = new Array(k).fill(0)',
    '  ',
    '  // Process nodes one by one (online)',
    '  for (let node of nodes) {',
    '    let pivotNeighbor = null',
    '    ',
    '    // Check if node has a pivot neighbor',
    '    for (let neighbor of getNeighbors(node, edges)) {',
    '      if (pivots.has(neighbor)) {',
    '        pivotNeighbor = neighbor',
    '        break',
    '      }',
    '    }',
    '    ',
    '    if (pivotNeighbor) {',
    '      // Add to pivot neighbor\'s cluster',
    '      clusters[node] = clusters[pivotNeighbor]',
    '      clusterSizes[clusters[node]]++',
    '    } else {',
    '      // Make it a pivot in smallest cluster',
    '      let clusterId = clusterSizes.indexOf(Math.min(...clusterSizes))',
    '      clusters[node] = clusterId',
    '      clusterSizes[clusterId]++',
    '      pivots.add(node)',
    '    }',
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

  const getNeighbors = (nodeId: string, edges: GraphEdge[]): string[] => {
    const neighbors: string[] = [];
    edges.forEach(edge => {
      if (edge.from === nodeId) neighbors.push(edge.to);
      if (edge.to === nodeId) neighbors.push(edge.from);
    });
    return neighbors;
  };

  const runPivotAlgorithm = async () => {
    setRunning(true);
    setBuilderMode('view');
    setCurrentPivot(null);
    setPivots(new Set());
    stopSignal.current = false;
    
    const clusters: Record<string, number> = {};
    const permutation = [...nodes].sort(() => Math.random() - 0.5);
    let clusterIndex = 0;

    setCurrentLine(2); // let permutation = shuffle(nodes)
    await sleep(speedRef.current);

    for (const pivot of permutation) {
      if (stopSignal.current) break;
      
      if (!clusters.hasOwnProperty(pivot.id)) {
        setCurrentLine(6); // for (let pivot of permutation)
        await sleep(speedRef.current);
        
        // Highlight current pivot in red
        setCurrentPivot(pivot.id);
        setPivots(prev => new Set([...prev, pivot.id]));
        setCurrentLine(8); // clusters[pivot] = clusterIndex
        
        clusters[pivot.id] = clusterIndex;
        setNodes(prev => prev.map(n => 
          n.id === pivot.id ? {...n, cluster: clusterIndex, isPivot: true} : n
        ));
        await sleep(speedRef.current);

        // Get and color neighbors with same cluster color
        const neighbors = getNeighbors(pivot.id, edges);
        setCurrentLine(11); // for (let neighbor of getNeighbors...)
        
        for (const neighbor of neighbors) {
          if (stopSignal.current) break;
          if (!clusters.hasOwnProperty(neighbor)) {
            setCurrentLine(13); // clusters[neighbor] = clusterIndex
            await sleep(speedRef.current / 2);
            
            clusters[neighbor] = clusterIndex;
            setNodes(prev => prev.map(n => 
              n.id === neighbor ? {...n, cluster: clusterIndex} : n
            ));
          }
        }

        clusterIndex++;
        setCurrentLine(17); // clusterIndex++
        await sleep(speedRef.current);
        setCurrentPivot(null); // Clear current pivot highlighting
      }
    }

    setCurrentLine(-1);
    setCurrentPivot(null);
    setPivots(new Set());
    setRunning(false);
  };

  const runKPivotAlgorithm = async () => {
    setRunning(true);
    setBuilderMode('view');
    setCurrentPivot(null);
    setPivots(new Set());
    stopSignal.current = false;
    
    const clusters: Record<string, number> = {};
    const clusterSizes = new Array(k).fill(0);
    const permutation = [...nodes].sort(() => Math.random() - 0.5);
    let pivotCount = 0;

    setCurrentLine(2); // let clusterSizes = new Array(k).fill(0)
    await sleep(speedRef.current);

    for (const pivot of permutation) {
      if (stopSignal.current) break;
      
      if (!clusters.hasOwnProperty(pivot.id)) {
        setCurrentLine(7); // for (let pivot of permutation)
        await sleep(speedRef.current);
        
        let clusterId: number;
        
        if (pivotCount < k) {
          setCurrentLine(11); // if (pivotCount < k)
          clusterId = pivotCount;
          pivotCount++;
        } else {
          setCurrentLine(16); // clusterId = clusterSizes.indexOf...
          clusterId = clusterSizes.indexOf(Math.min(...clusterSizes));
        }
        
        // Highlight current pivot
        setCurrentPivot(pivot.id);
        setPivots(prev => new Set([...prev, pivot.id]));
        
        setCurrentLine(19); // clusters[pivot] = clusterId
        clusters[pivot.id] = clusterId;
        clusterSizes[clusterId]++;
        setNodes(prev => prev.map(n => 
          n.id === pivot.id ? {...n, cluster: clusterId, isPivot: true} : n
        ));
        await sleep(speedRef.current);

        // Add neighbors
        const neighbors = getNeighbors(pivot.id, edges);
        setCurrentLine(23); // for (let neighbor of getNeighbors...)
        
        for (const neighbor of neighbors) {
          if (stopSignal.current) break;
          if (!clusters.hasOwnProperty(neighbor)) {
            setCurrentLine(25); // clusters[neighbor] = clusterId
            await sleep(speedRef.current / 2);
            
            clusters[neighbor] = clusterId;
            clusterSizes[clusterId]++;
            setNodes(prev => prev.map(n => 
              n.id === neighbor ? {...n, cluster: clusterId} : n
            ));
          }
        }
        
        await sleep(speedRef.current);
        setCurrentPivot(null);
      }
    }

    setCurrentLine(-1);
    setCurrentPivot(null);
    setPivots(new Set());
    setRunning(false);
  };

  const runBalancedPivotAlgorithm = async () => {
    setRunning(true);
    setBuilderMode('view');
    setCurrentPivot(null);
    setPivots(new Set());
    setArrivedNodes(new Set());
    stopSignal.current = false;
    
    const clusters: Record<string, number> = {};
    const pivotsSet = new Set<string>();
    const clusterSizes = new Array(k).fill(0);
    
    // Reset all nodes to be "unarrived" (faded)
    setNodes(prev => prev.map(n => ({...n, cluster: undefined})));

    setCurrentLine(1); // function balancedPivot...
    await sleep(speedRef.current);

    // Process nodes one by one
    for (const node of nodes) {
      if (stopSignal.current) break;
      
      setCurrentLine(6); // for (let node of nodes)
      
      // Mark node as arrived
      setArrivedNodes(prev => new Set([...prev, node.id]));
      await sleep(speedRef.current);

      let pivotNeighbor: string | null = null;
      
      setCurrentLine(10); // for (let neighbor of getNeighbors...)
      const neighbors = getNeighbors(node.id, edges);
      
      // Only consider neighbors that have already arrived
      for (const neighbor of neighbors) {
        if (pivotsSet.has(neighbor) && arrivedNodes.has(neighbor)) {
          pivotNeighbor = neighbor;
          break;
        }
      }

      if (pivotNeighbor) {
        setCurrentLine(18); // if (pivotNeighbor)
        await sleep(speedRef.current);
        
        // Add to pivot neighbor's cluster
        setCurrentLine(20); // clusters[node] = clusters[pivotNeighbor]
        clusters[node.id] = clusters[pivotNeighbor];
        clusterSizes[clusters[node.id]]++;
        setNodes(prev => prev.map(n => 
          n.id === node.id ? {...n, cluster: clusters[node.id]} : n
        ));
      } else {
        setCurrentLine(23); // else
        await sleep(speedRef.current);
        
        // Make it a pivot in smallest cluster
        setCurrentLine(24); // let clusterId = clusterSizes.indexOf...
        const clusterId = clusterSizes.indexOf(Math.min(...clusterSizes));
        
        setCurrentPivot(node.id);
        setPivots(prev => new Set([...prev, node.id]));
        
        clusters[node.id] = clusterId;
        clusterSizes[clusterId]++;
        pivotsSet.add(node.id);
        
        setNodes(prev => prev.map(n => 
          n.id === node.id ? {...n, cluster: clusterId, isPivot: true} : n
        ));
        
        await sleep(speedRef.current);
        setCurrentPivot(null);
      }
    }

    setCurrentLine(-1);
    setCurrentPivot(null);
    setPivots(new Set());
    setArrivedNodes(new Set());
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

  const stopAlgorithm = () => {
    stopSignal.current = true;
    setRunning(false);
    setCurrentLine(-1);
  };

  const runAlgorithm = () => {
    stopSignal.current = false;
    switch (algorithm) {
      case 'pivot':
        runPivotAlgorithm();
        break;
      case 'k-pivot':
        runKPivotAlgorithm();
        break;
      case 'balanced-pivot':
        runBalancedPivotAlgorithm();
        break;
      case 'kmeans':
        runKMeans();
        break;
    }
  };

  const resetClusters = () => {
    setNodes(nodes.map(n => ({...n, cluster: undefined})));
    setCurrentLine(-1);
    setCurrentPivot(null);
    setPivots(new Set());
    setArrivedNodes(new Set());
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setCurrentLine(-1);
    setCurrentPivot(null);
    setPivots(new Set());
    setArrivedNodes(new Set());
  };

  // Predefined example datasets
  const loadCorrelationExample = () => {
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
      // Community 1 internal (all positive by default)
      { from: 'n1', to: 'n2', type: 'positive' },
      { from: 'n1', to: 'n3', type: 'positive' },
      { from: 'n2', to: 'n4', type: 'positive' },
      { from: 'n3', to: 'n4', type: 'positive' },
      
      // Community 2 internal
      { from: 'n5', to: 'n6', type: 'positive' },
      { from: 'n5', to: 'n7', type: 'positive' },
      { from: 'n6', to: 'n8', type: 'positive' },
      { from: 'n7', to: 'n8', type: 'positive' },
      
      // Community 3 internal
      { from: 'n9', to: 'n10', type: 'positive' },
      { from: 'n9', to: 'n11', type: 'positive' },
      { from: 'n10', to: 'n12', type: 'positive' },
      { from: 'n11', to: 'n12', type: 'positive' },
      
      // Bridge connections
      { from: 'n13', to: 'n1', type: 'positive' },
      { from: 'n13', to: 'n9', type: 'positive' },
      { from: 'n14', to: 'n5', type: 'positive' },
      { from: 'n14', to: 'n9', type: 'positive' },
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

    setNodes(exampleNodes);
    setEdges([]); // K-means doesn't use edges
    setAlgorithm('kmeans');
    setK(4); // Set K to match the natural clusters
    setCurrentLine(-1);
  };

  const loadSocialNetworkExample = () => {
    // Create a more complex social network
    const exampleNodes: GraphNode[] = [
      // Friend group 1
      { id: 'p1', x: 300, y: 100, label: 'A' },
      { id: 'p2', x: 250, y: 150, label: 'B' },
      { id: 'p3', x: 350, y: 150, label: 'C' },
      { id: 'p4', x: 300, y: 200, label: 'D' },
      
      // Friend group 2
      { id: 'p5', x: 150, y: 250, label: 'E' },
      { id: 'p6', x: 100, y: 300, label: 'F' },
      { id: 'p7', x: 200, y: 300, label: 'G' },
      { id: 'p8', x: 150, y: 350, label: 'H' },
      
      // Friend group 3
      { id: 'p9', x: 550, y: 250, label: 'I' },
      { id: 'p10', x: 500, y: 300, label: 'J' },
      { id: 'p11', x: 600, y: 300, label: 'K' },
      { id: 'p12', x: 550, y: 350, label: 'L' },
      
      // Friend group 4
      { id: 'p13', x: 350, y: 400, label: 'M' },
      { id: 'p14', x: 300, y: 450, label: 'N' },
      { id: 'p15', x: 400, y: 450, label: 'O' },
      
      // Connectors
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
      
      // Group 2 internal
      { from: 'p5', to: 'p6', type: 'positive' },
      { from: 'p5', to: 'p7', type: 'positive' },
      { from: 'p6', to: 'p8', type: 'positive' },
      { from: 'p7', to: 'p8', type: 'positive' },
      
      // Group 3 internal
      { from: 'p9', to: 'p10', type: 'positive' },
      { from: 'p9', to: 'p11', type: 'positive' },
      { from: 'p10', to: 'p12', type: 'positive' },
      { from: 'p11', to: 'p12', type: 'positive' },
      
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
    ];

    setNodes(exampleNodes);
    setEdges(exampleEdges);
    setAlgorithm('k-pivot');
    setK(4);
    setCurrentLine(-1);
  };

  // Modified node rendering to show pivot state and arrival status
  const getNodeStyle = (node: GraphNode) => {
    const baseStyle: any = {};
    
    // Fade nodes that haven't arrived yet (for balanced-pivot)
    if (algorithm === 'balanced-pivot' && running && !arrivedNodes.has(node.id)) {
      baseStyle.opacity = 0.3;
    }
    
    // Highlight current pivot in red
    if (currentPivot === node.id) {
      baseStyle.stroke = '#dc2626';
      baseStyle.strokeWidth = 4;
      baseStyle.fill = '#ef4444'; // Red for current pivot
    } else if (pivots.has(node.id)) {
      // Mark previous pivots with thicker border
      baseStyle.stroke = '#f59e0b';
      baseStyle.strokeWidth = 3;
    }
    
    return baseStyle;
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

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>Algorithm:</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as any)}
            style={styles.select}
            disabled={running}
          >
            <option value="pivot">Pivot (Correlation)</option>
            <option value="k-pivot">K-Pivot (Correlation K-Clustering)</option>
            <option value="balanced-pivot">Balanced Pivot (Online)</option>
            <option value="kmeans">K-Means</option>
          </select>

          {(algorithm === 'kmeans' || algorithm === 'k-pivot' || algorithm === 'balanced-pivot') && (
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
          onClick={loadCorrelationExample}
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
            nodes={nodes.map(n => ({
              ...n,
              style: getNodeStyle(n)
            }))}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            mode={builderMode}
            edgeType="positive"
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
              style={styles.stopButton}
              onClick={stopAlgorithm}
              disabled={!running}
            >
              ⬛ Stop
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
            code={
              algorithm === 'pivot' ? pivotAlgorithmCode :
              algorithm === 'k-pivot' ? kPivotAlgorithmCode :
              algorithm === 'balanced-pivot' ? balancedPivotCode :
              kmeansCode
            }
            currentLine={currentLine}
            title={
              algorithm === 'pivot' ? 'Pivot Algorithm' :
              algorithm === 'k-pivot' ? 'K-Pivot Algorithm' :
              algorithm === 'balanced-pivot' ? 'Balanced Pivot (Online)' :
              'K-Means Algorithm'
            }
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
              {algorithm === 'pivot' ? '📚 How Pivot Clustering Works:' :
               algorithm === 'k-pivot' ? '📚 How K-Pivot Clustering Works:' :
               algorithm === 'balanced-pivot' ? '📚 How Balanced Pivot Works:' :
               '📚 How K-Means Works:'}
            </h3>
            {algorithm === 'pivot' ? (
              <div style={{ color: '#6b7280' }}>
                <p>1. Process nodes in random permutation order</p>
                <p>2. For each unassigned node (pivot):</p>
                <p>3. Create a new cluster with the pivot</p>
                <p>4. Add all neighbors (connected nodes) to the same cluster</p>
                <p>5. Continue until all nodes are clustered</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Goal:</strong> Minimize correlation clustering cost (edges = positive correlation, no edge = negative)
                </p>
              </div>
            ) : algorithm === 'k-pivot' ? (
              <div style={{ color: '#6b7280' }}>
                <p>1. Process nodes in random permutation order</p>
                <p>2. First k pivots create new clusters</p>
                <p>3. After k clusters exist:</p>
                <p>4. New pivots go to the cluster with minimum nodes</p>
                <p>5. Neighbors join the pivot's cluster</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Goal:</strong> Create k balanced clusters while respecting correlations
                </p>
              </div>
            ) : algorithm === 'balanced-pivot' ? (
              <div style={{ color: '#6b7280' }}>
                <p>1. Nodes arrive one by one (online algorithm)</p>
                <p>2. For each arriving node:</p>
                <p>3. If it has a pivot neighbor → join that cluster</p>
                <p>4. Otherwise → become pivot in smallest cluster</p>
                <p>5. Process continues until all nodes arrive</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Goal:</strong> Balance cluster sizes in an online setting
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