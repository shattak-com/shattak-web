import { redirect } from 'next/navigation';

type MyCoursePageProps = {
	params: Promise<{
		id: string;
	}>;
};

const MyCoursePage = async ({ params }: MyCoursePageProps) => {
	const { id } = await params;

	redirect(`/my-courses/${encodeURIComponent(id)}/overview`);
};

export default MyCoursePage;
