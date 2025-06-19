<script lang="ts">
	import '../app.css';
	import { onNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

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
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="Anish Shrestha - Go & Python Developer in Kathmandu, Nepal. Building distributed systems and web applications. Available for remote work worldwide."
	/>
	<meta
		name="keywords"
		content="Nepal software developer, Kathmandu web developer, Go developer Nepal, SvelteKit developer, remote developer Nepal, Python developer Kathmandu, software engineer Nepal"
	/>
	<meta name="author" content="Anish Shrestha" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content="en" />
	<meta name="geo.region" content="NP-BA" />
	<meta name="geo.placename" content="Kathmandu, Nepal" />
	<meta name="geo.position" content="27.7172;85.3240" />
	<meta name="ICBM" content="27.7172, 85.3240" />
	<title>Anish Shrestha - Go Developer Nepal | Remote Software Engineer</title>

	<!-- Open Graph -->
	<meta
		property="og:title"
		content="Anish Shrestha - Go Developer Nepal | Remote Software Engineer"
	/>
	<meta
		property="og:description"
		content="Go & Python developer from Kathmandu, Nepal. Building distributed systems and web applications. Available for remote work worldwide."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://anishshrestha.com" />
	<meta property="og:site_name" content="Anish Shrestha" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Anish Shrestha - Go Developer Nepal" />
	<meta
		name="twitter:description"
		content="Go & Python developer from Kathmandu, Nepal. Building distributed systems and web applications."
	/>

	<!-- JSON-LD Schema -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": "Anish Shrestha",
			"jobTitle": "Software Engineer",
			"description": "Go and Python developer specializing in distributed systems and web applications",
			"url": "https://anishshrestha.com",
			"sameAs": ["https://github.com/VoidArchive", "https://linkedin.com/in/theinanish"],
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
	<script
		defer
		src="https://cloud.umami.is/script.js"
		data-website-id="b7abb816-2b4e-4807-bddb-f31649532505"
	></script>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header />

	<div class="flex-1">
		{@render children()}
	</div>
	<Footer />
</div>
