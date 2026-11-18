import { ApiRequestError } from '~/lib/api/client';

export const isNotesNotFoundError = (error: unknown) => error instanceof ApiRequestError && error.statusCode === 404;

// App Router supplies decoded segments. Match the public API's slug limits before a fetch.
export const assertNotesSlugs = (...slugs: string[]) => {
	if (slugs.some(slug => !slug.trim() || slug.trim().length > 160)) {
		throw new ApiRequestError('Notes page not found', 404);
	}
};
