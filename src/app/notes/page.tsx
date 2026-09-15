import { Box, Container, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import type { Metadata } from 'next';

import { getNotesLanding, type NotesLandingData } from '~/lib/api/notes';
import ContributorBanner from '~/lib/containers/notes/components/ContributorBanner';
import DepartmentGrid from '~/lib/containers/notes/components/DepartmentGrid';
import NotesHero from '~/lib/containers/notes/components/NotesHero';
import NotesPageFrame from '~/lib/containers/notes/components/NotesPageFrame';
import SubjectDirectory from '~/lib/containers/notes/components/SubjectDirectory';
import { loadFeaturedCourses } from '~/lib/containers/notes/data';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
	title: 'Free Class Notes, PDFs & Previous-Year Questions',
	description:
		'Browse class notes, PDFs, lab resources, presentations, and previous-year questions by department and subject.',
	alternates: { canonical: '/notes' },
	openGraph: {
		title: 'Shattak Notes — Class Notes, PDFs & PYQs',
		description: 'Find useful study resources shared by students and seniors.',
		url: new URL('/notes', SITE_URL).toString(),
		type: 'website'
	}
};

const emptyLanding: NotesLandingData = { departments: [], popularSubjects: [] };

const NotesHomePage = async () => {
	const [landingResult, featuredCourses] = await Promise.all([
		getNotesLanding().catch(() => emptyLanding),
		loadFeaturedCourses()
	]);
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Shattak Notes',
		description: 'Class notes, PDFs, lab resources, presentations, and previous-year questions.',
		url: new URL('/notes', SITE_URL).toString()
	};

	return (
		<NotesPageFrame featuredCourses={featuredCourses}>
			{/* eslint-disable-next-line react/no-danger */}
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
			<Container maxW="6xl" py={{ base: 8, md: 12 }}>
				<Stack gap={{ base: 10, md: 14 }}>
					<NotesHero />
					<Box id="notes-departments" as="section" aria-labelledby="notes-departments-heading" scrollMarginTop="96px">
						<Flex justify="space-between" align="flex-end" mb={5} gap={4}>
							<Box>
								<Text
									color="text.brand"
									fontWeight="bold"
									fontSize="xs"
									letterSpacing="wider"
									textTransform="uppercase"
								>
									Find your course
								</Text>
								<Heading id="notes-departments-heading" size={{ base: 'lg', md: 'xl' }} mt={1}>
									Departments
								</Heading>
							</Box>
							<Text color="text.muted" fontSize="sm" display={{ base: 'none', sm: 'block' }}>
								{landingResult.departments.length} departments · Tap to explore
							</Text>
						</Flex>
						<DepartmentGrid departments={landingResult.departments} />
					</Box>
					<ContributorBanner />
					<SubjectDirectory subjects={landingResult.popularSubjects} />
				</Stack>
			</Container>
		</NotesPageFrame>
	);
};

export default NotesHomePage;
