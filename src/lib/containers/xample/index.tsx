import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';
import XampleHero from '~/lib/containers/xample/components/XampleHero';

const AboutPage = () => {

	return (
		<>
			<Header />
				<main>
					<XampleHero />
				</main>
			<Footer />
		</>
	);
};

export default AboutPage;
