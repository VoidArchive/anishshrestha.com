<script lang="ts">
	import type { Point, GameState } from '$labs/bagchal/rules';

	interface Props {
		points: Point[];
		gameState: GameState;
		validMoves: number[];
		handlePointClick: (id: number) => void;
		onDragStart?: (id: number) => void;
		onDragEnd?: () => void;
		onDrop?: (id: number) => void;
	}

	let { points, gameState, validMoves, handlePointClick, onDragStart, onDragEnd, onDrop }: Props =
		$props();

	let draggedPieceId: number | null = $state(null);
	let previewPosition: number | null = $state(null);

	let focusedPieceId: number | null = $state(null);

	function handleKeyDown(e: KeyboardEvent, id: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handlePointClick(id);
		}
	}

	function handleFocus(id: number) {
		focusedPieceId = id;
	}

	function handleBlur() {
		focusedPieceId = null;
	}

	// Pointer-based drag and drop handlers
	let isDragging = $state(false);
	let pointerStartId: number | null = $state(null);

	function handlePointerDown(e: PointerEvent, id: number) {
		if (!gameState.board[id]) return;

		// Set capture to track pointer even when it leaves the element
		(e.target as Element).setPointerCapture(e.pointerId);

		isDragging = true;
		draggedPieceId = id;
		pointerStartId = id;
		previewPosition = null;

		onDragStart?.(id);

		// Add global pointer event listeners
		document.addEventListener('pointermove', handlePointerMove);
		document.addEventListener('pointerup', handlePointerUp);

		e.preventDefault();
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging || draggedPieceId === null) return;

		// Find the element under the pointer
		const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
		const validMoveElement = elementUnder?.closest('[data-valid-move-id]');

		if (validMoveElement) {
			const moveId = parseInt(validMoveElement.getAttribute('data-valid-move-id') || '');
			if (!isNaN(moveId) && validMoves.includes(moveId)) {
				previewPosition = moveId;
			} else {
				previewPosition = null;
			}
		} else {
			previewPosition = null;
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;

		// Find the element under the pointer
		const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
		const validMoveElement = elementUnder?.closest('[data-valid-move-id]');

		if (validMoveElement && draggedPieceId !== null) {
			const moveId = parseInt(validMoveElement.getAttribute('data-valid-move-id') || '');
			if (!isNaN(moveId) && validMoves.includes(moveId)) {
				onDrop?.(moveId);
				handlePointClick(moveId);
			}
		}

		// Clean up
		isDragging = false;
		draggedPieceId = null;
		previewPosition = null;
		pointerStartId = null;

		onDragEnd?.();

		// Remove global listeners
		document.removeEventListener('pointermove', handlePointerMove);
		document.removeEventListener('pointerup', handlePointerUp);
	}
</script>

<!-- Render all pieces with Angular Design -->
{#each points as { x, y, id }}
	{@const piece = gameState.board[id]}
	{@const selected = gameState.selectedPieceId === id}
	{@const valid = validMoves.includes(id)}

	{#if piece === 'TIGER'}
		<!-- Tiger Piece - Enhanced UX Design -->
		<g transform={`translate(${x}, ${y})`} class="piece-group">
			<!-- Expanded hit area -->
			<circle
				cx="0"
				cy="0"
				r="24"
				fill="transparent"
				class="cursor-move"
				onpointerdown={(e) => handlePointerDown(e, id)}
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
				onfocus={() => handleFocus(id)}
				onblur={handleBlur}
				tabindex="0"
				role="button"
				aria-label={`Tiger at position ${id}`}
			/>

			<!-- Uniform circular focus/selection ring -->
			{#if selected || focusedPieceId === id}
				<circle
					cx="0"
					cy="0"
					r="22"
					fill="none"
					stroke="var(--color-primary)"
					stroke-width="2"
					class="pointer-events-none"
					opacity={draggedPieceId === id ? 0.5 : 1}
				/>
			{/if}

			<!-- Tiger icon -->
			<image
				href="/icons/tiger.svg"
				width="35"
				height="35"
				x="-17.5"
				y="-17.5"
				class="piece-icon pointer-events-none transition-opacity duration-200"
				style="filter: url(#pieceShadow);"
				opacity={draggedPieceId === id ? 0.3 : 1}
			/>
		</g>
	{:else if piece === 'GOAT'}
		<!-- Goat Piece - Enhanced UX Design -->
		<g transform={`translate(${x}, ${y})`} class="piece-group">
			<!-- Expanded hit area -->
			<circle
				cx="0"
				cy="0"
				r="24"
				fill="transparent"
				class="cursor-move"
				onpointerdown={(e) => handlePointerDown(e, id)}
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
				onfocus={() => handleFocus(id)}
				onblur={handleBlur}
				tabindex="0"
				role="button"
				aria-label={`Goat at position ${id}`}
			/>

			<!-- Uniform circular focus/selection ring -->
			{#if selected || focusedPieceId === id}
				<circle
					cx="0"
					cy="0"
					r="22"
					fill="none"
					stroke="var(--color-primary)"
					stroke-width="2"
					class="pointer-events-none"
					opacity={draggedPieceId === id ? 0.5 : 1}
				/>
			{/if}

			<!-- Goat icon -->
			<image
				href="/icons/goat.svg"
				width="35"
				height="35"
				x="-17.5"
				y="-17.5"
				class="piece-icon pointer-events-none transition-opacity duration-200"
				style="filter: url(#pieceShadow);"
				opacity={draggedPieceId === id ? 0.3 : 1}
			/>
		</g>
	{:else if valid}
		<!-- Enhanced Valid Move Indicators -->
		<g transform={`translate(${x}, ${y})`} data-valid-move-id={id}>
			<!-- Expanded hit area -->
			<circle
				cx="0"
				cy="0"
				r="24"
				fill="transparent"
				class="cursor-pointer"
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
				tabindex="0"
				role="button"
				aria-label={`Valid move to position ${id}`}
			/>

			<!-- Move preview ghost piece -->
			{#if previewPosition === id && draggedPieceId !== null}
				{@const draggedPiece = gameState.board[draggedPieceId]}
				<image
					href={draggedPiece === 'TIGER' ? '/icons/tiger.svg' : '/icons/goat.svg'}
					width="35"
					height="35"
					x="-17.5"
					y="-17.5"
					class="pointer-events-none"
					opacity="0.5"
					style="filter: url(#pieceShadow);"
				/>
			{/if}

			<!-- Larger, clearer diamond indicator -->
			<polygon
				points="-8,-8 8,-8 8,8 -8,8"
				fill="var(--color-primary)"
				opacity={previewPosition === id ? 0.3 : 0.6}
				class="pointer-events-none transition-opacity duration-150"
				transform="rotate(45)"
			/>
		</g>
	{:else}
		<!-- Enhanced Empty Points -->
		<g transform={`translate(${x}, ${y})`} class="empty-point-group">
			<!-- Expanded hit area (larger for mobile) -->
			<circle
				cx="0"
				cy="0"
				r="24"
				fill="transparent"
				class="touch-area cursor-pointer"
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
				tabindex="0"
				role="button"
				aria-label={`Empty position ${id}`}
			/>

			<!-- Visual empty point -->
			<circle
				cx="0"
				cy="0"
				r="8"
				fill="var(--color-bg-secondary)"
				stroke="var(--color-border)"
				stroke-width="1"
				class="empty-point-visual pointer-events-none transition-all duration-200"
			/>

			<!-- Hover indicator -->
			<circle
				cx="0"
				cy="0"
				r="12"
				fill="none"
				stroke="var(--color-text-muted)"
				stroke-width="1"
				class="hover-indicator pointer-events-none opacity-0 transition-opacity duration-200"
			/>
		</g>
	{/if}
{/each}

<style>
	/* Enhanced touch interactions */
	.touch-area {
		touch-action: manipulation;
	}

	/* Hover effects for empty points */
	.empty-point-group:hover .hover-indicator {
		opacity: 0.4;
	}

	.empty-point-group:hover .empty-point-visual {
		fill: var(--color-bg-primary);
		stroke: var(--color-text-muted);
	}

	/* Touch feedback for mobile */
	@media (hover: none) and (pointer: coarse) {
		.touch-area {
			r: 28; /* Larger touch targets on mobile */
		}

		/* Remove hover effects on touch devices */
		.empty-point-group:hover .hover-indicator,
		.empty-point-group:hover .empty-point-visual {
			opacity: inherit;
			fill: inherit;
			stroke: inherit;
		}
	}

	/* Focus styles for accessibility - use circular selection ring instead of square outline */
	.touch-area:focus {
		outline: none; /* Remove square outline, rely on circular selection ring */
	}
</style>
