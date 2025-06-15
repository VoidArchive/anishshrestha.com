import type { Handle } from '@sveltejs/kit';
import '$core/server';

// Default SvelteKit handle function
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  return response;
}; 