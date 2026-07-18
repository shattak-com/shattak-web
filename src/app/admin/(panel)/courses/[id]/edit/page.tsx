import CourseEditorPage from '~/lib/containers/admin/courses/CourseEditorPage';

type EditCoursePageProps = {
	params: Promise<{
		id: string;
	}>;
};

export const metadata = {
	title: 'Edit Course'
};

const EditCoursePage = async ({ params }: EditCoursePageProps) => {
	const { id } = await params;

	return <CourseEditorPage courseId={id} />;
};

export default EditCoursePage;
