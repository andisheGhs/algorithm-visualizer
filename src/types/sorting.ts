export interface SortingStep {
  type: 'compare' | 'swap' | 'merge' | 'partition' | 'done';
  indices?: number[];
  array: number[];
  algorithm?: 'mergeSort' | 'quickSort';
}

export interface ComparisonState {
  leftAlgorithm: 'mergeSort' | 'quickSort';
  rightAlgorithm: 'mergeSort' | 'quickSort';
  leftArray: number[];
  rightArray: number[];
  leftStats: SortingStats;
  rightStats: SortingStats;
  winner?: 'left' | 'right';
}

export interface SortingStats {
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
  timeElapsed: number;
}