<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
</script>

<Header />

<main class="container">
	<div class="py-8 text-center">
		<h1 class="text-primary-red text-4xl mb-4">Projects</h1>
		<p class="text-text-secondary text-lg">A curated selection of things I've hacked together recently.</p>
	</div>

	<section class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
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
			description="Interactive command-line Pokédex written in Go. Explore locations, catch Pokémon, and inspect your collection right inside your terminal. Offline-first with local caching."
			tech={[
				'Go',
				'CLI',
				'PokéAPI',
			]}
			repo="https://github.com/VoidArchive/pokedex"
		/>

		<ProjectCard
			title="Conway of Life – TUI Simulator"
			description="A fast Conway's Game of Life simulator built with Go. Features a ncurses-based interface, adjustable speed, and pattern loading/saving."
			tech={[
				'Go',
				'TUI',
				'ncurses'
			]}
			repo="https://github.com/VoidArchive/conway_of_life"
		/>

		<ProjectCard
			title="Maze Solver – Path-finding Visualizer"
			description="Python application that generates mazes and visualizes BFS/DFS algorithms as they discover the shortest path from start to finish."
			tech={[
				'Python',
				'Algorithms',
				'BFS/DFS'
			]}
			repo="https://github.com/VoidArchive/maze-solver"
		/>

		<ProjectCard
			title="Markdown Renderer – Static Site Generator"
			description="Lightweight static site generator written in Python that converts Markdown content into styled HTML pages. Powers my Boot.dev coursework blog."
			tech={[
				'Python',
				'Markdown',
				'SSG'
			]}
			repo="https://github.com/VoidArchive/markdown-renderer"
		/>
	</section>
</main>