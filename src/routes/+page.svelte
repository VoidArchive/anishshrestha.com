<script lang="ts">
	import ProfileSection from '$lib/components/ProfileSection.svelte';
	import TechStack from '$lib/components/TechStack.svelte';
	import Links from '$lib/components/Links.svelte';
	import AboutMe from '$lib/components/AboutMe.svelte';
	import LatestPosts from '$lib/components/LatestPosts.svelte';
	import FeaturedProjects from '$lib/components/FeaturedProjects.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="container min-h-[calc(100vh-100px)] pb-8 lg:pb-8">
	<div class="main-grid">
		<!-- Left Column -->
		<aside class="flex flex-col">
			<ProfileSection />
			<Links />
			<TechStack />
		</aside>

		<!-- Right Column -->
		<section class="flex flex-col">
			<AboutMe />
			<FeaturedProjects />
			<LatestPosts posts={data.latestPosts} />
		</section>
	</div>
</main>
