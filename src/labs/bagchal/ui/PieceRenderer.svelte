<script lang="ts">
	import type { Point, GameState } from '#labs/bagchal/rules/index.js';

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

	function handleKeyDown(e: KeyboardEvent, id: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handlePointClick(id);
		}
	}

	// Pointer-based drag and drop handlers
	let isDragging = $state(false);
	// let pointerStartId: number | null = $state(null); // Removed unused variable
	let pointerStartPosition = $state({ x: 0, y: 0 });
	let hasMoved = $state(false);

	function handlePointerDown(e: PointerEvent, id: number) {
		if (!gameState.board[id]) return;

		// Set capture to track pointer even when it leaves the element
		(e.target as Element).setPointerCapture(e.pointerId);

		isDragging = false; // Don't set to true immediately
		draggedPieceId = id;
		// pointerStartId = id; // Unused assignment removed
		previewPosition = null;
		hasMoved = false;
		pointerStartPosition = { x: e.clientX, y: e.clientY };

		// Add global pointer event listeners
		document.addEventListener('pointermove', handlePointerMove);
		document.addEventListener('pointerup', handlePointerUp);

		// Don't prevent default immediately - let click events work
	}

	function handlePointerMove(e: PointerEvent) {
		if (draggedPieceId === null) return;

		// Check if we've moved enough to start dragging (5px threshold)
		const deltaX = e.clientX - pointerStartPosition.x;
		const deltaY = e.clientY - pointerStartPosition.y;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		if (!isDragging && distance > 5) {
			// Start dragging after movement threshold
			isDragging = true;
			hasMoved = true;
			onDragStart?.(draggedPieceId);
		}

		if (!isDragging) return;

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
		const wasActuallyDragging = isDragging && hasMoved;

		if (wasActuallyDragging) {
			// Handle drag drop
			const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
			const validMoveElement = elementUnder?.closest('[data-valid-move-id]');

			if (validMoveElement && draggedPieceId !== null) {
				const moveId = parseInt(validMoveElement.getAttribute('data-valid-move-id') || '');
				if (!isNaN(moveId) && validMoves.includes(moveId)) {
					onDrop?.(moveId);
					handlePointClick(moveId);
				}
			}
		}
		// If not dragging (just a click), let the click event handle it naturally

		// Clean up
		isDragging = false;
		draggedPieceId = null;
		previewPosition = null;
		// pointerStartId = null; // Unused assignment removed
		hasMoved = false;

		if (wasActuallyDragging) {
			onDragEnd?.();
		}

		// Remove global listeners
		document.removeEventListener('pointermove', handlePointerMove);
		document.removeEventListener('pointerup', handlePointerUp);
	}

	$effect(() => () => {
		document.removeEventListener('pointermove', handlePointerMove);
		document.removeEventListener('pointerup', handlePointerUp);
	});
</script>

<!-- Pieces are the tiger and goat marks from static/icons; the hit circle underneath takes the pointer. -->
{#each points as { x, y, id } (id)}
	{@const piece = gameState.board[id]}
	{@const selected = gameState.selectedPieceId === id}
	{@const valid = validMoves.includes(id)}

	{#if piece === 'TIGER' || piece === 'GOAT'}
		<g transform={`translate(${x}, ${y})`}>
			<circle
				cx="0"
				cy="0"
				r="24"
				class="hit cursor-move"
				onpointerdown={(e) => handlePointerDown(e, id)}
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
				tabindex="0"
				role="button"
				aria-label={`${piece === 'TIGER' ? 'Tiger' : 'Goat'} at position ${id}`}
			/>
			{#if selected}
				<circle cx="0" cy="0" r="22" class="ring" opacity={draggedPieceId === id ? 0.5 : 1} />
			{/if}
			<image
				href={piece === 'TIGER' ? '/icons/tiger.svg' : '/icons/goat.svg'}
				x="-20"
				y="-20"
				width="40"
				height="40"
				class="piece"
				opacity={draggedPieceId === id ? 0.3 : 1}
			/>
		</g>
	{:else if valid}
		<g transform={`translate(${x}, ${y})`} data-valid-move-id={id}>
			<circle
				cx="0"
				cy="0"
				r="24"
				class="hit cursor-pointer"
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
				tabindex="0"
				role="button"
				aria-label={`Valid move to position ${id}`}
			/>
			{#if previewPosition === id && draggedPieceId !== null}
				<image
					href={gameState.board[draggedPieceId] === 'TIGER'
						? '/icons/tiger.svg'
						: '/icons/goat.svg'}
					x="-20"
					y="-20"
					width="40"
					height="40"
					class="piece"
					opacity="0.5"
				/>
			{:else}
				<circle cx="0" cy="0" r="6" class="valid" />
			{/if}
		</g>
	{:else}
		<g transform={`translate(${x}, ${y})`} class="empty">
			<circle
				cx="0"
				cy="0"
				r="24"
				class="hit cursor-pointer"
				onclick={() => handlePointClick(id)}
				onkeydown={(e) => handleKeyDown(e, id)}
				tabindex="0"
				role="button"
				aria-label={`Empty position ${id}`}
			/>
			<circle cx="0" cy="0" r="4" class="point" />
		</g>
	{/if}
{/each}

<style>
	.piece {
		pointer-events: none;
	}
	.hit {
		fill: transparent;
		touch-action: manipulation;
	}
	.hit:focus-visible {
		outline: 2px solid var(--color-spot);
		outline-offset: 2px;
	}
	.ring,
	.valid,
	.point {
		pointer-events: none;
	}
	.ring {
		fill: none;
		stroke: var(--color-spot);
		stroke-width: 2;
	}
	.valid {
		fill: var(--color-spot);
	}
	.point {
		fill: var(--color-ink);
	}
	.empty:hover .point {
		fill: var(--color-spot);
	}
</style>
