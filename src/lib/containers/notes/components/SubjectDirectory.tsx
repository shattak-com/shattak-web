'use client';

import { Box, Button, Flex, Heading, Icon, Input, InputGroup, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FiCheck, FiChevronRight, FiSearch, FiShare2 } from 'react-icons/fi';

import { trackNotesEvent } from '~/lib/analytics/mixpanel';
import type { NoteSubject } from '~/lib/api/notes';

type SubjectDirectoryProps = {
	subjects: NoteSubject[];
	departmentSlug?: string;
	showShare?: boolean;
	title?: string;
};

const subjectColorPalettes = ['purple', 'orange', 'green', 'pink', 'blue', 'teal'] as const;
const subjectConnectorWords = new Set(['and', 'of', 'the', 'for', 'with', 'in', 'to', 'a', 'an']);

const getSubjectInitials = (name: string) => {
	const words = (name.replace(/\([^)]*\)/g, '').match(/[\p{L}\p{N}]+/gu) ?? []).filter(
		word => !subjectConnectorWords.has(word.toLowerCase())
	);

	if (words.length > 1) {
		return `${Array.from(words[0] ?? '')[0] ?? ''}${Array.from(words[1] ?? '')[0] ?? ''}`.toUpperCase();
	}

	return (
		Array.from(words[0] ?? name.trim())
			.slice(0, 2)
			.join('')
			.toUpperCase() || 'NA'
	);
};

const getSubjectColorPalette = (identity: string) => {
	let hash = 0;

	for (let index = 0; index < identity.length; index += 1) {
		hash = (hash * 31 + identity.charCodeAt(index)) % 2_147_483_647;
	}

	return subjectColorPalettes[hash % subjectColorPalettes.length];
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
				<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
					{filteredSubjects.map(subject => {
						const selectedDepartment = departmentSlug
							? subject.departments.find(department => department.slug === departmentSlug)
							: subject.departments[0];
						const href = selectedDepartment ? `/notes/${selectedDepartment.slug}/${subject.slug}` : '/notes';
						const colorPalette = getSubjectColorPalette(subject.id);
						return (
							<Box
								key={subject.id}
								asChild
								bg="bg.card"
								border="1px solid"
								borderColor="border.default"
								borderRadius="tile"
								p={4}
								minW={0}
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
									<Flex gap={3} align="center" h="full">
										<Flex
											boxSize={11}
											borderRadius="soft"
											colorPalette={colorPalette}
											bg="colorPalette.subtle"
											align="center"
											justify="center"
											color="colorPalette.fg"
											flexShrink={0}
											aria-hidden="true"
										>
											<Text fontWeight="bold" fontSize="md" lineHeight="1">
												{getSubjectInitials(subject.name)}
											</Text>
										</Flex>
										<Stack gap={1} minW={0} flex={1}>
											<Text fontWeight="semibold" fontSize="sm" lineHeight="compact" overflowWrap="anywhere">
												{subject.name}
											</Text>
											<Text color="text.muted" fontSize="xs">
												{subject.noteCount} {subject.noteCount === 1 ? 'resource' : 'resources'} available
											</Text>
										</Stack>
										<Flex
											boxSize={6}
											borderRadius="full"
											bg="bg.surface"
											color="text.muted"
											align="center"
											justify="center"
											flexShrink={0}
											aria-hidden="true"
										>
											<Icon as={FiChevronRight} boxSize={3.5} />
										</Flex>
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
