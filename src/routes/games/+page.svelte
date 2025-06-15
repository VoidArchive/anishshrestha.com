<script lang="ts">
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';
	// Simple list of games – can be replaced with fetched data later
	const games = [
		{
			name: 'Bagchal',
			description: 'Play the traditional Nepali tiger-goat strategy game.',
			slug: 'bagchal',
			icon: '/icons/tiger.svg'
		},
		{
			name: 'Tic Tac Toe',
			description: 'Play the classic Tic Tac Toe game.',
			slug: 'tictactoe',
			icon: '/icons/hash.svg'
		}
	];
</script>

<svelte:head>
	<title>Games | anishshrestha.com</title>
</svelte:head>

<main class="container py-8">
	<TwoColumnShell leftGap="gap-2">
		<svelte:fragment slot="left">
			<!-- Sidebar filters -->
			<section class="section-card p-4">
				<h3 class="section-title mb-4 text-lg">Filters</h3>
				<div class="flex flex-wrap gap-2">
					{#each ['Puzzle','Strategy','Arcade','Multiplayer'] as genre}
						<span class="badge cursor-pointer select-none">{genre}/</span>
					{/each}
				</div>
			</section>
		</svelte:fragment>

		<!-- Main column -->
		<div class="flex flex-col">
			{#each games as game (game.slug)}
				<section class="section-card p-3 sm:p-4 flex flex-row justify-between items-start rounded-none gap-4">
					<!-- Text content -->
					<div class="flex flex-col gap-2 flex-1">
						<h2 class="section-title m-0 text-xl">{game.name}</h2>
						<p class="text-text-muted text-sm leading-relaxed">{game.description}</p>
						<a href={`/games/${game.slug}`} class="btn inline-flex w-max items-center gap-2 mt-1">
							<span>Play</span>
						</a>
					</div>
					<!-- Icon -->
					{#if game.icon}
						<img src={game.icon} alt={game.name} class="h-16 w-16 flex-shrink-0" />
					{/if}
				</section>
			{/each}
		</div>
	</TwoColumnShell>
</main>
