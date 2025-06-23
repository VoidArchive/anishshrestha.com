<!--
Latest Labs Component

Clean showcase of the most recent interactive lab projects on the homepage.
Features Game of Life and DSA Visualizer with minimal, focused preview cards
that emphasize project descriptions and technology stacks.
-->

<script lang="ts">
	import { Cpu, ArrowRight, Play, BarChart3, Grid3x3 } from 'lucide-svelte';

	// Lab projects data
	const latestLabs = [
		{
			name: 'DSA Visualizer',
			description:
				'Interactive visualization of sorting algorithms and pathfinding with step-by-step animations, speed controls, and detailed statistics for learning data structures.',
			slug: 'dsa-visualizer',
			tech: ['SvelteKit', 'TypeScript', 'Algorithms', 'Visualization'],
			icon: 'barchart'
		},
		{
			name: 'Game of Life',
			description:
				"Conway's cellular automaton with pattern library, speed controls, and interactive grid editing. Watch evolution patterns unfold and create your own configurations.",
			slug: 'gameoflife',
			tech: ['SvelteKit', 'TypeScript', 'Cellular Automata', 'Simulation'],
			icon: 'grid'
		}
	];
</script>

<section class="section-card">
	<h2 class="section-title flex items-center gap-2">
		<Cpu size={20} class="text-primary inline" /> Latest Labs
	</h2>
	<div class="flex flex-col gap-6">
		{#each latestLabs as lab (lab.slug)}
			<div class="lab-preview-card">
				<!-- Header with icon -->
				<div class="lab-header">
					<div class="lab-icon">
						{#if lab.icon === 'barchart'}
							<BarChart3 size={24} class="text-primary" />
						{:else if lab.icon === 'grid'}
							<Grid3x3 size={24} class="text-primary" />
						{/if}
					</div>
				</div>

				<!-- Content -->
				<div class="lab-content">
					<h3 class="lab-title">{lab.name}</h3>
					<p class="lab-description">{lab.description}</p>

					<!-- Tech stack -->
					<div class="tech-stack">
						{#each lab.tech as tech (tech)}
							<span class="tech-tag">{tech}</span>
						{/each}
					</div>
				</div>

				<!-- Action button -->
				<a href="/labs/{lab.slug}" class="btn lab-action-btn" aria-label="Try {lab.name}">
					<Play size={16} />
					<span>Try Now</span>
					<ArrowRight size={14} class="action-arrow" />
				</a>
			</div>
		{/each}
	</div>
</section>

<style>
	.lab-preview-card {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		padding: var(--space-4);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.lab-preview-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
		transition: left 0.5s ease;
	}

	.lab-preview-card:hover::before {
		left: 100%;
	}

	.lab-preview-card:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -3px rgba(201, 42, 42, 0.15);
	}

	.lab-header {
		display: flex;
		align-items: center;
		margin-bottom: var(--space-3);
	}

	.lab-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: rgba(201, 42, 42, 0.1);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		transition: all 0.3s ease;
	}

	.lab-preview-card:hover .lab-icon {
		background: rgba(201, 42, 42, 0.15);
		border-color: var(--color-primary);
		transform: scale(1.05);
	}

	.lab-content {
		margin-bottom: var(--space-4);
	}

	.lab-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: var(--space-2);
		transition: color 0.3s ease;
	}

	.lab-preview-card:hover .lab-title {
		color: var(--color-primary);
	}

	.lab-description {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		line-height: 1.6;
		margin-bottom: var(--space-4);
	}

	.tech-stack {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.tech-tag {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		padding: var(--space-1) var(--space-2);
		font-size: 0.75rem;
		font-family: var(--font-family-mono);
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.lab-preview-card:hover .tech-tag {
		border-color: var(--color-primary);
		background: rgba(201, 42, 42, 0.05);
		color: var(--color-text);
	}

	.lab-action-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: max-content;
		margin-left: auto;
	}

	/* .lab-action-btn .action-arrow {
		transition: transform 0.3s ease;
	}

	.lab-action-btn:hover .action-arrow {
		transform: translateX(4px);
	} */

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.lab-preview-card {
			padding: var(--space-3);
		}

		.tech-stack {
			gap: var(--space-1);
		}

		.tech-tag {
			font-size: 0.7rem;
		}
	}
</style>
