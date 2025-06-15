import type { Handle } from '@sveltejs/kit';

// Default SvelteKit handle function
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  return response;
}; 