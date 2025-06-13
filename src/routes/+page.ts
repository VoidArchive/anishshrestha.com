import { getBlogPosts } from '$lib/utils/blog';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = async () => {
	const allPosts = await getBlogPosts();
	const latestPosts = allPosts.slice(0, 2); // Get only the 2 most recent posts

	return {
		latestPosts
	};
};
