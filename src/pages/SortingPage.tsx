// src/pages/SortingPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { CodeDisplay } from '../components/common/CodeDisplay';

interface SortingPageProps {
  onBack: () => void;
}

interface SortingState {
  array: number[];
  comparing: number[];
  sorted: number[];
  pivot?: number;
  swapping?: number[];
  comparisons: number;
  swaps: number;
  currentLine: number;
  isRunning: boolean;
  algorithm: string;
}

export const SortingPage: React.FC<SortingPageProps> = ({ onBack }) => {
  const [arraySize, setArraySize] = useState<number>(30);
  const [arraySizeInput, setArraySizeInput] = useState<string>('30');
  const [mainArray, setMainArray] = useState<number[]>([]);
  const [speed, setSpeed] = useState(100);
  const [isRacing, setIsRacing] = useState(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['bubble', 'quick']);
  
  // Individual algorithm states for racing
  const [algorithmStates, setAlgorithmStates] = useState<Record<string, SortingState>>({});
  
  // For single algorithm mode
  const [singleAlgorithm, setSingleAlgorithm] = useState<string>('bubble');
  const [singleState, setSingleState] = useState<SortingState>({
    array: [],
    comparing: [],
    sorted: [],
    comparisons: 0,
    swaps: 0,
    currentLine: -1,
    isRunning: false,
    algorithm: 'bubble'
  });
  
  const animationSpeed = useRef(100);
  animationSpeed.current = speed;
  const stopSignal = useRef(false);

  const algorithms = {
    bubble: 'Bubble Sort',
    quick: 'Quick Sort',
    merge: 'Merge Sort',
    heap: 'Heap Sort',
    insertion: 'Insertion Sort',
    selection: 'Selection Sort'
  };

  const styles = {
    container: {
      background: 'white',
      borderRadius: '12px',
      padding: '32px',
      maxWidth: '1600px',
      margin: '0 auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    backButton: {
      background: '#10b981',
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
    section: {
      background: '#f9fafb',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    inputGroup: {
      display: 'flex',
      gap: '15px',
      alignItems: 'center',
      marginBottom: '10px',
      flexWrap: 'wrap' as const,
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      minWidth: '100px',
    },
    input: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      width: '100px',
    },
    select: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      backgroundColor: 'white',
    },
    visualizer: {
      height: '300px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '2px',
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      marginBottom: '20px',
      position: 'relative' as const,
    },
    bar: (value: number, index: number, state: SortingState) => ({
      flex: 1,
      height: `${(value / 100) * 100}%`,
      backgroundColor: state.sorted.includes(index) ? '#10b981' : 
                       state.pivot === index ? '#f59e0b' :
                       state.swapping?.includes(index) ? '#ec4899' :
                       state.comparing.includes(index) ? '#ef4444' : '#667eea',
      transition: `all ${speed}ms ease`,
      borderRadius: '4px 4px 0 0',
      position: 'relative' as const,
      minWidth: '10px',
      maxWidth: '50px',
    }),
    barLabel: {
      position: 'absolute' as const,
      top: '-20px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '10px',
      fontWeight: 'bold',
    },
    button: {
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
    stats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '15px',
      marginTop: '15px',
    },
    statCard: {
      background: 'white',
      padding: '12px',
      borderRadius: '8px',
      textAlign: 'center' as const,
    },
    statValue: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#667eea',
    },
    statLabel: {
      fontSize: '11px',
      color: '#6b7280',
      marginTop: '5px',
    },
    raceContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '20px',
      marginBottom: '20px',
    },
    raceItem: {
      background: '#f9fafb',
      borderRadius: '8px',
      padding: '15px',
    },
    raceTitle: {
      fontWeight: 'bold',
      marginBottom: '10px',
      fontSize: '16px',
    },
    checkbox: {
      marginRight: '8px',
    },
    checkboxLabel: {
      marginRight: '15px',
      fontSize: '14px',
    }
  };

  // Algorithm implementations with code
  const bubbleSortCode = [
    'function bubbleSort(arr) {',
    '  let n = arr.length;',
    '  for (let i = 0; i < n - 1; i++) {',
    '    for (let j = 0; j < n - i - 1; j++) {',
    '      // Compare adjacent elements',
    '      if (arr[j] > arr[j + 1]) {',
    '        // Swap if in wrong order',
    '        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];',
    '      }',
    '    }',
    '    // Largest element is now at the end',
    '  }',
    '  return arr;',
    '}'
  ];

  const quickSortCode = [
    'function quickSort(arr, low, high) {',
    '  if (low < high) {',
    '    // Find pivot position',
    '    let pivot = partition(arr, low, high);',
    '    // Sort left side',
    '    quickSort(arr, low, pivot - 1);',
    '    // Sort right side',
    '    quickSort(arr, pivot + 1, high);',
    '  }',
    '}',
    '',
    'function partition(arr, low, high) {',
    '  let pivot = arr[high]; // Choose last as pivot',
    '  let i = low - 1;',
    '  ',
    '  for (let j = low; j < high; j++) {',
    '    if (arr[j] < pivot) {',
    '      i++;',
    '      [arr[i], arr[j]] = [arr[j], arr[i]];',
    '    }',
    '  }',
    '  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];',
    '  return i + 1;',
    '}'
  ];

  const insertionSortCode = [
    'function insertionSort(arr) {',
    '  for (let i = 1; i < arr.length; i++) {',
    '    let key = arr[i];',
    '    let j = i - 1;',
    '    ',
    '    // Move elements greater than key right',
    '    while (j >= 0 && arr[j] > key) {',
    '      arr[j + 1] = arr[j];',
    '      j--;',
    '    }',
    '    // Insert key at correct position',
    '    arr[j + 1] = key;',
    '  }',
    '  return arr;',
    '}'
  ];

  const selectionSortCode = [
    'function selectionSort(arr) {',
    '  let n = arr.length;',
    '  ',
    '  for (let i = 0; i < n - 1; i++) {',
    '    // Find minimum in unsorted part',
    '    let minIdx = i;',
    '    for (let j = i + 1; j < n; j++) {',
    '      if (arr[j] < arr[minIdx]) {',
    '        minIdx = j;',
    '      }',
    '    }',
    '    // Swap minimum with first unsorted',
    '    if (minIdx !== i) {',
    '      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
    '    }',
    '  }',
    '  return arr;',
    '}'
  ];

  const mergeSortCode = [
    'function mergeSort(arr, left, right) {',
    '  if (left < right) {',
    '    let mid = Math.floor((left + right) / 2);',
    '    ',
    '    // Sort first half',
    '    mergeSort(arr, left, mid);',
    '    // Sort second half',
    '    mergeSort(arr, mid + 1, right);',
    '    // Merge sorted halves',
    '    merge(arr, left, mid, right);',
    '  }',
    '}',
    '',
    'function merge(arr, left, mid, right) {',
    '  let leftArr = arr.slice(left, mid + 1);',
    '  let rightArr = arr.slice(mid + 1, right + 1);',
    '  let i = 0, j = 0, k = left;',
    '  ',
    '  while (i < leftArr.length && j < rightArr.length) {',
    '    if (leftArr[i] <= rightArr[j]) {',
    '      arr[k++] = leftArr[i++];',
    '    } else {',
    '      arr[k++] = rightArr[j++];',
    '    }',
    '  }',
    '  // Copy remaining elements',
    '  while (i < leftArr.length) arr[k++] = leftArr[i++];',
    '  while (j < rightArr.length) arr[k++] = rightArr[j++];',
    '}'
  ];

  const heapSortCode = [
    'function heapSort(arr) {',
    '  let n = arr.length;',
    '  ',
    '  // Build max heap',
    '  for (let i = Math.floor(n/2) - 1; i >= 0; i--) {',
    '    heapify(arr, n, i);',
    '  }',
    '  ',
    '  // Extract elements from heap',
    '  for (let i = n - 1; i > 0; i--) {',
    '    [arr[0], arr[i]] = [arr[i], arr[0]];',
    '    heapify(arr, i, 0);',
    '  }',
    '}',
    '',
    'function heapify(arr, n, i) {',
    '  let largest = i;',
    '  let left = 2 * i + 1;',
    '  let right = 2 * i + 2;',
    '  ',
    '  if (left < n && arr[left] > arr[largest])',
    '    largest = left;',
    '  if (right < n && arr[right] > arr[largest])',
    '    largest = right;',
    '  ',
    '  if (largest !== i) {',
    '    [arr[i], arr[largest]] = [arr[largest], arr[i]];',
    '    heapify(arr, n, largest);',
    '  }',
    '}'
  ];

  const getAlgorithmCode = (algorithm: string) => {
    switch(algorithm) {
      case 'bubble': return bubbleSortCode;
      case 'quick': return quickSortCode;
      case 'insertion': return insertionSortCode;
      case 'selection': return selectionSortCode;
      case 'merge': return mergeSortCode;
      case 'heap': return heapSortCode;
      default: return bubbleSortCode;
    }
  };

  const generateArray = (size: number) => {
    const newArray = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 100) + 1
    );
    setMainArray(newArray);
    
    // Reset single state
    setSingleState({
      array: [...newArray],
      comparing: [],
      sorted: [],
      comparisons: 0,
      swaps: 0,
      currentLine: -1,
      isRunning: false,
      algorithm: singleAlgorithm
    });
    
    // Reset race states
    const newStates: Record<string, SortingState> = {};
    selectedAlgorithms.forEach(algo => {
      newStates[algo] = {
        array: [...newArray],
        comparing: [],
        sorted: [],
        comparisons: 0,
        swaps: 0,
        currentLine: -1,
        isRunning: false,
        algorithm: algo
      };
    });
    setAlgorithmStates(newStates);
  };

  useEffect(() => {
    generateArray(arraySize);
  }, []);

  useEffect(() => {
    // Initialize states for newly selected algorithms in race mode
    if (isRacing) {
      const newStates: Record<string, SortingState> = {};
      selectedAlgorithms.forEach(algo => {
        newStates[algo] = algorithmStates[algo] || {
          array: [...mainArray],
          comparing: [],
          sorted: [],
          comparisons: 0,
          swaps: 0,
          currentLine: -1,
          isRunning: false,
          algorithm: algo
        };
      });
      setAlgorithmStates(newStates);
    }
  }, [selectedAlgorithms, isRacing]);

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const updateState = (algorithm: string, updates: Partial<SortingState>) => {
    if (isRacing) {
      setAlgorithmStates(prev => ({
        ...prev,
        [algorithm]: prev[algorithm] ? { ...prev[algorithm], ...updates } : {
          array: [...mainArray],
          comparing: [],
          sorted: [],
          comparisons: 0,
          swaps: 0,
          currentLine: -1,
          isRunning: false,
          algorithm: algorithm,
          ...updates
        }
      }));
    } else {
      setSingleState(prev => ({ ...prev, ...updates }));
    }
  };

  // Sorting algorithm implementations
  const bubbleSort = async (algorithm: string, state: SortingState) => {
    const arr = [...state.array];
    const n = arr.length;
    let comparisonCount = 0;
    let swapCount = 0;
    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      if (stopSignal.current) break;
      
      for (let j = 0; j < n - i - 1; j++) {
        if (stopSignal.current) break;
        
        updateState(algorithm, { 
          comparing: [j, j + 1],
          currentLine: 5
        });
        comparisonCount++;
        updateState(algorithm, { comparisons: comparisonCount });
        
        await sleep(animationSpeed.current);
        
        if (arr[j] > arr[j + 1]) {
          updateState(algorithm, { 
            swapping: [j, j + 1],
            currentLine: 7
          });
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapCount++;
          updateState(algorithm, { 
            array: [...arr],
            swaps: swapCount
          });
          await sleep(animationSpeed.current);
        }
      }
      sortedIndices.unshift(n - i - 1); // Add sorted element
      updateState(algorithm, { 
        sorted: [...sortedIndices],
        swapping: undefined
      });
    }
    
    if (!stopSignal.current) {
      updateState(algorithm, { 
        sorted: Array.from({length: n}, (_, i) => i),
        comparing: [],
        currentLine: -1,
        isRunning: false
      });
    }
  };

  const quickSort = async (algorithm: string, state: SortingState) => {
    const arr = [...state.array];
    let comparisonCount = 0;
    let swapCount = 0;

    const partition = async (low: number, high: number): Promise<number> => {
      if (stopSignal.current) return low;
      
      const pivot = arr[high];
      updateState(algorithm, { 
        pivot: high,
        currentLine: 12
      });
      
      let i = low - 1;

      for (let j = low; j < high; j++) {
        if (stopSignal.current) break;
        
        updateState(algorithm, { 
          comparing: [j, high],
          currentLine: 16
        });
        comparisonCount++;
        updateState(algorithm, { comparisons: comparisonCount });
        await sleep(animationSpeed.current);

        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            updateState(algorithm, { 
              swapping: [i, j],
              currentLine: 18
            });
            [arr[i], arr[j]] = [arr[j], arr[i]];
            swapCount++;
            updateState(algorithm, { 
              array: [...arr],
              swaps: swapCount,
              swapping: undefined
            });
            await sleep(animationSpeed.current);
          }
        }
      }

      updateState(algorithm, { 
        swapping: [i + 1, high],
        currentLine: 21
      });
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swapCount++;
      updateState(algorithm, { 
        array: [...arr],
        swaps: swapCount,
        swapping: undefined,
        pivot: undefined
      });
      await sleep(animationSpeed.current);

      return i + 1;
    };

    const quickSortRecursive = async (low: number, high: number) => {
      if (low < high && !stopSignal.current) {
        const pi = await partition(low, high);
        await quickSortRecursive(low, pi - 1);
        await quickSortRecursive(pi + 1, high);
      }
    };

    await quickSortRecursive(0, arr.length - 1);
    
    if (!stopSignal.current) {
      updateState(algorithm, { 
        sorted: Array.from({length: arr.length}, (_, i) => i),
        comparing: [],
        currentLine: -1,
        isRunning: false
      });
    }
  };

  const insertionSort = async (algorithm: string, state: SortingState) => {
    const arr = [...state.array];
    let comparisonCount = 0;
    let swapCount = 0;
    const sortedIndices: number[] = [0];

    updateState(algorithm, { sorted: [0] });

    for (let i = 1; i < arr.length; i++) {
      if (stopSignal.current) break;
      
      const key = arr[i];
      let j = i - 1;
      
      updateState(algorithm, { 
        comparing: [i],
        pivot: i,
        currentLine: 2
      });
      await sleep(animationSpeed.current);

      while (j >= 0 && arr[j] > key) {
        if (stopSignal.current) break;
        
        updateState(algorithm, { 
          comparing: [j, j + 1],
          currentLine: 6
        });
        comparisonCount++;
        updateState(algorithm, { comparisons: comparisonCount });
        
        arr[j + 1] = arr[j];
        swapCount++;
        updateState(algorithm, { 
          array: [...arr],
          swaps: swapCount
        });
        await sleep(animationSpeed.current);
        j--;
      }
      
      arr[j + 1] = key;
      sortedIndices.push(i);
      updateState(algorithm, { 
        array: [...arr],
        sorted: [...sortedIndices],
        pivot: undefined,
        currentLine: 10
      });
      await sleep(animationSpeed.current);
    }

    if (!stopSignal.current) {
      updateState(algorithm, { 
        sorted: Array.from({length: arr.length}, (_, i) => i),
        comparing: [],
        currentLine: -1,
        isRunning: false
      });
    }
  };

  const selectionSort = async (algorithm: string, state: SortingState) => {
    const arr = [...state.array];
    const n = arr.length;
    let comparisonCount = 0;
    let swapCount = 0;
    const sortedIndices: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      if (stopSignal.current) break;
      
      let minIdx = i;
      updateState(algorithm, { 
        pivot: minIdx,
        currentLine: 5
      });
      
      for (let j = i + 1; j < n; j++) {
        if (stopSignal.current) break;
        
        updateState(algorithm, { 
          comparing: [minIdx, j],
          currentLine: 7
        });
        comparisonCount++;
        updateState(algorithm, { comparisons: comparisonCount });
        await sleep(animationSpeed.current);
        
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          updateState(algorithm, { pivot: minIdx });
        }
      }
      
      if (minIdx !== i) {
        updateState(algorithm, { 
          swapping: [i, minIdx],
          currentLine: 13
        });
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swapCount++;
        updateState(algorithm, { 
          array: [...arr],
          swaps: swapCount,
          swapping: undefined
        });
        await sleep(animationSpeed.current);
      }
      
      sortedIndices.push(i);
      updateState(algorithm, { 
        sorted: [...sortedIndices],
        pivot: undefined
      });
    }

    if (!stopSignal.current) {
      updateState(algorithm, { 
        sorted: Array.from({length: n}, (_, i) => i),
        comparing: [],
        currentLine: -1,
        isRunning: false
      });
    }
  };

  const mergeSort = async (algorithm: string, state: SortingState) => {
    const arr = [...state.array];
    let comparisonCount = 0;
    let swapCount = 0;

    const merge = async (left: number, mid: number, right: number) => {
      if (stopSignal.current) return;
      
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      
      let i = 0, j = 0, k = left;
      
      while (i < leftArr.length && j < rightArr.length) {
        if (stopSignal.current) break;
        
        updateState(algorithm, { 
          comparing: [left + i, mid + 1 + j],
          currentLine: 18
        });
        comparisonCount++;
        updateState(algorithm, { comparisons: comparisonCount });
        await sleep(animationSpeed.current);
        
        if (leftArr[i] <= rightArr[j]) {
          arr[k++] = leftArr[i++];
        } else {
          arr[k++] = rightArr[j++];
        }
        swapCount++;
        updateState(algorithm, { 
          array: [...arr],
          swaps: swapCount
        });
      }
      
      while (i < leftArr.length) {
        arr[k++] = leftArr[i++];
        swapCount++;
      }
      while (j < rightArr.length) {
        arr[k++] = rightArr[j++];
        swapCount++;
      }
      
      updateState(algorithm, { 
        array: [...arr],
        swaps: swapCount
      });
    };

    const mergeSortRecursive = async (left: number, right: number) => {
      if (left < right && !stopSignal.current) {
        const mid = Math.floor((left + right) / 2);
        
        updateState(algorithm, { currentLine: 5 });
        await mergeSortRecursive(left, mid);
        
        updateState(algorithm, { currentLine: 7 });
        await mergeSortRecursive(mid + 1, right);
        
        updateState(algorithm, { currentLine: 9 });
        await merge(left, mid, right);
      }
    };

    await mergeSortRecursive(0, arr.length - 1);
    
    if (!stopSignal.current) {
      updateState(algorithm, { 
        sorted: Array.from({length: arr.length}, (_, i) => i),
        comparing: [],
        currentLine: -1,
        isRunning: false
      });
    }
  };

  const heapSort = async (algorithm: string, state: SortingState) => {
    const arr = [...state.array];
    const n = arr.length;
    let comparisonCount = 0;
    let swapCount = 0;
    const sortedIndices: number[] = [];

    const heapify = async (n: number, i: number) => {
      if (stopSignal.current) return;
      
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      
      updateState(algorithm, { 
        pivot: i,
        currentLine: 16
      });
      
      if (left < n) {
        updateState(algorithm, { comparing: [left, largest] });
        comparisonCount++;
        updateState(algorithm, { comparisons: comparisonCount });
        await sleep(animationSpeed.current);
        
        if (arr[left] > arr[largest]) {
          largest = left;
        }
      }
      
      if (right < n) {
        updateState(algorithm, { comparing: [right, largest] });
        comparisonCount++;
        updateState(algorithm, { comparisons: comparisonCount });
        await sleep(animationSpeed.current);
        
        if (arr[right] > arr[largest]) {
          largest = right;
        }
      }
      
      if (largest !== i) {
        updateState(algorithm, { 
          swapping: [i, largest],
          currentLine: 26
        });
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        swapCount++;
        updateState(algorithm, { 
          array: [...arr],
          swaps: swapCount,
          swapping: undefined
        });
        await sleep(animationSpeed.current);
        
        await heapify(n, largest);
      }
    };

    // Build heap
    updateState(algorithm, { currentLine: 4 });
    for (let i = Math.floor(n/2) - 1; i >= 0; i--) {
      if (stopSignal.current) break;
      await heapify(n, i);
    }
    
    // Extract elements
    updateState(algorithm, { currentLine: 9 });
    for (let i = n - 1; i > 0; i--) {
      if (stopSignal.current) break;
      
      updateState(algorithm, { swapping: [0, i] });
      [arr[0], arr[i]] = [arr[i], arr[0]];
      swapCount++;
      sortedIndices.unshift(i); // Add to beginning since we're going backwards
      updateState(algorithm, { 
        array: [...arr],
        swaps: swapCount,
        sorted: [...sortedIndices],
        swapping: undefined
      });
      await sleep(animationSpeed.current);
      
      await heapify(i, 0);
    }
    
    if (!stopSignal.current) {
      updateState(algorithm, { 
        sorted: Array.from({length: n}, (_, i) => i),
        comparing: [],
        pivot: undefined,
        currentLine: -1,
        isRunning: false
      });
    }
  };

  const runAlgorithm = async (algorithm: string, state: SortingState) => {
    switch(algorithm) {
      case 'bubble':
        await bubbleSort(algorithm, state);
        break;
      case 'quick':
        await quickSort(algorithm, state);
        break;
      case 'insertion':
        await insertionSort(algorithm, state);
        break;
      case 'selection':
        await selectionSort(algorithm, state);
        break;
      case 'merge':
        await mergeSort(algorithm, state);
        break;
      case 'heap':
        await heapSort(algorithm, state);
        break;
    }
  };

  const startSorting = async () => {
    stopSignal.current = false;
    
    if (isRacing) {
      // Reset and start all selected algorithms
      const newStates: Record<string, SortingState> = {};
      selectedAlgorithms.forEach(algo => {
        newStates[algo] = {
          array: [...mainArray],
          comparing: [],
          sorted: [],
          comparisons: 0,
          swaps: 0,
          currentLine: -1,
          isRunning: true,
          algorithm: algo
        };
      });
      setAlgorithmStates(newStates);
      
      // Start all selected algorithms
      const promises = selectedAlgorithms.map(algo => {
        return runAlgorithm(algo, newStates[algo]);
      });
      await Promise.all(promises);
    } else {
      // Single algorithm mode - reset state before starting
      const newState = {
        array: [...mainArray],
        comparing: [],
        sorted: [],
        comparisons: 0,
        swaps: 0,
        currentLine: -1,
        isRunning: true,
        algorithm: singleAlgorithm
      };
      setSingleState(newState);
      await runAlgorithm(singleAlgorithm, newState);
    }
  };

  const stopSorting = () => {
    stopSignal.current = true;
    
    if (isRacing) {
      selectedAlgorithms.forEach(algo => {
        updateState(algo, { 
          isRunning: false,
          comparing: [],
          swapping: undefined,
          pivot: undefined,
          currentLine: -1
        });
      });
    } else {
      setSingleState(prev => ({ 
        ...prev, 
        isRunning: false,
        comparing: [],
        swapping: undefined,
        pivot: undefined,
        currentLine: -1
      }));
    }
  };

  const handleSizeChange = (value: string) => {
    setArraySizeInput(value);
    
    const num = parseInt(value);
    if (!isNaN(num) && num >= 5 && num <= 100) {
      setArraySize(num);
      generateArray(num);
    }
  };

  const toggleAlgorithmSelection = (algo: string) => {
    setSelectedAlgorithms(prev => {
      if (prev.includes(algo)) {
        if (prev.length > 1) {
          return prev.filter(a => a !== algo);
        }
        return prev;
      } else {
        return [...prev, algo];
      }
    });
  };

  const isAnySorting = isRacing ? 
    Object.values(algorithmStates).some(s => s.isRunning) : 
    singleState.isRunning;

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Home
      </button>
      
      <h2 style={styles.title}>📊 Sorting Algorithms</h2>
      
      <div style={styles.section}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Mode:</label>
          <button
            style={{
              ...styles.button,
              backgroundColor: !isRacing ? '#10b981' : '#6b7280'
            }}
            onClick={() => setIsRacing(false)}
            disabled={isAnySorting}
          >
            Single Algorithm
          </button>
          <button
            style={{
              ...styles.button,
              backgroundColor: isRacing ? '#10b981' : '#6b7280'
            }}
            onClick={() => setIsRacing(true)}
            disabled={isAnySorting}
          >
            🏁 Race Mode
          </button>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Array Size:</label>
          <input
            type="text"
            value={arraySizeInput}
            onChange={(e) => handleSizeChange(e.target.value)}
            onBlur={() => {
              const num = parseInt(arraySizeInput);
              if (isNaN(num) || num < 5) {
                setArraySizeInput('5');
                setArraySize(5);
                generateArray(5);
              } else if (num > 100) {
                setArraySizeInput('100');
                setArraySize(100);
                generateArray(100);
              }
            }}
            style={styles.input}
            disabled={isAnySorting}
          />
          
          {!isRacing && (
            <>
              <label style={styles.label}>Algorithm:</label>
              <select 
                value={singleAlgorithm}
                onChange={(e) => {
                  setSingleAlgorithm(e.target.value);
                  generateArray(arraySize);
                }}
                style={styles.select}
                disabled={isAnySorting}
              >
                {Object.entries(algorithms).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </>
          )}

          <label style={styles.label}>Speed:</label>
          <input
            type="range"
            min="10"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            style={{ width: '150px' }}
            disabled={isAnySorting}
          />
          <span>{speed}ms</span>
        </div>

        {isRacing && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Select Algorithms:</label>
            {Object.entries(algorithms).map(([key, name]) => (
              <label key={key} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={selectedAlgorithms.includes(key)}
                  onChange={() => toggleAlgorithmSelection(key)}
                  disabled={isAnySorting}
                />
                {name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Visualizations */}
      {!isRacing ? (
        // Single algorithm view with code
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
          <div>
            <div style={styles.section}>
              <div style={styles.visualizer}>
                {singleState.array.map((value, index) => (
                  <div key={index} style={styles.bar(value, index, singleState)}>
                    {arraySize <= 20 && (
                      <span style={styles.barLabel}>{value}</span>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  style={styles.button}
                  onClick={startSorting}
                  disabled={singleState.isRunning}
                >
                  {singleState.isRunning ? 'Sorting...' : '▶ Start Sorting'}
                </button>
                <button 
                  style={styles.stopButton}
                  onClick={stopSorting}
                  disabled={!singleState.isRunning}
                >
                  ⬛ Stop
                </button>
                <button 
                  style={{ ...styles.button, backgroundColor: '#6b7280' }}
                  onClick={() => generateArray(arraySize)}
                  disabled={singleState.isRunning}
                >
                  🔄 Reset Array
                </button>
              </div>

              <div style={styles.stats}>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{singleState.comparisons}</div>
                  <div style={styles.statLabel}>Comparisons</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{singleState.swaps}</div>
                  <div style={styles.statLabel}>Swaps</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{mainArray.length}</div>
                  <div style={styles.statLabel}>Elements</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{algorithms[singleAlgorithm]}</div>
                  <div style={styles.statLabel}>Algorithm</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <CodeDisplay
              code={getAlgorithmCode(singleAlgorithm)}
              currentLine={singleState.currentLine}
              title={algorithms[singleAlgorithm]}
            />
            
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
                  <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#667eea', marginRight: '10px' }}></span>
                  Unsorted
                </div>
                <div>
                  <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#ef4444', marginRight: '10px' }}></span>
                  Comparing
                </div>
                <div>
                  <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#f59e0b', marginRight: '10px' }}></span>
                  Pivot
                </div>
                <div>
                  <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#ec4899', marginRight: '10px' }}></span>
                  Swapping
                </div>
                <div>
                  <span style={{ display: 'inline-block', width: '20px', height: '10px', backgroundColor: '#10b981', marginRight: '10px' }}></span>
                  Sorted
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Race mode view
        <div>
          <div style={styles.raceContainer}>
            {selectedAlgorithms.map(algo => {
              const state = algorithmStates[algo] || {
                array: mainArray,
                comparing: [],
                sorted: [],
                comparisons: 0,
                swaps: 0,
                currentLine: -1,
                isRunning: false,
                algorithm: algo
              };
              
              return (
                <div key={algo} style={styles.raceItem}>
                  <div style={styles.raceTitle}>
                    {algorithms[algo]}
                    {state.sorted.length === arraySize && (
                      <span style={{ marginLeft: '10px', color: '#10b981' }}>✓ Complete!</span>
                    )}
                  </div>
                  <div style={{ ...styles.visualizer, height: '200px' }}>
                    {state.array.map((value, index) => (
                      <div key={index} style={styles.bar(value, index, state)}>
                        {arraySize <= 10 && (
                          <span style={{ ...styles.barLabel, fontSize: '8px' }}>{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ ...styles.stats, gridTemplateColumns: '1fr 1fr' }}>
                    <div style={styles.statCard}>
                      <div style={styles.statValue}>{state.comparisons}</div>
                      <div style={styles.statLabel}>Comparisons</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statValue}>{state.swaps}</div>
                      <div style={styles.statLabel}>Swaps</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              style={styles.button}
              onClick={startSorting}
              disabled={isAnySorting}
            >
              {isAnySorting ? 'Racing...' : '🏁 Start Race'}
            </button>
            <button 
              style={styles.stopButton}
              onClick={stopSorting}
              disabled={!isAnySorting}
            >
              ⬛ Stop Race
            </button>
            <button 
              style={{ ...styles.button, backgroundColor: '#6b7280' }}
              onClick={() => generateArray(arraySize)}
              disabled={isAnySorting}
            >
              🔄 Reset Arrays
            </button>
          </div>
        </div>
      )}
    </div>
  );
};