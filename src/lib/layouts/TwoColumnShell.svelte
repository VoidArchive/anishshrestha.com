<script lang="ts">
	let { left, children, leftWidth = '280px' } = $props();
</script>

<div
	class="grid lg:grid-cols-[minmax(0,_var(--left-width))_1fr]"
	style="--left-width:{leftWidth}; gap: var(--space-6);"
>
	<aside class="flex flex-col" style="gap: var(--space-6);">
		{@render left?.()}
	</aside>

	<main class="flex min-w-0 flex-col" style="gap: var(--space-6);">
		{@render children?.()}
	</main>
</div>
