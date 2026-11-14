import { error } from '@sveltejs/kit';
import { projects } from '#lib/site.js';
import { getEntries } from '#lib/utils/entries.js';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => projects.map(({ slug }) => ({ slug }));

export const load: PageLoad = async ({ params }) => {
	const project = projects.find((p) => p.slug === params.slug);
	if (!project) error(404, `No project called "${params.slug}"`);
	const lessons = (await getEntries()).filter((e) => e.project?.slug === project.slug);
	return { project, lessons };
};
