<script lang="ts">
	import type { Line } from '$labs/bagchal/rules';

	interface Props {
		lines: Line[];
	}

	let { lines }: Props = $props();
</script>

<!-- SVG Grid Structure with Consistent Angular Design -->
<defs>
	<!-- Shadow effect for pieces -->
	<filter id="pieceShadow" x="-50%" y="-50%" width="200%" height="200%">
		<feDropShadow dx="0.5" dy="1" stdDeviation="1" flood-opacity="0.6" />
	</filter>

	<!-- Angular glow effect for interactive elements -->
	<filter id="pieceHoverGlow" x="-50%" y="-50%" width="200%" height="200%">
		<feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#c92a2a" flood-opacity="0.8" />
	</filter>

	<!-- Angular glow for valid moves -->
	<radialGradient id="validMoveGlow" cx="50%" cy="50%" r="50%">
		<stop offset="0%" style="stop-color:#c92a2a;stop-opacity:0.4" />
		<stop offset="100%" style="stop-color:#c92a2a;stop-opacity:0" />
	</radialGradient>

	<!-- Selection ring gradient with primary color -->
	<radialGradient id="selectionGlow" cx="50%" cy="50%" r="50%">
		<stop offset="0%" style="stop-color:#c92a2a;stop-opacity:0.2" />
		<stop offset="100%" style="stop-color:#c92a2a;stop-opacity:0.6" />
	</radialGradient>

	<!-- Valid move indicator gradient -->
	<radialGradient id="validMoveIndicator" cx="50%" cy="50%" r="50%">
		<stop offset="0%" style="stop-color:#c92a2a;stop-opacity:0.6" />
		<stop offset="70%" style="stop-color:#c92a2a;stop-opacity:0.3" />
		<stop offset="100%" style="stop-color:#c92a2a;stop-opacity:0" />
	</radialGradient>
</defs>

<!-- Board Lines - Clean Subtle Design -->
{#each lines as line}
	<line
		x1={line.x1}
		y1={line.y1}
		x2={line.x2}
		y2={line.y2}
		stroke="var(--color-border)"
		stroke-width="0.5"
		class="transition-all duration-200"
	/>
{/each}
