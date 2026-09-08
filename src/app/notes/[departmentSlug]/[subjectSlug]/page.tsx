import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getNotesSubject, type NoteCategory } from '~/lib/api/notes';
import ContributorBanner from '~/lib/containers/notes/components/ContributorBanner';
import NotesBreadcrumbs from '~/lib/containers/notes/components/NotesBreadcrumbs';
import NotesList from '~/lib/containers/notes/components/NotesList';
import NotesPageFrame from '~/lib/containers/notes/components/NotesPageFrame';
import SubjectDirectory from '~/lib/containers/notes/components/SubjectDirectory';
import { loadFeaturedCourses } from '~/lib/containers/notes/data';
import { isNotesNotFoundError } from '~/lib/containers/notes/errors';

export const revalidate = 60;

type SubjectPageProps = {
	params: Promise<{ departmentSlug: string; subjectSlug: string }>;
	searchParams: Promise<{ category?: string; page?: string }>;
};

const getSubject = cache((departmentSlug: string, subjectSlug: string, category?: NoteCategory, page = 1) =>
	getNotesSubject(departmentSlug, subjectSlug, { category, page, pageSize: 20 })
);

const parseCategory = (value?: string): NoteCategory | undefined =>
	value && ['NOTES', 'PYQ', 'LAB'].includes(value.toUpperCase()) ? (value.toUpperCase() as NoteCategory) : undefined;

export const generateMetadata = async ({ params }: SubjectPageProps): Promise<Metadata> => {
	const { departmentSlug, subjectSlug } = await params;
	try {
		const data = await getSubject(decodeURIComponent(departmentSlug), decodeURIComponent(subjectSlug));
		return {
			title: `${data.subject.name} Notes, PDFs & PYQs`,
			description: `Browse ${data.subject.name} notes, PDFs, presentations, labs, and previous-year questions for ${data.department.name}.`,
			alternates: { canonical: `/notes/${data.department.slug}/${data.subject.slug}` }
		};
	} catch {
		return { title: 'Notes Subject Not Found', robots: { index: false, follow: false } };
	}
};

const NotesSubjectPage = async ({ params, searchParams }: SubjectPageProps) => {
	const [{ departmentSlug, subjectSlug }, query] = await Promise.all([params, searchParams]);
	const category = parseCategory(query.category);
	const rawPage = Number(query.page ?? '1');
	const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
	let data;
	try {
		data = await getSubject(decodeURIComponent(departmentSlug), decodeURIComponent(subjectSlug), category, page);
	} catch (error) {
		if (isNotesNotFoundError(error)) notFound();
		throw error;
	}
	const featuredCourses = await loadFeaturedCourses();

	return (
		<NotesPageFrame featuredCourses={featuredCourses}>
			<Container maxW="6xl" py={{ base: 8, md: 12 }}>
				<Stack gap={{ base: 8, md: 10 }}>
					<NotesBreadcrumbs
						items={[
							{ label: 'Notes', href: '/notes' },
							{ label: data.department.name, href: `/notes/${data.department.slug}` },
							{ label: data.subject.name }
						]}
					/>
					<Box>
						<Text color="text.brand" fontWeight="bold" fontSize="xs" letterSpacing="wider" textTransform="uppercase">
							{data.department.name}
						</Text>
						<Heading as="h1" fontSize={{ base: '3xl', md: '5xl' }} lineHeight="title" mt={2}>
							{data.subject.name}
						</Heading>
						<Text color="text.muted" mt={2}>
							Notes, presentations, labs, and previous-year questions.
						</Text>
					</Box>
					<ContributorBanner />
					<NotesList
						notes={data.notes}
						departmentSlug={data.department.slug}
						subjectSlug={data.subject.slug}
						activeCategory={category}
						pagination={data.pagination}
					/>
					{data.otherSubjects.length ? (
						<SubjectDirectory
							subjects={data.otherSubjects}
							departmentSlug={data.department.slug}
							title="Other Subjects in This Department"
						/>
					) : null}
				</Stack>
			</Container>
		</NotesPageFrame>
	);
};

export default NotesSubjectPage;
