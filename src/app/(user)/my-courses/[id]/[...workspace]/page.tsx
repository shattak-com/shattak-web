import { notFound } from 'next/navigation';

import { parseCourseWorkspaceSegments } from '~/lib/containers/my-courses/course-learning/routes';
import CourseLearningPage from '~/lib/containers/my-courses/CourseLearningPage';

type CourseWorkspacePageProps = {
	params: Promise<{
		id: string;
		workspace: string[];
	}>;
};

const CourseWorkspacePage = async ({ params }: CourseWorkspacePageProps) => {
	const { id, workspace } = await params;
	const initialRoute = parseCourseWorkspaceSegments(workspace);

	if (!initialRoute) {
		notFound();
	}

	return <CourseLearningPage courseId={id} initialRoute={initialRoute} />;
};

export default CourseWorkspacePage;
