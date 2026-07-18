export const courseCategories = [
	'Futured',
	'Software Development',
	'Data & AI',
	'DevOps & Cloud',
	'Business & Management',
	'Marketing',
	'Finance',
	'Creative',
	'Academical',
	'Sport & Gaming',
	'Lifestyle',
	'Private'
] as const;

export type CourseCategory = (typeof courseCategories)[number];
