import { getBlogPosts } from '$lib/utils/blog';
import type { BlogPost } from '$lib/utils/blog';

interface SitemapPage {
	url: string;
	priority: string;
	changefreq: string;
	lastmod?: string;
}

export async function GET() {
	const posts = await getBlogPosts();
	const baseUrl = 'https://anishshrestha.com';

	const staticPages: SitemapPage[] = [
		{
			url: '',
			priority: '1.0',
			changefreq: 'weekly',
			lastmod: new Date().toISOString().split('T')[0]
		},
		{ url: '/projects', priority: '0.9', changefreq: 'monthly' },
		{ url: '/blog', priority: '0.8', changefreq: 'weekly' },
		{ url: '/labs', priority: '0.7', changefreq: 'monthly' },
		{ url: '/labs/bagchal', priority: '0.6', changefreq: 'monthly' },
		{ url: '/labs/dsa-visualizer', priority: '0.6', changefreq: 'monthly' },
		{ url: '/labs/gameoflife', priority: '0.6', changefreq: 'monthly' },
		{ url: '/labs/tictactoe', priority: '0.6', changefreq: 'monthly' }
	];

	const blogPosts: SitemapPage[] = posts.map((post: BlogPost) => ({
		url: `/blog/${post.slug}`,
		priority: '0.8',
		changefreq: 'monthly',
		lastmod: post.date
	}));

	const allPages = [...staticPages, ...blogPosts];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages
	.map(
		(page) => `
	<url>
		<loc>${baseUrl}${page.url}</loc>
		<priority>${page.priority}</priority>
		<changefreq>${page.changefreq}</changefreq>
		${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
	</url>`
	)
	.join('')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600',
			'X-Robots-Tag': 'index, follow'
		}
	});
}
