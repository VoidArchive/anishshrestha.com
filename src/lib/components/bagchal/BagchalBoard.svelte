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
class="mx-auto block">
	<!-- Board Background -->
	<!-- <rect width="100%" height="100%" fill="var(--color-bg-primary)" /> -->
	
	<!-- Board Lines -->
	{#each lines as line}
		<line
			x1={line.x1}
			y1={line.y1}
			x2={line.x2}
			y2={line.y2}
			stroke-width="0.4%"
			class="stroke-gray-600 dark:stroke-gray-400"
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
						r="5%"
						fill="rgba(239, 68, 68, 0.3)"
						stroke="rgb(239, 68, 68)"
						stroke-width="0.4%"
					/>
				{/if}
				
				<!-- Tiger piece -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<text
					x={0}
					y={8}
					font-size="35"
					text-anchor="middle"
					class="cursor-pointer select-none {selected ? 'drop-shadow-lg' : ''}"
					tabindex="0"
					role="button"
					aria-label={`Tiger at position ${id}`}
					onclick={() => handlePointClick(id)}
				>
					🐯
				</text>
			</g>
		{:else if piece === 'GOAT'}
			<g transform={`translate(${x}, ${y})`}>
				<!-- Selection indicator for selected goat -->
				{#if selected}
					<circle
						cx={0}
						cy={0}
						r="5%"
						fill="rgba(34, 197, 94, 0.3)"
						stroke="rgb(34, 197, 94)"
						stroke-width="0.4%"
					/>
				{/if}
				
				<!-- Goat piece -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<text
					x={0}
					y={8}
					font-size="35"
					text-anchor="middle"
					class="cursor-pointer select-none {selected ? 'drop-shadow-lg' : ''}"
					tabindex="0"
					role="button"
					aria-label={`Goat at position ${id}`}
					onclick={() => handlePointClick(id)}
				>
					🐐
				</text>
			</g>
		{:else}
			<!-- Empty Point -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<circle
				cx={x}
				cy={y}
				r="2.4%"
				stroke="var(--color-border)"
				stroke-width="0.2%"
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