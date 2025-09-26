// src/algorithms/sorting/quickSort.ts
export function* quickSort(
  arr: number[],
  low = 0,
  high = arr.length - 1
): Generator<SortingStep> {
  if (low < high) {
    const pivotIndex = yield* partition(arr, low, high);
    
    // Recursively sort left and right partitions
    yield* quickSort(arr, low, pivotIndex - 1);
    yield* quickSort(arr, pivotIndex + 1, high);
  }

  // Mark as complete when returning to top level
  if (low === 0 && high === arr.length - 1) {
    yield {
      type: 'done',
      indices: Array.from({ length: arr.length }, (_, i) => i),
      array: [...arr],
      algorithm: 'quickSort'
    };
  }
}

function* partition(
  arr: number[],
  low: number,
  high: number
): Generator<SortingStep, number> {
  const pivot = arr[high];
  
  // Show pivot selection
  yield {
    type: 'partition',
    indices: [high],
    array: [...arr],
    algorithm: 'quickSort'
  };

  let i = low - 1;

  for (let j = low; j < high; j++) {
    // Compare with pivot
    yield {
      type: 'compare',
      indices: [j, high],
      array: [...arr],
      algorithm: 'quickSort'
    };

    if (arr[j] < pivot) {
      i++;
      
      // Swap elements
      if (i !== j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        yield {
          type: 'swap',
          indices: [i, j],
          array: [...arr],
          algorithm: 'quickSort'
        };
      }
    }
  }

  // Place pivot in correct position
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  yield {
    type: 'swap',
    indices: [i + 1, high],
    array: [...arr],
    algorithm: 'quickSort'
  };

  return i + 1;
}
