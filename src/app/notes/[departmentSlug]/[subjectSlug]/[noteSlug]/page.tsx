import { Badge, Box, Container, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getNoteDetail } from '~/lib/api/notes';
import ContributorBanner from '~/lib/containers/notes/components/ContributorBanner';
import NotesBreadcrumbs from '~/lib/containers/notes/components/NotesBreadcrumbs';
import NotesList from '~/lib/containers/notes/components/NotesList';
import NotesPageFrame from '~/lib/containers/notes/components/NotesPageFrame';
import NoteViewer from '~/lib/containers/notes/components/NoteViewer';
import { loadFeaturedCourses } from '~/lib/containers/notes/data';
import { isNotesNotFoundError } from '~/lib/containers/notes/errors';
import { formatNoteDate, getCategoryLabel, getResourceLabel } from '~/lib/containers/notes/utils';

export const revalidate = 60;

type NotePageProps = { params: Promise<{ departmentSlug: string; subjectSlug: string; noteSlug: string }> };
const getNote = cache((departmentSlug: string, subjectSlug: string, noteSlug: string) =>
	getNoteDetail(departmentSlug, subjectSlug, noteSlug)
);

export const generateMetadata = async ({ params }: NotePageProps): Promise<Metadata> => {
	const { departmentSlug, subjectSlug, noteSlug } = await params;
	try {
		const data = await getNote(
			decodeURIComponent(departmentSlug),
			decodeURIComponent(subjectSlug),
			decodeURIComponent(noteSlug)
		);
		return {
			title: `${data.note.title} — ${data.subject.name}`,
			description: `View ${data.note.title}, a ${getCategoryLabel(data.note.category)} resource for ${data.subject.name}.`,
			alternates: { canonical: `/notes/${data.department.slug}/${data.subject.slug}/${data.note.slug}` }
		};
	} catch {
		return { title: 'Note Not Found', robots: { index: false, follow: false } };
	}
};

const NotePage = async ({ params }: NotePageProps) => {
	const { departmentSlug, subjectSlug, noteSlug } = await params;
	let data;
	try {
		data = await getNote(
			decodeURIComponent(departmentSlug),
			decodeURIComponent(subjectSlug),
			decodeURIComponent(noteSlug)
		);
	} catch (error) {
		if (isNotesNotFoundError(error)) notFound();
		throw error;
	}
	const featuredCourses = await loadFeaturedCourses();
	const canonicalPath = `/notes/${data.department.slug}/${data.subject.slug}/${data.note.slug}`;
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'LearningResource',
		name: data.note.title,
		learningResourceType: getCategoryLabel(data.note.category),
		about: data.subject.name,
		url: new URL(canonicalPath, siteUrl).toString(),
		datePublished: data.note.resourceDate
	};

	return (
		<NotesPageFrame featuredCourses={featuredCourses}>
			{/* eslint-disable-next-line react/no-danger */}
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
			<Container maxW="6xl" py={{ base: 8, md: 12 }}>
				<Stack gap={{ base: 8, md: 10 }}>
					<NotesBreadcrumbs
						items={[
							{ label: 'Notes', href: '/notes' },
							{ label: data.department.name, href: `/notes/${data.department.slug}` },
							{ label: data.subject.name, href: `/notes/${data.department.slug}/${data.subject.slug}` },
							{ label: data.note.title }
						]}
					/>
					<Box>
						<Text color="text.muted" fontSize="sm" fontWeight="medium">
							{data.subject.name}
						</Text>
						<Heading as="h1" fontSize={{ base: '3xl', md: '5xl' }} lineHeight="title" mt={2}>
							{data.note.title}
						</Heading>
						<HStack mt={3} gap={2} flexWrap="wrap">
							<Badge colorPalette="orange" variant="subtle" borderRadius="full">
								{getCategoryLabel(data.note.category)}
							</Badge>
							<Text color="text.muted" fontSize="sm">
								{getResourceLabel(data.note.resourceType)} · {formatNoteDate(data.note.resourceDate)}
							</Text>
						</HStack>
					</Box>
					<ContributorBanner />
					<NoteViewer note={data.note} />
					{data.otherNotes.length ? (
						<NotesList
							notes={data.otherNotes}
							departmentSlug={data.department.slug}
							subjectSlug={data.subject.slug}
							showFilters={false}
							heading="Other Notes in This Subject"
						/>
					) : null}
				</Stack>
			</Container>
		</NotesPageFrame>
	);
};

export default NotePage;
