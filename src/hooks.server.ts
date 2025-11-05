import type { Handle } from '@sveltejs/kit';

/**
 * Server-side hooks for global request handling
 * Adds security headers to all responses
 */
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Security headers for production
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	// Content Security Policy
	// Allow inline styles/scripts for SvelteKit, allow analytics domains
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' https://cloud.umami.is",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"img-src 'self' data: https:",
			"connect-src 'self' https://cloud.umami.is",
			"font-src 'self' https://fonts.gstatic.com",
			"object-src 'none'",
			"base-uri 'self'",
			"form-action 'self'",
			"frame-ancestors 'none'",
			'upgrade-insecure-requests'
		].join('; ')
	);

	return response;
};
