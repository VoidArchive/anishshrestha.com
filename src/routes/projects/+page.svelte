<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';

	const projects = [
		{
			title: 'NepseAuth – NEPSE API Go Library',
			description:
				'Modern Go library for accessing Nepal Stock Exchange (NEPSE) API. Features type-safe client, automatic authentication, retry logic, and comprehensive market data retrieval.',
			tech: ['Go', 'API', 'Finance', 'NEPSE'],
			repo: 'https://github.com/VoidArchive/nepseauth',
			demo: null
		},
		{
			title: 'Bagchal – Nepali Strategy Game',
			description:
				'Browser implementation of Bagchal, the traditional Nepali Tigers & Goats board game. Features AI opponent with Easy and Hard difficulty levels.',
			tech: ['SvelteKit', 'TypeScript', 'Game', 'AI'],
			repo: 'https://github.com/VoidArchive/anishshrestha.com/tree/main/src/games/bagchal',
			demo: '/labs/bagchal'
		},
		{
			title: 'Advent of Go',
			description:
				'My attempt at Advent of Code 2024 using Go. Some solutions are elegant, others are brute force. All of them work eventually. Includes notes on what I learned.',
			tech: ['Go', 'Algorithms', 'AoC2024'],
			repo: 'https://github.com/VoidArchive/advent-of-go',
			demo: null
		},
		{
			title: 'Gator – CLI RSS Aggregator',
			description:
				'Gator is a command-line RSS reader written in Go. Import OPML files, follow feeds, browse fresh posts in a Vim-like interface— all without leaving your terminal.',
			tech: ['Go', 'PostgreSQL', 'sqlc'],
			repo: 'https://github.com/VoidArchive/gator',
			demo: null
		},
		{
			title: 'Pokedex – Terminal Pokédex',
			description:
				'Nostalgia project. Catch Pokémon in your terminal because why not. Uses the PokéAPI and caches everything locally so you can play offline.',
			tech: ['Go', 'CLI', 'PokéAPI'],
			repo: 'https://github.com/VoidArchive/pokedex',
			demo: null
		},
		{
			title: 'Conway of Life – TUI Simulator',
			description:
				'Classic Game of Life with a terminal interface. Load patterns or just hit space and watch evolution.',
			tech: ['Go', 'TUI', 'ncurses'],
			repo: 'https://github.com/VoidArchive/conway_of_life',
			demo: null
		},
		{
			title: 'Maze Solver – Path-finding Visualizer',
			description:
				'Generates random mazes and visualises BFS/DFS solving them. Built to understand path-finding.',
			tech: ['Python', 'Algorithms', 'Dijkstra/A*', 'BFS/DFS'],
			repo: 'https://github.com/VoidArchive/maze-solver',
			demo: null
		},
		{
			title: 'Markdown Renderer – Static Site Generator',
			description:
				'Yet another static site generator. Converts markdown to HTML. Powers my old coursework blog.',
			tech: ['Python', 'Markdown', 'SSG'],
			repo: 'https://github.com/VoidArchive/markdown-renderer',
			demo: null
		}
	];

	// Removed unused techTags variable
</script>

<svelte:head>
	<title>Projects - Full-Stack Software Developer Portfolio | Anish Shrestha</title>
	<meta
		name="description"
		content="Open source projects by Anish Shrestha - Full-stack applications, web tools, algorithms, and interactive experiences. Showcasing modern software development practices from Nepal."
	/>
	<meta
		name="keywords"
		content="software developer portfolio Nepal, full stack projects, web applications Nepal, open source projects, interactive demos, programming portfolio Nepal, software development showcase"
	/>
	<meta property="og:title" content="Projects - Full-Stack Software Developer Portfolio" />
	<meta
		property="og:description"
		content="Open source projects by Anish Shrestha - Full-stack applications, web tools, algorithms, and interactive experiences from Nepal."
	/>
	<meta property="og:url" content="https://anishshrestha.com/projects" />
</svelte:head>

<main class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
	<TwoColumnShell>
		{#snippet left()}
			<section class="section-card">
				<h3 class="section-title text-lg">Projects</h3>
				<p class="text-text-muted text-sm leading-relaxed">
					A collection of open-source projects and personal experiments. From CLI tools and
					algorithms to web applications and games, these projects showcase different aspects of
					software development using Go, Python, and modern web technologies.
				</p>
			</section>
		{/snippet}

		<div class="w-full">
			<section class="flex flex-col" style="gap: var(--space-4); padding-bottom: var(--space-16);">
				{#each projects as p (p.title)}
					<ProjectCard
						title={p.title}
						description={p.description}
						tech={p.tech}
						repo={p.repo}
						demo={p.demo}
					/>
				{/each}
			</section>
		</div>
	</TwoColumnShell>
</main>
