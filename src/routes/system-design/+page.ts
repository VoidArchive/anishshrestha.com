import { getEntries } from '#lib/utils/entries.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => ({ entries: await getEntries() });
