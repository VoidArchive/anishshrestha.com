<script lang="ts">
	const projects = [
		{
			title: 'nepal-payment-go',
			kind: 'Unified payment SDK',
			description:
				'One Go SDK for eSewa, Khalti, ConnectIPS and FonePay behind a single type-safe interface. Handles HMAC-SHA256, HMAC-SHA512 and RSA-SHA256 signatures with zero external dependencies.',
			tech: ['Go', 'SDK', 'eSewa', 'Khalti'],
			repo: 'https://github.com/VoidArchive/nepal-payment-go',
			demo: null
		},
		{
			title: 'go-nepse',
			kind: 'NEPSE API client',
			description:
				'Type-safe Go client for the Nepal Stock Exchange API. Automatic token handling through embedded WebAssembly (wazero), structured errors, exponential backoff retries.',
			tech: ['Go', 'API', 'NEPSE', 'WASM'],
			repo: 'https://github.com/VoidArchive/go-nepse',
			demo: null
		},
		{
			title: 'NTX',
			kind: 'Stock research platform',
			description:
				'Financial research for the Nepal Stock Exchange. Go backend with Protobuf APIs, SvelteKit frontend. Stock screener, company fundamentals, real-time market data, portfolio tracking.',
			tech: ['Go', 'SvelteKit', 'Protobuf', 'FinTech'],
			repo: 'https://github.com/voidarchive/ntx',
			demo: 'https://ntx.anishshrestha.com'
		},
		{
			title: 'Bagchal',
			kind: 'Nepali strategy game',
			description:
				'Browser implementation of the traditional tigers-and-goats board game, with a minimax opponent at two difficulty levels.',
			tech: ['SvelteKit', 'TypeScript', 'Game', 'AI'],
			repo: 'https://github.com/VoidArchive/anishshrestha.com/tree/main/src/labs/bagchal',
			demo: '/labs/bagchal'
		},
		{
			title: 'Advent of Go',
			kind: 'Advent of Code 2024',
			description:
				'Advent of Code 2024 in Go. Some solutions are elegant, others are brute force. All of them work eventually, and the notes say which is which.',
			tech: ['Go', 'Algorithms', 'AoC 2024'],
			repo: 'https://github.com/VoidArchive/advent-of-go',
			demo: null
		},
		{
			title: 'Gator',
			kind: 'CLI RSS aggregator',
			description:
				'A command-line RSS reader in Go. Import OPML files, follow feeds, and browse fresh posts in a Vim-like interface without leaving the terminal.',
			tech: ['Go', 'PostgreSQL', 'sqlc'],
			repo: 'https://github.com/VoidArchive/gator',
			demo: null
		},
		{
			title: 'Pokedex',
			kind: 'Terminal Pokédex',
			description:
				'Catch Pokémon in your terminal. Uses the PokéAPI and caches everything locally so it works offline.',
			tech: ['Go', 'CLI', 'PokéAPI'],
			repo: 'https://github.com/VoidArchive/pokedex',
			demo: null
		},
		{
			title: 'Conway of Life',
			kind: 'TUI simulator',
			description:
				'The Game of Life with a terminal interface. Load patterns or hit space and watch evolution.',
			tech: ['Go', 'TUI', 'ncurses'],
			repo: 'https://github.com/VoidArchive/conway_of_life',
			demo: null
		},
		{
			title: 'Maze Solver',
			kind: 'Path-finding visualizer',
			description:
				'Generates random mazes and visualises BFS and DFS solving them. Built to understand path-finding.',
			tech: ['Python', 'Algorithms', 'BFS/DFS'],
			repo: 'https://github.com/VoidArchive/maze-solver',
			demo: null
		},
		{
			title: 'Markdown Renderer',
			kind: 'Static site generator',
			description:
				'Yet another static site generator. Converts markdown to HTML; powered an older coursework blog.',
			tech: ['Python', 'Markdown', 'SSG'],
			repo: 'https://github.com/VoidArchive/markdown-renderer',
			demo: null
		}
	];
</script>

<svelte:head>
	<title>Instruments – Projects | Anish Shrestha</title>
	<meta
		name="description"
		content="Open source projects by Anish Shrestha: Go libraries for Nepal's payment providers and stock exchange, a stock research platform, games, CLI tools, and algorithm experiments."
	/>
	<meta property="og:title" content="Instruments – Projects | Anish Shrestha" />
	<meta property="og:url" content="https://anishshrestha.com/projects" />
</svelte:head>

<main class="page container">
	<h1 class="page-title">Instruments</h1>
	<p class="dek">
		Production Go libraries for Nepal's financial plumbing, then the smaller tools and experiments
		built along the way.
	</p>

	<ol class="ruled">
		{#each projects as p (p.title)}
			<li>
				<p class="meta">{p.kind} · {p.tech.join(' · ')}</p>
				<h2>{p.title}</h2>
				<p>{p.description}</p>
				<p class="meta links">
					<a href={p.repo} rel="noopener">Code</a>
					{#if p.demo}· <a href={p.demo} rel="noopener"
							>{p.demo.startsWith('/') ? 'Play' : 'Live'}</a
						>{/if}
				</p>
			</li>
		{/each}
	</ol>
</main>

<style>
	.links {
		margin: 0;
	}
	.links a {
		text-decoration: underline;
		text-decoration-color: var(--color-spot);
		text-underline-offset: 3px;
	}
</style>
