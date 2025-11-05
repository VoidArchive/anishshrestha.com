import { getBlogPosts } from '$lib/utils/blog';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const allPosts = await getBlogPosts();

	return {
		latestPosts: allPosts.slice(0, 2)
	};
};
