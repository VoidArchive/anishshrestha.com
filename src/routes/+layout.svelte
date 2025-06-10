<script lang="ts">
	import '../app.css';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import { page } from '$app/state';

	let { children } = $props();

	// Use the native View Transitions API for smooth page transitions
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// Add copy buttons to all code blocks after navigation
	afterNavigate(() => {
		// Wait for the DOM to be fully ready, especially for MDsvex content
		setTimeout(() => {
			addCopyButtons();
		}, 200);
	});

	function addCopyButtons() {
		const codeBlocks = document.querySelectorAll('pre > code');
		
		for (const codeElement of codeBlocks) {
			const preElement = codeElement.parentElement;
			if (!preElement || preElement.querySelector('.copy-code-button')) continue;

			const button = document.createElement('button');
			button.className = 'copy-code-button';
			button.setAttribute('aria-label', 'Copy code to clipboard');
			button.innerHTML = `
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
				</svg>
			`;
			
			button.onclick = async () => {
				try {
					await navigator.clipboard.writeText(codeElement.textContent || '');
					button.innerHTML = `
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20,6 9,17 4,12"/>
						</svg>
					`;
					button.classList.add('copied');
					
					setTimeout(() => {
						button.innerHTML = `
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
							</svg>
						`;
						button.classList.remove('copied');
					}, 2000);
				} catch (err) {
					console.error('Failed to copy text: ', err);
				}
			};

			preElement.appendChild(button);
		}
	}
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="description" content="Anish Shrestha - Software Engineer based in Nepal. Building distributed systems with Go and Python." />
	<meta name="keywords" content="Software Engineer, Go, Python, SvelteKit, TypeScript, PostgreSQL, Nepal" />
	<meta name="author" content="Anish Shrestha" />
	<title>Anish Shrestha - Software Engineer</title>
	
	<!-- Open Graph -->
	<meta property="og:title" content="Anish Shrestha - Software Engineer" />
	<meta property="og:description" content="Software Engineer based in Nepal. Building distributed systems with Go and Python." />
	<meta property="og:type" content="website" />
	
	<!-- Preload fonts -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
</svelte:head>

{@render children()}
