<script lang="ts">
	import type { GameState, Line, Point } from '$lib/bagchal';

	interface Props {
		points: Point[];
		lines: Line[];
		gameState: GameState;
		validMoves: number[];
		handlePointClick: (id: number) => void;
	}

	let { lines, points, gameState, validMoves, handlePointClick }: Props = $props();
</script>

<svg
	width="100%"
	viewBox="0 0 500 500"
	class="mx-auto block border border-gray-300 bg-white shadow-lg dark:bg-gray-800 dark:border-gray-600"
>
	<!-- Board Background -->
	<rect width="100%" height="100%" fill="var(--color-bg-primary)" />
	
	<!-- Board Lines -->
	{#each lines as line}
		<line
			x1={line.x1}
			y1={line.y1}
			x2={line.x2}
			y2={line.y2}
			class="stroke-2 stroke-gray-600 dark:stroke-gray-400"
		/>
	{/each}
	
	<!-- Points and Pieces -->
	{#each points as { id, x, y }}
		{@const piece = gameState.board[id]}
		{@const selected = gameState.selectedPieceId === id}
		{@const valid = validMoves.includes(id)}

		{#if piece === 'TIGER'}
			<g transform={`translate(${x}, ${y})`}>
				<!-- Selection indicator for selected tiger -->
				{#if selected}
					<circle
						cx={0}
						cy={0}
						r="25"
						fill="rgba(239, 68, 68, 0.3)"
						stroke="rgb(239, 68, 68)"
						stroke-width="2"
					/>
				{/if}
				
				<!-- Tiger piece -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<image
					x={-20}
					y={-20}
					width={40}
					height={40}
					href="/icons/tiger.svg"
					class="cursor-pointer select-none {selected ? 'drop-shadow-lg' : ''}"
					tabindex="0"
					role="button"
					aria-label={`Tiger at position ${id}`}
					onclick={() => handlePointClick(id)}
				/>
			</g>
		{:else if piece === 'GOAT'}
			<g transform={`translate(${x}, ${y})`}>
				<!-- Selection indicator for selected goat -->
				{#if selected}
					<circle
						cx={0}
						cy={0}
						r="25"
						fill="rgba(34, 197, 94, 0.3)"
						stroke="rgb(34, 197, 94)"
						stroke-width="2"
					/>
				{/if}
				
				<!-- Goat piece -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<image
					x={-20}
					y={-20}
					width={40}
					height={40}
					href="/icons/goat.svg"
					class="cursor-pointer select-none {selected ? 'drop-shadow-lg' : ''}"
					tabindex="0"
					role="button"
					aria-label={`Goat at position ${id}`}
					onclick={() => handlePointClick(id)}
				/>
			</g>
		{:else}
			<!-- Empty Point -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<circle
				cx={x}
				cy={y}
				r="12"
				stroke="var(--color-border)"
				stroke-width="1"
				class={valid 
					? 'cursor-pointer fill-red-200 stroke-red-400 animate-pulse' 
					: 'fill-white dark:fill-gray-700 hover:fill-gray-100 dark:hover:fill-gray-600 cursor-pointer'
				}
				aria-label={`Empty position ${id}`}
				role="button"
				tabindex="0"
				onclick={() => handlePointClick(id)}
			/>
		{/if}
	{/each}
</svg> 