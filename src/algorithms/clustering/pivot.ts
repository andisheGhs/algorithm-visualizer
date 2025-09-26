// src/algorithms/clustering/pivot.ts
import { SignedEdge, ClusterNode, PivotStep } from '@/types/clustering';

export interface SignedGraph {
  nodes: ClusterNode[];
  edges: SignedEdge[];
  adjacencyList: Map<string, Array<{ node: string; type: 'positive' | 'negative' }>>;
}

export function createSignedGraph(
  nodes: ClusterNode[],
  edges: SignedEdge[]
): SignedGraph {
  const adjacencyList = new Map<string, Array<{ node: string; type: 'positive' | 'negative' }>>();

  // Initialize adjacency list
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });

  // Build adjacency list
  edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push({ node: edge.to, type: edge.type });
    adjacencyList.get(edge.to)?.push({ node: edge.from, type: edge.type });
  });

  return { nodes, edges, adjacencyList };
}

export function* pivotAlgorithm(graph: SignedGraph): Generator<PivotStep> {
  const clusters: Record<string, number> = {};
  const unclustered = new Set(graph.nodes.map(n => n.id));
  let clusterIndex = 0;

  while (unclustered.size > 0) {
    // Pick a random pivot from unclustered nodes
    const pivotArray = Array.from(unclustered);
    const pivotId = pivotArray[Math.floor(Math.random() * pivotArray.length)];

    yield {
      type: 'select-pivot',
      pivot: pivotId,
      clusters: { ...clusters }
    };

    // Create new cluster with pivot
    clusters[pivotId] = clusterIndex;
    unclustered.delete(pivotId);

    // Get all neighbors of pivot
    const neighbors = graph.adjacencyList.get(pivotId) || [];

    // Add all positive neighbors to the same cluster
    for (const { node, type } of neighbors) {
      if (type === 'positive' && unclustered.has(node)) {
        clusters[node] = clusterIndex;
        unclustered.delete(node);

        yield {
          type: 'add-to-cluster',
          node,
          cluster: clusterIndex,
          pivot: pivotId,
          clusters: { ...clusters }
        };
      }
    }

    yield {
      type: 'cluster-complete',
      cluster: clusterIndex,
      pivot: pivotId,
      clusters: { ...clusters }
    };

    clusterIndex++;
  }

  yield {
    type: 'done',
    clusters: { ...clusters }
  };
}

export function calculateCorrelationCost(
  graph: SignedGraph,
  clusters: Record<string, number>
): { positiveMistakes: number; negativeMistakes: number; totalCost: number } {
  let positiveMistakes = 0;
  let negativeMistakes = 0;

  graph.edges.forEach(edge => {
    const fromCluster = clusters[edge.from];
    const toCluster = clusters[edge.to];

    if (fromCluster !== undefined && toCluster !== undefined) {
      if (edge.type === 'positive' && fromCluster !== toCluster) {
        // Positive edge between different clusters (mistake)
        positiveMistakes++;
      } else if (edge.type === 'negative' && fromCluster === toCluster) {
        // Negative edge within same cluster (mistake)
        negativeMistakes++;
      }
    }
  });

  return {
    positiveMistakes,
    negativeMistakes,
    totalCost: positiveMistakes + negativeMistakes
  };
}