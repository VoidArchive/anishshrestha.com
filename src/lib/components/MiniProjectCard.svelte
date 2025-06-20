<script lang="ts">
	import { Github } from 'lucide-svelte';
	export let title: string;
	export let description: string;
	export let tech: string[] = [];
	export let repo: string;
</script>

<a
	href={repo}
	target="_blank"
	rel="noopener noreferrer"
	class="project-card bg-bg-primary border-border hover:border-primary relative block overflow-hidden border p-4 no-underline transition-all duration-300"
>
	<article>
		<h3 class="mb-2 flex items-center gap-1">
			<span
				class="text-text hover:text-primary text-base font-semibold transition-colors duration-300"
			>
				{title}
			</span>
			<Github size={16} class="text-text-muted ml-auto" />
		</h3>
		<p class="text-text-muted mb-3 line-clamp-3 text-sm leading-relaxed">{description}</p>
		{#if tech.length}
			<div class="flex flex-wrap gap-1">
				{#each tech.slice(0, 4) as t (t)}
					<span class="bg-bg-secondary border-border border px-1.5 py-0.5 text-xs text-white"
						>{t}</span
					>
				{/each}
			</div>
		{/if}
	</article>
</a>

<style>
	.project-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
		transition: left 0.5s ease;
		pointer-events: none;
		z-index: 1;
	}

	.project-card:hover::before {
		left: 100%;
	}

	.project-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -3px rgba(201, 42, 42, 0.15);
	}

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
