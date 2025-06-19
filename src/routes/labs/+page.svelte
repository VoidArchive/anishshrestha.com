<script lang="ts">
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';
	import { Grid3x3, BarChart3 } from 'lucide-svelte';
	// Simple list of labs/experiments – can be replaced with fetched data later
	const experiments = [
		{
			name: 'DSA Visualizer',
			description: 'Interactive visualization of sorting algorithms and data structures with step-by-step animations.',
			slug: 'dsa-visualizer',
			icon: 'barchart'
		},
		{
			name: 'Game of Life',
			description: "Conway's cellular automaton - watch patterns evolve and create your own.",
			slug: 'gameoflife',
			icon: 'grid'
		},
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
	<title>Labs | anishshrestha.com</title>
</svelte:head>

<main class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
	<TwoColumnShell>
		<svelte:fragment slot="left">
			<!-- Labs description -->
			<section class="section-card">
				<h3 class="section-title text-lg">Labs</h3>
				<p class="text-text-muted text-sm leading-relaxed">
					This is my experimental playground where I build interactive projects, test new ideas, and
					prototype concepts. Each lab is a hands-on exploration of different technologies and game
					mechanics.
				</p>
			</section>
		</svelte:fragment>

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
						<a
							href={`/labs/${experiment.slug}`}
							class="btn inline-flex w-max items-center"
							style="margin-top: var(--space-1); gap: var(--space-2);"
						>
							<span>Play</span>
						</a>
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
