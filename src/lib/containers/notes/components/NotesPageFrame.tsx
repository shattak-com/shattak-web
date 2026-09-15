import { Box, Container, Stack } from '@chakra-ui/react';

import type { LandingCourseCard } from '~/lib/api/courses';
import Footer from '~/lib/components/layout/Footer';
import Header from '~/lib/components/layout/Header';
import NotesWhatsAppBanner from '~/lib/containers/notes/components/NotesWhatsAppBanner';
import SuggestedCourses from '~/lib/containers/notes/components/SuggestedCourses';

type NotesPageFrameProps = {
	children: React.ReactNode;
	featuredCourses: LandingCourseCard[];
};

const NotesPageFrame = ({ children, featuredCourses }: NotesPageFrameProps) => (
	<>
		<Header />
		<Box as="main" bg="bg.surface" minH="70vh">
			{children}
			<Container maxW="6xl" pb={{ base: 12, md: 18 }}>
				<Stack gap={{ base: 8, md: 10 }}>
					<NotesWhatsAppBanner />
					<SuggestedCourses courses={featuredCourses} />
				</Stack>
			</Container>
		</Box>
		<Footer />
	</>
);

export default NotesPageFrame;
