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
	<meta name="description" content="Anish Shrestha - Go & Python Developer in Kathmandu, Nepal. Building distributed systems and web applications. Available for remote work worldwide." />
	<meta name="keywords" content="Nepal software developer, Kathmandu web developer, Go developer Nepal, SvelteKit developer, remote developer Nepal, Python developer Kathmandu, software engineer Nepal" />
	<meta name="author" content="Anish Shrestha" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content="en" />
	<meta name="geo.region" content="NP-BA" />
	<meta name="geo.placename" content="Kathmandu, Nepal" />
	<meta name="geo.position" content="27.7172;85.3240" />
	<meta name="ICBM" content="27.7172, 85.3240" />
	<title>Anish Shrestha - Go Developer Nepal | Remote Software Engineer</title>
	
	<!-- Open Graph -->
	<meta property="og:title" content="Anish Shrestha - Go Developer Nepal | Remote Software Engineer" />
	<meta property="og:description" content="Go & Python developer from Kathmandu, Nepal. Building distributed systems and web applications. Available for remote work worldwide." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://anishshrestha.com" />
	<meta property="og:site_name" content="Anish Shrestha" />
	<meta property="og:locale" content="en_US" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Anish Shrestha - Go Developer Nepal" />
	<meta name="twitter:description" content="Go & Python developer from Kathmandu, Nepal. Building distributed systems and web applications." />
	
	<!-- JSON-LD Schema -->
	<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "Person",
		"name": "Anish Shrestha",
		"jobTitle": "Software Engineer",
		"description": "Go and Python developer specializing in distributed systems and web applications",
		"url": "https://anishshrestha.com",
		"sameAs": [
			"https://github.com/VoidArchive",
			"https://linkedin.com/in/theinanish"
		],
		"address": {
			"@type": "PostalAddress",
			"addressLocality": "Kathmandu",
			"addressCountry": "Nepal"
		},
		"knowsAbout": [
			"Go Programming",
			"Python Development",
			"Distributed Systems",
			"SvelteKit",
			"PostgreSQL",
			"Software Architecture"
		],
		"workLocation": {
			"@type": "Place",
			"name": "Remote / Kathmandu, Nepal"
		}
	}
	</script>
	

</svelte:head>

{@render children()}
