// src/algorithms/sorting/mergeSort.ts
import { SortingStep } from '@/types/sorting';

export function* mergeSort(
  arr: number[],
  start = 0,
  end = arr.length - 1,
  depth = 0
): Generator<SortingStep> {
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);

  // Divide phase
  yield {
    type: 'partition',
    indices: [start, mid, end],
    array: [...arr],
    algorithm: 'mergeSort'
  };

  // Sort left half
  yield* mergeSort(arr, start, mid, depth + 1);

  // Sort right half
  yield* mergeSort(arr, mid + 1, end, depth + 1);

  // Merge phase
  yield* merge(arr, start, mid, end);
}

function* merge(
  arr: number[],
  start: number,
  mid: number,
  end: number
): Generator<SortingStep> {
  const left = arr.slice(start, mid + 1);
  const right = arr.slice(mid + 1, end + 1);
  
  let i = 0, j = 0, k = start;

  while (i < left.length && j < right.length) {
    // Compare elements
    yield {
      type: 'compare',
      indices: [start + i, mid + 1 + j],
      array: [...arr],
      algorithm: 'mergeSort'
    };

    if (left[i] <= right[j]) {
      arr[k] = left[i];
      i++;
    } else {
      arr[k] = right[j];
      j++;
    }

    // Show merge operation
    yield {
      type: 'merge',
      indices: [k],
      array: [...arr],
      algorithm: 'mergeSort'
    };
    k++;
  }

  // Copy remaining elements
  while (i < left.length) {
    arr[k] = left[i];
    yield {
      type: 'merge',
      indices: [k],
      array: [...arr],
      algorithm: 'mergeSort'
    };
    i++;
    k++;
  }

  while (j < right.length) {
    arr[k] = right[j];
    yield {
      type: 'merge',
      indices: [k],
      array: [...arr],
      algorithm: 'mergeSort'
    };
    j++;
    k++;
  }

  // Mark merged section as done
  yield {
    type: 'done',
    indices: Array.from({ length: end - start + 1 }, (_, i) => start + i),
    array: [...arr],
    algorithm: 'mergeSort'
  };
}

