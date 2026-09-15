import type { IconType } from 'react-icons';

export type CourseLearningPageProps = {
	courseId: string;
	initialRoute: CourseWorkspaceRoute;
};

export type CourseTabId =
	| 'overview'
	| 'lessons'
	| 'recordings'
	| 'bonus'
	| 'assignment'
	| 'certificate'
	| 'peerNetwork';

export type CourseTab = {
	id: CourseTabId;
	label: string;
	icon: IconType;
};

export type CourseWorkspaceRoute = {
	tab: CourseTabId;
	moduleId: string | null;
	subsectionId: string | null;
};
