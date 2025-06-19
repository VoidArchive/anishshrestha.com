<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';

	const projects = [
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
	<title>Projects - Go & Python Developer Nepal | Anish Shrestha</title>
	<meta
		name="description"
		content="Open source projects by Anish Shrestha - Go and Python applications including CLI tools, web apps, and algorithms. Nepal software developer portfolio."
	/>
	<meta
		name="keywords"
		content="Nepal developer projects, Go programming Nepal, Python projects Kathmandu, open source Nepal, CLI tools Go, software portfolio Nepal"
	/>
	<meta property="og:title" content="Projects - Go & Python Developer Nepal" />
	<meta
		property="og:description"
		content="Open source projects by Anish Shrestha - Go and Python applications including CLI tools, web apps, and algorithms."
	/>
	<meta property="og:url" content="https://anishshrestha.com/projects" />
</svelte:head>

<main class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
	<TwoColumnShell>
		<svelte:fragment slot="left">
			<section class="section-card">
				<h3 class="section-title text-lg">Projects</h3>
				<p class="text-text-muted text-sm leading-relaxed">
					A collection of open-source projects and personal experiments. From CLI tools and
					algorithms to web applications and games, these projects showcase different aspects of
					software development using Go, Python, and modern web technologies.
				</p>
			</section>
		</svelte:fragment>

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
