<!--
Quick Actions Component

Provides immediate engagement opportunities for homepage visitors.
Features prominent action buttons for exploring labs, viewing projects,
and reading blog posts with consistent styling and hover animations.
-->

<script lang="ts">
	import { Play, FolderGit, BookOpen, ArrowRight } from 'lucide-svelte';
</script>

<section class="quick-actions">
	<div class="quick-actions-grid">
		<!-- Explore Labs -->
		<a href="/labs" class="action-card">
			<div class="action-icon">
				<Play size={20} />
			</div>
			<div class="action-content">
				<h3 class="action-title">Explore Labs</h3>
				<p class="action-description">Interactive algorithms, games, and simulations</p>
			</div>
			<ArrowRight size={16} class="action-arrow" />
		</a>

		<!-- View Projects -->
		<a href="/projects" class="action-card">
			<div class="action-icon">
				<FolderGit size={20} />
			</div>
			<div class="action-content">
				<h3 class="action-title">View Projects</h3>
				<p class="action-description">Production apps and open source work</p>
			</div>
			<ArrowRight size={16} class="action-arrow" />
		</a>

		<!-- Read Blog -->
		<a href="/blog" class="action-card">
			<div class="action-icon">
				<BookOpen size={20} />
			</div>
			<div class="action-content">
				<h3 class="action-title">Read Blog</h3>
				<p class="action-description">Technical insights and learning notes</p>
			</div>
			<ArrowRight size={16} class="action-arrow" />
		</a>
	</div>
</section>

<style>
	.quick-actions {
		margin-bottom: var(--space-6);
	}

	.quick-actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-3);
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		text-decoration: none;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.action-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
		transition: left 0.5s ease;
	}

	.action-card:hover::before {
		left: 100%;
	}

	.action-card:hover {
		transform: translateY(-2px);
		border-color: var(--color-primary);
		box-shadow: 0 8px 25px -3px rgba(201, 42, 42, 0.15);
	}

	.action-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 6px;
		transition: all 0.3s ease;
		flex-shrink: 0;
		background: rgba(201, 42, 42, 0.1);
		color: var(--color-primary);
		border: 1px solid var(--color-border);
	}

	.action-card:hover .action-icon {
		background: rgba(201, 42, 42, 0.15);
		border-color: var(--color-primary);
		transform: scale(1.05);
	}

	.action-content {
		flex: 1;
		min-width: 0;
	}

	.action-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 var(--space-1) 0;
		transition: color 0.3s ease;
	}

	.action-card:hover .action-title {
		color: var(--color-primary);
	}

	.action-description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.4;
	}

	/* .action-arrow {
		color: var(--color-text-muted);
		transition: all 0.3s ease;
		flex-shrink: 0;
	}

	.action-card:hover .action-arrow {
		transform: translateX(4px);
		color: var(--color-primary);
	} */

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.quick-actions-grid {
			grid-template-columns: 1fr;
		}

		.action-card {
			padding: var(--space-3);
		}
	}
</style>
