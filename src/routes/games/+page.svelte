<script lang="ts">
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

<main class="container">
	<div class="mx-auto max-w-4xl py-8">
		<header class="border-border mb-12 border-b pb-8 text-center">
			<h1 class="text-primary-red mb-4 text-4xl lg:text-4xl">Games</h1>
			<p class="text-text-secondary text-lg">Relax, play & experiment with my small web games.</p>
		</header>

		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each games as game (game.slug)}
				<section class="section-card p-3 sm:p-4 flex flex-col gap-3 rounded-none">
					<div class="flex items-center gap-3">
						{#if game.icon}
							<img src={game.icon} alt={game.name} class="h-10 w-10" />
						{/if}
						<h2 class="section-title m-0 flex-1 text-xl">{game.name}</h2>
					</div>
					<p class="text-text-secondary flex-1 text-sm leading-relaxed">{game.description}</p>

					<div class="mt-auto">
						<a href={`/games/${game.slug}`} class="btn inline-flex items-center gap-2">
							<span>Play</span>
						</a>
					</div>
				</section>
			{/each}
		</div>
	</div>
</main>
