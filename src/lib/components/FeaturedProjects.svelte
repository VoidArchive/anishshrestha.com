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
			title="NepseAuth – NEPSE API Go Library"
			description="Modern Go library for accessing Nepal Stock Exchange (NEPSE) API. Features type-safe client, automatic authentication, retry logic, and comprehensive market data retrieval."
			tech={['Go', 'API', 'Finance', 'NEPSE']}
			repo="https://github.com/VoidArchive/nepseauth"
		/>
	</div>
</section>
