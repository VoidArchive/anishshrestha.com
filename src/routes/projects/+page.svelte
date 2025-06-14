<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';

	const projects = [
		{
			title: 'Bagchal – Nepali Strategy Game',
			description: 'Browser implementation of Bagchal, the traditional Nepali Tigers & Goats board game. Features AI opponent and an upcoming Reforged rule set.',
			tech: ['SvelteKit', 'TypeScript', 'Game', 'AI'],
			repo: 'https://github.com/VoidArchive/anishshrestha.com/tree/main/src/games/bagchal',
			demo: '/games/bagchal'
		},
		{
			title: 'Advent of Go',
			description: 'My attempt at Advent of Code 2024 using Go. Some solutions are elegant, others are brute force. All of them work eventually. Includes notes on what I learned.',
			tech: ['Go', 'Algorithms', 'AoC2024'],
			repo: 'https://github.com/VoidArchive/advent-of-go',
			demo: null
		},
		{
			title: 'Gator – CLI RSS Aggregator',
			description: 'Gator is a command-line RSS reader written in Go. Import OPML files, follow feeds, browse fresh posts in a Vim-like interface— all without leaving your terminal.',
			tech: ['Go', 'PostgreSQL', 'sqlc'],
			repo: 'https://github.com/VoidArchive/gator',
			demo: null
		},
		{
			title: 'Pokedex – Terminal Pokédex',
			description: 'Nostalgia project. Catch Pokémon in your terminal because why not. Uses the PokéAPI and caches everything locally so you can play offline.',
			tech: ['Go', 'CLI', 'PokéAPI'],
			repo: 'https://github.com/VoidArchive/pokedex',
			demo: null
		},
		{
			title: 'Conway of Life – TUI Simulator',
			description: 'Classic Game of Life with a terminal interface. Load patterns or just hit space and watch evolution.',
			tech: ['Go', 'TUI', 'ncurses'],
			repo: 'https://github.com/VoidArchive/conway_of_life',
			demo: null
		},
		{
			title: 'Maze Solver – Path-finding Visualizer',
			description: 'Generates random mazes and visualises BFS/DFS solving them. Built to understand path-finding.',
			tech: ['Python', 'Algorithms', 'Dijkstra/A*', 'BFS/DFS'],
			repo: 'https://github.com/VoidArchive/maze-solver',
			demo: null
		},
		{
			title: 'Markdown Renderer – Static Site Generator',
			description: 'Yet another static site generator. Converts markdown to HTML. Powers my old coursework blog.',
			tech: ['Python', 'Markdown', 'SSG'],
			repo: 'https://github.com/VoidArchive/markdown-renderer',
			demo: null
		}
		
	];

	// Collect unique tech tags for sidebar
	const techTags: string[] = Array.from(new Set(projects.flatMap((p) => p.tech)));
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

<main class="container py-8">
	<TwoColumnShell leftGap="gap-2">
		<svelte:fragment slot="left">
			<section class="section-card p-4">
				<h3 class="section-title mb-4 text-lg">Tech</h3>
				<div class="flex flex-wrap gap-2">
					{#each techTags as tag}
						<span class="badge cursor-pointer select-none">{tag}/</span>
					{/each}
				</div>
			</section>
		</svelte:fragment>

		<div class="w-full">
			<section class="flex flex-col gap-4 pb-16">
				{#each projects as p (p.title)}
					<ProjectCard title={p.title} description={p.description} tech={p.tech} repo={p.repo} demo={p.demo} />
				{/each}
			</section>
		</div>
	</TwoColumnShell>
</main>
