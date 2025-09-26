// src/pages/SearchPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { CodeDisplay } from '../components/common/CodeDisplay';

interface SearchPageProps {
  onBack: () => void;
}

interface SearchState {
  array: number[];
  currentIndex: number;
  comparing: number[];
  found: number | null;
  searchRange: [number, number] | null;
  comparisons: number;
  isRunning: boolean;
  currentLine: number;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onBack }) => {
  const [arraySize, setArraySize] = useState<number>(30);
  const [arraySizeInput, setArraySizeInput] = useState<string>('30');
  const [mainArray, setMainArray] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState<number>(50);
  const [searchValueInput, setSearchValueInput] = useState<string>('50');
  const [algorithm, setAlgorithm] = useState<'linear' | 'binary' | 'jump' | 'exponential' | 'interpolation' | 'fibonacci'>('binary');
  const [speed, setSpeed] = useState(500);
  const [isSorted, setIsSorted] = useState(true);
  const [searchState, setSearchState] = useState<SearchState>({
    array: [],
    currentIndex: -1,
    comparing: [],
    found: null,
    searchRange: null,
    comparisons: 0,
    isRunning: false,
    currentLine: -1
  });
  
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
      background: '#f59e0b',
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
      minHeight: '300px',
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    arrayContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
      marginBottom: '20px',
      justifyContent: 'center',
    },
    arrayElement: (index: number, state: SearchState, value: number) => ({
      width: arraySize <= 20 ? '60px' : arraySize <= 40 ? '40px' : '30px',
      height: arraySize <= 20 ? '60px' : arraySize <= 40 ? '40px' : '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      fontSize: arraySize <= 20 ? '16px' : arraySize <= 40 ? '14px' : '11px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      border: '2px solid',
      borderColor: state.found === index ? '#10b981' : 
                   state.currentIndex === index ? '#f59e0b' :
                   state.comparing.includes(index) ? '#ef4444' :
                   state.searchRange && index >= state.searchRange[0] && index <= state.searchRange[1] ? '#3b82f6' :
                   '#e5e7eb',
      backgroundColor: state.found === index ? '#10b981' :
                       state.currentIndex === index ? '#fef3c7' :
                       state.comparing.includes(index) ? '#fee2e2' :
                       state.searchRange && index >= state.searchRange[0] && index <= state.searchRange[1] ? '#dbeafe' :
                       'white',
      color: state.found === index ? 'white' : '#374151',
      transform: state.currentIndex === index || state.found === index ? 'scale(1.2)' : 'scale(1)',
      position: 'relative' as const,
    }),
    indexLabel: {
      position: 'absolute' as const,
      top: '-20px',
      fontSize: '10px',
      color: '#9ca3af',
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginTop: '20px',
    },
    statCard: {
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center' as const,
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#f59e0b',
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '5px',
    },
    resultBox: {
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px',
      textAlign: 'center' as const,
      fontSize: '16px',
      fontWeight: 'bold',
    },
    foundBox: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '2px solid #10b981',
    },
    notFoundBox: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '2px solid #ef4444',
    }
  };

  // Algorithm code displays
  const linearSearchCode = [
    'function linearSearch(arr, target) {',
    '  for (let i = 0; i < arr.length; i++) {',
    '    // Check each element',
    '    if (arr[i] === target) {',
    '      return i; // Found!',
    '    }',
    '  }',
    '  return -1; // Not found',
    '}'
  ];

  const binarySearchCode = [
    'function binarySearch(arr, target) {',
    '  let left = 0;',
    '  let right = arr.length - 1;',
    '  ',
    '  while (left <= right) {',
    '    let mid = Math.floor((left + right) / 2);',
    '    ',
    '    if (arr[mid] === target) {',
    '      return mid; // Found!',
    '    }',
    '    ',
    '    if (arr[mid] < target) {',
    '      left = mid + 1; // Search right half',
    '    } else {',
    '      right = mid - 1; // Search left half',
    '    }',
    '  }',
    '  return -1; // Not found',
    '}'
  ];

  const jumpSearchCode = [
    'function jumpSearch(arr, target) {',
    '  let n = arr.length;',
    '  let step = Math.floor(Math.sqrt(n));',
    '  let prev = 0;',
    '  ',
    '  // Jump to find block',
    '  while (arr[Math.min(step, n) - 1] < target) {',
    '    prev = step;',
    '    step += Math.floor(Math.sqrt(n));',
    '    if (prev >= n) return -1;',
    '  }',
    '  ',
    '  // Linear search in block',
    '  while (arr[prev] < target) {',
    '    prev++;',
    '    if (prev === Math.min(step, n)) {',
    '      return -1;',
    '    }',
    '  }',
    '  ',
    '  if (arr[prev] === target) return prev;',
    '  return -1;',
    '}'
  ];

  const exponentialSearchCode = [
    'function exponentialSearch(arr, target) {',
    '  let n = arr.length;',
    '  ',
    '  // If target is at first position',
    '  if (arr[0] === target) return 0;',
    '  ',
    '  // Find range for binary search',
    '  let i = 1;',
    '  while (i < n && arr[i] <= target) {',
    '    i = i * 2;',
    '  }',
    '  ',
    '  // Binary search in found range',
    '  return binarySearch(arr, target,',
    '                      i / 2,',
    '                      Math.min(i, n - 1));',
    '}'
  ];

  const interpolationSearchCode = [
    'function interpolationSearch(arr, target) {',
    '  let low = 0;',
    '  let high = arr.length - 1;',
    '  ',
    '  while (low <= high && target >= arr[low] && target <= arr[high]) {',
    '    if (low === high) {',
    '      if (arr[low] === target) return low;',
    '      return -1;',
    '    }',
    '    ',
    '    // Estimate position using interpolation',
    '    let pos = low + Math.floor(',
    '      ((target - arr[low]) * (high - low)) /',
    '      (arr[high] - arr[low])',
    '    );',
    '    ',
    '    if (arr[pos] === target) return pos;',
    '    ',
    '    if (arr[pos] < target) {',
    '      low = pos + 1;',
    '    } else {',
    '      high = pos - 1;',
    '    }',
    '  }',
    '  return -1;',
    '}'
  ];

  const fibonacciSearchCode = [
    'function fibonacciSearch(arr, target) {',
    '  let n = arr.length;',
    '  let fib2 = 0; // (m-2)th Fibonacci',
    '  let fib1 = 1; // (m-1)th Fibonacci',
    '  let fibM = fib2 + fib1; // mth Fibonacci',
    '  ',
    '  // Find smallest Fibonacci >= n',
    '  while (fibM < n) {',
    '    fib2 = fib1;',
    '    fib1 = fibM;',
    '    fibM = fib2 + fib1;',
    '  }',
    '  ',
    '  let offset = -1;',
    '  ',
    '  while (fibM > 1) {',
    '    let i = Math.min(offset + fib2, n - 1);',
    '    ',
    '    if (arr[i] < target) {',
    '      fibM = fib1;',
    '      fib1 = fib2;',
    '      fib2 = fibM - fib1;',
    '      offset = i;',
    '    } else if (arr[i] > target) {',
    '      fibM = fib2;',
    '      fib1 = fib1 - fib2;',
    '      fib2 = fibM - fib1;',
    '    } else {',
    '      return i; // Found',
    '    }',
    '  }',
    '  ',
    '  if (fib1 && arr[offset + 1] === target) {',
    '    return offset + 1;',
    '  }',
    '  return -1;',
    '}'
  ];

  const getAlgorithmCode = () => {
    switch(algorithm) {
      case 'linear': return linearSearchCode;
      case 'binary': return binarySearchCode;
      case 'jump': return jumpSearchCode;
      case 'exponential': return exponentialSearchCode;
      case 'interpolation': return interpolationSearchCode;
      case 'fibonacci': return fibonacciSearchCode;
      default: return binarySearchCode;
    }
  };

  const generateArray = (size: number, sorted: boolean) => {
    let newArray: number[];
    
    if (sorted) {
      // Generate sorted array with some gaps
      newArray = [];
      let current = Math.floor(Math.random() * 10) + 1;
      for (let i = 0; i < size; i++) {
        newArray.push(current);
        current += Math.floor(Math.random() * 10) + 1;
      }
    } else {
      // Generate random unsorted array
      newArray = Array.from({ length: size }, () => 
        Math.floor(Math.random() * 100) + 1
      );
    }
    
    setMainArray(newArray);
    setSearchState({
      array: newArray,
      currentIndex: -1,
      comparing: [],
      found: null,
      searchRange: null,
      comparisons: 0,
      isRunning: false,
      currentLine: -1
    });
    
    // Set default search value to middle element
    if (newArray.length > 0) {
      const midIndex = Math.floor(newArray.length / 2);
      setSearchValue(newArray[midIndex]);
      setSearchValueInput(String(newArray[midIndex]));
    }
  };

  useEffect(() => {
    generateArray(arraySize, isSorted);
  }, []);

  useEffect(() => {
    // Ensure array is sorted for algorithms that require it
    if ((algorithm === 'binary' || algorithm === 'jump' || algorithm === 'exponential' || 
         algorithm === 'interpolation' || algorithm === 'fibonacci') && !isSorted) {
      setIsSorted(true);
      generateArray(arraySize, true);
    }
  }, [algorithm]);

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Search algorithm implementations
  const linearSearch = async () => {
    setSearchState(prev => ({ ...prev, isRunning: true, found: null, comparisons: 0 }));
    let comparisons = 0;
    let foundIndex = null;
    
    for (let i = 0; i < mainArray.length; i++) {
      if (stopSignal.current) break;
      
      setSearchState(prev => ({ 
        ...prev, 
        currentIndex: i,
        comparing: [i],
        currentLine: 3
      }));
      
      comparisons++;
      setSearchState(prev => ({ ...prev, comparisons }));
      
      await sleep(speedRef.current);
      
      if (mainArray[i] === searchValue) {
        foundIndex = i;
        setSearchState(prev => ({ 
          ...prev, 
          found: i,
          currentLine: 4
        }));
        await sleep(speedRef.current * 2);
        break;
      }
    }
    
    if (!stopSignal.current && foundIndex === null) {
      setSearchState(prev => ({ ...prev, found: -1 }));
    }
    
    setSearchState(prev => ({ 
      ...prev, 
      isRunning: false,
      currentIndex: -1,
      comparing: [],
      currentLine: -1
    }));
  };

  const binarySearch = async () => {
    setSearchState(prev => ({ ...prev, isRunning: true, found: null, comparisons: 0 }));
    let comparisons = 0;
    let foundIndex = null;
    
    let left = 0;
    let right = mainArray.length - 1;
    
    setSearchState(prev => ({ ...prev, currentLine: 1 }));
    await sleep(speedRef.current);
    
    while (left <= right && !stopSignal.current) {
      const mid = Math.floor((left + right) / 2);
      
      setSearchState(prev => ({ 
        ...prev, 
        currentIndex: mid,
        comparing: [mid],
        searchRange: [left, right],
        currentLine: 5
      }));
      await sleep(speedRef.current);
      
      comparisons++;
      setSearchState(prev => ({ ...prev, comparisons }));
      
      if (mainArray[mid] === searchValue) {
        foundIndex = mid;
        setSearchState(prev => ({ 
          ...prev, 
          found: mid,
          currentLine: 8
        }));
        await sleep(speedRef.current * 2);
        break;
      }
      
      if (mainArray[mid] < searchValue) {
        left = mid + 1;
        setSearchState(prev => ({ ...prev, currentLine: 12 }));
      } else {
        right = mid - 1;
        setSearchState(prev => ({ ...prev, currentLine: 14 }));
      }
      await sleep(speedRef.current);
    }
    
    if (!stopSignal.current && foundIndex === null) {
      setSearchState(prev => ({ ...prev, found: -1 }));
    }
    
    setSearchState(prev => ({ 
      ...prev, 
      isRunning: false,
      currentIndex: -1,
      comparing: [],
      searchRange: null,
      currentLine: -1
    }));
  };

  const jumpSearch = async () => {
    setSearchState(prev => ({ ...prev, isRunning: true, found: null, comparisons: 0 }));
    let comparisons = 0;
    let foundIndex = null;
    
    const n = mainArray.length;
    const step = Math.floor(Math.sqrt(n));
    let prev = 0;
    let current = step;
    
    setSearchState(prev => ({ ...prev, currentLine: 2 }));
    await sleep(speedRef.current);
    
    // Jump phase
    while (current < n && mainArray[current - 1] < searchValue && !stopSignal.current) {
      setSearchState(prev => ({ 
        ...prev, 
        currentIndex: current - 1,
        comparing: [current - 1],
        searchRange: [prev, current - 1],
        currentLine: 6
      }));
      comparisons++;
      setSearchState(prev => ({ ...prev, comparisons }));
      await sleep(speedRef.current);
      
      prev = current;
      current += step;
      if (current > n) current = n;
    }
    
    // Linear search phase
    setSearchState(prev => ({ ...prev, currentLine: 13 }));
    for (let i = prev; i < Math.min(current, n); i++) {
      if (stopSignal.current) break;
      
      setSearchState(prev => ({ 
        ...prev, 
        currentIndex: i,
        comparing: [i],
        searchRange: [prev, Math.min(current, n) - 1]
      }));
      comparisons++;
      setSearchState(prev => ({ ...prev, comparisons }));
      await sleep(speedRef.current);
      
      if (mainArray[i] === searchValue) {
        foundIndex = i;
        setSearchState(prev => ({ 
          ...prev, 
          found: i,
          currentLine: 20
        }));
        await sleep(speedRef.current * 2);
        break;
      }
      
      if (mainArray[i] > searchValue) {
        break;
      }
    }
    
    if (!stopSignal.current && foundIndex === null) {
      setSearchState(prev => ({ ...prev, found: -1 }));
    }
    
    setSearchState(prev => ({ 
      ...prev, 
      isRunning: false,
      currentIndex: -1,
      comparing: [],
      searchRange: null,
      currentLine: -1
    }));
  };

  const exponentialSearch = async () => {
    setSearchState(prev => ({ ...prev, isRunning: true, found: null, comparisons: 0 }));
    let comparisons = 0;
    let foundIndex = null;
    
    // Check first element
    setSearchState(prev => ({ 
      ...prev, 
      currentIndex: 0,
      comparing: [0],
      currentLine: 4
    }));
    comparisons++;
    setSearchState(prev => ({ ...prev, comparisons }));
    await sleep(speedRef.current);
    
    if (mainArray[0] === searchValue) {
      setSearchState(prev => ({ ...prev, found: 0 }));
      await sleep(speedRef.current * 2);
      setSearchState(prev => ({ 
        ...prev, 
        isRunning: false,
        currentIndex: -1,
        comparing: [],
        currentLine: -1
      }));
      return;
    }
    
    // Find range
    let i = 1;
    setSearchState(prev => ({ ...prev, currentLine: 7 }));
    while (i < mainArray.length && mainArray[i] <= searchValue && !stopSignal.current) {
      setSearchState(prev => ({ 
        ...prev, 
        currentIndex: i,
        comparing: [i],
        searchRange: [i/2, i]
      }));
      comparisons++;
      setSearchState(prev => ({ ...prev, comparisons }));
      await sleep(speedRef.current);
      
      i = i * 2;
    }
    
    // Binary search in range
    const left = Math.floor(i / 2);
    const right = Math.min(i, mainArray.length - 1);
    
    setSearchState(prev => ({ ...prev, currentLine: 12 }));
    await binarySearchInRange(left, right, comparisons);
  };

  const binarySearchInRange = async (start: number, end: number, prevComparisons: number) => {
    let left = start;
    let right = end;
    let comparisons = prevComparisons;
    let foundIndex = null;
    
    while (left <= right && !stopSignal.current) {
      const mid = Math.floor((left + right) / 2);
      
      setSearchState(prev => ({ 
        ...prev, 
        currentIndex: mid,
        comparing: [mid],
        searchRange: [left, right]
      }));
      comparisons++;
      setSearchState(prev => ({ ...prev, comparisons }));
      await sleep(speedRef.current);
      
      if (mainArray[mid] === searchValue) {
        foundIndex = mid;
        setSearchState(prev => ({ ...prev, found: mid }));
        await sleep(speedRef.current * 2);
        break;
      }
      
      if (mainArray[mid] < searchValue) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    if (!stopSignal.current && foundIndex === null) {
      setSearchState(prev => ({ ...prev, found: -1 }));
    }
    
    setSearchState(prev => ({ 
      ...prev, 
      isRunning: false,
      currentIndex: -1,
      comparing: [],
      searchRange: null,
      currentLine: -1
    }));
  };

  const interpolationSearch = async () => {
    setSearchState(prev => ({ ...prev, isRunning: true, found: null, comparisons: 0 }));
    let comparisons = 0;
    let foundIndex = null;
    
    let low = 0;
    let high = mainArray.length - 1;
    
    setSearchState(prev => ({ ...prev, currentLine: 1 }));
    await sleep(speedRef.current);
    
    while (low <= high && searchValue >= mainArray[low] && searchValue <= mainArray[high] && !stopSignal.current) {
      if (low === high) {
        setSearchState(prev => ({ 
          ...prev, 
          currentIndex: low,
          comparing: [low],
          currentLine: 6
        }));
        comparisons++;
        setSearchState(prev => ({ ...prev, comparisons }));
        await sleep(speedRef.current);
        
        if (mainArray[low] === searchValue) {
          foundIndex = low;
          setSearchState(prev => ({ ...prev, found: low }));
        }
        break;
      }
      
      // Calculate position using interpolation formula
      const pos = low + Math.floor(
        ((searchValue - mainArray[low]) * (high - low)) /
        (mainArray[high] - mainArray[low])
      );
      
      setSearchState(prev => ({ 
        ...prev, 
        currentIndex: pos,
        comparing: [pos],
        searchRange: [low, high],
        currentLine: 11
      }));
      comparisons++;
      setSearchState(prev => ({ ...prev, comparisons }));
      await sleep(speedRef.current);
      
      if (mainArray[pos] === searchValue) {
        foundIndex = pos;
        setSearchState(prev => ({ 
          ...prev, 
          found: pos,
          currentLine: 16
        }));
        await sleep(speedRef.current * 2);
        break;
      }
      
      if (mainArray[pos] < searchValue) {
        low = pos + 1;
        setSearchState(prev => ({ ...prev, currentLine: 19 }));
      } else {
        high = pos - 1;
        setSearchState(prev => ({ ...prev, currentLine: 21 }));
      }
      await sleep(speedRef.current);
    }
    
    if (!stopSignal.current && foundIndex === null) {
      setSearchState(prev => ({ ...prev, found: -1 }));
    }
    
    setSearchState(prev => ({ 
      ...prev, 
      isRunning: false,
      currentIndex: -1,
      comparing: [],
      searchRange: null,
      currentLine: -1
    }));
  };

  const fibonacciSearch = async () => {
    setSearchState(prev => ({ ...prev, isRunning: true, found: null, comparisons: 0 }));
    let comparisons = 0;
    let foundIndex = null;
    
    const n = mainArray.length;
    let fib2 = 0;
    let fib1 = 1;
    let fibM = fib2 + fib1;
    
    // Find smallest Fibonacci number >= n
    setSearchState(prev => ({ ...prev, currentLine: 7 }));
    while (fibM < n) {
      fib2 = fib1;
      fib1 = fibM;
      fibM = fib2 + fib1;
    }
    await sleep(speedRef.current);
    
    let offset = -1;
    
    while (fibM > 1 && !stopSignal.current) {
      const i = Math.min(offset + fib2, n - 1);
      
      setSearchState(prev => ({ 
        ...prev, 
        currentIndex: i,
        comparing: [i],
        searchRange: offset > -1 ? [offset, Math.min(offset + fibM, n - 1)] : null,
        currentLine: 16
      }));
      comparisons++;
      setSearchState(prev => ({ ...prev, comparisons }));
      await sleep(speedRef.current);
      
      if (mainArray[i] < searchValue) {
        fibM = fib1;
        fib1 = fib2;
        fib2 = fibM - fib1;
        offset = i;
        setSearchState(prev => ({ ...prev, currentLine: 19 }));
      } else if (mainArray[i] > searchValue) {
        fibM = fib2;
        fib1 = fib1 - fib2;
        fib2 = fibM - fib1;
        setSearchState(prev => ({ ...prev, currentLine: 24 }));
      } else {
        foundIndex = i;
        setSearchState(prev => ({ 
          ...prev, 
          found: i,
          currentLine: 28
        }));
        await sleep(speedRef.current * 2);
        break;
      }
      await sleep(speedRef.current);
    }
    
    // Check last element
    if (!stopSignal.current && foundIndex === null && fib1 && offset + 1 < n) {
      if (mainArray[offset + 1] === searchValue) {
        foundIndex = offset + 1;
        setSearchState(prev => ({ ...prev, found: offset + 1 }));
        await sleep(speedRef.current);
      }
    }
    
    if (!stopSignal.current && foundIndex === null) {
      setSearchState(prev => ({ ...prev, found: -1 }));
    }
    
    setSearchState(prev => ({ 
      ...prev, 
      isRunning: false,
      currentIndex: -1,
      comparing: [],
      searchRange: null,
      currentLine: -1
    }));
  };

  const startSearch = () => {
    stopSignal.current = false;
    
    switch(algorithm) {
      case 'linear':
        linearSearch();
        break;
      case 'binary':
        binarySearch();
        break;
      case 'jump':
        jumpSearch();
        break;
      case 'exponential':
        exponentialSearch();
        break;
      case 'interpolation':
        interpolationSearch();
        break;
      case 'fibonacci':
        fibonacciSearch();
        break;
    }
  };

  const stopSearch = () => {
    stopSignal.current = true;
  };

  const handleArraySizeChange = (value: string) => {
    setArraySizeInput(value);
    
    const num = parseInt(value);
    if (!isNaN(num) && num >= 5 && num <= 100) {
      setArraySize(num);
      generateArray(num, isSorted);
    }
  };

  const handleSearchValueChange = (value: string) => {
    setSearchValueInput(value);
    
    const num = parseInt(value);
    if (!isNaN(num)) {
      setSearchValue(num);
    }
  };

  const loadExampleData = (type: string) => {
    switch(type) {
      case 'small':
        setArraySize(15);
        setArraySizeInput('15');
        generateArray(15, isSorted);
        break;
      case 'medium':
        setArraySize(30);
        setArraySizeInput('30');
        generateArray(30, isSorted);
        break;
      case 'large':
        setArraySize(50);
        setArraySizeInput('50');
        generateArray(50, isSorted);
        break;
      case 'worst':
        // Worst case: searching for element not in array
        setSearchValue(999);
        setSearchValueInput('999');
        break;
      case 'best':
        // Best case: searching for middle element (for binary search)
        if (mainArray.length > 0) {
          const midIndex = Math.floor(mainArray.length / 2);
          setSearchValue(mainArray[midIndex]);
          setSearchValueInput(String(mainArray[midIndex]));
        }
        break;
    }
  };

  const insertRandomValue = () => {
    if (mainArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * mainArray.length);
      setSearchValue(mainArray[randomIndex]);
      setSearchValueInput(String(mainArray[randomIndex]));
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Home
      </button>
      
      <h2 style={styles.title}>🔍 Search Algorithms</h2>
      
      <div style={styles.section}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Array Size:</label>
          <input
            type="text"
            value={arraySizeInput}
            onChange={(e) => handleArraySizeChange(e.target.value)}
            onBlur={() => {
              const num = parseInt(arraySizeInput);
              if (isNaN(num) || num < 5) {
                setArraySizeInput('5');
                setArraySize(5);
                generateArray(5, isSorted);
              } else if (num > 100) {
                setArraySizeInput('100');
                setArraySize(100);
                generateArray(100, isSorted);
              }
            }}
            style={styles.input}
            disabled={searchState.isRunning}
          />
          
          <label style={styles.label}>Search For:</label>
          <input
            type="text"
            value={searchValueInput}
            onChange={(e) => handleSearchValueChange(e.target.value)}
            style={styles.input}
            disabled={searchState.isRunning}
          />
          <button
            style={{ ...styles.button, backgroundColor: '#8b5cf6', padding: '8px 15px' }}
            onClick={insertRandomValue}
            disabled={searchState.isRunning}
          >
            🎲 Random
          </button>
          
          <label style={styles.label}>Algorithm:</label>
          <select 
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as any)}
            style={styles.select}
            disabled={searchState.isRunning}
          >
            <option value="linear">Linear Search</option>
            <option value="binary">Binary Search</option>
            <option value="jump">Jump Search</option>
            <option value="exponential">Exponential Search</option>
            <option value="interpolation">Interpolation Search</option>
            <option value="fibonacci">Fibonacci Search</option>
          </select>

          <label style={styles.label}>Speed:</label>
          <input
            type="range"
            min="100"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            style={{ width: '150px' }}
            disabled={searchState.isRunning}
          />
          <span>{speed}ms</span>
        </div>

        <div style={styles.inputGroup}>
          <label>
            <input
              type="checkbox"
              checked={isSorted}
              onChange={(e) => {
                setIsSorted(e.target.checked);
                generateArray(arraySize, e.target.checked);
              }}
              disabled={searchState.isRunning || algorithm !== 'linear'}
              style={{ marginRight: '8px' }}
            />
            Sorted Array
            {algorithm !== 'linear' && (
              <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                (Required for {algorithm})
              </span>
            )}
          </label>
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
        flexWrap: 'wrap' as const,
      }}>
        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>📊 Examples:</span>
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
          onClick={() => loadExampleData('small')}
          disabled={searchState.isRunning}
        >
          Small (15)
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
          onClick={() => loadExampleData('medium')}
          disabled={searchState.isRunning}
        >
          Medium (30)
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
          onClick={() => loadExampleData('large')}
          disabled={searchState.isRunning}
        >
          Large (50)
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onClick={() => loadExampleData('worst')}
          disabled={searchState.isRunning}
        >
          Worst Case (Not Found)
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
          onClick={() => loadExampleData('best')}
          disabled={searchState.isRunning}
        >
          Best Case (Middle)
        </button>
      </div>

      {/* Main visualization area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
        <div>
          <div style={styles.section}>
            <div style={styles.visualizer}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#374151' }}>
                Searching for: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{searchValue}</span>
              </h3>
              
              <div style={styles.arrayContainer}>
                {searchState.array.map((value, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    {arraySize <= 40 && (
                      <span style={styles.indexLabel}>{index}</span>
                    )}
                    <div style={styles.arrayElement(index, searchState, value)}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Result display */}
              {searchState.found !== null && (
                <div style={searchState.found >= 0 ? styles.foundBox : styles.notFoundBox}>
                  {searchState.found >= 0 
                    ? `✅ Found at index ${searchState.found}!`
                    : '❌ Value not found in array'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                style={styles.button}
                onClick={startSearch}
                disabled={searchState.isRunning}
              >
                {searchState.isRunning ? 'Searching...' : '▶ Start Search'}
              </button>
              <button 
                style={styles.stopButton}
                onClick={stopSearch}
                disabled={!searchState.isRunning}
              >
                ⬛ Stop
              </button>
              <button 
                style={{ ...styles.button, backgroundColor: '#6b7280' }}
                onClick={() => generateArray(arraySize, isSorted)}
                disabled={searchState.isRunning}
              >
                🔄 Reset Array
              </button>
            </div>

            <div style={styles.stats}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{searchState.comparisons}</div>
                <div style={styles.statLabel}>Comparisons</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{arraySize}</div>
                <div style={styles.statLabel}>Array Size</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>
                  {algorithm === 'linear' ? 'O(n)' :
                   algorithm === 'binary' ? 'O(log n)' :
                   algorithm === 'jump' ? 'O(√n)' :
                   algorithm === 'exponential' ? 'O(log n)' :
                   algorithm === 'interpolation' ? 'O(log log n)' :
                   'O(log n)'}
                </div>
                <div style={styles.statLabel}>Time Complexity</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>
                  {searchState.found === null ? '—' :
                   searchState.found >= 0 ? searchState.found : 'N/A'}
                </div>
                <div style={styles.statLabel}>Found At</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <CodeDisplay
            code={getAlgorithmCode()}
            currentLine={searchState.currentLine}
            title={
              algorithm === 'linear' ? 'Linear Search' :
              algorithm === 'binary' ? 'Binary Search' :
              algorithm === 'jump' ? 'Jump Search' :
              algorithm === 'exponential' ? 'Exponential Search' :
              algorithm === 'interpolation' ? 'Interpolation Search' :
              'Fibonacci Search'
            }
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
                <span style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '12px', 
                  backgroundColor: '#fef3c7',
                  border: '2px solid #f59e0b',
                  marginRight: '10px' 
                }}></span>
                Current Element
              </div>
              <div>
                <span style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '12px', 
                  backgroundColor: '#fee2e2',
                  border: '2px solid #ef4444',
                  marginRight: '10px' 
                }}></span>
                Comparing
              </div>
              <div>
                <span style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '12px', 
                  backgroundColor: '#dbeafe',
                  border: '2px solid #3b82f6',
                  marginRight: '10px' 
                }}></span>
                Search Range
              </div>
              <div>
                <span style={{ 
                  display: 'inline-block', 
                  width: '20px', 
                  height: '12px', 
                  backgroundColor: '#10b981',
                  border: '2px solid #10b981',
                  marginRight: '10px' 
                }}></span>
                Found
              </div>
            </div>
          </div>

          {/* Algorithm Info */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f9fafb', 
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              📚 Algorithm Details:
            </h3>
            {algorithm === 'linear' && (
              <div style={{ color: '#6b7280' }}>
                <p><strong>Best Case:</strong> O(1) - Element at first position</p>
                <p><strong>Worst Case:</strong> O(n) - Element at last or not present</p>
                <p><strong>Works on:</strong> Sorted and unsorted arrays</p>
                <p><strong>Use when:</strong> Array is small or unsorted</p>
              </div>
            )}
            {algorithm === 'binary' && (
              <div style={{ color: '#6b7280' }}>
                <p><strong>Best Case:</strong> O(1) - Element at middle</p>
                <p><strong>Worst Case:</strong> O(log n) - Element at ends</p>
                <p><strong>Requires:</strong> Sorted array</p>
                <p><strong>Use when:</strong> Array is sorted and large</p>
              </div>
            )}
            {algorithm === 'jump' && (
              <div style={{ color: '#6b7280' }}>
                <p><strong>Best Case:</strong> O(1) - Element at first block</p>
                <p><strong>Worst Case:</strong> O(√n) - Linear search in block</p>
                <p><strong>Requires:</strong> Sorted array</p>
                <p><strong>Use when:</strong> Jumping is cheaper than binary comparison</p>
              </div>
            )}
            {algorithm === 'exponential' && (
              <div style={{ color: '#6b7280' }}>
                <p><strong>Best Case:</strong> O(1) - Element at first position</p>
                <p><strong>Worst Case:</strong> O(log n) - Binary search phase</p>
                <p><strong>Requires:</strong> Sorted array</p>
                <p><strong>Use when:</strong> Target likely near beginning</p>
              </div>
            )}
            {algorithm === 'interpolation' && (
              <div style={{ color: '#6b7280' }}>
                <p><strong>Best Case:</strong> O(1) - Direct hit</p>
                <p><strong>Average:</strong> O(log log n) - Uniform distribution</p>
                <p><strong>Worst Case:</strong> O(n) - Uneven distribution</p>
                <p><strong>Use when:</strong> Data is uniformly distributed</p>
              </div>
            )}
            {algorithm === 'fibonacci' && (
              <div style={{ color: '#6b7280' }}>
                <p><strong>Best Case:</strong> O(1) - Element at Fibonacci position</p>
                <p><strong>Worst Case:</strong> O(log n) - Similar to binary search</p>
                <p><strong>Requires:</strong> Sorted array</p>
                <p><strong>Use when:</strong> Division is expensive</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};