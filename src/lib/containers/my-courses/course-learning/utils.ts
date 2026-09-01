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

const getCalendarDateInTimeZone = (date: Date, timeZone: string) => {
	const dateParts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(date);
	const calendarParts = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));

	return new Date(Date.UTC(Number(calendarParts.year), Number(calendarParts.month) - 1, Number(calendarParts.day)));
};

const getStreakWindowEnd = (lastActiveDate: string | null, timeZone: string) => {
	const lastActive = lastActiveDate ? new Date(lastActiveDate) : null;
	const windowEnd = lastActive && !Number.isNaN(lastActive.getTime()) ? lastActive : new Date();

	return getCalendarDateInTimeZone(windowEnd, timeZone);
};

const getUtcDateKey = (date: Date) =>
	`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;

export const getStreakTiles = (
	currentStreak: number,
	lastActiveDate: string | null,
	timeZone: string,
	targetDays: number,
	cycleDays: number
) => {
	const cycleLength = Math.max(1, cycleDays);
	const normalizedStreak = Math.min(Math.max(currentStreak, 1), cycleLength);
	const cycleStart = getStreakWindowEnd(lastActiveDate, timeZone);
	cycleStart.setUTCDate(cycleStart.getUTCDate() - (normalizedStreak - 1));

	return Array.from({ length: cycleLength }, (_, index) => {
		const date = new Date(cycleStart);
		const dayNumber = index + 1;
		date.setUTCDate(cycleStart.getUTCDate() + index);

		return {
			dateKey: getUtcDateKey(date),
			dayNumber,
			dayLabel: `Day ${dayNumber}`,
			weekdayLabel: streakWeekdayFormatter.format(date),
			dateLabel: streakDateFormatter.format(date),
			isCompleted: dayNumber < normalizedStreak,
			isCurrent: dayNumber === normalizedStreak,
			isBuffer: dayNumber > targetDays
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
