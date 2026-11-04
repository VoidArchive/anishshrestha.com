<script lang="ts">
	import { onMount } from 'svelte';
	import { SortingAlgorithms } from '#labs/dsa-visualizer/engine/algorithms/sorting.js';
	import type { AnimationStep } from '#labs/dsa-visualizer/types.js';

	const N = 24;
	const STEP_MS = 90;

	let { autoplay = true }: { autoplay?: boolean } = $props();

	function fresh() {
		return Array.from({ length: N }, () => 8 + Math.floor(Math.random() * 92));
	}

	const initial = fresh();
	let values = $state(initial);
	let steps: AnimationStep[] = SortingAlgorithms.generateSteps(initial, 'QUICK_SORT');
	let cursor = $state(0);
	let comparisons = $state(0);
	let swaps = $state(0);
	let active: number[] = $state([]);
	let running = $state(false);
	let timer: ReturnType<typeof setInterval> | null = null;
	let restart: ReturnType<typeof setTimeout> | null = null;

	function apply(step: AnimationStep) {
		const m = step.move;
		if (m.type === 'COMPARE') {
			comparisons += 1;
			active = m.indices;
		} else if (m.type === 'SWAP') {
			swaps += 1;
			const [a, b] = m.indices;
			[values[a], values[b]] = [values[b], values[a]];
			active = m.indices;
		} else if (m.type === 'SET_VALUE') {
			values[m.index] = m.value;
			active = [m.index];
		} else if (m.type === 'HIGHLIGHT') {
			active = m.indices;
		}
	}

	function tick() {
		if (cursor >= steps.length) {
			// shortcut: sorted runs restart from a new shuffle after a beat, no end state UI
			restart = setTimeout(reshuffle, 1200);
			pause();
			return;
		}
		apply(steps[cursor]);
		cursor += 1;
	}

	function play() {
		if (timer) return;
		running = true;
		timer = setInterval(tick, STEP_MS);
	}

	function pause() {
		if (timer) clearInterval(timer);
		timer = null;
		running = false;
	}

	function reshuffle() {
		values = fresh();
		steps = SortingAlgorithms.generateSteps(values, 'QUICK_SORT');
		cursor = 0;
		comparisons = 0;
		swaps = 0;
		active = [];
		play();
	}

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (autoplay && !reduce) play();
		return () => {
			if (restart) clearTimeout(restart);
			pause();
		};
	});
</script>

<div
	class="bars"
	class:paused={!running}
	role="img"
	aria-label="Quick sort on {N} values, animated"
>
	{#each values as v, i (i)}
		<i style:height="{v * 0.7}%" class:active={active.includes(i)}></i>
	{/each}
</div>
<div class="reading">
	<span class="state">{running ? 'Running' : 'Paused'}</span>
	<span>Quick sort · {N} values</span>
	<span>{comparisons} comparisons · {swaps} swaps</span>
	<span class="controls">
		<button type="button" onclick={running ? pause : play}>{running ? 'Pause' : 'Play'}</button>
		<button type="button" onclick={reshuffle}>Shuffle</button>
	</span>
</div>

<style>
	.bars {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		aspect-ratio: 3 / 2;
		padding: 0 12px;
		border: 1.5px solid var(--spread-ink);
		background: var(--spread-paper);
	}
	.bars.paused {
		border-style: dashed;
	}
	.bars i {
		flex: 1;
		background: var(--spread-ink);
	}
	.bars:not(.paused) i {
		background: var(--spread-spot);
	}
	.bars i.active {
		background: var(--spread-ink);
	}
	.bars.paused i.active {
		background: var(--spread-spot);
	}
</style>
