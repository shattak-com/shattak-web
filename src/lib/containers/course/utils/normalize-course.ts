import type { CourseDetails, CourseSessionSection } from '~/lib/containers/course/types';

const arrayOrEmpty = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

const normalizeCurriculumSections = (sections: CourseSessionSection[] | null | undefined): CourseSessionSection[] =>
	arrayOrEmpty(sections).map(section => ({
		...section,
		subsections: arrayOrEmpty(section.subsections)
	}));

export const normalizeCourseDetails = (course: CourseDetails): CourseDetails => ({
	...course,
	categories: arrayOrEmpty(course.categories),
	highlights: arrayOrEmpty(course.highlights),
	schedule: arrayOrEmpty(course.schedule),
	projectGallery: arrayOrEmpty(course.projectGallery),
	outcomes: arrayOrEmpty(course.outcomes),
	audience: arrayOrEmpty(course.audience),
	completion: {
		...(course.completion ?? {}),
		benefits: arrayOrEmpty(course.completion?.benefits)
	},
	projects: arrayOrEmpty(course.projects),
	faqs: arrayOrEmpty(course.faqs),
	lessons: normalizeCurriculumSections(course.lessons),
	liveSessions: normalizeCurriculumSections(course.liveSessions),
	postSessionMaterials: normalizeCurriculumSections(course.postSessionMaterials),
	requirements: arrayOrEmpty(course.requirements),
	tools: arrayOrEmpty(course.tools),
	instructors: arrayOrEmpty(course.instructors),
	reviews: arrayOrEmpty(course.reviews)
});
