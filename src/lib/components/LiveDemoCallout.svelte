<!--
  LiveDemoCallout.svelte
  Purpose: Component for linking blog posts to their corresponding interactive labs
  Displays a prominent call-to-action that encourages readers to try the live demo
-->
<script lang="ts">
	import { Play, ArrowRight } from 'lucide-svelte';

	interface Props {
		labName: string;
		labUrl: string;
		labDescription: string;
		variant?: 'default' | 'minimal';
	}

	let { labName, labUrl, labDescription, variant = 'default' }: Props = $props();
</script>

{#if variant === 'minimal'}
	<!-- Minimal inline version -->
	<div class="live-demo-minimal">
		<a href={labUrl} class="demo-link-minimal">
			<Play size={16} />
			<span>Try {labName} Live</span>
			<ArrowRight size={14} />
		</a>
	</div>
{:else}
	<!-- Full callout version -->
	<div class="live-demo-callout">
		<div class="demo-icon">
			<Play size={24} />
		</div>
		<div class="demo-content">
			<h3 class="demo-title">Try the Live Demo</h3>
			<p class="demo-description">{labDescription}</p>
			<a href={labUrl} class="demo-link">
				<span>Launch {labName}</span>
				<ArrowRight size={16} />
			</a>
		</div>
	</div>
{/if}

<style>
	/* Full callout styles */
	.live-demo-callout {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		margin: 1.5rem 0;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		transition: all 0.3s ease;
	}

	.live-demo-callout:hover {
		border-color: var(--color-primary);
		background-color: rgba(201, 42, 42, 0.02);
	}

	.demo-icon {
		background-color: var(--color-primary);
		color: var(--color-text);
		display: flex;
		height: 3rem;
		width: 3rem;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	.demo-content {
		flex: 1;
	}

	.demo-title {
		color: var(--color-text);
		margin-bottom: 0.25rem;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.demo-description {
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.demo-link {
		border: 1px solid var(--color-border);
		color: var(--color-text);
		background: transparent;
		padding: 0.5rem 1rem;
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		text-decoration: none;
		cursor: pointer;
		overflow: hidden;
		position: relative;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.demo-link:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	/* Minimal inline styles */
	.live-demo-minimal {
		margin: 0.75rem 0;
		text-align: center;
	}

	.demo-link-minimal {
		color: var(--color-primary);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid var(--color-primary);
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-family: var(--font-family-mono);
		transition: all 0.3s ease;
		text-decoration: none;
	}

	.demo-link-minimal:hover {
		color: var(--color-text);
		border-color: var(--color-primary);
		background-color: rgba(201, 42, 42, 0.1);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.live-demo-callout {
			flex-direction: column;
			gap: 0.75rem;
		}

		.demo-icon {
			height: 2.5rem;
			width: 2.5rem;
		}

		.demo-title {
			font-size: 1rem;
		}
	}
</style>
