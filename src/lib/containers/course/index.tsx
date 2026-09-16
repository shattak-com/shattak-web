import WhatsAppBanner from '~/lib/components/WhatsAppBanner';
import CourseAudience from '~/lib/containers/course/components/CourseAudience';
import CourseCompletion from '~/lib/containers/course/components/CourseCompletion';
import CourseCurriculum from '~/lib/containers/course/components/CourseCurriculum';
import CourseEnrollBanner from '~/lib/containers/course/components/CourseEnrollBanner';
import CourseFaq from '~/lib/containers/course/components/CourseFaq';
import CourseHero from '~/lib/containers/course/components/CourseHero';
import CourseInstructor from '~/lib/containers/course/components/CourseInstructor';
import CourseOutcomes from '~/lib/containers/course/components/CourseOutcomes';
import CourseProjects from '~/lib/containers/course/components/CourseProjects';
import CourseRequirements from '~/lib/containers/course/components/CourseRequirements';
import CourseReviews from '~/lib/containers/course/components/CourseReviews';
import type { CourseDetails } from '~/lib/containers/course/types';

type CourseDetailsPageProps = {
	course: CourseDetails;
};

// TODO: Add CourseOverview back when content for this section is ready to publish.
const CourseDetailsPage = ({ course }: CourseDetailsPageProps) => (
	<>
		<CourseHero course={course} />
		<CourseOutcomes outcomes={course.outcomes} />
		<CourseCurriculum lessons={course.lessons} />
		<CourseRequirements items={course.requirements} />
		<CourseInstructor instructors={course.instructors} />
		<CourseAudience />
		<CourseCompletion />
		<CourseReviews reviews={course.reviews} />
		<CourseProjects projects={course.projects} />
		<WhatsAppBanner title="Join Our Community, Ask Questions" />
		<CourseFaq faqs={course.faqs} />
		<CourseEnrollBanner course={course} />
	</>
);

export default CourseDetailsPage;
