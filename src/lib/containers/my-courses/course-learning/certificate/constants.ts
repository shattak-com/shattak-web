import type { CourseFeedbackInput } from '~/lib/api/enrollments';

export const feedbackQuestions: Array<{
	name: Exclude<keyof CourseFeedbackInput, 'rating'>;
	label: string;
	helper: string;
}> = [
	{
		name: 'aboutYourself',
		label: '1. Tell us a little about yourself.',
		helper: 'Your current role, background, college department, or designation.'
	},
	{
		name: 'preCourseChallenge',
		label: '2. What challenge or problem were you facing before joining this course?',
		helper: 'What were you struggling with, and what made you decide to join this course?'
	},
	{
		name: 'courseExperience',
		label: '3. How was your experience throughout the course?',
		helper: 'What did you enjoy most, and which part of the course helped you the most?'
	},
	{
		name: 'supportExperience',
		label:
			'4. Would you like to share something about the mentors, peers, or community members who supported you during your journey?',
		helper: 'How did they help you learn, stay motivated, or overcome challenges?'
	},
	{
		name: 'nextStep',
		label: '5. What is the next step you are planning to take after completing this course?',
		helper:
			'For example: building projects, applying for jobs, freelancing, internships, higher studies, or starting your own venture.'
	}
];

export const courseRatings = Array.from({ length: 10 }, (_, index) => index + 1);
