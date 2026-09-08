'use client';

import { AspectRatio, Box, Button, Flex, Heading, Icon, Spinner, Stack, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiDownload, FiExternalLink, FiFolder, FiLock } from 'react-icons/fi';

import { trackNotesEvent } from '~/lib/analytics/mixpanel';
import { accessNote, type PublicNote } from '~/lib/api/notes';
import NotesAccessMessage from '~/lib/containers/notes/components/NotesAccessMessage';
import useNotesAuth from '~/lib/containers/notes/hooks/useNotesAuth';
import { createNoteViewerUrl } from '~/lib/containers/notes/utils';

const NoteViewer = ({ note }: { note: PublicNote }) => {
	const pathname = usePathname();
	const { authState, setAuthState } = useNotesAuth();
	const [resourceUrl, setResourceUrl] = useState('');
	const [error, setError] = useState('');
	const [isDownloading, setIsDownloading] = useState(false);
	const hasRequestedView = useRef(false);
	const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

	useEffect(() => {
		if (authState !== 'authenticated' || hasRequestedView.current) return;
		hasRequestedView.current = true;

		accessNote(note.id, 'VIEW')
			.then(resource => {
				setResourceUrl(resource.resourceUrl);
				trackNotesEvent({
					eventName: 'Note Viewed',
					location: 'notes_resources',
					noteId: note.id,
					category: note.category,
					resourceType: note.resourceType,
					action: 'VIEW'
				});
			})
			.catch(requestError => {
				const statusCode =
					typeof requestError === 'object' && requestError && 'statusCode' in requestError
						? Number(requestError.statusCode)
						: 0;
				if (statusCode === 401) setAuthState('anonymous');
				else setError('The viewer could not load this resource. Please try again.');
				trackNotesEvent({
					eventName: 'Note Access Failed',
					location: 'notes_resources',
					noteId: note.id,
					action: 'VIEW',
					errorType: statusCode ? `http_${statusCode}` : 'request_failed'
				});
			});
	}, [authState, note.category, note.id, note.resourceType, setAuthState]);

	const handleDownload = async () => {
		setIsDownloading(true);
		setError('');
		const resourceWindow = window.open('about:blank', '_blank');
		if (resourceWindow) resourceWindow.opener = null;
		try {
			const resource = await accessNote(note.id, 'DOWNLOAD');
			if (resourceWindow) resourceWindow.location.href = resource.resourceUrl;
			else window.open(resource.resourceUrl, '_blank', 'noopener,noreferrer');
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
			const statusCode =
				typeof requestError === 'object' && requestError && 'statusCode' in requestError
					? Number(requestError.statusCode)
					: 0;
			if (statusCode === 401) setAuthState('anonymous');
			else setError('The resource could not be opened. Please try again.');
		} finally {
			setIsDownloading(false);
		}
	};

	if (authState === 'checking' || (authState === 'authenticated' && !resourceUrl && !error)) {
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
						Preparing the secure viewer…
					</Text>
				</Stack>
			</Flex>
		);
	}

	if (authState === 'anonymous') {
		return (
			<Flex
				minH={{ base: '320px', md: '480px' }}
				bg="bg.card"
				border="1px solid"
				borderColor="border.default"
				borderRadius="panel"
				align="center"
				justify="center"
				p={6}
			>
				<Stack maxW="520px" align="center" textAlign="center" gap={5}>
					<Flex boxSize={14} borderRadius="full" bg="bg.brand" color="text.brand" align="center" justify="center">
						<Icon as={FiLock} boxSize={6} />
					</Flex>
					<Stack gap={1}>
						<Heading size="lg">Log in to view this note</Heading>
						<Text color="text.muted">
							Resource links are available to signed-in learners. Your place on this page will be preserved.
						</Text>
					</Stack>
					<NotesAccessMessage message="Please log in to securely open this Notes resource." loginHref={loginHref} />
				</Stack>
			</Flex>
		);
	}

	if (error) {
		return <NotesAccessMessage message={error} variant="error" />;
	}

	if (note.resourceType === 'FOLDER') {
		return (
			<Flex
				minH={{ base: '300px', md: '420px' }}
				bg="bg.card"
				border="1px solid"
				borderColor="border.default"
				borderRadius="panel"
				align="center"
				justify="center"
				p={6}
			>
				<Stack align="center" textAlign="center" gap={4} maxW="480px">
					<Flex boxSize={16} borderRadius="panel" bg="bg.accent" color="text.accent" align="center" justify="center">
						<Icon as={FiFolder} boxSize={7} />
					</Flex>
					<Stack gap={1}>
						<Heading size="lg">Open this resource folder</Heading>
						<Text color="text.muted">
							This note is a Google Drive folder containing one or more learning resources.
						</Text>
					</Stack>
					<Button asChild bg="primary" color="text.inverse" borderRadius="full">
						<a href={resourceUrl} target="_blank" rel="noopener noreferrer">
							<FiExternalLink /> Open Drive folder
						</a>
					</Button>
				</Stack>
			</Flex>
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
