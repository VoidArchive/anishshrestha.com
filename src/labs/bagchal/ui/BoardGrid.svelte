<script lang="ts">
	import type { Line } from '#labs/bagchal/rules/index.js';

	interface Props {
		lines: Line[];
	}

	let { lines }: Props = $props();
</script>

{#each lines as line (`${line.x1}-${line.y1}-${line.x2}-${line.y2}`)}
	<line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
{/each}

<style>
	line {
		stroke: var(--color-ink);
		stroke-width: 1.5;
	}
</style>
