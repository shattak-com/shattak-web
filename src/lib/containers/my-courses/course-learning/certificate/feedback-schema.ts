import { z } from 'zod';

const requiredAnswer = (fieldName: string) =>
	z.string().trim().min(2, `${fieldName} must be at least 2 characters.`).max(4000, `${fieldName} is too long.`);

export const courseFeedbackSchema = z.object({
	rating: z.number().int().min(1, 'Select a rating between 1 and 10.').max(10, 'Select a rating between 1 and 10.'),
	aboutYourself: requiredAnswer('Your introduction'),
	preCourseChallenge: requiredAnswer('Your pre-course challenge'),
	courseExperience: requiredAnswer('Your course experience'),
	supportExperience: requiredAnswer('Your support experience'),
	nextStep: requiredAnswer('Your next step')
});

export type CourseFeedbackFormValues = z.infer<typeof courseFeedbackSchema>;

export const defaultCourseFeedbackValues: CourseFeedbackFormValues = {
	rating: 0,
	aboutYourself: '',
	preCourseChallenge: '',
	courseExperience: '',
	supportExperience: '',
	nextStep: ''
};
