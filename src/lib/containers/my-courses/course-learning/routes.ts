import type { CourseTabId, CourseWorkspaceRoute } from './types';

const tabSegmentById: Record<Exclude<CourseTabId, 'lessons'>, string> = {
	overview: 'overview',
	recordings: 'recordings',
	bonus: 'bonus-content',
	assignment: 'assignment',
	certificate: 'certificate',
	peerNetwork: 'peer-community'
};

const tabIdBySegment = Object.fromEntries(
	Object.entries(tabSegmentById).map(([tabId, segment]) => [segment, tabId])
) as Record<string, Exclude<CourseTabId, 'lessons'>>;

export const getCourseWorkspaceRoute = (
	tab: CourseTabId,
	lesson?: { moduleId: string; subsectionId: string } | null
): CourseWorkspaceRoute => ({
	tab,
	moduleId: tab === 'lessons' ? (lesson?.moduleId ?? null) : null,
	subsectionId: tab === 'lessons' ? (lesson?.subsectionId ?? null) : null
});

export const parseCourseWorkspaceSegments = (segments: string[]): CourseWorkspaceRoute | null => {
	if (segments.length === 1 && segments[0] === 'lesson') {
		return getCourseWorkspaceRoute('lessons');
	}

	if (segments.length === 3 && segments[0] === 'lesson' && segments[1] && segments[2]) {
		return getCourseWorkspaceRoute('lessons', {
			moduleId: segments[1],
			subsectionId: segments[2]
		});
	}

	if (segments.length !== 1) {
		return null;
	}

	const tab = tabIdBySegment[segments[0] ?? ''];
	return tab ? getCourseWorkspaceRoute(tab) : null;
};

export const parseCourseWorkspacePath = (pathname: string, courseId: string): CourseWorkspaceRoute | null => {
	try {
		const segments = pathname
			.split('/')
			.filter(Boolean)
			.map(segment => decodeURIComponent(segment));

		if (segments[0] !== 'my-courses' || segments[1] !== courseId) {
			return null;
		}

		return parseCourseWorkspaceSegments(segments.slice(2));
	} catch {
		return null;
	}
};

export const buildCourseWorkspacePath = (courseId: string, route: CourseWorkspaceRoute) => {
	const coursePath = `/my-courses/${encodeURIComponent(courseId)}`;

	if (route.tab === 'lessons') {
		if (route.moduleId && route.subsectionId) {
			return `${coursePath}/lesson/${encodeURIComponent(route.moduleId)}/${encodeURIComponent(route.subsectionId)}`;
		}

		return `${coursePath}/lesson`;
	}

	return `${coursePath}/${tabSegmentById[route.tab]}`;
};
