<script lang="ts">
	const labs = [
		{
			n: 1,
			name: 'Game of Life',
			description:
				"Conway's cellular automaton with a pattern library, speed control and a grid you can edit while it runs.",
			slug: 'gameoflife',
			blog: 'building-conways-game-of-life-svelte'
		},
		{
			n: 2,
			name: 'Boids Flocking',
			description:
				'Emergent flocking from three rules: separation, alignment, cohesion. Adjust the weights and watch the flock respond.',
			slug: 'boids',
			blog: 'boids-in-a-small-box'
		},
		{
			n: 3,
			name: 'DSA Visualizer',
			description:
				'Sorting algorithms and pathfinding, one step at a time, with the comparisons and swaps counted as they happen.',
			slug: 'dsa-visualizer',
			blog: 'building-dsa-visualizer-animation-engine'
		},
		{
			n: 4,
			name: 'Life Calendar',
			description: 'Your life drawn in weeks, one square each, assuming a hundred years.',
			slug: 'life-calendar',
			blog: null
		},
		{
			n: 5,
			name: 'Bagchal',
			description:
				'The traditional Nepali tigers-and-goats game against a minimax opponent with an opening book.',
			slug: 'bagchal',
			blog: 'bagchal-reforged-ai-chess-tigers'
		},
		{
			n: 6,
			name: 'Tic Tac Toe',
			description: 'The classic game against an unbeatable minimax player.',
			slug: 'tictactoe',
			blog: null
		}
	];
</script>

<svelte:head>
	<title>Labs | anishshrestha.com</title>
	<meta
		name="description"
		content="Six working experiments: Game of Life, boids, a sorting and pathfinding visualizer, Bagchal, Tic Tac Toe, and a life calendar."
	/>
</svelte:head>

<main class="page container">
	<h1 class="page-title">Labs</h1>
	<p class="dek">
		Six experiments that run in the browser. Each is a figure on the home page; most come with a
		note on how the engine behind it was built. If you find a bug, report it on GitHub or write to
		me.
	</p>

	<ol class="ruled figures">
		{#each labs as lab (lab.slug)}
			<li>
				<span class="numeral" aria-hidden="true">Fig. {lab.n}</span>
				<div>
					<h2><a href="/labs/{lab.slug}">{lab.name}</a></h2>
					<p>{lab.description}</p>
					<p class="meta links">
						<a href="/labs/{lab.slug}">Play</a>
						{#if lab.blog}· <a href="/blog/{lab.blog}">Read how it was built</a>{/if}
					</p>
				</div>
			</li>
		{/each}
	</ol>
</main>

<style>
	.figures > li {
		display: grid;
		grid-template-columns: 150px minmax(0, 1fr);
		gap: 24px;
		align-items: start;
		padding: 22px 0;
	}
	.figures .numeral {
		font-size: 40px;
		padding-top: 2px;
	}
	.links {
		margin: 0;
	}
	.links a {
		text-decoration: underline;
		text-decoration-color: var(--color-spot);
		text-underline-offset: 3px;
	}
	@media (max-width: 640px) {
		.figures > li {
			grid-template-columns: 1fr;
			gap: 6px;
		}
		.figures .numeral {
			font-size: 32px;
		}
	}
</style>
