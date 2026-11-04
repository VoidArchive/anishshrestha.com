import { getBlogPosts } from '#lib/utils/blog.js';
import type { LayoutLoad } from './$types';

// The running head numbers the "issue" by published notes on every route
export const load: LayoutLoad = async () => {
	const posts = await getBlogPosts();
	return { postCount: posts.length };
};
