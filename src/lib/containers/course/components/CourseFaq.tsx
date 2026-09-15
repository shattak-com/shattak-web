import FaqSection from '~/lib/components/FaqSection';
import type { CourseFaqItem } from '~/lib/containers/course/types';

type CourseFaqProps = {
	faqs: readonly CourseFaqItem[];
};

const CourseFaq = ({ faqs }: CourseFaqProps) => <FaqSection id="course-faqs" faqs={faqs} />;

export default CourseFaq;
