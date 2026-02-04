import type { CourseDetails } from '~/lib/containers/course/types';

export const courseDetailsMock: CourseDetails = {
	id: 'course-ux-ui-001',
	title: 'Build Responsive Real World Websites with HTML and CSS',
	subtitle: '',
	summary:
		'Learn modern HTML, CSS, and responsive layout techniques through live mentor-led sessions and a real-world project.',
	category: 'Software Development',
	categories: ['Futured', 'Software Development'],
	level: 'Beginner',
	price: 200,
	originalPrice: 349,
	durationHours: 4,
	durationMinutes: 30,
	mode: 'Live',
	enrollmentCount: 3200,
	rating: 4.7,
	thumbnailImage: '/images/courses/course-1.svg',
	promoImage: '/images/courses/course-2.svg',
	paymentLink: '',
	status: 'Published',
	highlights: [
		{ id: 'highlight-duration', label: 'Duration', value: '4h 30m' },
		{ id: 'highlight-learners', label: 'Learners', value: '3.2k+ Enrolled Students' },
		{ id: 'highlight-recording', label: 'Session Recording', value: 'Lifetime Access' },
		{ id: 'highlight-post-session', label: 'Post Session', value: 'Mentor support' }
	],
	schedule: [
		{ id: 'schedule-1', label: 'Session 1', time: '20 Aug - 7:00 PM', duration: '1h 30m' },
		{ id: 'schedule-2', label: 'Session 2', time: '22 Aug - 7:00 PM', duration: '1h 30m' },
		{ id: 'schedule-3', label: 'Session 3', time: '24 Aug - 7:00 PM', duration: '1h 30m' },
		{ id: 'schedule-4', label: 'Session 4', time: '26 Aug - 7:00 PM', duration: '1h 30m' }
	],
	projectGallery: [
		{ id: 'project-1', image: '/images/courses/course-1.svg', alt: 'Portfolio project preview' },
		{ id: 'project-2', image: '/images/courses/course-2.svg', alt: 'Responsive layout preview' },
		{ id: 'project-3', image: '/images/courses/course-3.svg', alt: 'Live build preview' }
	],
	about:
		'By the end of this course, you will have a complete, real-world web development portfolio, including a live website and a GitHub project built with HTML, CSS, and Vanilla JavaScript, ready to showcase your skills to recruiters, clients, and peers.',
	liveUrl: 'https://shattak.com/live-class',
	outcomes: [
		{ id: 'outcome-1', text: 'Build a responsive website from scratch' },
		{ id: 'outcome-2', text: 'Publish a project to your GitHub portfolio' },
		{ id: 'outcome-3', text: 'Master HTML, CSS, and layout systems' },
		{ id: 'outcome-4', text: 'Showcase a live project to recruiters' }
	],
	audience: [
		{
			id: 'audience-1',
			title: 'Students & Fresh Graduates',
			bullets: ['Build a strong portfolio', 'Learn from live mentors', 'Get feedback on your work'],
			tone: 'success'
		},
		{
			id: 'audience-2',
			title: 'Working Professionals',
			bullets: ['Upgrade frontend skills', 'Ship real projects', 'Join a peer community'],
			tone: 'accent'
		},
		{
			id: 'audience-3',
			title: 'Career Switchers',
			bullets: ['Structured learning path', 'Hands-on practice', 'Guided sessions'],
			tone: 'warning'
		},
		{
			id: 'audience-4',
			title: 'Freelancers & Creators',
			bullets: ['Build client-ready sites', 'Improve delivery speed', 'Learn modern workflows'],
			tone: 'info'
		}
	],
	completion: {
		certificateImage: '/images/courses/course-2.svg',
		benefits: [
			'Receive an official course completion certificate',
			'Earn skill-focused feedback from mentors',
			'Showcase your project in the Shattak community',
			'Access lifetime notes and references',
			'Stay connected with instructors for guidance'
		]
	},
	projects: [
		{
			id: 'project-1',
			title: 'Portfolio Landing Page',
			author: 'Zainab Shaikh',
			previewImage: '/images/courses/course-1.svg',
			likes: 300,
			liveUrl: 'https://example.com'
		},
		{
			id: 'project-2',
			title: 'Product Marketing Site',
			author: 'Devendra Singh',
			previewImage: '/images/courses/course-2.svg',
			likes: 214,
			liveUrl: 'https://example.com'
		},
		{
			id: 'project-3',
			title: 'Interactive Web Story',
			author: 'Nadia Ahmed',
			previewImage: '/images/courses/course-3.svg',
			likes: 183,
			liveUrl: 'https://example.com'
		}
	],
	faqs: [
		{
			id: 'faq-1',
			question: 'Who is this course for?',
			answer: 'Students, working professionals, and career switchers who want to build job-ready web projects.'
		},
		{
			id: 'faq-2',
			question: 'Do I need coding experience?',
			answer: 'Basic familiarity with HTML or CSS is helpful, but the course includes beginner-friendly guidance.'
		},
		{
			id: 'faq-3',
			question: 'Will sessions be recorded?',
			answer: 'Yes, recordings are shared after each live session.'
		},
		{
			id: 'faq-4',
			question: 'How will I get feedback?',
			answer: 'Mentors provide live feedback and follow-up notes during the sessions.'
		},
		{
			id: 'faq-5',
			question: 'Can I ask questions after class?',
			answer: 'Yes, you can ask questions in the community group and during live office hours.'
		}
	],
	prerequisites: [
		{
			sectionName: 'Setting up the Development Environment',
			subsections: [
				{ title: 'Install VS Code (Windows/Mac)', time: '20 min' },
				{ title: 'Install Google Chrome', time: '10 min' },
				{ title: 'Postman installation & intro', time: '15 min' }
			]
		},
		{
			sectionName: 'Introduction to Git & GitHub',
			subsections: [
				{ title: 'Git basics', time: '15 min' },
				{ title: 'Creating a GitHub repo', time: '10 min' }
			]
		},
		{
			sectionName: 'Basic Web Concepts',
			subsections: [
				{ title: 'How the internet works', time: '15 min' },
				{ title: 'HTML, CSS & JavaScript overview', time: '25 min' }
			]
		}
	],
	liveSessions: [
		{
			sectionName: 'Session 1: Project Planning & HTML Foundation',
			subsections: [
				{ title: 'Project walkthrough & assets', time: '20 min' },
				{ title: 'HTML layout structure', time: '40 min' },
				{ title: 'Semantic markup', time: '25 min' }
			]
		},
		{
			sectionName: 'Session 2: CSS Styling & Responsive Design',
			subsections: [
				{ title: 'Flexbox & grid layouts', time: '35 min' },
				{ title: 'Responsive breakpoints', time: '30 min' },
				{ title: 'Design tokens in practice', time: '20 min' }
			]
		},
		{
			sectionName: 'Session 3: JavaScript & Interactivity',
			subsections: [
				{ title: 'DOM basics', time: '25 min' },
				{ title: 'Interactive UI patterns', time: '30 min' }
			]
		},
		{
			sectionName: 'Session 4: Project Completion & Deployment',
			subsections: [
				{ title: 'Deployment checklist', time: '20 min' },
				{ title: 'Portfolio walkthrough', time: '20 min' }
			]
		}
	],
	postSessionMaterials: [
		{
			sectionName: 'Real-World Examples',
			subsections: [
				{ title: 'Reference layouts', time: '30 min' },
				{ title: 'Component checklist', time: '20 min' }
			]
		},
		{
			sectionName: 'Case Studies',
			subsections: [
				{ title: 'Best-in-class landing pages', time: '25 min' },
				{ title: 'Conversion tips', time: '20 min' }
			]
		},
		{
			sectionName: 'Assignments',
			subsections: [
				{ title: 'Build an alternate layout', time: '45 min' },
				{ title: 'Polish your spacing', time: '25 min' }
			]
		}
	],
	requirements: [
		'Laptop or desktop with internet access',
		'Basic understanding of HTML and CSS',
		'Modern browser (Chrome, Edge, or Firefox)',
		'VS Code or another editor installed',
		'Willingness to practice between sessions'
	],
	tools: [
		{ id: 'tool-figma', name: 'Figma', image: '/images/courses/course-3.svg' },
		{ id: 'tool-vscode', name: 'VS Code', image: '/images/courses/course-1.svg' },
		{ id: 'tool-react', name: 'React', image: '' },
		{ id: 'tool-postman', name: 'Postman', image: '' },
		{ id: 'tool-chatgpt', name: 'ChatGPT', image: '' },
		{ id: 'tool-photoshop', name: 'Photoshop', image: '' }
	],
	instructors: [
		{
			id: 'instructor-1',
			name: 'Aarav Sharma',
			role: 'Senior Frontend Engineer, StudioLabs',
			photo:
				'https://media.istockphoto.com/id/2158468781/photo/a-serious-indian-man-in-glasses-and-a-blue-shirt-standing-with-crossed-arms-in-a-modern.jpg?s=612x612&w=0&k=20&c=f7-Xh5CLWKRVk0GgtJ-nYvFvC6deTkNf2NqcEZwxCao=',
			bio: 'Aarav has mentored 1200+ learners and specializes in production UI systems and scalable frontend architecture.',
			linkedInUrl: 'https://www.linkedin.com'
		},
		{
			id: 'instructor-2',
			name: 'Ananya Mehta',
			role: 'Design Technologist, CraftLabs',
			photo:
				'https://media.istockphoto.com/id/2200020759/photo/young-businesswoman-smiling-with-arms-crossed-in-modern-office-building.jpg?s=612x612&w=0&k=20&c=t12dUjfk1UvFr9WyBk5wWNFcaBc2WEatLC87U6ss5zk=',
			bio: 'Ananya blends design and code to help learners ship portfolio-ready projects.',
			linkedInUrl: 'https://www.linkedin.com'
		},
		{
			id: 'instructor-3',
			name: 'Kabir Sayed',
			role: 'Frontend Mentor, PixelWorks',
			photo:
				'https://media.istockphoto.com/id/2179722128/photo/cheerful-beautiful-young-arab-entrepreneur-woman-posing-in-office-hall.jpg?s=612x612&w=0&k=20&c=PiC525CGcTeYwYMnO4ufOXaMiLRqHIzPabhiMhOiRLs=',
			bio: 'Kabir focuses on clean code, accessibility, and practical frontend delivery.',
			linkedInUrl: 'https://www.linkedin.com'
		}
	],
	reviews: [
		{
			id: 'review-1',
			name: 'Riya Jain',
			affiliation: 'B.Tech, NIT Trichy',
			rating: 4.8,
			body: 'Clear structure, solid examples, and a fast pace that keeps you engaged.',
			avatar: '/images/testimonials/avatar-2.svg',
			likes: 24,
			show: true
		},
		{
			id: 'review-2',
			name: 'Kabir Singh',
			affiliation: 'Frontend Intern, PixelWorks',
			rating: 4.6,
			body: 'Practical sessions with feedback that helped improve my portfolio.',
			avatar: '/images/testimonials/avatar-3.svg',
			likes: 18,
			show: true
		},
		{
			id: 'review-3',
			name: 'Meera Patel',
			affiliation: 'Design Graduate',
			rating: 4.9,
			body: 'Loved the structure and the live walkthroughs.',
			likes: 12,
			show: true
		}
	]
};
