import type { AuthenticatedUser } from '~/lib/api/auth';
import type { CourseLearningDashboard, CourseLessonModule, CourseLessonsState } from '~/lib/api/enrollments';

export const getCourseWorkspaceGridColumns = (showRail: boolean, isRailCollapsed: boolean) => {
	if (!showRail) {
		return '1fr';
	}

	return {
		base: '1fr',
		xl: isRailCollapsed ? 'minmax(0, 1fr) 64px' : 'minmax(520px, 1fr) 340px',
		'2xl': isRailCollapsed ? 'minmax(0, 1fr) 64px' : 'minmax(680px, 1fr) 380px'
	};
};

export const formatCourseDate = (value: string) =>
	new Intl.DateTimeFormat('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(new Date(value));

export const isAdminLearner = (user: AuthenticatedUser | null) =>
	user?.roles.some(role => role === 'ADMIN' || role === 'SUPER_ADMIN') ?? false;

export const getActiveLessonContext = (lessons: CourseLessonsState | null) => {
	if (!lessons) {
		return null;
	}

	return (
		lessons.modules
			.flatMap(courseModule => courseModule.subsections.map(subsection => ({ courseModule, subsection })))
			.find(item => item.subsection.id === lessons.activeSubsectionId) ?? null
	);
};

const flattenLessonRows = (modules: CourseLessonModule[]) =>
	modules.flatMap(courseModule => courseModule.subsections.map(subsection => ({ courseModule, subsection })));

export const getNextLessonRow = (lessons: CourseLessonsState, subsectionId: string) => {
	const rows = flattenLessonRows(lessons.modules);
	const currentIndex = rows.findIndex(row => row.subsection.id === subsectionId);

	return currentIndex >= 0 ? (rows[currentIndex + 1] ?? null) : null;
};

export const getPreviousUnlockedLessonRow = (lessons: CourseLessonsState, subsectionId: string) => {
	const rows = flattenLessonRows(lessons.modules);
	const currentIndex = rows.findIndex(row => row.subsection.id === subsectionId);

	if (currentIndex <= 0) {
		return null;
	}

	return [...rows.slice(0, currentIndex)].reverse().find(row => !row.subsection.isLocked) ?? null;
};

export const getLessonStateLabel = (subsection: CourseLessonsState['modules'][number]['subsections'][number]) => {
	if (subsection.isActive) {
		return 'Current';
	}

	if (subsection.isCompleted) {
		return 'Completed';
	}

	return subsection.isLocked ? 'Locked' : 'Available';
};

const streakWeekdayFormatter = new Intl.DateTimeFormat('en-US', {
	weekday: 'short',
	timeZone: 'UTC'
});

const streakDateFormatter = new Intl.DateTimeFormat('en-US', {
	day: '2-digit',
	month: 'short',
	timeZone: 'UTC'
});

const getStreakWindowEnd = (lastActiveDate: string | null) => {
	const datePart = lastActiveDate?.slice(0, 10) ?? '';
	if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
		const [year, month, day] = datePart.split('-').map(Number);
		return new Date(Date.UTC(year, month - 1, day));
	}

	const now = new Date();
	return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

export const getStreakTiles = (currentStreak: number, lastActiveDate: string | null) => {
	const windowEnd = getStreakWindowEnd(lastActiveDate);
	const activeTileCount = Math.min(Math.max(currentStreak, 0), 10);

	return Array.from({ length: 10 }, (_, index) => {
		const date = new Date(windowEnd);
		date.setUTCDate(windowEnd.getUTCDate() - (9 - index));

		return {
			dateKey: date.toISOString().slice(0, 10),
			dayLabel: streakWeekdayFormatter.format(date),
			dateLabel: streakDateFormatter.format(date),
			isActive: index >= 10 - activeTileCount,
			isLatest: index === 9
		};
	});
};

export const getDashboardRailProgress = (
	showLessonRail: boolean,
	lessonProgressPercentage: number | undefined,
	dashboard: CourseLearningDashboard | null,
	enrollmentProgressPercentage: number
) =>
	showLessonRail
		? (lessonProgressPercentage ?? enrollmentProgressPercentage)
		: (dashboard?.completion.percentage ?? enrollmentProgressPercentage);
