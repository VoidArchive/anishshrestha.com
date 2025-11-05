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
	// Enforce HTTPS (also enable HSTS in Cloudflare dashboard for best coverage)
	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

	// Content Security Policy
	// Allow inline styles/scripts for SvelteKit, allow analytics domains
	const csp = [
		"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://cloud.umami.is",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"img-src 'self' data: https:",
	"connect-src 'self' https://cloud.umami.is https://fonts.googleapis.com https://fonts.gstatic.com",
		"font-src 'self' https://fonts.gstatic.com data:",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'"
	].join('; ');

	response.headers.set('Content-Security-Policy', csp);

	return response;
};
