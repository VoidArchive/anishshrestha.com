<script lang="ts">
	import { Folder, ArrowRight } from 'lucide-svelte';
	import MiniProjectCard from './MiniProjectCard.svelte';
</script>

<section class="section-card">
	<h2 class="section-title flex items-center gap-2">
		<Folder size={20} class="inline" /> Featured Projects
	</h2>
	<div class="flex flex-col gap-6">
		<MiniProjectCard
			title="Gator – CLI RSS Aggregator"
			description="Command-line RSS reader written in Go. Import OPML feeds, follow other users, and browse fresh posts in a Vim-like TUI—offline-first and blazing fast."
			tech={[
				'Go',
				'PostgreSQL',
				'sqlc',
				'TUI'
			]}
			repo="https://github.com/VoidArchive/gator"
		/>

		<MiniProjectCard
			title="Pokedex – Terminal Pokédex"
			description="Interactive command-line Pokédex written in Go. Explore locations, catch Pokémon, and inspect your collection right inside your terminal. Offline-first with local caching."
			tech={[
				'Go',
				'CLI',
				'PokéAPI'
			]}
			repo="https://github.com/VoidArchive/pokedex"
		/>
	</div>

	<a
		href="/projects"
		class="btn flex items-center gap-1 w-max mt-4 ml-auto"
	>
		<span>View all projects</span>
		<ArrowRight size={14} />
	</a>
</section> 