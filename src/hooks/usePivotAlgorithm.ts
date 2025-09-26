// src/hooks/usePivotAlgorithm.ts
import { useState, useRef, useCallback } from 'react';
import { SignedEdge, ClusterNode, PivotStep } from '@/types/clustering';
import { createSignedGraph, pivotAlgorithm } from '@/algorithms/clustering/pivot';

export const usePivotAlgorithm = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const generatorRef = useRef<Generator<PivotStep> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((nodes: ClusterNode[], edges: SignedEdge[]) => {
    const graph = createSignedGraph(nodes, edges);
    generatorRef.current = pivotAlgorithm(graph);
    setIsRunning(true);
    setIsPaused(false);
    // Execute steps...
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    // Continue execution...
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    generatorRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const step = useCallback((nodes: ClusterNode[], edges: SignedEdge[]) => {
    if (!generatorRef.current) {
      const graph = createSignedGraph(nodes, edges);
      generatorRef.current = pivotAlgorithm(graph);
    }
    // Execute one step...
  }, []);

  return {
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    step
  };
};