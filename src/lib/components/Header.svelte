<script lang="ts">
	import { page } from '$app/state';
	
	$: currentPath = page.url.pathname;
</script>

<header class="py-4 border-b border-border">
	<div class="container">
		<div class="flex justify-between items-center flex-col lg:flex-row gap-4 lg:gap-0">
			<div class="text-2xl font-bold text-text-primary">
				<a href="/">Anish</a>
			</div>
			<nav class="flex items-center gap-2 flex-wrap justify-center">
				<a href="/bagchal" 
				   class="nav-link {currentPath === '/bagchal' ? 'active' : ''}">Bagchal</a>
				<span class="text-text-secondary mx-1">/</span>
				<a href="/blog" 
				   class="nav-link {currentPath.startsWith('/blog') ? 'active' : ''}">Blog</a>
				<span class="text-text-secondary mx-1">/</span>
				<a href="/projects" 
				   class="nav-link {currentPath === '/projects' ? 'active' : ''}">Projects</a>
			</nav>
		</div>
	</div>
</header>

<style>
	.nav-link {
		color: #f8f8f8;
		transition: color 0.3s ease;
		font-size: 1rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		text-decoration: none;
	}
	
	.nav-link:hover {
		color: #c92a2a;
	}
	
	.nav-link.active {
		background-color: #c92a2a;
		color: #f8f8f8;
		padding: 0.25rem 0.5rem;
		border-radius: 0;
	}
	
	.nav-link:focus {
		outline: none;
	}
</style> 