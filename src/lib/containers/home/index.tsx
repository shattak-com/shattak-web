import CoursesSection from '~/lib/containers/home/components/CoursesSection';
import Features from '~/lib/containers/home/components/Features';
import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';
import Hero from '~/lib/containers/home/components/Hero';
import InstructorCTA from '~/lib/containers/home/components/InstructorCTA';
import Testimonials from '~/lib/components/Testimonials';
import WhatsAppBanner from '~/lib/components/WhatsAppBanner';
import { testimonials } from '~/lib/constants/landing';
import { getPublishedLandingCourseCards, type LandingCourseCard } from '~/lib/firebase/courses';

const HomePage = async () => {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
	let landingCourses: LandingCourseCard[] = [];
	try {
		landingCourses = await getPublishedLandingCourseCards();
	} catch {
		landingCourses = [];
	}
	const featuredCourse = landingCourses[0];
	const jsonLdType = 'application/ld+json';

	const organizationJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Shattak',
		url: siteUrl,
		description: 'Live classes, expert mentors, and career-ready learning.',
		sameAs: []
	};

	const courseJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Course',
		name: featuredCourse?.title ?? 'Live Class From Expert Mentors',
		description: 'Live class from expert mentors.',
		provider: {
			'@type': 'Organization',
			name: 'Shattak',
			sameAs: siteUrl
		}
	};

	return (
		<>
			<script type={jsonLdType}>{JSON.stringify(organizationJsonLd)}</script>
			<script type={jsonLdType}>{JSON.stringify(courseJsonLd)}</script>

			<Header />
			<main>
				<Hero />
				<CoursesSection courses={landingCourses} />
				<WhatsAppBanner />
				<Features />
				<InstructorCTA />
				<Testimonials items={testimonials} />
			</main>
			<Footer />
		</>
	);
};

export default HomePage;
