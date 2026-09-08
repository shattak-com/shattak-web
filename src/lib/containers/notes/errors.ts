import { ApiRequestError } from '~/lib/api/client';

export const isNotesNotFoundError = (error: unknown) => error instanceof ApiRequestError && error.statusCode === 404;
