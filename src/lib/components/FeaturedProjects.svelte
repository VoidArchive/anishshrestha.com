<script lang="ts">
	import { FolderGit, ArrowRight } from 'lucide-svelte';
	import MiniProjectCard from './MiniProjectCard.svelte';
</script>

<section class="section-card">
	<h2 class="section-title flex items-center gap-2">
		<FolderGit size={20} class="text-primary inline" /> Featured Projects
	</h2>
	<div class="flex flex-col gap-6">
		<MiniProjectCard
			title="Gator – CLI RSS Aggregator"
			description="Command-line RSS reader written in Go. Import OPML feeds, follow other users, and browse fresh posts in a Vim-like TUI—offline-first and blazing fast."
			tech={['Go', 'PostgreSQL', 'sqlc', 'TUI']}
			repo="https://github.com/VoidArchive/gator"
		/>

		<MiniProjectCard
			title="Bagchal – Nepali Strategy Game"
			description="SvelteKit implementation of Bagchal, the traditional Tigers & Goats board game. Play against AI or friends. Features Easy and Hard AI difficulty levels."
			tech={['SvelteKit', 'TypeScript', 'Game', 'AI']}
			repo="/games/bagchal"
		/>
	</div>

	<a href="/projects" class="btn mt-4 ml-auto flex w-max items-center gap-1">
		<span>View all projects</span>
		<ArrowRight size={14} />
	</a>
</section>
