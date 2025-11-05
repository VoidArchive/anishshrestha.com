import { getBlogPost } from '$lib/utils/blog';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const post = await getBlogPost(params.slug);

	if (!post) {
		throw error(404, `Blog post "${params.slug}" not found`);
	}

	return {
		post
	};
};
