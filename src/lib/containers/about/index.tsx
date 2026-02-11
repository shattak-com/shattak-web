import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';
import Testimonials from '~/lib/components/Testimonials';
import AboutAudience from '~/lib/containers/about/components/AboutAudience';
import AboutFaq from '~/lib/containers/about/components/AboutFaq';
import AboutFinalCta from '~/lib/containers/about/components/AboutFinalCta';
import AboutHero from '~/lib/containers/about/components/AboutHero';
import AboutHowItWorks from '~/lib/containers/about/components/AboutHowItWorks';
import AboutPortfolio from '~/lib/containers/about/components/AboutPortfolio';
import AboutValues from '~/lib/containers/about/components/AboutValues';
import AboutWhy from '~/lib/containers/about/components/AboutWhy';
import { testimonials } from '~/lib/constants/landing';

const AboutPage = () => {
	const testimonialItems = testimonials.slice(0, 3);

	return (
		<>
			<Header />
			<main>
				<AboutHero />
				<AboutWhy />
				<AboutHowItWorks />
				<AboutPortfolio />
				<AboutAudience />
				<Testimonials
					items={testimonialItems}
					title="Stories from Shattak learners"
					subtitle="Real feedback from people building practical skills through mentor-led live classes."
					sectionId="testimonials"
					background="bg.surface"
					variant="modern"
					containerMaxW="6xl"
				/>
				<AboutValues />
				<AboutFaq />
				<AboutFinalCta />
			</main>
			<Footer />
		</>
	);
};

export default AboutPage;
