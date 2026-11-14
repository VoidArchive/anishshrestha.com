import { getEntries } from '#lib/utils/entries.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// Newest three, newest first
	return { entries: (await getEntries()).slice(-3).reverse() };
};
