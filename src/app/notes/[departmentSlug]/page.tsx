import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getNotesDepartment, getNotesLanding } from '~/lib/api/notes';
import ContributorBanner from '~/lib/containers/notes/components/ContributorBanner';
import NotesBreadcrumbs from '~/lib/containers/notes/components/NotesBreadcrumbs';
import NotesPageFrame from '~/lib/containers/notes/components/NotesPageFrame';
import SubjectDirectory from '~/lib/containers/notes/components/SubjectDirectory';
import { assertNotesSlugs, isNotesNotFoundError } from '~/lib/containers/notes/errors';

export const revalidate = 3600;
export const dynamic = 'force-static';

// Bound build work to the small directory set, never thousands of note slugs.
export const generateStaticParams = async () => {
	const landing = await getNotesLanding().catch(() => null);
	return (landing?.departments ?? []).slice(0, 24).map(({ slug }) => ({ departmentSlug: slug }));
};

type DepartmentPageProps = { params: Promise<{ departmentSlug: string }> };
const getDepartment = cache(async (slug: string) => {
	assertNotesSlugs(slug);
	return getNotesDepartment(slug);
});

export const generateMetadata = async ({ params }: DepartmentPageProps): Promise<Metadata> => {
	const { departmentSlug } = await params;
	try {
		const { department } = await getDepartment(departmentSlug);
		return {
			title: `${department.name} Notes & Study Resources`,
			description: `Browse subjects, notes, PDFs, PYQs, and lab resources for ${department.name}.`,
			alternates: { canonical: `/notes/${department.slug}` }
		};
	} catch {
		return { title: 'Notes Department Not Found', robots: { index: false, follow: false } };
	}
};

const NotesDepartmentPage = async ({ params }: DepartmentPageProps) => {
	const { departmentSlug } = await params;
	let data;
	try {
		data = await getDepartment(departmentSlug);
	} catch (error) {
		if (isNotesNotFoundError(error)) notFound();
		throw error;
	}

	return (
		<NotesPageFrame>
			<Container maxW="6xl" py={{ base: 8, md: 12 }}>
				<Stack gap={{ base: 8, md: 10 }}>
					<NotesBreadcrumbs items={[{ label: 'All departments', href: '/notes' }, { label: data.department.name }]} />
					<Box>
						<Text color="text.brand" fontWeight="bold" fontSize="xs" letterSpacing="wider" textTransform="uppercase">
							Notes department
						</Text>
						<Heading as="h1" fontSize={{ base: '3xl', md: '5xl' }} lineHeight="title" mt={2}>
							{data.department.name}
						</Heading>
						<Text color="text.muted" mt={2}>
							{data.department.subjectCount} {data.department.subjectCount === 1 ? 'subject' : 'subjects'} available
						</Text>
					</Box>
					<ContributorBanner />
					<SubjectDirectory subjects={data.subjects} departmentSlug={data.department.slug} showShare title="Subjects" />
				</Stack>
			</Container>
		</NotesPageFrame>
	);
};

export default NotesDepartmentPage;
