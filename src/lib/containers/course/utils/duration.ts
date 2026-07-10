import type { CourseDetails, CourseSessionSection } from '~/lib/containers/course/types';

export const parseDurationMinutes = (value?: string) => {
	const normalizedValue = value?.toLowerCase().replace(/\s+/g, ' ').trim() ?? '';

	if (!normalizedValue) {
		return 0;
	}

	const colonMatch = normalizedValue.match(/^(\d+)\s*:\s*([0-5]?\d)$/);

	if (colonMatch) {
		return Number.parseInt(colonMatch[1] ?? '0', 10) * 60 + Number.parseInt(colonMatch[2] ?? '0', 10);
	}

	const hourMatch = normalizedValue.match(/(\d+)\s*(?:hours?|hrs?|hr|h)/);
	const minuteMatch = normalizedValue.match(/(\d+)\s*(?:minutes?|mins?|min|m)/);

	if (hourMatch || minuteMatch) {
		return Number.parseInt(hourMatch?.[1] ?? '0', 10) * 60 + Number.parseInt(minuteMatch?.[1] ?? '0', 10);
	}

	const plainNumber = Number.parseInt(normalizedValue, 10);

	return Number.isFinite(plainNumber) ? plainNumber : 0;
};

export const getCurriculumDurationMinutes = (sections: CourseSessionSection[]) =>
	sections.reduce(
		(total, section) =>
			total + section.subsections.reduce((sectionTotal, item) => sectionTotal + parseDurationMinutes(item.time), 0),
		0
	);

export const getCourseContentDurationMinutes = (course: CourseDetails) => {
	const curriculumDuration =
		getCurriculumDurationMinutes(course.lessons) +
		getCurriculumDurationMinutes(course.liveSessions) +
		getCurriculumDurationMinutes(course.postSessionMaterials);

	return curriculumDuration || course.durationHours * 60 + course.durationMinutes;
};

export const formatCourseDuration = (totalMinutes: number) => {
	const safeTotalMinutes = Math.max(0, Math.trunc(totalMinutes));
	const hours = Math.floor(safeTotalMinutes / 60);
	const minutes = safeTotalMinutes % 60;
	const parts: string[] = [];

	if (hours && !minutes) {
		return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
	}

	if (hours) {
		parts.push(`${hours} hr`);
	}

	if (minutes) {
		parts.push(`${minutes} min`);
	}

	return parts.join(' ') || '0 min';
};
