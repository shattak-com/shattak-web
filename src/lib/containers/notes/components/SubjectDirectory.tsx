'use client';

import { Box, Button, Flex, Heading, Icon, Input, InputGroup, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FiBookOpen, FiCheck, FiSearch, FiShare2 } from 'react-icons/fi';

import { trackNotesEvent } from '~/lib/analytics/mixpanel';
import type { NoteSubject } from '~/lib/api/notes';

type SubjectDirectoryProps = {
	subjects: NoteSubject[];
	departmentSlug?: string;
	showShare?: boolean;
	title?: string;
};

const SubjectDirectory = ({
	subjects,
	departmentSlug,
	showShare = false,
	title = 'Popular Subjects'
}: SubjectDirectoryProps) => {
	const [query, setQuery] = useState('');
	const [copied, setCopied] = useState(false);
	const filteredSubjects = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return subjects;
		return subjects.filter(subject =>
			[subject.name, ...subject.departments.map(department => department.name)].some(value =>
				value.toLowerCase().includes(normalized)
			)
		);
	}, [query, subjects]);

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1800);
			trackNotesEvent({ eventName: 'Page Link Copied', location: 'notes_subjects', action: 'share' });
		} catch {
			setCopied(false);
		}
	};

	return (
		<Box as="section" aria-labelledby="subject-directory-heading">
			<Flex direction={{ base: 'column', md: 'row' }} align={{ md: 'flex-end' }} justify="space-between" gap={4} mb={5}>
				<Box>
					<Text color="text.brand" fontWeight="bold" fontSize="xs" letterSpacing="wider" textTransform="uppercase">
						Browse resources
					</Text>
					<Heading id="subject-directory-heading" size={{ base: 'lg', md: 'xl' }} mt={1}>
						{title}
					</Heading>
				</Box>
				<Flex gap={2} w={{ base: '100%', md: 'auto' }}>
					<InputGroup startElement={<FiSearch />} flex={1} w={{ md: '330px' }}>
						<Input
							value={query}
							onChange={event => setQuery(event.target.value)}
							placeholder="Search subjects or departments"
							bg="bg.card"
							borderRadius="full"
							aria-label="Search subjects"
						/>
					</InputGroup>
					{showShare ? (
						<Button variant="outline" borderRadius="full" onClick={handleShare} flexShrink={0} aria-live="polite">
							{copied ? <FiCheck /> : <FiShare2 />} {copied ? 'Copied' : 'Share'}
						</Button>
					) : null}
				</Flex>
			</Flex>

			{filteredSubjects.length ? (
				<SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
					{filteredSubjects.map(subject => {
						const selectedDepartment = departmentSlug
							? subject.departments.find(department => department.slug === departmentSlug)
							: subject.departments[0];
						const href = selectedDepartment ? `/notes/${selectedDepartment.slug}/${subject.slug}` : '/notes';
						return (
							<Box
								key={subject.id}
								asChild
								bg="bg.card"
								border="1px solid"
								borderColor="border.default"
								borderRadius="tile"
								p={4}
								transition="all 0.2s ease"
								_hover={{ borderColor: 'border.accentSoft', bg: 'bg.accent', transform: 'translateY(-2px)' }}
							>
								<Link
									href={href}
									onClick={() =>
										trackNotesEvent({
											eventName: 'Subject Opened',
											location: 'notes_subjects',
											subjectId: subject.id,
											departmentId: selectedDepartment?.id
										})
									}
								>
									<Flex gap={3} align="center">
										<Flex
											boxSize={9}
											borderRadius="soft"
											bg="bg.accent"
											align="center"
											justify="center"
											color="text.accent"
											flexShrink={0}
										>
											<Icon as={FiBookOpen} />
										</Flex>
										<Stack gap={0.5} minW={0}>
											<Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
												{subject.name}
											</Text>
											<Text color="text.muted" fontSize="xs">
												{subject.noteCount} {subject.noteCount === 1 ? 'resource' : 'resources'} available
											</Text>
										</Stack>
									</Flex>
								</Link>
							</Box>
						);
					})}
				</SimpleGrid>
			) : (
				<Box border="1px dashed" borderColor="border.muted" borderRadius="panel" p={8} textAlign="center">
					<Icon as={FiSearch} boxSize={6} color="text.muted" mb={2} />
					<Text fontWeight="semibold">No subjects match “{query}”</Text>
					<Text color="text.muted" fontSize="sm" mt={1}>
						Try a shorter or different search term.
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default SubjectDirectory;
