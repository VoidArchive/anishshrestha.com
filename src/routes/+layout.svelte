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
		content="Anish Shrestha - Full-Stack Software Developer in Kathmandu, Nepal. Building web applications, distributed systems, and interactive experiences. Specializing in Go, Python, SvelteKit, and modern development practices."
	/>
	<meta
		name="keywords"
		content="software developer Nepal, full stack developer Nepal, Kathmandu web developer, Nepal programmer, software engineer Nepal, Go developer, Python developer, SvelteKit developer, remote developer Nepal, web development Nepal, software development Nepal, tech talent Nepal"
	/>
	<meta name="author" content="Anish Shrestha" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content="en" />
	<meta name="geo.region" content="NP-BA" />
	<meta name="geo.placename" content="Kathmandu, Nepal" />
	<meta name="geo.position" content="27.7172;85.3240" />
	<meta name="ICBM" content="27.7172, 85.3240" />
	<title>Anish Shrestha - Software Developer Nepal | Full-Stack Engineer & Tech Innovator</title>

	<!-- Open Graph -->
	<meta
		property="og:title"
		content="Anish Shrestha - Software Developer Nepal | Full-Stack Engineer & Tech Innovator"
	/>
	<meta
		property="og:description"
		content="Full-stack software developer from Kathmandu, Nepal. Creating web applications, distributed systems, and interactive experiences with modern technologies. Available for remote collaboration worldwide."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://anishshrestha.com" />
	<meta property="og:site_name" content="Anish Shrestha" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Anish Shrestha - Software Developer Nepal" />
	<meta
		name="twitter:description"
		content="Full-stack software developer from Kathmandu, Nepal. Creating web applications, distributed systems, and interactive experiences."
	/>

	<!-- JSON-LD Schema -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": "Anish Shrestha",
			"jobTitle": "Software Developer",
			"description": "Full-stack software developer specializing in web applications, distributed systems, and interactive experiences. Expert in Go, Python, SvelteKit, and modern development practices.",
			"url": "https://anishshrestha.com",
			"sameAs": ["https://github.com/VoidArchive", "https://linkedin.com/in/theinanish"],
			"address": {
				"@type": "PostalAddress",
				"addressLocality": "Kathmandu",
				"addressCountry": "Nepal"
			},
			"knowsAbout": [
				"Software Development",
				"Full-Stack Development",
				"Web Development",
				"Go Programming",
				"Python Development",
				"JavaScript",
				"TypeScript",
				"SvelteKit",
				"React",
				"Node.js",
				"PostgreSQL",
				"Distributed Systems",
				"Software Architecture",
				"API Design",
				"DevOps",
				"Docker",
				"Linux",
				"AWS",
				"Algorithm Design",
				"Data Structures"
			],
			"workLocation": {
				"@type": "Place",
				"name": "Remote / Kathmandu, Nepal"
			},
			"hasOccupation": {
				"@type": "Occupation",
				"name": "Software Developer",
				"occupationLocation": {
					"@type": "Country",
					"name": "Nepal"
				},
				"skills": [
					"Full-Stack Development",
					"Backend Development",
					"Frontend Development",
					"Web Application Development",
					"Distributed Systems",
					"Software Architecture",
					"Algorithm Implementation",
					"Database Design",
					"API Development",
					"DevOps Practices"
				]
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
