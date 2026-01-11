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
			title="NTX – Nepse Stock Analyzer"
			description="A powerful terminal-based stock analyzer for the Nepal Stock Exchange (NEPSE). Features stock screener, company pages, and market overview."
			tech={['Go', 'SvelteKit', 'GRPC', 'SQLC']}
			repo="https://github.com/voidarchive/ntx"
		/>
		<MiniProjectCard
			title="Bagchal – Nepali Strategy Game"
			description="Browser implementation of the traditional Nepali Tigers & Goats board game. Features AI opponent with minimax algorithm and adjustable difficulty levels."
			tech={['SvelteKit', 'TypeScript', 'Game', 'AI']}
			repo="https://github.com/VoidArchive/anishshrestha.com/tree/main/src/labs/bagchal"
		/>
		<MiniProjectCard
			title="go-nepse – NEPSE API Go Library"
			description="Modern Go library for accessing Nepal Stock Exchange (NEPSE) API. Features type-safe client, automatic authentication, retry logic, and comprehensive market data retrieval."
			tech={['Go', 'API', 'Finance', 'NEPSE']}
			repo="https://github.com/VoidArchive/go-nepse"
		/>
	</div>
</section>
