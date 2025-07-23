export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	date: string;
	published: boolean;
	tags: string[];
	content: unknown;
	// New fields for lab integration
	labSlug?: string;
	relatedLab?: {
		name: string;
		url: string;
		description: string;
	};
}

// Cache interfaces for blog post caching
interface CacheEntry<T> {
	data: T;
	timestamp: number;
	expires: number;
}

interface CacheStats {
	hits: number;
	misses: number;
	entries: number;
	lastCleared: number;
}

interface BlogModule {
	default: unknown;
	metadata: {
		title: string;
		description: string;
		date: string;
		published: boolean;
		tags: string[];
	};
}

// Cache configuration
const CACHE_DURATION = 60 * 1000; // 60 seconds in milliseconds
const MAX_CACHE_SIZE = 100; // Maximum number of cache entries

// TODO: Add file system watching for cache invalidation on content changes
// NOTE: Current implementation uses time-based expiration for simplicity
// PERF: In-memory cache provides significant performance improvement for repeated blog post loads

// In-memory cache for blog posts
class BlogCache {
	private cache = new Map<string, CacheEntry<BlogPost[]>>();
	private singlePostCache = new Map<string, CacheEntry<BlogPost>>();
	private stats: CacheStats = {
		hits: 0,
		misses: 0,
		entries: 0,
		lastCleared: Date.now()
	};

	// Get cached blog posts
	get(key: string): BlogPost[] | null {
		const entry = this.cache.get(key);
		if (!entry) {
			this.stats.misses++;
			return null;
		}

		if (Date.now() > entry.expires) {
			// Cache expired, remove entry
			this.cache.delete(key);
			this.stats.misses++;
			return null;
		}

		this.stats.hits++;
		return entry.data;
	}

	// Set cached blog posts
	set(key: string, data: BlogPost[]): void {
		// Remove oldest entries if cache is full
		if (this.cache.size >= MAX_CACHE_SIZE) {
			const oldestKey = this.cache.keys().next().value;
			if (oldestKey) {
				this.cache.delete(oldestKey);
			}
		}

		const now = Date.now();
		this.cache.set(key, {
			data,
			timestamp: now,
			expires: now + CACHE_DURATION
		});

		this.stats.entries = this.cache.size;
	}

	// Get cached single blog post
	getSingle(slug: string): BlogPost | null {
		const entry = this.singlePostCache.get(slug);
		if (!entry) {
			this.stats.misses++;
			return null;
		}

		if (Date.now() > entry.expires) {
			// Cache expired, remove entry
			this.singlePostCache.delete(slug);
			this.stats.misses++;
			return null;
		}

		this.stats.hits++;
		return entry.data;
	}

	// Set cached single blog post
	setSingle(slug: string, data: BlogPost): void {
		// Remove oldest entries if cache is full
		if (this.singlePostCache.size >= MAX_CACHE_SIZE) {
			const oldestKey = this.singlePostCache.keys().next().value;
			if (oldestKey) {
				this.singlePostCache.delete(oldestKey);
			}
		}

		const now = Date.now();
		this.singlePostCache.set(slug, {
			data,
			timestamp: now,
			expires: now + CACHE_DURATION
		});
	}

	// Clear all cache entries
	clear(): void {
		this.cache.clear();
		this.singlePostCache.clear();
		this.stats = {
			hits: 0,
			misses: 0,
			entries: 0,
			lastCleared: Date.now()
		};
	}

	// Get cache statistics
	getStats(): CacheStats {
		return {
			...this.stats,
			entries: this.cache.size + this.singlePostCache.size
		};
	}

	// Check if cache needs refresh based on content modification
	shouldRefresh(key: string): boolean {
		const entry = this.cache.get(key);
		if (!entry) return true;

		// For now, rely on time-based expiration
		// Future enhancement: check file modification times
		return Date.now() > entry.expires;
	}
}

// Global cache instance
const blogCache = new BlogCache();

/**
 * Get all blog posts from the content directory with caching
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
	const cacheKey = 'all-blog-posts';

	// Check cache first
	const cachedPosts = blogCache.get(cacheKey);
	if (cachedPosts) {
		return cachedPosts;
	}

	// Cache miss - load from files
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
	const sortedPosts = posts.sort((a, b) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		return dateB.getTime() - dateA.getTime();
	});

	// Cache the results
	blogCache.set(cacheKey, sortedPosts);

	return sortedPosts;
}

/**
 * Get a single blog post by slug with caching
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
	try {
		// Check cache first
		const cachedPost = blogCache.getSingle(slug);
		if (cachedPost) {
			return cachedPost;
		}

		// Cache miss - load from file
		const modules = import.meta.glob('../../content/blog/*.md') as Record<
			string,
			() => Promise<BlogModule>
		>;
		const postPath = `../../content/blog/${slug}.md`;

		if (modules[postPath]) {
			const post = await modules[postPath]();
			const blogPost: BlogPost = {
				slug,
				...post.metadata,
				content: post.default
			};

			// Cache the single post
			blogCache.setSingle(slug, blogPost);

			return blogPost;
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

/**
 * Cache management functions
 */

/**
 * Clear all cached blog posts
 */
export function clearBlogCache(): void {
	blogCache.clear();
}

/**
 * Get cache statistics for monitoring
 */
export function getBlogCacheStats(): CacheStats {
	return blogCache.getStats();
}

/**
 * Check if cache needs refresh (for advanced cache management)
 */
export function shouldRefreshCache(key: string = 'all-blog-posts'): boolean {
	return blogCache.shouldRefresh(key);
}
