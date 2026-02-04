import WhatsAppBanner from '~/lib/components/WhatsAppBanner';
import CourseAudience from '~/lib/containers/course/components/CourseAudience';
import CourseCompletion from '~/lib/containers/course/components/CourseCompletion';
import CourseCurriculum from '~/lib/containers/course/components/CourseCurriculum';
import CourseEnrollBanner from '~/lib/containers/course/components/CourseEnrollBanner';
import CourseHero from '~/lib/containers/course/components/CourseHero';
import CourseInstructor from '~/lib/containers/course/components/CourseInstructor';
import CourseOverview from '~/lib/containers/course/components/CourseOverview';
import CourseOutcomes from '~/lib/containers/course/components/CourseOutcomes';
import CourseProjects from '~/lib/containers/course/components/CourseProjects';
import CourseFaq from '~/lib/containers/course/components/CourseFaq';
import CourseRequirements from '~/lib/containers/course/components/CourseRequirements';
import CourseReviews from '~/lib/containers/course/components/CourseReviews';
import CourseTools from '~/lib/containers/course/components/CourseTools';
import type { CourseDetails } from '~/lib/containers/course/types';

type CourseDetailsPageProps = {
	course: CourseDetails;
};

const CourseDetailsPage = ({ course }: CourseDetailsPageProps) => (
	<>
		<CourseHero course={course} />
		<CourseOverview course={course} />
		<CourseOutcomes outcomes={course.outcomes} />
		<CourseCurriculum
			prerequisites={course.prerequisites}
			liveSessions={course.liveSessions}
			postSessionMaterials={course.postSessionMaterials}
		/>
		<CourseRequirements items={course.requirements} />
		<CourseTools tools={course.tools} />
		<CourseInstructor instructors={course.instructors} />
		<CourseAudience audience={course.audience} />
		<CourseCompletion completion={course.completion} />
		<CourseReviews reviews={course.reviews} />
		<CourseProjects projects={course.projects} />
		<WhatsAppBanner title="Join Our Community, Ask Questions" />
		<CourseFaq faqs={course.faqs} />
		<CourseEnrollBanner course={course} />
	</>
);

export default CourseDetailsPage;
