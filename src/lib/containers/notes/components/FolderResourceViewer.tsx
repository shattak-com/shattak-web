'use client';

import { Box, Button, Flex, Heading, Icon, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { FiExternalLink, FiFolder } from 'react-icons/fi';

import { createNoteViewerUrl } from '~/lib/containers/notes/utils';

type FolderResourceViewerProps = {
	resourceUrl: string;
	title: string;
	onOpenExternally: () => void;
};

type FolderViewerState = 'loading' | 'ready' | 'failed';

const FolderFallback = ({
	resourceUrl,
	onOpenExternally
}: Pick<FolderResourceViewerProps, 'resourceUrl' | 'onOpenExternally'>) => (
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
					The embedded folder preview is unavailable. You can still open all learning resources directly in Google
					Drive.
				</Text>
			</Stack>
			<Button asChild bg="primary" color="text.inverse" borderRadius="full">
				<a href={resourceUrl} target="_blank" rel="noopener noreferrer" onClick={onOpenExternally}>
					<FiExternalLink /> Open Drive folder
				</a>
			</Button>
		</Stack>
	</Flex>
);

const FolderResourceViewer = ({ resourceUrl, title, onOpenExternally }: FolderResourceViewerProps) => {
	const viewerUrl = useMemo(() => createNoteViewerUrl(resourceUrl, 'FOLDER'), [resourceUrl]);
	const [viewerState, setViewerState] = useState<FolderViewerState>(viewerUrl ? 'loading' : 'failed');

	useEffect(() => {
		setViewerState(viewerUrl ? 'loading' : 'failed');
		if (!viewerUrl) return undefined;

		const fallbackTimer = window.setTimeout(() => {
			setViewerState(currentState => (currentState === 'loading' ? 'failed' : currentState));
		}, 15_000);

		return () => window.clearTimeout(fallbackTimer);
	}, [viewerUrl]);

	if (viewerState === 'failed') {
		return <FolderFallback resourceUrl={resourceUrl} onOpenExternally={onOpenExternally} />;
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
				<Stack minW={0} gap={0}>
					<Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
						Resource folder
					</Text>
					<Text color="text.muted" fontSize="xs" display={{ base: 'none', sm: 'block' }}>
						Select a resource to open it in a new tab.
					</Text>
				</Stack>
				<Button asChild size="sm" variant="outline" borderRadius="full" flexShrink={0}>
					<a href={resourceUrl} target="_blank" rel="noopener noreferrer" onClick={onOpenExternally}>
						<FiExternalLink /> Open folder
					</a>
				</Button>
			</Flex>

			<Box
				position="relative"
				h={{ base: 'min(68dvh, 560px)', md: '680px' }}
				minH={{ base: '380px', md: '560px' }}
				bg="bg.subtle"
			>
				{viewerState === 'loading' ? (
					<Flex position="absolute" inset={0} zIndex={1} bg="bg.card" align="center" justify="center">
						<Stack align="center" gap={3} role="status">
							<Spinner color="primary" size="lg" />
							<Text color="text.muted" fontSize="sm">
								Loading resource folder…
							</Text>
						</Stack>
					</Flex>
				) : null}

				<iframe
					src={viewerUrl}
					title={`${title} resource folder`}
					loading="eager"
					referrerPolicy="strict-origin-when-cross-origin"
					sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
					style={{ border: 0, height: '100%', opacity: viewerState === 'ready' ? 1 : 0, width: '100%' }}
					onLoad={() => setViewerState('ready')}
					onError={() => setViewerState('failed')}
				/>
			</Box>
		</Box>
	);
};

export default FolderResourceViewer;
