<!--
Tech Stack Component

Modern, clean technical skills showcase with badge-style layout.
Features categorized technologies in a compact, scannable format
with subtle hover animations and visual hierarchy.
-->

<script lang="ts">
	import { Code, Database, Globe, FileCode, Terminal, Layers, Cloud } from 'lucide-svelte';

	interface TechItem {
		name: string;
		icon: any;
	}

	interface TechCategory {
		name: string;
		icon: any;
		items: TechItem[];
	}

	const techStack: TechCategory[] = [
		{
			name: 'Backend',
			icon: Terminal,
			items: [
				{ name: 'Go', icon: Code },
				{ name: 'Python', icon: Code },
				{ name: 'PostgreSQL', icon: Database }
			]
		},
		{
			name: 'Frontend',
			icon: Globe,
			items: [
				{ name: 'SvelteKit', icon: Layers },
				{ name: 'TypeScript', icon: FileCode }
			]
		},
		{
			name: 'DevOps',
			icon: Cloud,
			items: [
				{ name: 'Docker', icon: Layers },
				{ name: 'Linux', icon: Terminal }
			]
		}
	];
</script>

<section class="section-card">
	<h2 class="section-title flex items-center gap-2">
		<Code size={20} class="text-primary inline" /> Tech Stack
	</h2>

	<div class="tech-grid">
		{#each techStack as category (category.name)}
			<div class="tech-category">
				<!-- Category Header -->
				<div class="category-header">
					<category.icon size={16} />
					<span class="category-name">{category.name}</span>
				</div>

				<!-- Tech Badges -->
				<div class="tech-badges">
					{#each category.items as item (item.name)}
						<div class="tech-badge">
							<item.icon size={14} />
							<span class="tech-name">{item.name}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.tech-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.tech-category {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}

	.category-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.tech-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.tech-badge {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		transition: all 0.3s ease;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.tech-badge::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(201, 42, 42, 0.1), transparent);
		transition: left 0.4s ease;
		pointer-events: none;
	}

	.tech-badge:hover::before {
		left: 100%;
	}

	.tech-badge:hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
		background: rgba(201, 42, 42, 0.03);
		box-shadow: 0 4px 12px -2px rgba(201, 42, 42, 0.15);
	}

	.tech-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
		transition: color 0.3s ease;
		white-space: nowrap;
	}

	.tech-badge:hover .tech-name {
		color: var(--color-primary);
		font-weight: 600;
	}

	:global(.tech-badge svg) {
		color: var(--color-text-muted);
		transition: color 0.3s ease;
		flex-shrink: 0;
	}

	.tech-badge:hover :global(svg) {
		color: var(--color-primary);
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.tech-grid {
			gap: var(--space-3);
		}

		.tech-badges {
			gap: var(--space-1);
		}

		.tech-badge {
			padding: var(--space-2);
			font-size: 0.8rem;
		}

		.tech-badge :global(svg) {
			width: 12px;
			height: 12px;
		}
	}
</style>
