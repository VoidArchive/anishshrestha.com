<script lang="ts">
	import type { Point } from '#labs/bagchal/rules/index.js';
	import type { Move } from '#labs/bagchal/ai/types.js';

	interface Props {
		showAnimation?: boolean;
		animationProgress?: number;
		currentMove?: Move | null;
		points: Point[];
	}

	let {
		showAnimation = false,
		animationProgress = 0,
		currentMove = null,
		points
	}: Props = $props();

	function getFromPoint(): Point | null {
		if (!currentMove || currentMove.from === null) return null;
		return points[currentMove.from] || null;
	}

	function getToPoint(): Point | null {
		if (!currentMove) return null;
		return points[currentMove.to] || null;
	}

	function getCapturedGoatPoint(): Point | null {
		if (!currentMove || !currentMove.jumpedGoatId) return null;
		return points[currentMove.jumpedGoatId] || null;
	}

	function isPlacementMove(): boolean {
		return currentMove?.moveType === 'PLACEMENT';
	}

	function isMovementMove(): boolean {
		return currentMove?.moveType === 'MOVEMENT';
	}

	function isCaptureMove(): boolean {
		return currentMove?.jumpedGoatId !== undefined && currentMove?.jumpedGoatId !== null;
	}
</script>

<!-- Two inks only: the move travels in spot colour, a capture is struck out in ink. -->
{#if showAnimation && currentMove}
	<g class="anim" aria-hidden="true">
		{#if isPlacementMove()}
			{@const toPoint = getToPoint()}
			{#if toPoint}
				<circle
					class="spot-ring"
					cx={toPoint.x}
					cy={toPoint.y}
					r={16 + (1 - animationProgress) * 14}
					opacity={1 - animationProgress}
				/>
			{/if}
		{:else if isMovementMove() || currentMove?.moveType === 'CAPTURE'}
			{@const fromPoint = getFromPoint()}
			{@const toPoint = getToPoint()}
			{@const capturedGoat = getCapturedGoatPoint()}
			{#if fromPoint && toPoint}
				{@const currentX = fromPoint.x + (toPoint.x - fromPoint.x) * animationProgress}
				{@const currentY = fromPoint.y + (toPoint.y - fromPoint.y) * animationProgress}
				<circle
					class="spot-ring"
					cx={fromPoint.x}
					cy={fromPoint.y}
					r="16"
					opacity={Math.max(0, 1 - animationProgress * 2)}
				/>
				<line
					class="trail"
					x1={fromPoint.x}
					y1={fromPoint.y}
					x2={currentX}
					y2={currentY}
					opacity={1 - animationProgress}
				/>
				<circle class="spot-dot" cx={currentX} cy={currentY} r="6" />
				{#if isCaptureMove() && capturedGoat}
					<circle
						class="ink-ring"
						cx={capturedGoat.x}
						cy={capturedGoat.y}
						r={16 + animationProgress * 10}
						opacity={1 - animationProgress}
					/>
				{/if}
			{/if}
		{/if}
	</g>
{/if}

<style>
	.spot-ring {
		fill: none;
		stroke: var(--color-spot);
		stroke-width: 2;
	}
	.spot-dot {
		fill: var(--color-spot);
	}
	.trail {
		stroke: var(--color-spot);
		stroke-width: 2;
	}
	.ink-ring {
		fill: none;
		stroke: var(--color-ink);
		stroke-width: 2;
	}
	/* The move appears in place; the board already shows the result. */
	@media (prefers-reduced-motion: reduce) {
		.anim {
			display: none;
		}
	}
</style>
