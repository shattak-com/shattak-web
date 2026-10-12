'use client';

import { AspectRatio, Box, Button, Flex, Spinner, Stack, Text } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import { trackNotesEvent } from '~/lib/analytics/mixpanel';
import { ApiRequestError } from '~/lib/api/client';
import { accessNote, type PublicNote } from '~/lib/api/notes';
import FolderResourceViewer from '~/lib/containers/notes/components/FolderResourceViewer';
import NotesAccessMessage from '~/lib/containers/notes/components/NotesAccessMessage';
import useNotesAuth from '~/lib/containers/notes/hooks/useNotesAuth';
import { createNotesLoginHref, createNoteViewerUrl } from '~/lib/containers/notes/utils';

const NoteViewer = ({ note }: { note: PublicNote }) => {
	const pathname = usePathname();
	const router = useRouter();
	const { authState, setAuthState } = useNotesAuth();
	const [resource, setResource] = useState<{ noteId: string; url: string } | null>(null);
	const [viewerError, setViewerError] = useState<{ noteId: string; message: string } | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);
	const viewRequest = useRef<{ noteId: string; promise: ReturnType<typeof accessNote>; tracked: boolean } | null>(null);
	const hasRedirectedToLogin = useRef(false);
	const resourceUrl = resource?.noteId === note.id ? resource.url : '';
	const error = viewerError?.noteId === note.id ? viewerError.message : '';

	const redirectToLogin = useCallback(
		(action: 'VIEW' | 'DOWNLOAD') => {
			if (hasRedirectedToLogin.current) return;
			hasRedirectedToLogin.current = true;
			trackNotesEvent({
				eventName: 'Authentication Required',
				location: 'notes_resources',
				noteId: note.id,
				category: note.category,
				resourceType: note.resourceType,
				action
			});
			router.replace(createNotesLoginHref(`${pathname}${window.location.search}`));
		},
		[note.category, note.id, note.resourceType, pathname, router]
	);

	useEffect(() => {
		if (authState === 'anonymous') redirectToLogin('VIEW');
	}, [authState, redirectToLogin]);

	useEffect(() => {
		if (authState !== 'authenticated') return undefined;
		let active = true;

		if (viewRequest.current?.noteId !== note.id) {
			viewRequest.current = { noteId: note.id, promise: accessNote(note.id, 'VIEW'), tracked: false };
		}

		viewRequest.current.promise
			.then(result => {
				if (!active) return;
				setResource({ noteId: note.id, url: result.resourceUrl });
				if (viewRequest.current?.noteId === note.id && !viewRequest.current.tracked) {
					viewRequest.current.tracked = true;
					trackNotesEvent({
						eventName: 'Note Viewed',
						location: 'notes_resources',
						noteId: note.id,
						category: note.category,
						resourceType: note.resourceType,
						action: 'VIEW'
					});
				}
			})
			.catch(requestError => {
				if (!active) return;
				const statusCode = requestError instanceof ApiRequestError ? requestError.statusCode : 0;
				if (statusCode === 401) {
					setAuthState('anonymous');
					redirectToLogin('VIEW');
				} else {
					setViewerError({ noteId: note.id, message: 'The viewer could not load this resource. Please try again.' });
				}
				trackNotesEvent({
					eventName: 'Note Access Failed',
					location: 'notes_resources',
					noteId: note.id,
					action: 'VIEW',
					errorType: statusCode ? `http_${statusCode}` : 'request_failed'
				});
			});

		return () => {
			active = false;
		};
	}, [authState, note.category, note.id, note.resourceType, redirectToLogin, setAuthState]);

	const handleDownload = async () => {
		setIsDownloading(true);
		setViewerError(null);
		const resourceWindow = window.open('about:blank', '_blank');
		if (resourceWindow) resourceWindow.opener = null;
		try {
			const download = await accessNote(note.id, 'DOWNLOAD');
			if (resourceWindow) resourceWindow.location.href = download.resourceUrl;
			else window.open(download.resourceUrl, '_blank', 'noopener,noreferrer');
			trackNotesEvent({
				eventName: 'Note Download Opened',
				location: 'notes_resources',
				noteId: note.id,
				category: note.category,
				resourceType: note.resourceType,
				action: 'DOWNLOAD'
			});
		} catch (requestError) {
			resourceWindow?.close();
			const statusCode = requestError instanceof ApiRequestError ? requestError.statusCode : 0;
			if (statusCode === 401) {
				setAuthState('anonymous');
				redirectToLogin('DOWNLOAD');
			} else {
				setViewerError({ noteId: note.id, message: 'The resource could not be opened. Please try again.' });
			}
		} finally {
			setIsDownloading(false);
		}
	};

	if (
		authState === 'checking' ||
		authState === 'anonymous' ||
		(authState === 'authenticated' && !resourceUrl && !error)
	) {
		return (
			<Flex
				minH={{ base: '360px', md: '560px' }}
				bg="bg.card"
				border="1px solid"
				borderColor="border.default"
				borderRadius="panel"
				align="center"
				justify="center"
			>
				<Stack align="center" gap={3} role="status">
					<Spinner color="primary" size="lg" />
					<Text color="text.muted" fontSize="sm">
						{authState === 'anonymous' ? 'Opening login…' : 'Preparing the secure viewer…'}
					</Text>
				</Stack>
			</Flex>
		);
	}

	if (authState === 'error') {
		return <NotesAccessMessage message="Your session could not be checked. Please refresh the page and try again." />;
	}

	if (error) {
		return <NotesAccessMessage message={error} />;
	}

	if (note.resourceType === 'FOLDER') {
		return (
			<FolderResourceViewer
				resourceUrl={resourceUrl}
				title={note.title}
				onOpenExternally={() =>
					trackNotesEvent({
						eventName: 'Folder Opened Externally',
						location: 'notes_resources',
						noteId: note.id,
						category: note.category,
						resourceType: note.resourceType,
						action: 'VIEW'
					})
				}
			/>
		);
	}

	return (
		<Box
			bg="bg.card"
			border="1px solid"
			borderColor="border.default"
			borderRadius="panel"
			overflow="hidden"
			boxShadow="card"
		>
			<Flex
				px={{ base: 4, md: 5 }}
				py={3}
				align="center"
				justify="space-between"
				borderBottom="1px solid"
				borderColor="border.default"
				gap={3}
			>
				<Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
					Secure note viewer
				</Text>
				<Button size="sm" variant="outline" borderRadius="full" onClick={handleDownload} loading={isDownloading}>
					<FiDownload /> Download
				</Button>
			</Flex>
			<AspectRatio ratio={{ base: 3 / 4, md: 16 / 10 }} bg="gray.950">
				<iframe
					src={createNoteViewerUrl(resourceUrl, note.resourceType)}
					title={note.title}
					loading="lazy"
					allow="autoplay"
					referrerPolicy="strict-origin-when-cross-origin"
				/>
			</AspectRatio>
		</Box>
	);
};

export default NoteViewer;
