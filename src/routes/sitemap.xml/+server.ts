import { getBlogPosts } from '#lib/utils/blog.js';
import { SITE, projects } from '#lib/site.js';

export const prerender = true;

// Every static page route is found from the filesystem, so a new lab or page lands here without an edit
const staticPaths = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'))
	.filter((file) => !file.includes('['))
	.map((file) => file.slice('/src/routes'.length, -'/+page.svelte'.length));

export async function GET() {
	const today = new Date().toISOString().split('T')[0];
	const posts = await getBlogPosts();

	const urls = [
		...staticPaths.map((path) => ({ path, lastmod: path === '' ? today : undefined })),
		...projects.map((p) => ({ path: `/projects/${p.slug}`, lastmod: undefined })),
		...posts.map((p) => ({ path: `/blog/${p.slug}`, lastmod: p.date }))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		({ path, lastmod }) =>
			`	<url><loc>${SITE}${path || '/'}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=3600' }
	});
}
