<script lang="ts">
	import type { Point, GameState } from '$games/bagchal/rules';

	interface Props {
		points: Point[];
		gameState: GameState;
		validMoves: number[];
		handlePointClick: (id: number) => void;
	}

	let { points, gameState, validMoves, handlePointClick }: Props = $props();

	function handleKeyDown(e: KeyboardEvent, id: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handlePointClick(id);
		}
	}
</script>

<!-- Render all pieces with Angular Design -->
{#each points as { x, y, id }}
	{@const piece = gameState.board[id]}
	{@const selected = gameState.selectedPieceId === id}
	{@const valid = validMoves.includes(id)}

	{#if piece === 'TIGER'}
		<!-- Tiger Piece - Clean Design -->
		<g transform={`translate(${x}, ${y})`} class="piece-group">
			<!-- Tiger icon -->
			<image
				href="/icons/tiger.svg"
				width="35"
				height="35"
				x="-17.5"
				y="-17.5"
				class="piece-text cursor-pointer select-none transition-all duration-200 transform-gpu
					{selected ? 'brightness-120 scale-105' : 'hover:brightness-110 hover:scale-105'}
					focus:outline-none"
				style="filter: url(#pieceShadow);"
				tabindex="0"
				role="button"
				aria-label={`Tiger at position ${id}`}
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
			/>
		</g>
	
	{:else if piece === 'GOAT'}
		<!-- Goat Piece - Clean Design -->
		<g transform={`translate(${x}, ${y})`} class="piece-group">
			<!-- Goat icon -->
			<image
				href="/icons/goat.svg"
				width="35"
				height="35"
				x="-17.5"
				y="-17.5"
				class="piece-text cursor-pointer select-none transition-all duration-200 transform-gpu
					{selected ? 'brightness-120 scale-105' : 'hover:brightness-110 hover:scale-105'}
					focus:outline-none"
				style="filter: url(#pieceShadow);"
				tabindex="0"
				role="button"
				aria-label={`Goat at position ${id}`}
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
			/>
		</g>
	
	{:else if valid}
		<!-- Empty Valid Move Spots - Subtle Red Diamonds -->
		<g transform={`translate(${x}, ${y})`}>
			<!-- Larger clickable area for better UX -->
			<circle
				cx="0"
				cy="0"
				r="15"
				fill="transparent"
				class="cursor-pointer"
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
				tabindex="0"
				role="button"
				aria-label={`Valid move to position ${id}`}
			/>
			
			<!-- Subtle red diamond indicator -->
			<polygon
				points="-3,-3 3,-3 3,3 -3,3"
				fill="#c92a2a"
				opacity="0.8"
				class="pointer-events-none"
				transform="rotate(45)"
			/>
		</g>
	
	{:else}
		<!-- Empty Points that are clickable -->
		<g transform={`translate(${x}, ${y})`}>
			<!-- Regular empty point -->
			<circle
				cx={0}
				cy={0}
				r="12"
				fill="var(--color-bg-secondary)"
				stroke="var(--color-border)"
				stroke-width="0.5"
				class="cursor-pointer transition-all duration-200 transform-gpu 
					hover:fill-[var(--color-bg-primary)] hover:stroke-[var(--color-text-muted)] hover:scale-110
					focus:outline-none"
				aria-label={`Empty position ${id}`}
				role="button"
				tabindex="0"
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
			/>
		</g>
	{/if}
{/each} 