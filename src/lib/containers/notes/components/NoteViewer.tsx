'use client';

import { AspectRatio, Box, Button, Flex, Spinner, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import { trackNotesEvent } from '~/lib/analytics/mixpanel';
import { ApiRequestError } from '~/lib/api/client';
import { downloadNote, previewNote, type PublicNote } from '~/lib/api/notes';
import FolderResourceViewer from '~/lib/containers/notes/components/FolderResourceViewer';
import NotesAccessMessage from '~/lib/containers/notes/components/NotesAccessMessage';
import { createNotesLoginHref } from '~/lib/containers/notes/utils';

const NoteViewer = ({ note }: { note: PublicNote }) => {
	const router = useRouter();
	const [resource, setResource] = useState<{ noteId: string; url: string | null } | null>(null);
	const [viewerError, setViewerError] = useState<{ noteId: string; message: string } | null>(null);
	const [downloadError, setDownloadError] = useState<{ noteId: string; message: string } | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);
	const viewRequest = useRef<{ noteId: string; promise: ReturnType<typeof previewNote>; tracked: boolean } | null>(
		null
	);
	const preview = resource?.noteId === note.id ? resource : null;
	const error = viewerError?.noteId === note.id ? viewerError.message : '';
	const downloadNotice = downloadError?.noteId === note.id ? downloadError.message : '';

	useEffect(() => {
		let active = true;

		if (viewRequest.current?.noteId !== note.id) {
			viewRequest.current = { noteId: note.id, promise: previewNote(note.id), tracked: false };
		}

		viewRequest.current.promise
			.then(result => {
				if (!active) return;
				setResource({ noteId: note.id, url: result.previewUrl });
				if (result.previewUrl && viewRequest.current?.noteId === note.id && !viewRequest.current.tracked) {
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
				setViewerError({ noteId: note.id, message: 'The viewer could not load this resource. Please try again.' });
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
	}, [note.category, note.id, note.resourceType]);

	const handleDownload = async () => {
		setIsDownloading(true);
		setDownloadError(null);
		const resourceWindow = window.open('about:blank', '_blank');
		if (resourceWindow) resourceWindow.opener = null;
		try {
			const download = await downloadNote(note.id);
			if (resourceWindow) resourceWindow.location.href = download.resourceUrl;
			else window.open(download.resourceUrl, '_blank', 'noopener,noreferrer');
			trackNotesEvent({
				eventName: note.resourceType === 'FOLDER' ? 'Folder Opened Externally' : 'Note Download Opened',
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
				trackNotesEvent({
					eventName: 'Authentication Required',
					location: 'notes_resources',
					noteId: note.id,
					category: note.category,
					resourceType: note.resourceType,
					action: 'DOWNLOAD'
				});
				router.push(createNotesLoginHref(`${window.location.pathname}${window.location.search}`));
			} else {
				setDownloadError({ noteId: note.id, message: 'The download could not be opened. Please try again.' });
			}
		} finally {
			setIsDownloading(false);
		}
	};

	if (!preview && !error) {
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
						Loading preview…
					</Text>
				</Stack>
			</Flex>
		);
	}

	if (note.resourceType === 'FOLDER' && preview) {
		return (
			<FolderResourceViewer
				previewUrl={preview.url}
				title={note.title}
				onDownload={handleDownload}
				isDownloading={isDownloading}
				downloadError={downloadNotice}
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
					Note preview
				</Text>
				<Button size="sm" variant="outline" borderRadius="full" onClick={handleDownload} loading={isDownloading}>
					<FiDownload /> Download
				</Button>
			</Flex>
			{downloadNotice ? <NotesAccessMessage message={downloadNotice} /> : null}
			{preview?.url ? (
				<AspectRatio ratio={{ base: 3 / 4, md: 16 / 10 }} bg="gray.950">
					<iframe
						src={preview.url}
						title={note.title}
						loading="lazy"
						allow="autoplay"
						referrerPolicy="strict-origin-when-cross-origin"
					/>
				</AspectRatio>
			) : (
				<NotesAccessMessage message={error || 'This resource cannot be previewed here. Sign in to download it.'} />
			)}
		</Box>
	);
};

export default NoteViewer;
