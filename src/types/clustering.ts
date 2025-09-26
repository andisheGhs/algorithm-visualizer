export interface SignedEdge {
  from: string;
  to: string;
  type: 'positive' | 'negative';
}

export interface ClusterNode {
  id: string;
  x: number;
  y: number;
  clusterId?: number;
}

export interface PivotStep {
  type: 'select-pivot' | 'add-to-cluster' | 'cluster-complete' | 'done';
  pivot?: string;
  node?: string;
  cluster?: number;
  clusters: Record<string, number>;
}