<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ProfileSection from '$lib/components/ProfileSection.svelte';
	import TechStack from '$lib/components/TechStack.svelte';
	import Links from '$lib/components/Links.svelte';
	import AboutMe from '$lib/components/AboutMe.svelte';
	import LatestPosts from '$lib/components/LatestPosts.svelte';
	import FeaturedProjects from '$lib/components/FeaturedProjects.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Header />

<main class="container min-h-[calc(100vh-100px)] pb-8 lg:pb-8">
	<div class="main-grid">
		<!-- Left Column -->
		<aside class="flex flex-col">
			<ProfileSection />
			<TechStack />
			<Links />
		</aside>

		<!-- Right Column -->
		<section class="flex flex-col">
			<AboutMe />
			<LatestPosts posts={data.latestPosts} />
			<FeaturedProjects />
		</section>
	</div>
</main>
