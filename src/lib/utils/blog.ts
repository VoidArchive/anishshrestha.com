export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	date: string;
	published: boolean;
	tags: string[];
	content: any;
	// New fields for lab integration
	labSlug?: string;
	relatedLab?: {
		name: string;
		url: string;
		description: string;
	};
}

interface BlogModule {
	default: any;
	metadata: {
		title: string;
		description: string;
		date: string;
		published: boolean;
		tags: string[];
	};
}

/**
 * Get all blog posts from the content directory
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
	const modules = import.meta.glob('../../content/blog/*.md') as Record<
		string,
		() => Promise<BlogModule>
	>;
	const posts: BlogPost[] = [];

	for (const path in modules) {
		const mod = await modules[path]();
		const slug = path.split('/').pop()?.replace('.md', '') || '';

		if (mod?.metadata?.published) {
			posts.push({
				slug,
				...mod.metadata,
				content: mod.default
			});
		}
	}

	// Sort by date (newest first)
	return posts.sort((a, b) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		return dateB.getTime() - dateA.getTime();
	});
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
	try {
		// Use relative import with proper path
		const modules = import.meta.glob('../../content/blog/*.md') as Record<
			string,
			() => Promise<BlogModule>
		>;
		const postPath = `../../content/blog/${slug}.md`;

		if (modules[postPath]) {
			const post = await modules[postPath]();
			return {
				slug,
				...post.metadata,
				content: post.default
			};
		}

		return null;
	} catch (error) {
		console.error(`Error loading blog post ${slug}:`, error);
		return null;
	}
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}
