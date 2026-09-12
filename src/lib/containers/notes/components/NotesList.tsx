'use client';

import { Badge, Box, Button, Flex, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiDownload, FiEye, FiFileText, FiFolder, FiMonitor } from 'react-icons/fi';

import { trackNotesEvent } from '~/lib/analytics/mixpanel';
import { accessNote, type NoteCategory, type PublicNote } from '~/lib/api/notes';
import NotesAccessMessage from '~/lib/containers/notes/components/NotesAccessMessage';
import useNotesAuth from '~/lib/containers/notes/hooks/useNotesAuth';
import { formatNoteDate, getCategoryLabel, getResourceLabel } from '~/lib/containers/notes/utils';

type NotesListProps = {
	notes: PublicNote[];
	departmentSlug: string;
	subjectSlug: string;
	activeCategory?: NoteCategory;
	pagination?: { page: number; totalPages: number; total: number };
	showFilters?: boolean;
	heading?: string;
};

const categoryOptions: Array<{ value?: NoteCategory; label: string }> = [
	{ label: 'All resources' },
	{ value: 'NOTES', label: 'Notes' },
	{ value: 'PYQ', label: 'PYQ' },
	{ value: 'LAB', label: 'Lab' }
];

const getResourceIcon = (type: PublicNote['resourceType']) => {
	if (type === 'FOLDER') return FiFolder;
	if (type === 'PPT') return FiMonitor;
	return FiFileText;
};

const getCategoryPalette = (category: NoteCategory) => {
	if (category === 'PYQ') return 'purple';
	if (category === 'LAB') return 'blue';
	return 'orange';
};

const NotesList = ({
	notes,
	departmentSlug,
	subjectSlug,
	activeCategory,
	pagination,
	showFilters = true,
	heading = 'Available Notes'
}: NotesListProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const { authState, setAuthState } = useNotesAuth();
	const [activeAction, setActiveAction] = useState('');
	const [notice, setNotice] = useState<{ message: string; variant: 'login' | 'error' } | null>(null);
	const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

	const requireLogin = (note: PublicNote, action: 'VIEW' | 'DOWNLOAD') => {
		setNotice({ message: 'Please log in to view or download Notes resources.', variant: 'login' });
		trackNotesEvent({
			eventName: 'Authentication Required',
			location: 'notes_resources',
			noteId: note.id,
			category: note.category,
			resourceType: note.resourceType,
			action
		});
	};

	const handleView = (note: PublicNote) => {
		if (authState !== 'authenticated') {
			requireLogin(note, 'VIEW');
			return;
		}
		const href = `/notes/${departmentSlug}/${subjectSlug}/${note.slug}`;
		trackNotesEvent({
			eventName: 'Note View Requested',
			location: 'notes_resources',
			noteId: note.id,
			category: note.category,
			resourceType: note.resourceType,
			action: 'VIEW'
		});
		router.push(href);
	};

	const handleDownload = async (note: PublicNote) => {
		if (authState !== 'authenticated') {
			requireLogin(note, 'DOWNLOAD');
			return;
		}

		const actionKey = `${note.id}:download`;
		setActiveAction(actionKey);
		setNotice(null);
		const resourceWindow = window.open('about:blank', '_blank');
		if (resourceWindow) resourceWindow.opener = null;

		try {
			const resource = await accessNote(note.id, 'DOWNLOAD');
			trackNotesEvent({
				eventName: 'Note Download Opened',
				location: 'notes_resources',
				noteId: note.id,
				category: note.category,
				resourceType: note.resourceType,
				action: 'DOWNLOAD'
			});
			if (resourceWindow) {
				resourceWindow.location.href = resource.resourceUrl;
			} else {
				window.open(resource.resourceUrl, '_blank', 'noopener,noreferrer');
			}
		} catch (error) {
			resourceWindow?.close();
			const statusCode = typeof error === 'object' && error && 'statusCode' in error ? Number(error.statusCode) : 0;
			if (statusCode === 401) {
				setAuthState('anonymous');
				requireLogin(note, 'DOWNLOAD');
			} else {
				setNotice({ message: 'Please try again in a moment.', variant: 'error' });
				trackNotesEvent({
					eventName: 'Note Access Failed',
					location: 'notes_resources',
					noteId: note.id,
					action: 'DOWNLOAD',
					errorType: statusCode ? `http_${statusCode}` : 'request_failed'
				});
			}
		} finally {
			setActiveAction('');
		}
	};

	const categoryHref = (category?: NoteCategory) => {
		const params = new URLSearchParams();
		if (category) params.set('category', category);
		return params.size ? `${pathname}?${params.toString()}` : pathname;
	};
	const pageHref = (page: number) => {
		const baseHref = categoryHref(activeCategory);
		return `${baseHref}${activeCategory ? '&' : '?'}page=${page}`;
	};

	return (
		<Box as="section" aria-labelledby="notes-list-heading">
			<Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ md: 'flex-end' }} gap={4} mb={5}>
				<Box>
					<Heading id="notes-list-heading" size={{ base: 'lg', md: 'xl' }}>
						{heading}
					</Heading>
					<Text color="text.muted" fontSize="sm" mt={1}>
						{pagination?.total ?? notes.length} {(pagination?.total ?? notes.length) === 1 ? 'resource' : 'resources'} ·
						newest first
					</Text>
				</Box>
				{showFilters ? (
					<HStack gap={2} flexWrap="wrap">
						{categoryOptions.map(option => {
							const selected = option.value === activeCategory || (!option.value && !activeCategory);
							return (
								<Button
									key={option.label}
									asChild
									size="sm"
									borderRadius="full"
									variant={selected ? 'solid' : 'outline'}
									bg={selected ? 'primary' : 'bg.card'}
									color={selected ? 'text.inverse' : 'text.primary'}
								>
									<Link href={categoryHref(option.value)}>{option.label}</Link>
								</Button>
							);
						})}
					</HStack>
				) : null}
			</Flex>

			{notice ? (
				<Box mb={4}>
					<NotesAccessMessage
						message={notice.message}
						variant={notice.variant}
						loginHref={notice.variant === 'login' ? loginHref : undefined}
						onDismiss={() => setNotice(null)}
					/>
				</Box>
			) : null}

			<Stack gap={2.5}>
				{notes.map(note => (
					<Flex
						key={note.id}
						bg="bg.card"
						border="1px solid"
						borderColor="border.default"
						borderRadius="tile"
						p={{ base: 3, md: 4 }}
						gap={{ base: 3, md: 4 }}
						align={{ base: 'flex-start', md: 'center' }}
						direction={{ base: 'column', sm: 'row' }}
						_hover={{ borderColor: 'border.brandSoft', boxShadow: 'soft' }}
						transition="all 0.2s ease"
					>
						<Flex gap={3} minW={0} flex={1} align="center">
							<Flex
								boxSize={{ base: 9, md: 10 }}
								borderRadius="soft"
								bg="bg.brand"
								color="text.brand"
								align="center"
								justify="center"
								flexShrink={0}
							>
								<Icon as={getResourceIcon(note.resourceType)} />
							</Flex>
							<Stack gap={1} minW={0}>
								<Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }} lineClamp={2}>
									{note.title}
								</Text>
								<HStack gap={2} color="text.muted" fontSize="xs" flexWrap="wrap">
									<Badge variant="subtle" colorPalette={getCategoryPalette(note.category)} borderRadius="full">
										{getCategoryLabel(note.category)}
									</Badge>
									<Text>{getResourceLabel(note.resourceType)}</Text>
									<Text aria-hidden="true">·</Text>
									<Text>{formatNoteDate(note.resourceDate)}</Text>
								</HStack>
							</Stack>
						</Flex>
						<HStack w={{ base: '100%', sm: 'auto' }} gap={2} justify={{ base: 'flex-end', sm: 'initial' }}>
							<Button
								size="sm"
								variant="subtle"
								borderRadius="full"
								disabled={authState === 'checking'}
								onClick={() => handleView(note)}
							>
								<FiEye /> View
							</Button>
							<Button
								size="sm"
								variant="outline"
								borderRadius="full"
								disabled={authState === 'checking'}
								loading={activeAction === `${note.id}:download`}
								onClick={() => handleDownload(note)}
							>
								<FiDownload /> Download
							</Button>
						</HStack>
					</Flex>
				))}
			</Stack>

			{!notes.length ? (
				<Box border="1px dashed" borderColor="border.muted" borderRadius="panel" p={8} textAlign="center">
					<Icon as={FiFileText} boxSize={7} color="text.muted" mb={2} />
					<Text fontWeight="semibold">No resources found</Text>
					<Text color="text.muted" fontSize="sm" mt={1}>
						Try another filter or check back for new uploads.
					</Text>
				</Box>
			) : null}

			{pagination && pagination.totalPages > 1 ? (
				<HStack justify="center" mt={6}>
					{pagination.page > 1 ? (
						<Button asChild variant="outline" borderRadius="full">
							<Link href={pageHref(pagination.page - 1)}>Previous</Link>
						</Button>
					) : (
						<Button variant="outline" borderRadius="full" disabled>
							Previous
						</Button>
					)}
					<Text fontSize="sm" color="text.muted">
						Page {pagination.page} of {pagination.totalPages}
					</Text>
					{pagination.page < pagination.totalPages ? (
						<Button asChild variant="outline" borderRadius="full">
							<Link href={pageHref(pagination.page + 1)}>Next</Link>
						</Button>
					) : (
						<Button variant="outline" borderRadius="full" disabled>
							Next
						</Button>
					)}
				</HStack>
			) : null}
		</Box>
	);
};

export default NotesList;
