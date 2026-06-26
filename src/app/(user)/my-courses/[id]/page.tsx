import CourseLearningPage from '~/lib/containers/my-courses/CourseLearningPage';

type MyCoursePageProps = {
	params: Promise<{
		id: string;
	}>;
};

const MyCoursePage = async ({ params }: MyCoursePageProps) => {
	const { id } = await params;

	return <CourseLearningPage courseId={id} />;
};

export default MyCoursePage;
