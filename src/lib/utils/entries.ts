import { getBlogPosts } from '#lib/utils/blog.js';
import { projects } from '#lib/site.js';

/** System design entries: posts with `series: 'system-design'`, oldest first, numbered from 1. */
export async function getEntries() {
	const posts = (await getBlogPosts()).filter((p) => p.series === 'system-design').reverse();
	return posts.map(({ slug, title, description, date, project }, i) => {
		const backing = projects.find((p) => p.slug === project);
		return {
			no: i + 1,
			slug,
			title,
			description,
			date,
			project: backing && { slug: backing.slug, name: backing.name }
		};
	});
}
