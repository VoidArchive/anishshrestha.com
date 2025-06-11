<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
</script>

<svelte:head>
	<title>Projects - Go & Python Developer Nepal | Anish Shrestha</title>
	<meta name="description" content="Open source projects by Anish Shrestha - Go and Python applications including CLI tools, web apps, and algorithms. Nepal software developer portfolio." />
	<meta name="keywords" content="Nepal developer projects, Go programming Nepal, Python projects Kathmandu, open source Nepal, CLI tools Go, software portfolio Nepal" />
	<meta property="og:title" content="Projects - Go & Python Developer Nepal" />
	<meta property="og:description" content="Open source projects by Anish Shrestha - Go and Python applications including CLI tools, web apps, and algorithms." />
	<meta property="og:url" content="https://anishshrestha.com/projects" />
</svelte:head>

<Header />

<main class="container">
	<div class="py-8 text-center">
		<h1 class="text-primary-red text-4xl mb-4">Projects</h1>
		<p class="text-text-secondary text-lg">A curated selection of things I've hacked together recently.</p>
	</div>

	<section class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
		<ProjectCard
			title="Advent of Go – Advent of Code 2024 Solutions"
			description="My attempt at Advent of Code 2024 using Go. Some solutions are elegant, others are brute force. All of them work eventually. Includes notes on what I learned."
			tech={[
				'Go',
				'Algorithms',
				'AoC2024'
			]}
			repo="https://github.com/VoidArchive/advent-of-go"
		/>

		<ProjectCard
			title="Gator – CLI RSS Aggregator"
			description="Gator is a command-line RSS reader written in Go. Import OPML files, follow other users' feeds, and browse fresh posts in a Vim-like interface— all without leaving your terminal. Built for speed, minimalism and offline-first reading."
			tech={[
				'Go',
				'PostgreSQL',
				'sqlc',
			]}
			repo="https://github.com/VoidArchive/gator"
		/>

		<ProjectCard
			title="Pokedex – Terminal Pokédex"
			description="Nostalgia project. Catch Pokémon in your terminal because why not. Uses the PokéAPI and caches everything locally so you can play offline."
			tech={[
				'Go',
				'CLI',
				'PokéAPI',
			]}
			repo="https://github.com/VoidArchive/pokedex"
		/>

		<ProjectCard
			title="Conway of Life – TUI Simulator"
			description="Classic Game of Life with a terminal interface. Surprisingly relaxing to watch patterns evolve. Load your own patterns or just hit space and see what happens."
			tech={[
				'Go',
				'TUI',
				'ncurses'
			]}
			repo="https://github.com/VoidArchive/conway_of_life"
		/>

		<ProjectCard
			title="Maze Solver – Path-finding Visualizer"
			description="Generates random mazes and watches BFS/DFS algorithms solve them. Made this to understand pathfinding algorithms better. Pretty colors included."
			tech={[
				'Python',
				'Algorithms',
				'Dijkstra/A*',
				'BFS/DFS'
			]}
			repo="https://github.com/VoidArchive/maze-solver"
		/>

		<ProjectCard
			title="Markdown Renderer – Static Site Generator"
			description="Yet another static site generator because the world clearly needed one more. Converts markdown to HTML. Nothing fancy, just works. Powers my old coursework blog."
			tech={[
				'Python',
				'Markdown',
				'SSG'
			]}
			repo="https://github.com/VoidArchive/markdown-renderer"
		/>
	</section>
</main>