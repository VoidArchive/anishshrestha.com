import { getBlogPosts } from '$lib/utils/blog.js';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = async () => {
	const posts = await getBlogPosts();
	
	return {
		posts
	};
}; 