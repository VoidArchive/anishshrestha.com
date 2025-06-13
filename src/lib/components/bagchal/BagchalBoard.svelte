<script lang="ts">
	import type { GameState, Line, Point } from '$lib/bagchal';

	interface Props {
		points: Point[];
		lines: Line[];
		gameState: GameState;
		validMoves: number[];
		handlePointClick: (id: number) => void;
		aiCalculatedMove?: any;
		showAiAnimation?: boolean;
		animationProgress?: number;
	}

	let { lines, points, gameState, validMoves, handlePointClick, aiCalculatedMove = null, showAiAnimation = false, animationProgress = 0 }: Props = $props();
	
	// Function to get valid lines that connect from selected piece to valid moves
	function getValidLines(): Line[] {
		if (!gameState.selectedPieceId || validMoves.length === 0) return [];
		
		const selectedPoint = points[gameState.selectedPieceId];
		if (!selectedPoint) return [];
		
		const validLines: Line[] = [];
		
		// For each valid move, find the path
		validMoves.forEach(moveId => {
			const movePoint = points[moveId];
			if (!movePoint) return;
			
			// Check for direct connections (normal moves)
			const directLine = lines.find(line => 
				(line.x1 === selectedPoint.x && line.y1 === selectedPoint.y && 
				 line.x2 === movePoint.x && line.y2 === movePoint.y) ||
				(line.x2 === selectedPoint.x && line.y2 === selectedPoint.y && 
				 line.x1 === movePoint.x && line.y1 === movePoint.y)
			);
			
			if (directLine) {
				validLines.push(directLine);
			} else {
				// For tiger captures - find path through intermediate goat
				// Check if this is a tiger and look for capture path
				if (gameState.selectedPieceId !== null && gameState.board[gameState.selectedPieceId] === 'TIGER') {
					// Find potential intermediate points (where goats might be)
					lines.forEach(firstLine => {
						if ((firstLine.x1 === selectedPoint.x && firstLine.y1 === selectedPoint.y) ||
							(firstLine.x2 === selectedPoint.x && firstLine.y2 === selectedPoint.y)) {
							
							// Get the intermediate point
							const intermediateX = firstLine.x1 === selectedPoint.x && firstLine.y1 === selectedPoint.y ? firstLine.x2 : firstLine.x1;
							const intermediateY = firstLine.y1 === selectedPoint.y && firstLine.x1 === selectedPoint.x ? firstLine.y2 : firstLine.y1;
							
							// Check if there's a line from intermediate to target
							const secondLine = lines.find(line =>
								(line.x1 === intermediateX && line.y1 === intermediateY && 
								 line.x2 === movePoint.x && line.y2 === movePoint.y) ||
								(line.x2 === intermediateX && line.y2 === intermediateY && 
								 line.x1 === movePoint.x && line.y1 === movePoint.y)
							);
							
							if (secondLine) {
								// Add both line segments for the capture path
								validLines.push(firstLine);
								validLines.push(secondLine);
							}
						}
					});
				}
			}
		});
		
		// Remove duplicates
		return validLines.filter((line, index, self) => 
			index === self.findIndex(l => 
				l.x1 === line.x1 && l.y1 === line.y1 && l.x2 === line.x2 && l.y2 === line.y2
			)
		);
	}
	
	let validLines = $derived(getValidLines());
	
	// Get AI animation path
	function getAiAnimationPath() {
		if (!aiCalculatedMove || !showAiAnimation) return { lines: [], fromPoint: null, toPoint: null };
		
		const fromPoint = aiCalculatedMove.from !== null ? points[aiCalculatedMove.from] : null;
		const toPoint = points[aiCalculatedMove.to];
		
		// For placement moves, just highlight the destination
		if (aiCalculatedMove.moveType === 'PLACEMENT') {
			return { lines: [], fromPoint: null, toPoint };
		}
		
		if (!fromPoint || !toPoint) return { lines: [], fromPoint: null, toPoint: null };
		
		// Find the lines that connect from to to
		const animationLines: Line[] = [];
		
		// Check for direct connection first
		const directLine = lines.find(line => 
			(line.x1 === fromPoint.x && line.y1 === fromPoint.y && 
			 line.x2 === toPoint.x && line.y2 === toPoint.y) ||
			(line.x2 === fromPoint.x && line.y2 === fromPoint.y && 
			 line.x1 === toPoint.x && line.y1 === toPoint.y)
		);
		
		if (directLine) {
			animationLines.push(directLine);
		}
		
		// For captures, show the capture path
		if (aiCalculatedMove.moveType === 'CAPTURE' && aiCalculatedMove.jumpedGoatId !== null) {
			const jumpedPoint = points[aiCalculatedMove.jumpedGoatId];
			if (jumpedPoint) {
				// Line from tiger to goat
				const firstLine = lines.find(line =>
					(line.x1 === fromPoint.x && line.y1 === fromPoint.y && 
					 line.x2 === jumpedPoint.x && line.y2 === jumpedPoint.y) ||
					(line.x2 === fromPoint.x && line.y2 === fromPoint.y && 
					 line.x1 === jumpedPoint.x && line.y1 === jumpedPoint.y)
				);
				// Line from goat to destination
				const secondLine = lines.find(line =>
					(line.x1 === jumpedPoint.x && line.y1 === jumpedPoint.y && 
					 line.x2 === toPoint.x && line.y2 === toPoint.y) ||
					(line.x2 === jumpedPoint.x && line.y2 === jumpedPoint.y && 
					 line.x1 === toPoint.x && line.y1 === toPoint.y)
				);
				
				if (firstLine && !animationLines.some(l => l.x1 === firstLine.x1 && l.y1 === firstLine.y1 && l.x2 === firstLine.x2 && l.y2 === firstLine.y2)) {
					animationLines.push(firstLine);
				}
				if (secondLine && !animationLines.some(l => l.x1 === secondLine.x1 && l.y1 === secondLine.y1 && l.x2 === secondLine.x2 && l.y2 === secondLine.y2)) {
					animationLines.push(secondLine);
				}
			}
		}
		
		return { lines: animationLines, fromPoint, toPoint };
	}
	
	let aiAnimationPath = $derived(getAiAnimationPath());
	
	// Handle keyboard events for accessibility
	function handleKeyDown(event: KeyboardEvent, id: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handlePointClick(id);
		}
	}

</script>

<svg
	width="100%"
	viewBox="0 0 500 500"
	class="mx-auto block">
	<!-- Define gradients and effects -->
	<defs>
		<!-- Selection glow gradient for tigers -->
		<radialGradient id="tigerGlow" cx="50%" cy="50%" r="60%">
			<stop offset="0%" stop-color="rgba(239, 68, 68, 0.4)" />
			<stop offset="70%" stop-color="rgba(239, 68, 68, 0.2)" />
			<stop offset="100%" stop-color="transparent" />
		</radialGradient>
		
		<!-- Selection glow gradient for goats -->
		<radialGradient id="goatGlow" cx="50%" cy="50%" r="60%">
			<stop offset="0%" stop-color="rgba(34, 197, 94, 0.4)" />
			<stop offset="70%" stop-color="rgba(34, 197, 94, 0.2)" />
			<stop offset="100%" stop-color="transparent" />
		</radialGradient>
		
		<!-- Valid move pulse gradient -->
		<radialGradient id="validMoveGlow" cx="50%" cy="50%" r="70%">
			<stop offset="0%" stop-color="rgba(255, 193, 7, 0.6)" />
			<stop offset="50%" stop-color="rgba(255, 193, 7, 0.3)" />
			<stop offset="100%" stop-color="transparent" />
		</radialGradient>
		
		<!-- Subtle drop shadow -->
		<filter id="pieceShadow">
			<feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.3)" />
		</filter>
		
		<!-- Subtle hover glow -->
		<filter id="pieceHoverGlow">
			<feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.3)" />
			<feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="rgba(201,42,42,0.4)" />
		</filter>
	</defs>
	
	<!-- Board Lines with theme colors -->
	{#each lines as line}
		{@const isValidLine = validLines.some(vl => 
			vl.x1 === line.x1 && vl.y1 === line.y1 && vl.x2 === line.x2 && vl.y2 === line.y2
		)}
		{@const isAiAnimationLine = showAiAnimation && aiAnimationPath.lines.some(al => 
			al.x1 === line.x1 && al.y1 === line.y1 && al.x2 === line.x2 && al.y2 === line.y2
		)}
		<line
			x1={line.x1}
			y1={line.y1}
			x2={line.x2}
			y2={line.y2}
			stroke={isAiAnimationLine ? "rgb(255, 193, 7)" : (isValidLine ? "rgb(255, 193, 7)" : "var(--color-border)")}
			stroke-width={isAiAnimationLine ? "0.8%" : "0.3%"}
			class="transition-all duration-300 {isAiAnimationLine ? 'ai-animation-line' : ''}"
			opacity={isAiAnimationLine ? animationProgress * 0.9 + 0.1 : 1}
		/>
	{/each}
	
	<!-- Points and Pieces -->
	{#each points as { id, x, y }}
		{@const piece = gameState.board[id]}
		{@const selected = gameState.selectedPieceId === id}
		{@const valid = validMoves.includes(id)}

		{#if piece === 'TIGER'}
			<g transform={`translate(${x}, ${y})`} class="piece-group">
				<!-- Selection glow for selected tiger -->
				{#if selected}
					<circle
						cx={0}
						cy={0}
						r="4%"
						fill="url(#tigerGlow)"
						class="selection-ring"
					/>
					<circle
						cx={0}
						cy={0}
						r="3.5%"
						fill="none"
						stroke="rgb(239, 68, 68)"
						stroke-width="0.2%"
						class="selection-border"
					/>
				{/if}
				
				<!-- Tiger piece icon -->
				<image
					href="/icons/tiger.svg"
					width="7%"
					height="7%"
					x="-3.5%"
					y="-3.5%"
					class="piece-text cursor-pointer select-none {selected ? 'piece-selected' : 'piece-hover'}"
					style="filter: url(#pieceShadow);"
					tabindex="0"
					role="button"
					aria-label={`Tiger at position ${id}`}
					onclick={() => handlePointClick(id)}
					onkeydown={(e) => handleKeyDown(e, id)}
				/>
			</g>
		{:else if piece === 'GOAT'}
			<g transform={`translate(${x}, ${y})`} class="piece-group">
				<!-- Selection glow for selected goat -->
				{#if selected}
					<circle
						cx={0}
						cy={0}
						r="4%"
						fill="url(#goatGlow)"
						class="selection-ring"
					/>
					<circle
						cx={0}
						cy={0}
						r="3.5%"
						fill="none"
						stroke="rgb(34, 197, 94)"
						stroke-width="0.2%"
						class="selection-border"
					/>
				{/if}
				
				<!-- Goat piece icon -->
				<image
					href="/icons/goat.svg"
					width="7%"
					height="7%"
					x="-3.5%"
					y="-3.5%"
					class="piece-text cursor-pointer select-none {selected ? 'piece-selected' : 'piece-hover'}"
					style="filter: url(#pieceShadow);"
					tabindex="0"
					role="button"
					aria-label={`Goat at position ${id}`}
					onclick={() => handlePointClick(id)}
					onkeydown={(e) => handleKeyDown(e, id)}
				/>
			</g>
		{:else}
			<!-- Empty Point using theme colors -->
			<g transform={`translate(${x}, ${y})`}>
				{#if valid}
					<!-- Smaller valid move indicator -->
					<circle
						cx={0}
						cy={0}
						r="2%"
						fill="url(#validMoveGlow)"
						class="valid-move-glow"
					/>
					<circle
						cx={0}
						cy={0}
						r="1.5%"
						fill="none"
						stroke="rgb(255, 193, 7)"
						stroke-width="0.2%"
						class="valid-move-dot cursor-pointer"
						aria-label={`Valid move to position ${id}`}
						role="button"
						tabindex="0"
						onclick={() => handlePointClick(id)}
						onkeydown={(e) => handleKeyDown(e, id)}
					/>
					<!-- Larger invisible clickable area -->
					<circle
						cx={0}
						cy={0}
						r="3%"
						fill="transparent"
						class="cursor-pointer"
						onclick={() => handlePointClick(id)}
						onkeydown={(e) => handleKeyDown(e, id)}
						tabindex="0"
						role="button"
						aria-label={`Click area for position ${id}`}
					/>
				{:else}
					<!-- Regular empty point using theme's secondary black -->
					<circle
						cx={0}
						cy={0}
						r="2.4%"
						fill="var(--color-bg-secondary)"
						stroke="var(--color-border)"
						stroke-width="0.1%"
						class="empty-point cursor-pointer transition-all duration-200 hover:fill-[var(--color-bg-primary)] hover:stroke-[var(--color-text-secondary)]"
						aria-label={`Empty position ${id}`}
						role="button"
						tabindex="0"
						onclick={() => handlePointClick(id)}
						onkeydown={(e) => handleKeyDown(e, id)}
					/>
				{/if}
			</g>
		{/if}
	{/each}
	
	<!-- AI Animation: Highlight the planned move path -->
	{#if showAiAnimation && aiCalculatedMove}
		<!-- From position highlight -->
		{#if aiCalculatedMove.from !== null}
			{@const fromPoint = points[aiCalculatedMove.from]}
			{#if fromPoint}
				<g transform={`translate(${fromPoint.x}, ${fromPoint.y})`}>
					<circle
						cx={0}
						cy={0}
						r="5%"
						fill="none"
						stroke="rgb(255, 193, 7)"
						stroke-width="0.4%"
						class="ai-from-highlight"
						opacity={animationProgress}
					/>
				</g>
			{/if}
		{/if}
		
		<!-- To position highlight -->
		{@const toPoint = points[aiCalculatedMove.to]}
		{#if toPoint}
			<g transform={`translate(${toPoint.x}, ${toPoint.y})`}>
				<circle
					cx={0}
					cy={0}
					r="5%"
					fill="rgba(255, 193, 7, 0.2)"
					stroke="rgb(255, 193, 7)"
					stroke-width="0.4%"
					class="ai-to-highlight"
					opacity={animationProgress}
				/>
			</g>
		{/if}
	{/if}
</svg>

<style>
	/* Remove focus outline from clickable game pieces */
	image[role="button"]:focus,
	circle[role="button"]:focus {
		outline: none;
	}
	
	/* Piece animations and effects */
	.piece-text {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: center;
	}
	
	.piece-hover:hover {
		filter: url(#pieceHoverGlow);
	}
	
	.piece-selected {
		filter: url(#pieceShadow) brightness(1.2);
	}
	
	/* Selection ring - static styling */
	.selection-ring {
		opacity: 0.6;
	}
	
	.selection-border {
		opacity: 0.9;
	}
	
	/* Valid move - static styling */
	.valid-move-glow {
		opacity: 0.5;
	}
	
	.valid-move-dot {
		opacity: 1;
	}
	
	/* Empty point hover effects */
	.empty-point {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.empty-point:hover {
		transform: scale(1.2);
	}
	
	/* Piece group hover effects */
	.piece-group:hover .piece-text {
		filter: url(#pieceHoverGlow);
	}
	
	/* AI Animation styles */
	.ai-animation-line {
		stroke-linecap: round;
		filter: drop-shadow(0 0 4px rgba(255, 193, 7, 0.6));
	}
	
	.ai-from-highlight {
		animation: ai-pulse 0.6s ease-in-out infinite;
	}
	
	.ai-to-highlight {
		animation: ai-glow 0.8s ease-in-out infinite;
	}
	
	@keyframes ai-pulse {
		0%, 100% {
			opacity: 0.8;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
		}
	}
	
	@keyframes ai-glow {
		0%, 100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}
</style> 