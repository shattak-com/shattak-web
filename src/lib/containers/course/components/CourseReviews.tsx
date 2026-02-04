'use client';

import Testimonials, { type TestimonialItem } from '~/lib/components/Testimonials';
import type { CourseReview } from '~/lib/containers/course/types';

type CourseReviewsProps = {
	reviews: CourseReview[];
};

const CourseReviews = ({ reviews }: CourseReviewsProps) => {
	const items: TestimonialItem[] = reviews
		.filter(review => review.show)
		.map(review => ({
			id: review.id,
			name: review.name,
			institution: review.affiliation,
			rating: review.rating,
			body: review.body,
			avatar: review.avatar,
			likes: review.likes
		}));

	return (
		<Testimonials
			items={items}
			title="Hear From Learners Who've Taken This Course"
			subtitle="Honest feedback from learners who completed the live sessions."
			sectionId="reviews"
			background="bg.surface"
			cardBackgrounds={['bg.accent', 'bg.success', 'bg.subtle']}
			variant="modern"
			containerMaxW="7xl"
		/>
	);
};

export default CourseReviews;
