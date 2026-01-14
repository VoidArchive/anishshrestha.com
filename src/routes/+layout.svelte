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
	<title>Anish Shrestha | Software Developer</title>

	<!-- Open Graph -->
	<meta property="og:title" content="Anish Shrestha | Software Developer" />
	<meta
		property="og:description"
		content="Full-stack software developer from Kathmandu, Nepal. Creating web applications, distributed systems, and interactive experiences with modern technologies. Available for remote collaboration worldwide."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://anishshrestha.com" />
	<meta property="og:site_name" content="Anish Shrestha" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:image" content="https://anishshrestha.com/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Anish Shrestha - Software Developer from Nepal" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Anish Shrestha | Software Developer" />
	<meta
		name="twitter:description"
		content="Full-stack software developer from Kathmandu, Nepal. Creating web applications, distributed systems, and interactive experiences."
	/>
	<meta name="twitter:image" content="https://anishshrestha.com/og-image.png" />
	<meta name="twitter:image:alt" content="Anish Shrestha - Software Developer from Nepal" />

	<!-- JSON-LD Schema -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": "Anish Shrestha",
			"jobTitle": "Go Software Engineer",
			"alternateName": ["Anish", "VoidArchive"],
			"description": "Trusted Go (Golang) software engineer specializing in backend systems, SDK development, payment integrations, and distributed systems. Expert in building production-ready APIs, developer tools, and financial technology applications. Available for remote work worldwide.",
			"url": "https://anishshrestha.com",
			"image": "https://anishshrestha.com/og-image.png",
			"sameAs": ["https://github.com/VoidArchive", "https://linkedin.com/in/theinanish"],
			"address": {
				"@type": "PostalAddress",
				"addressLocality": "Kathmandu",
				"addressRegion": "Bagmati",
				"addressCountry": "Nepal"
			},
			"knowsAbout": [
				"Go",
				"Golang",
				"Go Programming Language",
				"Backend Development",
				"SDK Development",
				"API Development",
				"Payment Gateway Integration",
				"Financial Technology",
				"Distributed Systems",
				"Software Architecture",
				"Full-Stack Development",
				"SvelteKit",
				"TypeScript",
				"Python",
				"PostgreSQL",
				"Docker",
				"Linux",
				"AWS",
				"gRPC",
				"Protocol Buffers",
				"WebAssembly",
				"REST APIs"
			],
			"knowsLanguage": ["en", "ne"],
			"workLocation": {
				"@type": "Place",
				"name": "Remote / Kathmandu, Nepal"
			},
			"hasOccupation": {
				"@type": "Occupation",
				"name": "Go Software Engineer",
				"description": "Specializes in Go backend development, SDK creation, and payment system integrations",
				"occupationLocation": {
					"@type": "Country",
					"name": "Nepal"
				},
				"skills": [
					"Go/Golang Development",
					"Backend Engineering",
					"SDK Development",
					"Payment System Integration",
					"API Design and Development",
					"Distributed Systems",
					"Software Architecture",
					"Database Design",
					"DevOps Practices",
					"Technical Documentation"
				]
			},
			"hasCredential": [
				{
					"@type": "EducationalOccupationalCredential",
					"credentialCategory": "Professional Experience",
					"name": "Go Backend Development",
					"description": "Extensive experience building production Go applications including payment SDKs, API clients, and financial systems"
				}
			],
			"makesOffer": {
				"@type": "Offer",
				"itemOffered": {
					"@type": "Service",
					"name": "Go Software Development Services",
					"description": "Backend development, SDK creation, API development, and payment integrations using Go. Available for remote contract work and consulting.",
					"provider": {
						"@type": "Person",
						"name": "Anish Shrestha"
					}
				}
			},
			"mainEntityOfPage": {
				"@type": "WebPage",
				"@id": "https://anishshrestha.com"
			}
		}
	</script>

	<!-- Work Samples Schema -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "ItemList",
			"name": "Go Projects by Anish Shrestha",
			"description": "Open source Go projects demonstrating expertise in SDK development, API clients, and payment integrations",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"item": {
						"@type": "SoftwareSourceCode",
						"name": "nepal-payment-go",
						"description": "Unified payment SDK for Nepal in Go. Integrates eSewa, Khalti, ConnectIPS, and FonePay with a single interface. Handles HMAC-SHA256, HMAC-SHA512, and RSA-SHA256 signatures.",
						"programmingLanguage": "Go",
						"codeRepository": "https://github.com/voidarchive/nepal-payment-go",
						"author": {
							"@type": "Person",
							"name": "Anish Shrestha",
							"url": "https://anishshrestha.com"
						},
						"keywords": ["Go", "Golang", "Payment SDK", "eSewa", "Khalti", "Nepal", "Fintech"]
					}
				},
				{
					"@type": "ListItem",
					"position": 2,
					"item": {
						"@type": "SoftwareSourceCode",
						"name": "go-nepse",
						"description": "Type-safe Go client for the NEPSE (Nepal Stock Exchange) API. Features automatic token handling via embedded WebAssembly, structured errors, retries, and clean modular design.",
						"programmingLanguage": "Go",
						"codeRepository": "https://github.com/voidarchive/go-nepse",
						"author": {
							"@type": "Person",
							"name": "Anish Shrestha",
							"url": "https://anishshrestha.com"
						},
						"keywords": ["Go", "Golang", "NEPSE", "Stock Market", "API Client", "Nepal", "Fintech"]
					}
				},
				{
					"@type": "ListItem",
					"position": 3,
					"item": {
						"@type": "WebApplication",
						"name": "NTX",
						"description": "Financial research platform for Nepal Stock Exchange. Go backend with Protobuf APIs and SvelteKit frontend. Features real-time market data, company fundamentals, and portfolio tracking.",
						"url": "https://ntx.anishshrestha.com",
						"applicationCategory": "FinanceApplication",
						"author": {
							"@type": "Person",
							"name": "Anish Shrestha",
							"url": "https://anishshrestha.com"
						},
						"keywords": ["Go", "Golang", "NEPSE", "Stock Market", "Financial Research", "Nepal"]
					}
				}
			]
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
