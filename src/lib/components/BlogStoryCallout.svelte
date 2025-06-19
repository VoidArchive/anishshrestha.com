<!--
  BlogStoryCallout.svelte
  Purpose: Component for linking lab pages to their corresponding blog posts
  Displays a call-to-action encouraging users to read the technical deep-dive
-->
<script lang="ts">
	import { BookOpen, ArrowRight } from 'lucide-svelte';

	interface Props {
		blogTitle: string;
		blogUrl: string;
		blogDescription?: string;
		variant?: 'default' | 'banner' | 'minimal';
	}

	let { blogTitle, blogUrl, blogDescription, variant = 'default' }: Props = $props();
</script>

{#if variant === 'banner'}
	<!-- Banner version for top of lab pages -->
	<div class="blog-story-banner">
		<div class="banner-content">
			<div class="banner-icon">
				<BookOpen size={20} />
			</div>
			<div class="banner-text">
				<span class="banner-title">Read the Story</span>
				<span class="banner-subtitle">{blogTitle}</span>
			</div>
		</div>
		<a href={blogUrl} class="banner-link">
			<span>Read Article</span>
			<ArrowRight size={16} />
		</a>
	</div>
{:else if variant === 'minimal'}
	<!-- Minimal inline version -->
	<div class="blog-story-minimal">
		<a href={blogUrl} class="story-link-minimal">
			<BookOpen size={16} />
			<span>Read the Technical Story</span>
			<ArrowRight size={14} />
		</a>
	</div>
{:else}
	<!-- Default callout version -->
	<div class="blog-story-callout">
		<div class="story-icon">
			<BookOpen size={24} />
		</div>
		<div class="story-content">
			<h3 class="story-title">Technical Deep-Dive</h3>
			<p class="story-description">
				{blogDescription ||
					'Learn about the architecture, algorithms, and implementation decisions behind this project.'}
			</p>
			<a href={blogUrl} class="story-link">
				<span>Read "{blogTitle}"</span>
				<ArrowRight size={16} />
			</a>
		</div>
	</div>
{/if}

<style>
	/* Default callout styles */
	.blog-story-callout {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		margin: 1.5rem 0;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		transition: all 0.3s ease;
	}

	.blog-story-callout:hover {
		border-color: var(--color-primary);
		background-color: rgba(201, 42, 42, 0.02);
	}

	.story-icon {
		background-color: var(--color-text);
		color: var(--color-bg-primary);
		display: flex;
		height: 3rem;
		width: 3rem;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}

	.story-content {
		flex: 1;
	}

	.story-title {
		color: var(--color-text);
		margin-bottom: 0.25rem;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.story-description {
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.story-link {
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

	.story-link:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	/* Banner styles */
	.blog-story-banner {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		transition: all 0.3s ease;
	}

	.blog-story-banner:hover {
		border-color: var(--color-primary);
		background-color: rgba(201, 42, 42, 0.02);
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.banner-icon {
		color: var(--color-text-muted);
	}

	.banner-text {
		display: flex;
		flex-direction: column;
	}

	.banner-title {
		color: var(--color-text);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.banner-subtitle {
		color: var(--color-text-muted);
		font-size: 0.75rem;
	}

	.banner-link {
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		background: transparent;
		padding: 0.5rem 0.75rem;
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		text-decoration: none;
		cursor: pointer;
		overflow: hidden;
		position: relative;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.banner-link:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	/* Minimal styles */
	.blog-story-minimal {
		margin: 0.75rem 0;
		text-align: center;
	}

	.story-link-minimal {
		color: var(--color-text-muted);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid var(--color-border);
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-family: var(--font-family-mono);
		transition: all 0.3s ease;
		text-decoration: none;
	}

	.story-link-minimal:hover {
		color: var(--color-text);
		border-color: var(--color-text);
		background-color: rgba(108, 117, 125, 0.1);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.blog-story-callout {
			flex-direction: column;
			gap: 0.75rem;
		}

		.story-icon {
			height: 2.5rem;
			width: 2.5rem;
		}

		.story-title {
			font-size: 1rem;
		}

		.blog-story-banner {
			flex-direction: column;
			gap: 0.75rem;
		}

		.banner-content {
			width: 100%;
		}

		.banner-link {
			width: 100%;
			justify-content: center;
		}
	}
</style>
