export type NavLink = {
	id: string;
	label: string;
	href: string;
};

export type Feature = {
	id: string;
	title: string;
	description: string;
	iconKey: 'mentors' | 'projects' | 'support' | 'outcomes';
};

export type Testimonial = {
	id: string;
	name: string;
	institution: string;
	rating: number;
	body: string;
	avatar: string;
};

export const navLinks: NavLink[] = [
	{ id: 'about', label: 'About', href: '/about' },
	{ id: 'courses', label: 'Courses', href: '/#courses' },
	{ id: 'testimonials', label: 'Testimonials', href: '/#testimonials' },
	{ id: 'instructor', label: 'Become an Instructor', href: '/#instructor' }
];

export const courseCategories = [
	'Futured',
	'Software Development',
	'Data & AI',
	'DevOps & Cloud',
	'Business & Management',
	'Marketing',
	'Finance',
	'Creative',
	'Academical',
	'Sport & Gaming',
	'Lifestyle'
] as const;

export const features: Feature[] = [
	{
		id: 'feature-mentors',
		title: 'Live sessions',
		description: 'Get real-time feedback, Q&A, and actionable guidance from experts.',
		iconKey: 'mentors'
	},
	{
		id: 'feature-projects',
		title: 'Hands-on projects',
		description: 'Build portfolio-ready work with structured tasks and reviews.',
		iconKey: 'projects'
	},
	{
		id: 'feature-support',
		title: 'Community support',
		description: 'Join peer groups, weekly check-ins, and focused study circles.',
		iconKey: 'support'
	},
	{
		id: 'feature-outcomes',
		title: 'Career outcomes',
		description: 'Learn job-relevant skills aligned to real roles and expectations.',
		iconKey: 'outcomes'
	}
];

export const testimonials: Testimonial[] = [
	{
		id: 'testimonial-1',
		name: 'Ananya Das',
		institution: 'Amity University, Kolkata',
		rating: 4.9,
		body: 'When I first heard about Shattak, I was honestly confused about my career path. I enrolled in one course just to explore. The way concepts were explained with real-world examples made learning feel simple and practical. Slowly, I gained clarity and confidence. Shattak did not just teach me skills, it helped me believe in my potential.',
		avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScPzl0Q8qAiT2ZORFA-JwA84btZyDwJfD5tA&s'
	},
	{
		id: 'testimonial-2',
		name: 'Rohit Kumar',
		institution: 'Techno India University',
		rating: 4.8,
		body: 'I was struggling to understand how skills actually apply in real jobs. Through Shattak, learning felt structured and relevant. Every session added value, and the mentorship support really stood out. Today, I feel more prepared and focused on my career goals.',
		avatar: 'https://userphotos2.teacheron.com/1407070-27327.jpg'
	},
	{
		id: 'testimonial-3',
		name: 'Arjun Banerjee',
		institution: "St. Xavier's College, Kolkata",
		rating: 5,
		body: 'Shattak came at the right time in my college life. The learning approach is simple yet powerful. I understood things that my regular classes never explained clearly. It truly bridges the gap between college education and industry needs.',
		avatar:
			'https://engineering.purdue.edu/ECE/News/2025/purdue-ece-student-arjun-gupte-named-2025-astronaut-scholar/gupte-web.jpg'
	}
];
