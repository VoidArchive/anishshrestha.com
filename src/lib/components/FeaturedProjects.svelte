<!--
Featured Projects Component

Showcases major external and GitHub projects.
Complements the LatestLabs component by focusing on production/GitHub projects
rather than interactive browser-based labs.
-->

<script lang="ts">
	import { FolderGit } from 'lucide-svelte';
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
			title="Portfolio & Lab Platform"
			description="This very website! SvelteKit-based portfolio featuring interactive labs, blog system, and responsive design. Includes game engines, algorithm visualizers, and educational tools."
			tech={['SvelteKit', 'TypeScript', 'Tailwind', 'Cloudflare']}
			repo="https://github.com/VoidArchive/anishshrestha.com"
		/>
	</div>
</section>
