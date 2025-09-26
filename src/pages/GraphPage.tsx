// src/pages/GraphPage.tsx
import React, { useState, useRef } from 'react';
import { InteractiveGraphBuilder, GraphNode, GraphEdge } from '../components/common/InteractiveGraphBuilder';
import { CodeDisplay } from '../components/common/CodeDisplay';

interface GraphPageProps {
  onBack: () => void;
}

interface ExtendedNode extends GraphNode {
  distance?: number;
  visited?: boolean;
  parent?: string | null;
  inPath?: boolean;
  inQueue?: boolean;
}

export const GraphPage: React.FC<GraphPageProps> = ({ onBack }) => {
  const [nodes, setNodes] = useState<ExtendedNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [builderMode, setBuilderMode] = useState<'add-node' | 'add-edge' | 'delete' | 'move' | 'view'>('add-node');
  const [algorithm, setAlgorithm] = useState<'dfs' | 'bfs' | 'dijkstra' | 'bellman-ford' | 'kruskal'>('dfs');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentLine, setCurrentLine] = useState(-1);
  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);
  const [visitOrder, setVisitOrder] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWeights, setShowWeights] = useState(false);
  const [mstEdges, setMstEdges] = useState<Set<string>>(new Set());
  const [totalWeight, setTotalWeight] = useState<number>(0);
  
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
      background: '#3b82f6',
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
      backgroundColor: isActive ? '#3b82f6' : '#e5e7eb',
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
    },
    nodeButton: (isActive: boolean) => ({
      padding: '6px 12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      backgroundColor: isActive ? '#10b981' : '#f3f4f6',
      color: isActive ? 'white' : '#374151',
      marginRight: '5px',
    }),
    statusBar: {
      padding: '10px',
      background: '#f3f4f6',
      borderRadius: '6px',
      marginBottom: '10px',
      fontSize: '14px',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
    }
  };

  const dfsCode = [
    'function DFS(graph, start, end) {',
    '  let stack = [start]',
    '  let visited = new Set()',
    '  let parent = new Map()',
    '  ',
    '  while (stack.length > 0) {',
    '    let current = stack.pop()',
    '    ',
    '    if (visited.has(current)) continue',
    '    visited.add(current)',
    '    ',
    '    if (current === end) {',
    '      return reconstructPath(parent, end)',
    '    }',
    '    ',
    '    for (let neighbor of graph[current]) {',
    '      if (!visited.has(neighbor)) {',
    '        parent.set(neighbor, current)',
    '        stack.push(neighbor)',
    '      }',
    '    }',
    '  }',
    '  return null // No path found',
    '}'
  ];

  const bfsCode = [
    'function BFS(graph, start, end) {',
    '  let queue = [start]',
    '  let visited = new Set([start])',
    '  let parent = new Map()',
    '  ',
    '  while (queue.length > 0) {',
    '    let current = queue.shift()',
    '    ',
    '    if (current === end) {',
    '      return reconstructPath(parent, end)',
    '    }',
    '    ',
    '    for (let neighbor of graph[current]) {',
    '      if (!visited.has(neighbor)) {',
    '        visited.add(neighbor)',
    '        parent.set(neighbor, current)',
    '        queue.push(neighbor)',
    '      }',
    '    }',
    '  }',
    '  return null // No path found',
    '}'
  ];

  const dijkstraCode = [
    'function Dijkstra(graph, start, end) {',
    '  let distances = {}',
    '  let parent = {}',
    '  let unvisited = new Set(nodes)',
    '  ',
    '  // Initialize distances',
    '  for (let node of nodes) {',
    '    distances[node] = Infinity',
    '  }',
    '  distances[start] = 0',
    '  ',
    '  while (unvisited.size > 0) {',
    '    // Find unvisited node with min distance',
    '    let current = minDistanceNode(unvisited, distances)',
    '    if (current === end) break',
    '    ',
    '    unvisited.delete(current)',
    '    ',
    '    for (let [neighbor, weight] of graph[current]) {',
    '      let alt = distances[current] + weight',
    '      if (alt < distances[neighbor]) {',
    '        distances[neighbor] = alt',
    '        parent[neighbor] = current',
    '      }',
    '    }',
    '  }',
    '  return { distances, parent }',
    '}'
  ];

  const bellmanFordCode = [
    'function BellmanFord(graph, start) {',
    '  let distances = {}',
    '  let parent = {}',
    '  ',
    '  // Step 1: Initialize distances',
    '  for (let node of nodes) {',
    '    distances[node] = Infinity',
    '  }',
    '  distances[start] = 0',
    '  ',
    '  // Step 2: Relax edges V-1 times',
    '  for (let i = 0; i < nodes.length - 1; i++) {',
    '    for (let edge of edges) {',
    '      let u = edge.from',
    '      let v = edge.to',
    '      let weight = edge.weight',
    '      ',
    '      if (distances[u] + weight < distances[v]) {',
    '        distances[v] = distances[u] + weight',
    '        parent[v] = u',
    '      }',
    '    }',
    '  }',
    '  ',
    '  // Step 3: Check for negative cycles',
    '  for (let edge of edges) {',
    '    if (distances[edge.from] + edge.weight < distances[edge.to]) {',
    '      return "Negative cycle detected!"',
    '    }',
    '  }',
    '  return { distances, parent }',
    '}'
  ];

  const kruskalCode = [
    'function Kruskal(nodes, edges) {',
    '  // Sort edges by weight',
    '  edges.sort((a, b) => a.weight - b.weight)',
    '  ',
    '  let parent = {}',
    '  let rank = {}',
    '  let mst = []',
    '  ',
    '  // Initialize disjoint sets',
    '  for (let node of nodes) {',
    '    parent[node] = node',
    '    rank[node] = 0',
    '  }',
    '  ',
    '  // Process edges in order',
    '  for (let edge of edges) {',
    '    let rootU = find(parent, edge.from)',
    '    let rootV = find(parent, edge.to)',
    '    ',
    '    // If no cycle, add to MST',
    '    if (rootU !== rootV) {',
    '      mst.push(edge)',
    '      union(parent, rank, rootU, rootV)',
    '      ',
    '      // Stop when we have V-1 edges',
    '      if (mst.length === nodes.length - 1) break',
    '    }',
    '  }',
    '  return mst',
    '}'
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getAdjacencyList = () => {
    const adj: Record<string, string[]> = {};
    nodes.forEach(node => {
      adj[node.id] = [];
    });
    edges.forEach(edge => {
      adj[edge.from].push(edge.to);
      adj[edge.to].push(edge.from); // Undirected graph
    });
    return adj;
  };

  const getWeightedAdjacencyList = () => {
    const adj: Record<string, Array<{node: string, weight: number}>> = {};
    nodes.forEach(node => {
      adj[node.id] = [];
    });
    edges.forEach(edge => {
      const weight = edge.weight || 1;
      adj[edge.from].push({node: edge.to, weight});
      adj[edge.to].push({node: edge.from, weight}); // Undirected
    });
    return adj;
  };

  const runDFS = async () => {
    if (!startNode || !endNode) {
      alert('Please select start and end nodes');
      return;
    }

    setRunning(true);
    setBuilderMode('view');
    setVisitOrder([]);
    setCurrentStep(0);
    stopSignal.current = false;
    
    const adj = getAdjacencyList();
    const stack = [startNode];
    const visited = new Set<string>();
    const parent = new Map<string, string>();
    const visitOrderLocal: string[] = [];

    setCurrentLine(1);
    await sleep(speedRef.current);

    while (stack.length > 0 && !stopSignal.current) {
      setCurrentLine(6);
      await sleep(speedRef.current);
      
      const current = stack.pop()!;
      
      if (visited.has(current)) continue;
      
      visited.add(current);
      visitOrderLocal.push(current);
      setVisitOrder([...visitOrderLocal]);
      
      setNodes(prev => prev.map(n => ({
        ...n,
        visited: visited.has(n.id),
        inPath: n.id === current
      })));
      
      setCurrentLine(9);
      await sleep(speedRef.current);

      if (current === endNode) {
        const path = [];
        let node: string | undefined = endNode;
        while (node) {
          path.unshift(node);
          node = parent.get(node);
        }
        
        setNodes(prev => prev.map(n => ({
          ...n,
          inPath: path.includes(n.id)
        })));
        
        setCurrentLine(12);
        await sleep(speedRef.current);
        break;
      }

      setCurrentLine(15);
      const neighbors = adj[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          parent.set(neighbor, current);
          stack.push(neighbor);
        }
        await sleep(speedRef.current / 2);
      }
    }

    setCurrentLine(-1);
    setRunning(false);
  };

  const runBFS = async () => {
    if (!startNode || !endNode) {
      alert('Please select start and end nodes');
      return;
    }

    setRunning(true);
    setBuilderMode('view');
    setVisitOrder([]);
    stopSignal.current = false;
    
    const adj = getAdjacencyList();
    const queue = [startNode];
    const visited = new Set<string>([startNode]);
    const parent = new Map<string, string>();
    const visitOrderLocal: string[] = [startNode];

    // Mark start node as visited
    setNodes(prev => prev.map(n => ({
      ...n,
      visited: n.id === startNode,
      inQueue: n.id === startNode,
      inPath: false
    })));

    setCurrentLine(1);
    await sleep(speedRef.current);

    while (queue.length > 0 && !stopSignal.current) {
      setCurrentLine(6);
      await sleep(speedRef.current);
      
      const current = queue.shift()!;
      setVisitOrder([...visitOrderLocal]);
      
      // Update visualization - current node being processed
      setNodes(prev => prev.map(n => ({
        ...n,
        inPath: n.id === current,
        inQueue: queue.includes(n.id)
      })));

      if (current === endNode) {
        const path = [];
        let node: string | undefined = endNode;
        while (node) {
          path.unshift(node);
          node = parent.get(node);
        }
        
        setNodes(prev => prev.map(n => ({
          ...n,
          inPath: path.includes(n.id),
          inQueue: false
        })));
        
        setCurrentLine(9);
        await sleep(speedRef.current);
        break;
      }

      setCurrentLine(12);
      const neighbors = adj[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          visitOrderLocal.push(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
          
          // Mark as visited and in queue
          setNodes(prev => prev.map(n => ({
            ...n,
            visited: visited.has(n.id),
            inQueue: queue.includes(n.id)
          })));
          
          await sleep(speedRef.current / 2);
        }
      }
    }

    setCurrentLine(-1);
    setRunning(false);
  };

  const runDijkstra = async () => {
    if (!startNode || !endNode) {
      alert('Please select start and end nodes');
      return;
    }

    setRunning(true);
    setBuilderMode('view');
    setVisitOrder([]);
    stopSignal.current = false;
    
    const adj = getWeightedAdjacencyList();
    const distances: Record<string, number> = {};
    const parent: Record<string, string | null> = {};
    const unvisited = new Set<string>();
    
    setCurrentLine(6);
    nodes.forEach(node => {
      distances[node.id] = node.id === startNode ? 0 : Infinity;
      parent[node.id] = null;
      unvisited.add(node.id);
    });
    
    setNodes(prev => prev.map(n => ({
      ...n,
      distance: distances[n.id],
      visited: false,
      inPath: false
    })));
    await sleep(speedRef.current);

    while (unvisited.size > 0 && !stopSignal.current) {
      setCurrentLine(13);
      await sleep(speedRef.current);
      
      let current: string | null = null;
      let minDist = Infinity;
      unvisited.forEach(node => {
        if (distances[node] < minDist) {
          minDist = distances[node];
          current = node;
        }
      });
      
      if (current === null || distances[current] === Infinity) break;
      if (current === endNode) break;
      
      unvisited.delete(current);
      
      setNodes(prev => prev.map(n => ({
        ...n,
        distance: distances[n.id],
        visited: !unvisited.has(n.id),
        inPath: n.id === current
      })));
      
      setCurrentLine(18);
      await sleep(speedRef.current);
      
      const neighbors = adj[current] || [];
      for (const {node: neighbor, weight} of neighbors) {
        if (unvisited.has(neighbor)) {
          const alt = distances[current] + weight;
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            parent[neighbor] = current;
            
            setNodes(prev => prev.map(n => ({
              ...n,
              distance: distances[n.id]
            })));
          }
        }
        await sleep(speedRef.current / 2);
      }
    }

    const path = [];
    let node: string | null = endNode;
    while (node && parent[node]) {
      path.unshift(node);
      node = parent[node];
    }
    if (node === startNode) {
      path.unshift(startNode);
      
      setNodes(prev => prev.map(n => ({
        ...n,
        inPath: path.includes(n.id)
      })));
      
      setTotalWeight(distances[endNode]);
    }

    setCurrentLine(-1);
    setRunning(false);
  };

  const runBellmanFord = async () => {
    if (!startNode) {
      alert('Please select a start node');
      return;
    }

    setRunning(true);
    setBuilderMode('view');
    stopSignal.current = false;
    
    const distances: Record<string, number> = {};
    const parent: Record<string, string | null> = {};
    
    // Initialize
    setCurrentLine(5);
    nodes.forEach(node => {
      distances[node.id] = node.id === startNode ? 0 : Infinity;
      parent[node.id] = null;
    });
    
    setNodes(prev => prev.map(n => ({
      ...n,
      distance: distances[n.id],
      visited: false,
      inPath: false
    })));
    await sleep(speedRef.current);

    // Relax edges V-1 times
    setCurrentLine(11);
    for (let i = 0; i < nodes.length - 1 && !stopSignal.current; i++) {
      let updated = false;
      
      for (const edge of edges) {
        if (stopSignal.current) break;
        
        const weight = edge.weight || 1;
        
        setCurrentLine(17);
        // Highlight the edge being considered
        setMstEdges(new Set([`${edge.from}-${edge.to}`]));
        await sleep(speedRef.current / 2);
        
        if (distances[edge.from] !== Infinity && 
            distances[edge.from] + weight < distances[edge.to]) {
          distances[edge.to] = distances[edge.from] + weight;
          parent[edge.to] = edge.from;
          updated = true;
          
          setNodes(prev => prev.map(n => ({
            ...n,
            distance: distances[n.id]
          })));
        }
        
        // Also check reverse direction for undirected graph
        if (distances[edge.to] !== Infinity && 
            distances[edge.to] + weight < distances[edge.from]) {
          distances[edge.from] = distances[edge.to] + weight;
          parent[edge.from] = edge.to;
          updated = true;
          
          setNodes(prev => prev.map(n => ({
            ...n,
            distance: distances[n.id]
          })));
        }
      }
      
      setMstEdges(new Set());
      
      if (!updated) break; // No changes, can stop early
    }

    // Check for negative cycles
    setCurrentLine(25);
    for (const edge of edges) {
      const weight = edge.weight || 1;
      if (distances[edge.from] !== Infinity && 
          distances[edge.from] + weight < distances[edge.to]) {
        alert('Negative cycle detected!');
        break;
      }
    }

    // Highlight path to end node if specified
    if (endNode && distances[endNode] !== Infinity) {
      const path = [];
      let node: string | null = endNode;
      while (node && parent[node]) {
        path.unshift(node);
        node = parent[node];
      }
      if (node === startNode) {
        path.unshift(startNode);
        
        setNodes(prev => prev.map(n => ({
          ...n,
          inPath: path.includes(n.id)
        })));
        
        setTotalWeight(distances[endNode]);
      }
    }

    setCurrentLine(-1);
    setRunning(false);
  };

  const runKruskal = async () => {
    setRunning(true);
    setBuilderMode('view');
    stopSignal.current = false;
    setMstEdges(new Set());
    setTotalWeight(0);
    
    // Sort edges by weight
    setCurrentLine(2);
    const sortedEdges = [...edges].sort((a, b) => (a.weight || 1) - (b.weight || 1));
    await sleep(speedRef.current);
    
    // Initialize disjoint sets
    const parent: Record<string, string> = {};
    const rank: Record<string, number> = {};
    
    const find = (x: string): string => {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]);
      }
      return parent[x];
    };
    
    const union = (x: string, y: string) => {
      const rootX = find(x);
      const rootY = find(y);
      
      if (rootX !== rootY) {
        if (rank[rootX] < rank[rootY]) {
          parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
          parent[rootY] = rootX;
        } else {
          parent[rootY] = rootX;
          rank[rootX]++;
        }
      }
    };
    
    setCurrentLine(9);
    nodes.forEach(node => {
      parent[node.id] = node.id;
      rank[node.id] = 0;
    });
    await sleep(speedRef.current);
    
    const mst: GraphEdge[] = [];
    let totalWeightLocal = 0;
    
    setCurrentLine(15);
    for (const edge of sortedEdges) {
      if (stopSignal.current) break;
      
      setCurrentLine(16);
      // Highlight edge being considered
      setNodes(prev => prev.map(n => ({
        ...n,
        inPath: n.id === edge.from || n.id === edge.to
      })));
      await sleep(speedRef.current);
      
      const rootU = find(edge.from);
      const rootV = find(edge.to);
      
      setCurrentLine(20);
      if (rootU !== rootV) {
        mst.push(edge);
        mstEdges.add(`${edge.from}-${edge.to}`);
        mstEdges.add(`${edge.to}-${edge.from}`);
        setMstEdges(new Set(mstEdges));
        
        union(rootU, rootV);
        totalWeightLocal += edge.weight || 1;
        setTotalWeight(totalWeightLocal);
        
        setCurrentLine(21);
        await sleep(speedRef.current);
        
        if (mst.length === nodes.length - 1) break;
      }
    }
    
    // Mark all nodes as part of MST
    setNodes(prev => prev.map(n => ({
      ...n,
      visited: true,
      inPath: false
    })));
    
    setCurrentLine(-1);
    setRunning(false);
  };

  const runAlgorithm = () => {
    switch(algorithm) {
      case 'dfs':
        runDFS();
        break;
      case 'bfs':
        runBFS();
        break;
      case 'dijkstra':
        runDijkstra();
        break;
      case 'bellman-ford':
        runBellmanFord();
        break;
      case 'kruskal':
        runKruskal();
        break;
      default:
        alert('Algorithm not implemented yet');
    }
  };

  const stopAlgorithm = () => {
    stopSignal.current = true;
    setCurrentLine(-1);
    setRunning(false);
  };

  const resetVisualization = () => {
    setNodes(nodes.map(n => ({
      ...n,
      visited: false,
      inPath: false,
      inQueue: false,
      distance: undefined
    })));
    setVisitOrder([]);
    setCurrentStep(0);
    setMstEdges(new Set());
    setTotalWeight(0);
    setCurrentLine(-1);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setStartNode(null);
    setEndNode(null);
    setVisitOrder([]);
    setCurrentStep(0);
    setMstEdges(new Set());
    setTotalWeight(0);
    setCurrentLine(-1);
  };

  const loadGraphExample = () => {
    const exampleNodes: ExtendedNode[] = [
      { id: 'A', x: 100, y: 200, label: 'A' },
      { id: 'B', x: 250, y: 100, label: 'B' },
      { id: 'C', x: 400, y: 100, label: 'C' },
      { id: 'D', x: 250, y: 300, label: 'D' },
      { id: 'E', x: 400, y: 300, label: 'E' },
      { id: 'F', x: 550, y: 200, label: 'F' },
      { id: 'G', x: 700, y: 200, label: 'G' },
    ];

    const exampleEdges: GraphEdge[] = [
      { from: 'A', to: 'B', type: 'positive', weight: 4 },
      { from: 'A', to: 'D', type: 'positive', weight: 3 },
      { from: 'B', to: 'C', type: 'positive', weight: 2 },
      { from: 'B', to: 'D', type: 'positive', weight: 5 },
      { from: 'C', to: 'E', type: 'positive', weight: 1 },
      { from: 'C', to: 'F', type: 'positive', weight: 6 },
      { from: 'D', to: 'E', type: 'positive', weight: 2 },
      { from: 'E', to: 'F', type: 'positive', weight: 3 },
      { from: 'F', to: 'G', type: 'positive', weight: 2 },
    ];

    setNodes(exampleNodes);
    setEdges(exampleEdges);
    setStartNode('A');
    setEndNode('G');
    setShowWeights(algorithm === 'dijkstra' || algorithm === 'bellman-ford' || algorithm === 'kruskal');
  };

  const loadMazeExample = () => {
    const rows = 5;
    const cols = 7;
    const cellSize = 80;
    const startX = 100;
    const startY = 100;
    
    const mazeNodes: ExtendedNode[] = [];
    const mazeEdges: GraphEdge[] = [];
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        mazeNodes.push({
          id: `${i}-${j}`,
          x: startX + j * cellSize,
          y: startY + i * cellSize,
          label: ''
        });
      }
    }
    
    const walls = new Set(['0-2|0-3', '1-2|1-3', '2-1|2-2', '2-3|2-4', '3-1|3-2', '3-4|3-5']);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (j < cols - 1) {
          const edgeId = `${i}-${j}|${i}-${j+1}`;
          if (!walls.has(edgeId) && !walls.has(`${i}-${j+1}|${i}-${j}`)) {
            mazeEdges.push({
              from: `${i}-${j}`,
              to: `${i}-${j+1}`,
              type: 'positive'
            });
          }
        }
        if (i < rows - 1) {
          const edgeId = `${i}-${j}|${i+1}-${j}`;
          if (!walls.has(edgeId) && !walls.has(`${i+1}-${j}|${i}-${j}`)) {
            mazeEdges.push({
              from: `${i}-${j}`,
              to: `${i+1}-${j}`,
              type: 'positive'
            });
          }
        }
      }
    }
    
    setNodes(mazeNodes);
    setEdges(mazeEdges);
    setStartNode('0-0');
    setEndNode(`${rows-1}-${cols-1}`);
    setShowWeights(false);
  };

  const loadBinaryTreeExample = () => {
    const treeNodes: ExtendedNode[] = [
      { id: '1', x: 400, y: 50, label: '1' },
      { id: '2', x: 200, y: 150, label: '2' },
      { id: '3', x: 600, y: 150, label: '3' },
      { id: '4', x: 100, y: 250, label: '4' },
      { id: '5', x: 300, y: 250, label: '5' },
      { id: '6', x: 500, y: 250, label: '6' },
      { id: '7', x: 700, y: 250, label: '7' },
      { id: '8', x: 50, y: 350, label: '8' },
      { id: '9', x: 150, y: 350, label: '9' },
      { id: '10', x: 250, y: 350, label: '10' },
      { id: '11', x: 350, y: 350, label: '11' },
      { id: '12', x: 450, y: 350, label: '12' },
      { id: '13', x: 550, y: 350, label: '13' },
      { id: '14', x: 650, y: 350, label: '14' },
      { id: '15', x: 750, y: 350, label: '15' },
    ];

    const treeEdges: GraphEdge[] = [
      { from: '1', to: '2', type: 'positive', weight: 3 },
      { from: '1', to: '3', type: 'positive', weight: 2 },
      { from: '2', to: '4', type: 'positive', weight: 1 },
      { from: '2', to: '5', type: 'positive', weight: 4 },
      { from: '3', to: '6', type: 'positive', weight: 5 },
      { from: '3', to: '7', type: 'positive', weight: 2 },
      { from: '4', to: '8', type: 'positive', weight: 2 },
      { from: '4', to: '9', type: 'positive', weight: 3 },
      { from: '5', to: '10', type: 'positive', weight: 1 },
      { from: '5', to: '11', type: 'positive', weight: 2 },
      { from: '6', to: '12', type: 'positive', weight: 4 },
      { from: '6', to: '13', type: 'positive', weight: 1 },
      { from: '7', to: '14', type: 'positive', weight: 3 },
      { from: '7', to: '15', type: 'positive', weight: 2 },
    ];

    setNodes(treeNodes);
    setEdges(treeEdges);
    setStartNode('1');
    setEndNode('15');
    setShowWeights(algorithm === 'dijkstra' || algorithm === 'bellman-ford' || algorithm === 'kruskal');
  };

  const loadCompleteGraphExample = () => {
    const n = 6;
    const centerX = 400;
    const centerY = 250;
    const radius = 150;
    
    const completeNodes: ExtendedNode[] = [];
    const completeEdges: GraphEdge[] = [];
    
    // Create nodes in a circle
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      completeNodes.push({
        id: String.fromCharCode(65 + i),
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        label: String.fromCharCode(65 + i)
      });
    }
    
    // Connect every node to every other node
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        completeEdges.push({
          from: String.fromCharCode(65 + i),
          to: String.fromCharCode(65 + j),
          type: 'positive',
          weight: Math.floor(Math.random() * 9) + 1
        });
      }
    }
    
    setNodes(completeNodes);
    setEdges(completeEdges);
    setStartNode('A');
    setEndNode('F');
    setShowWeights(algorithm === 'dijkstra' || algorithm === 'bellman-ford' || algorithm === 'kruskal');
  };

  const loadCycleGraphExample = () => {
    const cycleNodes: ExtendedNode[] = [
      { id: 'A', x: 200, y: 100, label: 'A' },
      { id: 'B', x: 400, y: 100, label: 'B' },
      { id: 'C', x: 600, y: 100, label: 'C' },
      { id: 'D', x: 300, y: 200, label: 'D' },
      { id: 'E', x: 500, y: 200, label: 'E' },
      { id: 'F', x: 200, y: 300, label: 'F' },
      { id: 'G', x: 400, y: 300, label: 'G' },
      { id: 'H', x: 600, y: 300, label: 'H' },
    ];

    const cycleEdges: GraphEdge[] = [
      { from: 'A', to: 'B', type: 'positive', weight: 2 },
      { from: 'B', to: 'C', type: 'positive', weight: 3 },
      { from: 'A', to: 'D', type: 'positive', weight: 4 },
      { from: 'B', to: 'D', type: 'positive', weight: 1 },
      { from: 'B', to: 'E', type: 'positive', weight: 5 },
      { from: 'C', to: 'E', type: 'positive', weight: 2 },
      { from: 'D', to: 'E', type: 'positive', weight: 3 },
      { from: 'D', to: 'F', type: 'positive', weight: 2 },
      { from: 'D', to: 'G', type: 'positive', weight: 4 },
      { from: 'E', to: 'G', type: 'positive', weight: 1 },
      { from: 'E', to: 'H', type: 'positive', weight: 3 },
      { from: 'F', to: 'G', type: 'positive', weight: 5 },
      { from: 'G', to: 'H', type: 'positive', weight: 2 },
    ];

    setNodes(cycleNodes);
    setEdges(cycleEdges);
    setStartNode('A');
    setEndNode('H');
    setShowWeights(algorithm === 'dijkstra' || algorithm === 'bellman-ford' || algorithm === 'kruskal');
  };

  // Custom rendering for graph visualization
  const GraphVisualizerWithInfo: React.FC = () => {
    const getNodeColor = (n: ExtendedNode): number | undefined => {
      if (n.inPath) return 2; // Green - in final path
      if (n.inQueue) return 3; // Orange - in queue (BFS)
      if (n.visited) return 1; // Blue - visited
      return undefined; // Gray - unvisited
    };

    return (
      <>
        <InteractiveGraphBuilder
          width={800}
          height={500}
          nodes={nodes.map(n => ({
            ...n,
            label: n.label + (n.distance !== undefined && n.distance !== Infinity ? ` (${n.distance})` : ''),
            cluster: getNodeColor(n)
          }))}
          edges={edges.map(e => ({
            ...e,
            type: mstEdges.has(`${e.from}-${e.to}`) || mstEdges.has(`${e.to}-${e.from}`) ? 'positive' : e.type
          }))}
          onNodesChange={setNodes as any}
          onEdgesChange={setEdges}
          mode={builderMode}
          showWeights={showWeights}
          showInstructions={true}
        />
        
        {/* Node selection for start/end */}
        {(algorithm !== 'kruskal') && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Start Node:</span>
              {nodes.map(node => (
                <button
                  key={node.id}
                  style={styles.nodeButton(startNode === node.id)}
                  onClick={() => setStartNode(node.id)}
                  disabled={running}
                >
                  {node.label || node.id}
                </button>
              ))}
            </div>
            {algorithm !== 'bellman-ford' && (
              <div>
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>End Node:</span>
                {nodes.map(node => (
                  <button
                    key={node.id}
                    style={styles.nodeButton(endNode === node.id)}
                    onClick={() => setEndNode(node.id)}
                    disabled={running}
                  >
                    {node.label || node.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const getAlgorithmCode = () => {
    switch(algorithm) {
      case 'dfs': return dfsCode;
      case 'bfs': return bfsCode;
      case 'dijkstra': return dijkstraCode;
      case 'bellman-ford': return bellmanFordCode;
      case 'kruskal': return kruskalCode;
      default: return dfsCode;
    }
  };

  const getAlgorithmTitle = () => {
    switch(algorithm) {
      case 'dfs': return 'Depth-First Search';
      case 'bfs': return 'Breadth-First Search';
      case 'dijkstra': return "Dijkstra's Algorithm";
      case 'bellman-ford': return 'Bellman-Ford Algorithm';
      case 'kruskal': return "Kruskal's Algorithm";
      default: return 'Algorithm';
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Home
      </button>
      
      <h2 style={styles.title}>🌐 Graph Algorithms</h2>

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
            onChange={(e) => {
              setAlgorithm(e.target.value as any);
              setShowWeights(
                e.target.value === 'dijkstra' || 
                e.target.value === 'bellman-ford' || 
                e.target.value === 'kruskal'
              );
              resetVisualization();
            }}
            style={styles.select}
            disabled={running}
          >
            <option value="dfs">DFS (Depth-First)</option>
            <option value="bfs">BFS (Breadth-First)</option>
            <option value="dijkstra">Dijkstra (Shortest Path)</option>
            <option value="bellman-ford">Bellman-Ford</option>
            <option value="kruskal">Kruskal (MST)</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={showWeights}
              onChange={(e) => setShowWeights(e.target.checked)}
              disabled={running}
            />
            Show Weights
          </label>

          <label>Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            style={styles.select}
            disabled={running}
          >
            <option value="2000">Very Slow</option>
            <option value="1000">Slow</option>
            <option value="500">Normal</option>
            <option value="200">Fast</option>
            <option value="50">Very Fast</option>
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
        borderRadius: '8px',
        flexWrap: 'wrap' as const
      }}>
        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>📊 Load Example:</span>
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
          onClick={loadGraphExample}
          disabled={running}
        >
          🌐 Sample Graph
        </button>
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
          onClick={loadMazeExample}
          disabled={running}
        >
          🏃 Maze
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
          onClick={loadBinaryTreeExample}
          disabled={running}
        >
          🌳 Binary Tree
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#f59e0b',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onClick={loadCompleteGraphExample}
          disabled={running}
        >
          🔷 Complete Graph
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#ec4899',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onClick={loadCycleGraphExample}
          disabled={running}
        >
          🔄 Cycles & Paths
        </button>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        {algorithm === 'kruskal' && totalWeight > 0 && (
          <span>MST Total Weight: {totalWeight}</span>
        )}
        {(algorithm === 'dijkstra' || algorithm === 'bellman-ford') && totalWeight > 0 && (
          <span>Shortest Path Distance: {totalWeight}</span>
        )}
        {visitOrder.length > 0 && algorithm !== 'kruskal' && (
          <span>Visit Order: {visitOrder.join(' → ')}</span>
        )}
        {!visitOrder.length && algorithm !== 'kruskal' && startNode && endNode && (
          <span>Ready to find path from {startNode} to {endNode}</span>
        )}
        {!visitOrder.length && algorithm === 'kruskal' && nodes.length > 0 && (
          <span>Ready to find Minimum Spanning Tree</span>
        )}
        {!visitOrder.length && algorithm !== 'kruskal' && (!startNode || (algorithm !== 'bellman-ford' && !endNode)) && (
          <span>Select {algorithm === 'bellman-ford' ? 'start node' : 'start and end nodes'} to begin</span>
        )}
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div>
          <GraphVisualizerWithInfo />

          {/* Control Buttons */}
          <div style={{ marginTop: '20px' }}>
            <button
              style={styles.controlButton}
              onClick={runAlgorithm}
              disabled={
                running || 
                nodes.length === 0 ||
                (algorithm === 'kruskal' ? false : 
                 algorithm === 'bellman-ford' ? !startNode :
                 !startNode || !endNode)
              }
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
              onClick={resetVisualization}
              disabled={running}
            >
              🔄 Reset Visualization
            </button>
            <button
              style={{ ...styles.controlButton, backgroundColor: '#ef4444' }}
              onClick={clearAll}
              disabled={running}
            >
              🗑️ Clear All
            </button>
          </div>

          {/* Color Legend */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f9fafb', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Color Legend:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#9ca3af', marginRight: '10px', border: '1px solid #374151' }}></span>
                Unvisited
              </div>
              <div>
                <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#667eea', marginRight: '10px', border: '1px solid #374151' }}></span>
                Visited
              </div>
              {algorithm === 'bfs' && (
                <div>
                  <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#f59e0b', marginRight: '10px', border: '1px solid #374151' }}></span>
                  In Queue
                </div>
              )}
              <div>
                <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#10b981', marginRight: '10px', border: '1px solid #374151' }}></span>
                {algorithm === 'kruskal' ? 'In MST' : 'Final Path'}
              </div>
              {algorithm === 'kruskal' && (
                <div>
                  <span style={{ display: 'inline-block', width: '20px', height: '3px', backgroundColor: '#10b981', marginRight: '10px' }}></span>
                  MST Edge
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Display */}
        <div>
          <CodeDisplay
            code={getAlgorithmCode()}
            currentLine={currentLine}
            title={getAlgorithmTitle()}
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
              📚 How {algorithm.toUpperCase()} Works:
            </h3>
            {algorithm === 'dfs' && (
              <div style={{ color: '#6b7280' }}>
                <p>1. Start with a stack containing the start node</p>
                <p>2. Pop a node from the stack</p>
                <p>3. Mark it as visited</p>
                <p>4. Add all unvisited neighbors to the stack</p>
                <p>5. Repeat until target is found or stack is empty</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Properties:</strong> Goes deep before going wide, doesn't guarantee shortest path
                </p>
              </div>
            )}
            {algorithm === 'bfs' && (
              <div style={{ color: '#6b7280' }}>
                <p>1. Start with a queue containing the start node</p>
                <p>2. Dequeue a node from the front</p>
                <p>3. Mark it as visited</p>
                <p>4. Add all unvisited neighbors to the queue</p>
                <p>5. Repeat until target is found or queue is empty</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Properties:</strong> Explores level by level, guarantees shortest path (unweighted)
                </p>
              </div>
            )}
            {algorithm === 'dijkstra' && (
              <div style={{ color: '#6b7280' }}>
                <p>1. Set distance to start as 0, all others as infinity</p>
                <p>2. Pick unvisited node with minimum distance</p>
                <p>3. Update distances to its neighbors</p>
                <p>4. Mark current node as visited</p>
                <p>5. Repeat until target is reached</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Properties:</strong> Finds shortest weighted path, greedy algorithm, no negative weights
                </p>
              </div>
            )}
            {algorithm === 'bellman-ford' && (
              <div style={{ color: '#6b7280' }}>
                <p>1. Initialize distances (start = 0, others = ∞)</p>
                <p>2. Relax all edges V-1 times</p>
                <p>3. For each edge, update distance if shorter path found</p>
                <p>4. Check for negative cycles on final iteration</p>
                <p>5. Return shortest distances to all nodes</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Properties:</strong> Handles negative weights, detects negative cycles, O(VE) complexity
                </p>
              </div>
            )}
            {algorithm === 'kruskal' && (
              <div style={{ color: '#6b7280' }}>
                <p>1. Sort all edges by weight (ascending)</p>
                <p>2. Initialize each node as its own set</p>
                <p>3. For each edge in sorted order:</p>
                <p>   • Check if endpoints are in different sets</p>
                <p>   • If yes, add edge to MST and union sets</p>
                <p>4. Stop when MST has V-1 edges</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Properties:</strong> Finds minimum spanning tree, greedy algorithm, uses Union-Find
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};