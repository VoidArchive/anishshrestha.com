<script lang="ts">
	import { onMount } from 'svelte';
	import { BagchalEngine } from '#labs/bagchal/engine/index.js';
	import { generatePoints, generateLines } from '#labs/bagchal/rules/index.js';

	const STEP_MS = 650;
	// The plate is 700 x 520 like its neighbours, so the 5 x 5 board is drawn slightly wide
	const X = (n: number) => 70 + n * 140;
	const Y = (n: number) => 50 + n * 105;
	const lines = generateLines(generatePoints(5, 1, 0));

	let { autoplay = true }: { autoplay?: boolean } = $props();

	let game = $state.raw(BagchalEngine.initialState());
	let running = $state(false);
	let over = $state('');
	let timer: ReturnType<typeof setInterval> | null = null;
	let goats = $derived(game.board.filter((p) => p === 'GOAT').length);

	// shortcut: both sides play random legal moves (tigers take a capture when one exists), not the lab's minimax; swap in ComputerPlayer if the game should look skilled
	function step() {
		if (over) return restart();
		const moves = BagchalEngine.validMoves(game);
		const captures = moves.filter((m) => m.moveType === 'CAPTURE');
		const pool = captures.length > 0 ? captures : moves;
		if (pool.length === 0) {
			over = game.turn === 'TIGER' ? 'Goats win' : 'Tigers win';
			return;
		}
		game = BagchalEngine.applyMove(game, pool[Math.floor(Math.random() * pool.length)]);
		if (game.winner)
			over = game.winner === 'DRAW' ? 'Draw' : game.winner === 'GOAT' ? 'Goats win' : 'Tigers win';
	}

	function restart() {
		game = BagchalEngine.initialState();
		over = '';
	}

	function play() {
		if (timer) return;
		running = true;
		timer = setInterval(step, STEP_MS);
	}

	function pause() {
		if (timer) clearInterval(timer);
		timer = null;
		running = false;
	}

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (autoplay && !reduce) play();
		return pause;
	});
</script>

<div class="figure" class:paused={!running}>
	<svg
		viewBox="0 0 700 520"
		role="img"
		aria-label="A Bagchal board playing itself: four tigers against up to twenty goats."
	>
		{#each lines as l (`${l.x1}-${l.y1}-${l.x2}-${l.y2}`)}
			<line x1={X(l.x1)} y1={Y(l.y1)} x2={X(l.x2)} y2={Y(l.y2)} />
		{/each}
		{#each game.board as piece, id (id)}
			{#if piece}
				{@const size = piece === 'TIGER' ? 76 : 60}
				<image
					href={piece === 'TIGER' ? '/icons/tiger.svg' : '/icons/goat.svg'}
					x={X(id % 5) - size / 2}
					y={Y(Math.floor(id / 5)) - size / 2}
					width={size}
					height={size}
				/>
			{/if}
		{/each}
	</svg>
	<div class="reading">
		<span class="state">{over || (running ? 'Running' : 'Paused')}</span>
		<span>Goats {goats}</span>
		<span>Captured {game.goatsCaptured}</span>
		<span class="controls">
			<button type="button" onclick={running ? pause : play}>{running ? 'Pause' : 'Play'}</button>
			<button type="button" onclick={restart}>Restart</button>
		</span>
	</div>
</div>

<style>
	.figure {
		display: contents;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 700 / 520;
		border: 1.5px solid var(--spread-ink);
		background: var(--spread-paper);
	}
	.paused svg {
		border-style: dashed;
	}
	line {
		stroke: var(--spread-ink);
		stroke-width: 1.5;
	}
</style>
