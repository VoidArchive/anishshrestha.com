<!--
Homepage Layout

Main landing page showcasing profile, latest labs, featured projects, and blog posts.
Uses two-column layout with profile/links on left and main content on right.
Enhanced with quick actions for immediate engagement and profile stats.
-->

<script lang="ts">
	import ProfileSection from '$lib/components/ProfileSection.svelte';
	import TechStack from '$lib/components/TechStack.svelte';
	import Links from '$lib/components/Links.svelte';
	import AboutMe from '$lib/components/AboutMe.svelte';
	import LatestLabs from '$lib/components/LatestLabs.svelte';
	import LatestPosts from '$lib/components/LatestPosts.svelte';
	import FeaturedProjects from '$lib/components/FeaturedProjects.svelte';
	import QuickActions from '$lib/components/QuickActions.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="container min-h-[calc(100vh-100px)]" style="padding-bottom: var(--space-8);">
	<div class="main-grid">
		<!-- Left Column -->
		<aside class="flex flex-col">
			<ProfileSection />
			<QuickActions />
			<Links />
			<TechStack />
		</aside>

		<!-- Right Column -->
		<section class="flex flex-col">
			<AboutMe />
			<LatestLabs />
			<FeaturedProjects />
			<LatestPosts posts={data.latestPosts} />
		</section>
	</div>
</main>
