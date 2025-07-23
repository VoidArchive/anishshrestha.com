<script lang="ts">
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';
	import { Grid3x3, BarChart3, BookOpen } from 'lucide-svelte';
	// Simple list of labs/experiments – can be replaced with fetched data later
	const experiments = [
		{
			name: 'DSA Visualizer',
			description:
				'Interactive visualization of sorting algorithms and data structures with step-by-step animations.',
			slug: 'dsa-visualizer',
			icon: 'barchart',
			blogSlug: 'building-dsa-visualizer-animation-engine',
			blogTitle: 'Building a DSA Visualizer: Animation Engine Architecture'
		},
		{
			name: 'Game of Life',
			description: "Conway's cellular automaton - watch patterns evolve and create your own.",
			slug: 'gameoflife',
			icon: 'grid',
			blogSlug: 'building-conways-game-of-life-svelte',
			blogTitle: "Building Conway's Game of Life: From Theory to Interactive Simulation"
		},
		{
			name: 'Bagchal',
			description: 'Play the traditional Nepali tiger-goat strategy game.',
			slug: 'bagchal',
			icon: '/icons/tiger.svg',
			blogSlug: 'bagchal-reforged-ai-chess-tigers',
			blogTitle: 'Bagchal Reforged: AI Chess with Tigers and Goats'
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
	<title>Labs | anishshrestha.com</title>
</svelte:head>

<main class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
	<TwoColumnShell>
		{#snippet left()}
			<!-- Labs description -->
			<section class="section-card">
				<h3 class="section-title text-lg">Labs</h3>
				<p class="text-text-muted text-sm leading-relaxed">
					This is my experimental playground where I build interactive projects, test new ideas, and
					prototype concepts. Each lab is a hands-on exploration of deifferent technologies and game
					mechanics. If you find a bug, report it on Github or drop me a message.
				</p>
			</section>
		{/snippet}

		<!-- Main column -->
		<div class="flex flex-col">
			{#each experiments as experiment (experiment.slug)}
				<section
					class="section-card flex flex-row items-start justify-between rounded-none"
					style="gap: var(--space-4);"
				>
					<!-- Text content -->
					<div class="flex flex-1 flex-col" style="gap: var(--space-2);">
						<h2 class="section-title m-0 text-xl">{experiment.name}</h2>
						<p class="text-text-muted text-sm leading-relaxed">{experiment.description}</p>
						<div
							class="flex flex-wrap items-center"
							style="margin-top: var(--space-1); gap: var(--space-2);"
						>
							<a
								href={`/labs/${experiment.slug}`}
								class="btn inline-flex items-center"
								style="gap: var(--space-2);"
							>
								<span>Play</span>
							</a>
							{#if experiment.blogSlug}
								<a
									href={`/blog/${experiment.blogSlug}`}
									class="btn-secondary inline-flex items-center"
									style="gap: var(--space-2);"
									title={experiment.blogTitle}
								>
									<BookOpen size={16} />
									<span>Read the Story</span>
								</a>
							{/if}
						</div>
					</div>
					<!-- Icon -->
					<div class="flex h-16 w-16 flex-shrink-0 items-center justify-center">
						{#if experiment.icon === 'grid'}
							<Grid3x3 size={48} />
						{:else if experiment.icon === 'barchart'}
							<BarChart3 size={48} />
						{:else}
							<img src={experiment.icon} alt={experiment.name} class="h-16 w-16 flex-shrink-0" />
						{/if}
					</div>
				</section>
			{/each}
		</div>
	</TwoColumnShell>
</main>
