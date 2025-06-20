import type { AnimationStep, SortingAlgorithm } from '../../types';

export class SortingAlgorithms {
	static generateSteps(array: number[], algorithm: SortingAlgorithm): AnimationStep[] {
		const steps: AnimationStep[] = [];
		const arr = [...array];

		switch (algorithm) {
			case 'BUBBLE_SORT':
				return this.bubbleSort(arr);
			case 'SELECTION_SORT':
				return this.selectionSort(arr);
			case 'INSERTION_SORT':
				return this.insertionSort(arr);
			case 'QUICK_SORT':
				return this.quickSortWrapper(arr);
			case 'MERGE_SORT':
				return this.mergeSortWrapper(arr);
			case 'HEAP_SORT':
				return this.heapSort(arr);
			default:
				return steps;
		}
	}

	private static bubbleSort(arr: number[]): AnimationStep[] {
		const steps: AnimationStep[] = [];
		const n = arr.length;
		let swapCount = 0;
		let comparisonCount = 0;

		for (let i = 0; i < n - 1; i++) {
			for (let j = 0; j < n - i - 1; j++) {
				// Compare adjacent elements
				comparisonCount++;
				steps.push({
					move: { type: 'COMPARE', indices: [j, j + 1] },
					description: `Comparing elements at positions ${j} and ${j + 1}`,
					state: {
						comparing: [j, j + 1],
						comparisons: comparisonCount
					}
				});

				if (arr[j] > arr[j + 1]) {
					// Swap elements
					[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
					swapCount++;
					steps.push({
						move: { type: 'SWAP', indices: [j, j + 1] },
						description: `Swapping elements at positions ${j} and ${j + 1}`,
						state: {
							array: [...arr],
							comparing: [],
							swaps: swapCount,
							comparisons: comparisonCount
						}
					});
				}
			}
			// Mark element as sorted
			steps.push({
				move: { type: 'HIGHLIGHT', indices: [n - i - 1] },
				description: `Element at position ${n - i - 1} is now in its final position`,
				state: {
					comparing: [],
					sorted: Array.from({ length: i + 1 }, (_, k) => n - k - 1)
				}
			});
		}

		// Mark first element as sorted
		steps.push({
			move: { type: 'STEP_COMPLETE' },
			description: 'Bubble sort completed!',
			state: {
				comparing: [],
				sorted: Array.from({ length: n }, (_, i) => i),
				completed: true
			}
		});

		return steps;
	}

	private static selectionSort(arr: number[]): AnimationStep[] {
		const steps: AnimationStep[] = [];
		const n = arr.length;
		let swapCount = 0;
		let comparisonCount = 0;

		for (let i = 0; i < n - 1; i++) {
			let minIdx = i;

			steps.push({
				move: { type: 'HIGHLIGHT', indices: [i] },
				description: `Finding minimum element from position ${i}`,
				state: { comparing: [i] }
			});

			for (let j = i + 1; j < n; j++) {
				comparisonCount++;
				steps.push({
					move: { type: 'COMPARE', indices: [minIdx, j] },
					description: `Comparing elements at positions ${minIdx} and ${j}`,
					state: {
						comparing: [minIdx, j],
						comparisons: comparisonCount
					}
				});

				if (arr[j] < arr[minIdx]) {
					minIdx = j;
				}
			}

			if (minIdx !== i) {
				[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
				swapCount++;
				steps.push({
					move: { type: 'SWAP', indices: [i, minIdx] },
					description: `Swapping elements at positions ${i} and ${minIdx}`,
					state: {
						array: [...arr],
						comparing: [],
						swaps: swapCount,
						comparisons: comparisonCount
					}
				});
			} else {
				// CRITICAL FIX: Add step for when no swap is needed
				steps.push({
					move: { type: 'HIGHLIGHT', indices: [i] },
					description: `Element at position ${i} is already in correct position`,
					state: {
						comparing: [],
						swaps: swapCount,
						comparisons: comparisonCount
					}
				});
			}

			steps.push({
				move: { type: 'HIGHLIGHT', indices: [i] },
				description: `Element at position ${i} is now in its final position`,
				state: {
					comparing: [],
					sorted: Array.from({ length: i + 1 }, (_, k) => k)
				}
			});
		}

		steps.push({
			move: { type: 'STEP_COMPLETE' },
			description: 'Selection sort completed!',
			state: {
				comparing: [],
				sorted: Array.from({ length: n }, (_, i) => i),
				completed: true
			}
		});

		return steps;
	}

	private static insertionSort(arr: number[]): AnimationStep[] {
		const steps: AnimationStep[] = [];
		const n = arr.length;

		for (let i = 1; i < n; i++) {
			const key = arr[i];
			let j = i - 1;

			steps.push({
				move: { type: 'HIGHLIGHT', indices: [i] },
				description: `Inserting element ${key} into sorted portion`,
				state: { comparing: [i] }
			});

			while (j >= 0 && arr[j] > key) {
				steps.push({
					move: { type: 'COMPARE', indices: [j, j + 1] },
					description: `Comparing elements at positions ${j} and ${j + 1}`,
					state: { comparing: [j, j + 1] }
				});

				arr[j + 1] = arr[j];
				steps.push({
					move: { type: 'SET_VALUE', index: j + 1, value: arr[j] },
					description: `Moving element ${arr[j]} to position ${j + 1}`,
					state: { array: [...arr] }
				});

				j--;
			}

			arr[j + 1] = key;
			steps.push({
				move: { type: 'SET_VALUE', index: j + 1, value: key },
				description: `Placing element ${key} at position ${j + 1}`,
				state: {
					array: [...arr],
					comparing: [],
					sorted: Array.from({ length: i + 1 }, (_, k) => k)
				}
			});
		}

		steps.push({
			move: { type: 'STEP_COMPLETE' },
			description: 'Insertion sort completed!',
			state: {
				comparing: [],
				sorted: Array.from({ length: n }, (_, i) => i),
				completed: true
			}
		});

		return steps;
	}

	private static quickSortWrapper(arr: number[]): AnimationStep[] {
		const globalState = { swapCount: 0, comparisonCount: 0 };
		const steps = this.quickSort(arr, 0, arr.length - 1, globalState);
		const n = arr.length;

		// Add final completion step to mark all elements as sorted
		steps.push({
			move: { type: 'STEP_COMPLETE' },
			description: 'Quick sort completed!',
			state: {
				comparing: [],
				sorted: Array.from({ length: n }, (_, i) => i),
				completed: true,
				swaps: globalState.swapCount,
				comparisons: globalState.comparisonCount
			}
		});

		return steps;
	}

	private static quickSort(
		arr: number[],
		low: number,
		high: number,
		globalState: { swapCount: number; comparisonCount: number }
	): AnimationStep[] {
		const steps: AnimationStep[] = [];

		if (low < high) {
			const { pivotIndex, partitionSteps } = this.partition(arr, low, high, globalState);
			steps.push(...partitionSteps);

			// Mark pivot as correctly placed
			steps.push({
				move: { type: 'HIGHLIGHT', indices: [pivotIndex] },
				description: `Pivot at position ${pivotIndex} is now in its final position`,
				state: {
					comparing: [],
					swaps: globalState.swapCount,
					comparisons: globalState.comparisonCount
				}
			});

			steps.push(...this.quickSort(arr, low, pivotIndex - 1, globalState));
			steps.push(...this.quickSort(arr, pivotIndex + 1, high, globalState));
		}

		return steps;
	}

	private static partition(
		arr: number[],
		low: number,
		high: number,
		globalState: { swapCount: number; comparisonCount: number }
	): { pivotIndex: number; partitionSteps: AnimationStep[] } {
		const steps: AnimationStep[] = [];
		const pivot = arr[high];
		let i = low - 1;

		steps.push({
			move: { type: 'HIGHLIGHT', indices: [high] },
			description: `Choosing ${pivot} as pivot`,
			state: { comparing: [high] }
		});

		for (let j = low; j < high; j++) {
			globalState.comparisonCount++;
			steps.push({
				move: { type: 'COMPARE', indices: [j, high] },
				description: `Comparing ${arr[j]} with pivot ${pivot}`,
				state: {
					comparing: [j, high],
					comparisons: globalState.comparisonCount
				}
			});

			if (arr[j] < pivot) {
				i++;
				if (i !== j) {
					[arr[i], arr[j]] = [arr[j], arr[i]];
					globalState.swapCount++;
					steps.push({
						move: { type: 'SWAP', indices: [i, j] },
						description: `Swapping elements at positions ${i} and ${j}`,
						state: {
							array: [...arr],
							swaps: globalState.swapCount,
							comparisons: globalState.comparisonCount
						}
					});
				}
			}
		}

		[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
		globalState.swapCount++;
		steps.push({
			move: { type: 'SWAP', indices: [i + 1, high] },
			description: `Placing pivot at position ${i + 1}`,
			state: {
				array: [...arr],
				comparing: [],
				swaps: globalState.swapCount,
				comparisons: globalState.comparisonCount
			}
		});

		return { pivotIndex: i + 1, partitionSteps: steps };
	}

	private static mergeSortWrapper(arr: number[]): AnimationStep[] {
		const steps = this.mergeSort(arr, 0, arr.length - 1);
		const n = arr.length;

		// Add final completion step to mark all elements as sorted
		steps.push({
			move: { type: 'STEP_COMPLETE' },
			description: 'Merge sort completed!',
			state: {
				comparing: [],
				sorted: Array.from({ length: n }, (_, i) => i),
				completed: true
			}
		});

		return steps;
	}

	private static mergeSort(arr: number[], left: number, right: number): AnimationStep[] {
		const steps: AnimationStep[] = [];

		if (left < right) {
			const mid = Math.floor((left + right) / 2);

			steps.push(...this.mergeSort(arr, left, mid));
			steps.push(...this.mergeSort(arr, mid + 1, right));
			steps.push(...this.merge(arr, left, mid, right));

			// Mark the merged section as sorted when it's complete
			if (left === 0 && right === arr.length - 1) {
				// Final merge - all elements are sorted
				steps.push({
					move: {
						type: 'HIGHLIGHT',
						indices: Array.from({ length: right - left + 1 }, (_, i) => left + i)
					},
					description: `Section from ${left} to ${right} is now sorted`,
					state: {
						comparing: [],
						sorted: Array.from({ length: right - left + 1 }, (_, i) => left + i)
					}
				});
			} else {
				// Partial merge - mark this section as sorted
				steps.push({
					move: {
						type: 'HIGHLIGHT',
						indices: Array.from({ length: right - left + 1 }, (_, i) => left + i)
					},
					description: `Section from ${left} to ${right} is now sorted`,
					state: {
						comparing: []
					}
				});
			}
		}

		return steps;
	}

	private static merge(arr: number[], left: number, mid: number, right: number): AnimationStep[] {
		const steps: AnimationStep[] = [];
		const leftArr = arr.slice(left, mid + 1);
		const rightArr = arr.slice(mid + 1, right + 1);

		let i = 0,
			j = 0,
			k = left;

		while (i < leftArr.length && j < rightArr.length) {
			steps.push({
				move: { type: 'COMPARE', indices: [left + i, mid + 1 + j] },
				description: `Comparing ${leftArr[i]} and ${rightArr[j]}`,
				state: { comparing: [left + i, mid + 1 + j] }
			});

			if (leftArr[i] <= rightArr[j]) {
				arr[k] = leftArr[i];
				i++;
			} else {
				arr[k] = rightArr[j];
				j++;
			}

			steps.push({
				move: { type: 'SET_VALUE', index: k, value: arr[k] },
				description: `Setting position ${k} to ${arr[k]}`,
				state: {
					array: [...arr],
					comparing: []
				}
			});

			k++;
		}

		while (i < leftArr.length) {
			arr[k] = leftArr[i];
			steps.push({
				move: { type: 'SET_VALUE', index: k, value: arr[k] },
				description: `Copying remaining element ${arr[k]} to position ${k}`,
				state: { array: [...arr] }
			});
			i++;
			k++;
		}

		while (j < rightArr.length) {
			arr[k] = rightArr[j];
			steps.push({
				move: { type: 'SET_VALUE', index: k, value: arr[k] },
				description: `Copying remaining element ${arr[k]} to position ${k}`,
				state: { array: [...arr] }
			});
			j++;
			k++;
		}

		return steps;
	}

	private static heapSort(arr: number[]): AnimationStep[] {
		const steps: AnimationStep[] = [];
		const n = arr.length;
		const globalState = { swapCount: 0, comparisonCount: 0 };

		// Build max heap
		for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
			steps.push(...this.heapify(arr, n, i, globalState));
		}

		// Extract elements from heap one by one
		for (let i = n - 1; i > 0; i--) {
			[arr[0], arr[i]] = [arr[i], arr[0]];
			globalState.swapCount++;
			steps.push({
				move: { type: 'SWAP', indices: [0, i] },
				description: `Moving largest element to position ${i}`,
				state: {
					array: [...arr],
					swaps: globalState.swapCount,
					comparisons: globalState.comparisonCount,
					sorted: Array.from({ length: n - i }, (_, k) => n - k - 1)
				}
			});

			steps.push(...this.heapify(arr, i, 0, globalState));
		}

		steps.push({
			move: { type: 'STEP_COMPLETE' },
			description: 'Heap sort completed!',
			state: {
				comparing: [],
				sorted: Array.from({ length: n }, (_, i) => i),
				completed: true,
				swaps: globalState.swapCount,
				comparisons: globalState.comparisonCount
			}
		});

		return steps;
	}

	private static heapify(
		arr: number[],
		n: number,
		i: number,
		globalState: { swapCount: number; comparisonCount: number }
	): AnimationStep[] {
		const steps: AnimationStep[] = [];
		let largest = i;
		const left = 2 * i + 1;
		const right = 2 * i + 2;

		if (left < n) {
			globalState.comparisonCount++;
			steps.push({
				move: { type: 'COMPARE', indices: [left, largest] },
				description: `Comparing left child ${arr[left]} with parent ${arr[largest]}`,
				state: {
					comparing: [left, largest],
					comparisons: globalState.comparisonCount
				}
			});

			if (arr[left] > arr[largest]) {
				largest = left;
			}
		}

		if (right < n) {
			globalState.comparisonCount++;
			steps.push({
				move: { type: 'COMPARE', indices: [right, largest] },
				description: `Comparing right child ${arr[right]} with largest ${arr[largest]}`,
				state: {
					comparing: [right, largest],
					comparisons: globalState.comparisonCount
				}
			});

			if (arr[right] > arr[largest]) {
				largest = right;
			}
		}

		if (largest !== i) {
			[arr[i], arr[largest]] = [arr[largest], arr[i]];
			globalState.swapCount++;
			steps.push({
				move: { type: 'SWAP', indices: [i, largest] },
				description: `Swapping parent with largest child`,
				state: {
					array: [...arr],
					comparing: [],
					swaps: globalState.swapCount,
					comparisons: globalState.comparisonCount
				}
			});

			steps.push(...this.heapify(arr, n, largest, globalState));
		}

		return steps;
	}
}
