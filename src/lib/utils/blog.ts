import { render } from 'svelte/server';

export interface BlogFrontmatter {
	slug: string;
	title: string;
	description: string;
	date: string;
	published: boolean;
	tags: string[];
	labSlug?: string;
	relatedLab?: {
		name: string;
		url: string;
		description: string;
	};
}

export type BlogPostSummary = BlogFrontmatter;

export interface BlogPost extends BlogFrontmatter {
	html: string;
}

type BlogMetadataModule = {
	title: string;
	description: string;
	date: string;
	published: boolean;
	tags: string[];
	labSlug?: string;
	relatedLab?: BlogFrontmatter['relatedLab'];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SvelteComponent = any;

type MdsvexModule = {
	default: SvelteComponent;
	metadata: BlogMetadataModule;
};

const blogModules = import.meta.glob('../../content/blog/*.md', { eager: false });

/**
 * Returns published blog posts sorted by newest first.
 * Only frontmatter metadata is included to keep client payloads light.
 */
export async function getBlogPosts(): Promise<BlogPostSummary[]> {
	const summaries: BlogPostSummary[] = [];

	for (const [path, resolver] of Object.entries(blogModules)) {
		const module = (await resolver()) as {
			metadata: BlogMetadataModule;
		};

		if (!module.metadata.published) continue;

		const slug = path.split('/').pop()?.replace('.md', '') ?? '';

		summaries.push({
			slug,
			title: module.metadata.title,
			description: module.metadata.description,
			date: module.metadata.date,
			published: module.metadata.published,
			tags: module.metadata.tags,
			labSlug: module.metadata.labSlug,
			relatedLab: module.metadata.relatedLab
		});
	}

	return summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Returns the fully rendered blog post for a given slug.
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
	const postPath = `../../content/blog/${slug}.md`;
	const loader = blogModules[postPath];

	if (!loader) {
		return null;
	}

	const module = (await loader()) as MdsvexModule;

	if (!module.metadata.published) {
		return null;
	}

	// mdsvex exports a Svelte component as default
	// In Svelte 5, we use the render function from svelte/server
	const Component = module.default;
	const rendered = render(Component, { props: {} });
	const html = rendered.body;

	return {
		slug,
		title: module.metadata.title,
		description: module.metadata.description,
		date: module.metadata.date,
		published: module.metadata.published,
		tags: module.metadata.tags,
		labSlug: module.metadata.labSlug,
		relatedLab: module.metadata.relatedLab,
		html
	};
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);

	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}
