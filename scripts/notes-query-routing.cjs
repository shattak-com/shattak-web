// The CDN MUST vary by category/page, in addition to the adapter's RSC keys.
const source = '/notes/:departmentSlug/:subjectSlug/';
const category = {
	type: 'query',
	key: 'category',
	value: '(?<noteCategory>[nN][oO][tT][eE][sS]|[pP][yY][qQ]|[lL][aA][bB])'
};
const page = { type: 'query', key: 'page', value: '(?<notePage>[0-9]{1,9})' };
const destination = '/notes-browse/:departmentSlug/:subjectSlug';

module.exports = {
	notesQueryHeaders: [{ source, headers: [{ key: 'Netlify-Vary', value: 'query=category|page' }] }],
	notesQueryRewrites: [
		{ source, has: [category, page], destination: `${destination}/:noteCategory/:notePage/` },
		{ source, has: [category], destination: `${destination}/:noteCategory/1/` },
		{ source, has: [page], destination: `${destination}/all/:notePage/` }
	]
};
