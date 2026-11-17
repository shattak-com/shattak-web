import type { NoteCategory } from '~/lib/api/notes';

export const parseSubjectVariant = (category: string, page: string) => {
	const normalized = category.toUpperCase();
	const categoryValue = ['NOTES', 'PYQ', 'LAB'].includes(normalized) ? (normalized as NoteCategory) : undefined;
	const value = Number(page);
	return { category: categoryValue, page: Number.isSafeInteger(value) && value > 0 ? value : 1 };
};
