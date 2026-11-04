<!-- Links a note to its live lab. Default: a ruled plate; minimal: one caps line. -->
<script lang="ts">
	interface Props {
		labName: string;
		labUrl: string;
		labDescription: string;
		variant?: 'default' | 'minimal';
	}

	let { labName, labUrl, labDescription, variant = 'default' }: Props = $props();
</script>

{#if variant === 'minimal'}
	<p class="meta minimal"><a href={labUrl}>Open {labName} live</a></p>
{:else}
	<aside class="callout">
		<p class="meta">Live lab</p>
		<p class="what">{labDescription}</p>
		<a class="btn" href={labUrl}>Open {labName}</a>
	</aside>
{/if}

<style>
	.callout {
		margin: 0 0 40px;
		padding: 16px 0 20px;
		border-top: 1.5px solid var(--color-ink);
		border-bottom: 1px solid var(--color-ink);
	}
	.what {
		margin: 6px 0 14px;
		font-size: 15.5px;
		max-width: 60ch;
	}
	.minimal {
		margin: 40px 0 0;
		padding-top: 10px;
		border-top: 1px solid var(--color-ink);
	}
</style>
