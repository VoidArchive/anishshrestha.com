<script lang="ts">
	import type { Point } from '$games/bagchal/rules';
	import type { Move } from '$games/bagchal/ai/types';

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

	// Compute animation values directly in template
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

<!-- Unified Animation: Angular and minimal design with consistent theming -->
{#if showAnimation && currentMove}
	<defs>
		<!-- Angular glow effect - using primary color -->
		<filter id="aiGlow" x="-50%" y="-50%" width="200%" height="200%">
			<feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#c92a2a" flood-opacity="0.7"/>
		</filter>
		
		<!-- Capture effect glow -->
		<filter id="captureGlow" x="-50%" y="-50%" width="200%" height="200%">
			<feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#c92a2a" flood-opacity="0.9"/>
		</filter>
		
		<!-- Animated gradient for movement trail -->
		<linearGradient id="moveTrail" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" style="stop-color:#c92a2a;stop-opacity:0"/>
			<stop offset={`${animationProgress * 100}%`} style="stop-color:#c92a2a;stop-opacity:0.9"/>
			<stop offset={`${Math.min(animationProgress * 100 + 20, 100)}%`} style="stop-color:#c92a2a;stop-opacity:0"/>
		</linearGradient>
		
		<!-- Pulsing capture gradient -->
		<radialGradient id="captureEffect" cx="50%" cy="50%" r="50%">
			<stop offset="0%" style="stop-color:#c92a2a;stop-opacity:0.6"/>
			<stop offset="70%" style="stop-color:#c92a2a;stop-opacity:0.3"/>
			<stop offset="100%" style="stop-color:#c92a2a;stop-opacity:0"/>
		</radialGradient>
	</defs>

	{#if isPlacementMove()}
		{@const toPoint = getToPoint()}
		{#if toPoint}
			<!-- Placement Animation: Expanding angular ring -->
			<g transform={`translate(${toPoint.x}, ${toPoint.y})`}>
				<!-- Outer angular ring -->
				<polygon
					points="-20,-20 20,-20 20,20 -20,20"
					fill="none"
					stroke="#c92a2a"
					stroke-width="2"
					transform={`scale(${0.5 + animationProgress * 0.8}) rotate(${animationProgress * 45})`}
					opacity={1 - animationProgress * 0.3}
					filter="url(#aiGlow)"
				/>
				
				<!-- Inner diamond indicator -->
				<polygon
					points="0,-12 12,0 0,12 -12,0"
					fill="rgba(201, 42, 42, 0.3)"
					stroke="#c92a2a"
					stroke-width="1.5"
					transform={`scale(${animationProgress}) rotate(${-animationProgress * 30})`}
					opacity={animationProgress}
				/>
				
				<!-- Center dot -->
				<circle
					cx="0"
					cy="0"
					r="3"
					fill="#c92a2a"
					opacity={animationProgress}
				/>
			</g>
		{/if}
		
	{:else if isMovementMove() || currentMove?.moveType === 'CAPTURE'}
		{@const fromPoint = getFromPoint()}
		{@const toPoint = getToPoint()}
		{@const capturedGoat = getCapturedGoatPoint()}
		{#if fromPoint && toPoint}
			<!-- Movement Animation: Angular path with geometric elements -->
			
			<!-- Source position marker -->
			<g transform={`translate(${fromPoint.x}, ${fromPoint.y})`}>
				<polygon
					points="-8,-8 8,-8 8,8 -8,8"
					fill="none"
					stroke="#c92a2a"
					stroke-width="2"
					opacity={Math.max(0, 1 - animationProgress * 2)}
					transform={`rotate(${animationProgress * 90})`}
				/>
			</g>

			<!-- Capture Animation: Show captured goat with destruction effect -->
			{#if isCaptureMove() && capturedGoat}
				<g transform={`translate(${capturedGoat.x}, ${capturedGoat.y})`}>
					<!-- Expanding destruction ring -->
					<circle
						cx="0"
						cy="0"
						r={15 + animationProgress * 20}
						fill="url(#captureEffect)"
						opacity={1 - animationProgress}
					/>
					
					<!-- Angular destruction indicators -->
					<polygon
						points="-12,-12 12,-12 12,12 -12,12"
						fill="none"
						stroke="#c92a2a"
						stroke-width="2"
						transform={`scale(${1 + animationProgress * 0.5}) rotate(${animationProgress * 180})`}
						opacity={Math.max(0, 1 - animationProgress * 1.5)}
						filter="url(#captureGlow)"
					/>
					
					<!-- Inner cross pattern -->
					<g opacity={Math.max(0, 1 - animationProgress * 2)}>
						<line x1="-8" y1="0" x2="8" y2="0" stroke="#c92a2a" stroke-width="2"/>
						<line x1="0" y1="-8" x2="0" y2="8" stroke="#c92a2a" stroke-width="2"/>
					</g>
				</g>
			{/if}

			<!-- Movement trail line -->
			<line
				x1={fromPoint.x}
				y1={fromPoint.y}
				x2={toPoint.x}
				y2={toPoint.y}
				stroke="url(#moveTrail)"
				stroke-width="3"
				opacity="0.8"
			/>

			<!-- Animated moving indicator -->
			{@const currentX = fromPoint.x + (toPoint.x - fromPoint.x) * animationProgress}
			{@const currentY = fromPoint.y + (toPoint.y - fromPoint.y) * animationProgress}
			
			<g transform={`translate(${currentX}, ${currentY})`}>
				<!-- Leading diamond -->
				<polygon
					points="0,-6 6,0 0,6 -6,0"
					fill="#c92a2a"
					opacity={animationProgress < 0.9 ? 1 : (1 - animationProgress) * 10}
					transform={`rotate(${animationProgress * 180})`}
					filter="url(#aiGlow)"
				/>
			</g>

			<!-- Destination marker -->
			<g transform={`translate(${toPoint.x}, ${toPoint.y})`}>
				<!-- Angular target indicator -->
				<polygon
					points="-10,-10 10,-10 10,10 -10,10"
					fill="none"
					stroke="#c92a2a"
					stroke-width="2"
					opacity={animationProgress * 0.8}
					transform={`scale(${1 + animationProgress * 0.2}) rotate(${animationProgress * -45})`}
				/>
				
				<!-- Inner target -->
				<polygon
					points="0,-8 8,0 0,8 -8,0"
					fill="rgba(201, 42, 42, 0.3)"
					stroke="#c92a2a"
					stroke-width="1"
					opacity={animationProgress}
					transform={`rotate(${animationProgress * 60})`}
				/>
			</g>
		{/if}
	{/if}
{/if} 