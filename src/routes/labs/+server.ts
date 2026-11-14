import { redirect } from '@sveltejs/kit';

// The labs index moved into /projects; the lab pages themselves stay at /labs/<name>
export const prerender = false;
export const GET = () => redirect(308, '/projects');
