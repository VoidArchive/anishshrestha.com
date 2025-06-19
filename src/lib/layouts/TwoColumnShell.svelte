<script lang="ts">
	export let leftWidth: string = '280px'; // configurable, but defaults to 280px
</script>

<div
	class="grid lg:grid-cols-[minmax(0,_var(--left-width))_1fr]"
	style="--left-width:{leftWidth}; gap: var(--space-6);"
>
	<aside class="flex flex-col" style="gap: var(--space-6);">
		<slot name="left" />
	</aside>

	<main class="flex min-w-0 flex-col" style="gap: var(--space-6);">
		<slot />
	</main>
</div>
