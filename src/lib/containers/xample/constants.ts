export const instructorApplicationUrl = 'https://forms.gle/yQVwU7FJ9Q5rDHTq7';

export const portfolioExamples = [
	{
		id: 'portfolio-example-1',
		title: 'Responsive websites',
		description:
			'Build pages that adapt across devices with clean structure, modern UI patterns, and accessible layouts.'
	},
	{
		id: 'portfolio-example-2',
		title: 'Practical applications',
		description: 'Create usable products and workflows that show your ability to solve real-world problems.'
	},
];

export const learnerBenefits = [
	'Gain clarity on what to learn and why it matters for real roles.',
	'Build confidence through live classes, mentor feedback, and consistent practice.',
	'Get real-world exposure with portfolio-focused assignments and guided reviews.'
];

export const instructorBenefits = [
	'Teach live classes and interact directly with motivated learners.',
	'Work with flexible schedules while delivering practical, outcomes-first sessions.',
	'Build your personal brand by mentoring learners and sharing industry experience.'
];

export const aboutValues = [
	{
		id: 'about-value-practical',
		title: 'Practical learning first',
		description: 'Every session is designed around real application, not just theory.'
	},
	{
		id: 'about-value-consistency',
		title: 'Consistency over cramming',
		description: 'Structured routines and check-ins help learners stay on track.'
	},

];

export type AboutFaqItem = {
	id: string;
	question: string;
	answer: string;
};

export const aboutFaqItems: AboutFaqItem[] = [
	{
		id: 'about-faq-1',
		question: 'What is Shattak?',
		answer:
			'Shattak is an India-focused learning platform offering live classes with mentor-led guidance, practical projects, and portfolio outcomes.'
	},
	{
		id: 'about-faq-2',
		question: 'How are Shattak classes different from regular recorded courses?',
		answer:
			'Shattak runs live classes where learners can ask questions in real time, get direct feedback, and improve faster with mentor support.'
	},
	
];
