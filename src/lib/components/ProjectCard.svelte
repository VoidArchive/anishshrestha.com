<script lang="ts">
	import { FolderGit, Github, ExternalLink } from 'lucide-svelte';
	export let title: string;
	export let description: string;
	export let tech: string[] = [];
	export let repo: string;
	export let demo: string | null = null;
</script>

<section class="section-card" style="margin-bottom: 0;">
	<h2 class="section-title flex items-center gap-2">
		<FolderGit size={20} class="inline" />
		{title}
	</h2>

	<p class="text-text-muted mb-4">{description}</p>

	{#if tech.length}
		<div class="mb-4 flex flex-wrap gap-2">
			{#each tech as t (t)}
				<span class="bg-bg-primary border-border border px-2 py-1 text-xs">
					{t}
				</span>
			{/each}
		</div>
	{/if}

	<div class="flex gap-3">
		<a href={repo} target="_blank" rel="noopener noreferrer" class="btn flex items-center gap-1">
			<Github size={16} /> Code
		</a>

		{#if demo}
			<a href={demo} target="_blank" rel="noopener noreferrer" class="btn flex items-center gap-1">
				<ExternalLink size={16} /> Demo
			</a>
		{/if}
	</div>
</section>
