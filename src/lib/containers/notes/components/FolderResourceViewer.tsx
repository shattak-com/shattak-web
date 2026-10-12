'use client';

import {
	Badge,
	Box,
	Button,
	chakra,
	Flex,
	Heading,
	HStack,
	Icon,
	Portal,
	Spinner,
	Stack,
	Text
} from '@chakra-ui/react';
import { type ReactNode, type RefObject, useEffect, useId, useRef, useState } from 'react';
import {
	FiAlertCircle,
	FiExternalLink,
	FiFolder,
	FiGrid,
	FiList,
	FiMaximize2,
	FiMinimize2,
	FiRefreshCw
} from 'react-icons/fi';

import { createDriveFolderViewerUrl } from '~/lib/containers/notes/utils';

type FolderResourceViewerProps = {
	resourceUrl: string;
	title: string;
	onOpenExternally: () => void;
};

type FolderLayout = 'grid' | 'list';
type FolderViewerState = 'loading' | 'ready' | 'slow' | 'failed';

const previewHeight = { base: 'min(52dvh, 400px)', md: 'clamp(340px, 48dvh, 460px)' };
const previewMinHeight = { base: '320px', md: '340px' };
const folderLayouts = [
	{ value: 'grid', label: 'Grid', icon: FiGrid },
	{ value: 'list', label: 'List', icon: FiList }
] as const;

const ExpandedFolderDialog = chakra('dialog');

const FolderPreviewStatus = ({
	viewerState,
	canRetry,
	onRetry
}: {
	viewerState: FolderViewerState;
	canRetry: boolean;
	onRetry: () => void;
}) => {
	const isWaiting = viewerState === 'loading' || viewerState === 'slow';
	const isUnavailable = viewerState === 'failed';
	const unavailableMessage = canRetry
		? 'Use Open in Drive above to access this folder, or reload its preview.'
		: 'This link cannot be previewed here. Use Open in Drive above to access the original resource.';
	return (
		<Flex position="absolute" inset={0} bg="bg.card" direction="column" overflowY="auto" p={{ base: 5, md: 8 }}>
			<Stack
				align="center"
				textAlign="center"
				gap={3}
				maxW="400px"
				w="full"
				m="auto"
				flexShrink={0}
				role={isUnavailable ? 'alert' : 'status'}
			>
				<Flex boxSize={14} borderRadius="tile" bg="bg.accent" color="text.accent" align="center" justify="center">
					{isWaiting ? <Spinner size="lg" /> : <Icon as={FiAlertCircle} boxSize={6} />}
				</Flex>
				<Stack gap={1}>
					<Text fontWeight="semibold">{isUnavailable ? 'Folder preview unavailable' : 'Loading your resources…'}</Text>
					<Text fontSize="sm" color="text.muted">
						{isUnavailable ? unavailableMessage : 'Browse the folder, then select a file to open it in a new tab.'}
					</Text>
				</Stack>
				{viewerState === 'slow' ? (
					<Text fontSize="sm" color="text.muted">
						Drive is taking longer than usual. Reload the preview or open the folder in Drive.
					</Text>
				) : null}
				{canRetry && (viewerState === 'slow' || isUnavailable) ? (
					<Button variant="outline" borderRadius="full" onClick={onRetry}>
						<FiRefreshCw /> Retry preview
					</Button>
				) : null}
			</Stack>
		</Flex>
	);
};

const FolderPreview = ({
	viewerUrl,
	title,
	expanded = false,
	onRetry
}: {
	viewerUrl: string;
	title: string;
	expanded?: boolean;
	onRetry: () => void;
}) => {
	const [viewerState, setViewerState] = useState<FolderViewerState>(viewerUrl ? 'loading' : 'failed');

	useEffect(() => {
		if (!viewerUrl) return undefined;
		const timer = window.setTimeout(() => {
			setViewerState(state => (state === 'loading' ? 'slow' : state));
		}, 15_000);
		return () => window.clearTimeout(timer);
	}, [viewerUrl]);

	const isWaiting = viewerState === 'loading' || viewerState === 'slow';

	return (
		<Box
			position="relative"
			h={expanded ? '100%' : previewHeight}
			minH={expanded ? 0 : previewMinHeight}
			minW={0}
			flex={expanded ? 1 : undefined}
			bg="white"
			aria-busy={isWaiting}
		>
			{viewerUrl ? (
				<iframe
					src={viewerUrl}
					title={`${title} resource folder`}
					loading="eager"
					referrerPolicy="strict-origin-when-cross-origin"
					sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
					style={{ border: 0, display: 'block', height: '100%', width: '100%' }}
					onLoad={() => setViewerState('ready')}
					onError={() => setViewerState('failed')}
				/>
			) : null}
			{viewerState !== 'ready' ? (
				<FolderPreviewStatus viewerState={viewerState} canRetry={Boolean(viewerUrl)} onRetry={onRetry} />
			) : null}
		</Box>
	);
};

type FolderPanelProps = FolderResourceViewerProps & {
	layout: FolderLayout;
	onLayoutChange: (layout: FolderLayout) => void;
	onReload: () => void;
	expanded?: boolean;
	onToggleExpanded: () => void;
	expandButtonRef?: RefObject<HTMLButtonElement | null>;
	headingId?: string;
	children: ReactNode;
};

const FolderPanel = ({
	resourceUrl,
	title,
	onOpenExternally,
	layout,
	onLayoutChange,
	onReload,
	expanded = false,
	onToggleExpanded,
	expandButtonRef,
	headingId,
	children
}: FolderPanelProps) => {
	const titleElement = (
		<Heading id={headingId} as="h2" size={{ base: 'md', md: 'lg' }} color="text.primary" overflowWrap="anywhere">
			{title}
		</Heading>
	);

	return (
		<Flex direction="column" h={expanded ? '100%' : undefined} minH={0} minW={0} bg="bg.card">
			<Flex
				p={{ base: 4, md: 5 }}
				gap={4}
				align={{ base: 'stretch', sm: 'center' }}
				justify="space-between"
				direction={{ base: 'column', sm: 'row' }}
				flexShrink={0}
			>
				<Flex gap={3} align="center" minW={0} flex={1}>
					<Flex
						boxSize={12}
						borderRadius="tile"
						bg="bg.accent"
						color="text.accent"
						flexShrink={0}
						align="center"
						justify="center"
					>
						<Icon as={FiFolder} boxSize={6} aria-hidden="true" />
					</Flex>
					<Stack gap={1} minW={0}>
						<HStack gap={2} flexWrap="wrap">
							<Text fontSize="xs" color="text.muted" fontWeight="bold" letterSpacing="wider" textTransform="uppercase">
								Resource library
							</Text>
							<Badge bg="bg.accent" color="text.secondary" borderRadius="full" px={2}>
								Google Drive
							</Badge>
						</HStack>
						{titleElement}
					</Stack>
				</Flex>
				<Button asChild size="sm" minH={10} variant="outline" borderRadius="full" flexShrink={0}>
					<a href={resourceUrl} target="_blank" rel="noopener noreferrer" onClick={onOpenExternally}>
						<FiExternalLink aria-hidden="true" /> Open in Drive
					</a>
				</Button>
			</Flex>

			<Flex
				px={{ base: 4, md: 5 }}
				py={3}
				gap={3}
				flexWrap="wrap"
				align="center"
				justify="space-between"
				bg="bg.surface"
				borderBlock="1px solid"
				borderColor="border.default"
				flexShrink={0}
			>
				<HStack
					role="group"
					aria-label="Folder layout"
					gap={1}
					p={1}
					border="1px solid"
					borderColor="border.default"
					borderRadius="full"
				>
					{folderLayouts.map(option => (
						<Button
							key={option.value}
							size="sm"
							minH={10}
							variant="ghost"
							borderRadius="full"
							bg={layout === option.value ? 'bg.accent' : 'transparent'}
							color={layout === option.value ? 'text.primary' : 'text.muted'}
							aria-pressed={layout === option.value}
							onClick={() => onLayoutChange(option.value)}
						>
							<Icon as={option.icon} aria-hidden="true" /> {option.label}
						</Button>
					))}
				</HStack>
				<HStack gap={2} flexWrap="wrap">
					<Button
						size="sm"
						minH={10}
						variant="ghost"
						borderRadius="full"
						onClick={onReload}
						aria-label="Reload folder preview"
					>
						<FiRefreshCw aria-hidden="true" /> Reload
					</Button>
					<Button
						ref={expandButtonRef}
						autoFocus={expanded}
						size="sm"
						minH={10}
						variant="outline"
						borderRadius="full"
						onClick={onToggleExpanded}
						aria-haspopup={expanded ? undefined : 'dialog'}
						aria-label={expanded ? 'Close expanded folder view' : 'Expand folder view'}
					>
						{expanded ? <FiMinimize2 aria-hidden="true" /> : <FiMaximize2 aria-hidden="true" />}
						{expanded ? 'Close' : 'Expand'}
					</Button>
				</HStack>
			</Flex>
			{children}
			<Text px={{ base: 4, md: 5 }} py={3} fontSize="xs" color="text.muted" bg="bg.surface" flexShrink={0}>
				Select a file to open it in a new tab. If Drive asks for access, use Open in Drive.
			</Text>
		</Flex>
	);
};

const FolderResourceViewer = ({ resourceUrl, title, onOpenExternally }: FolderResourceViewerProps) => {
	const [layout, setLayout] = useState<FolderLayout>('grid');
	const [isExpanded, setIsExpanded] = useState(false);
	const [reloadCount, setReloadCount] = useState(0);
	const expandButtonRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const expandedTitleId = useId();
	const viewerUrl = createDriveFolderViewerUrl(resourceUrl, layout);
	const reload = () => setReloadCount(count => count + 1);
	const panelProps = { resourceUrl, title, onOpenExternally, layout, onLayoutChange: setLayout, onReload: reload };
	const previewKey = `${viewerUrl}:${reloadCount}`;

	useEffect(() => {
		if (!isExpanded || !dialogRef.current) return undefined;
		const dialog = dialogRef.current;
		const returnFocus = expandButtonRef.current;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		if (!dialog.open) dialog.showModal();
		return () => {
			dialog.close();
			document.body.style.overflow = previousOverflow;
			returnFocus?.focus();
		};
	}, [isExpanded]);

	return (
		<>
			<Box border="1px solid" borderColor="border.default" borderRadius="panel" overflow="hidden" bg="bg.card" minW={0}>
				<FolderPanel {...panelProps} expandButtonRef={expandButtonRef} onToggleExpanded={() => setIsExpanded(true)}>
					{isExpanded ? (
						<Flex h={previewHeight} minH={previewMinHeight} align="center" justify="center" p={5}>
							<Text color="text.muted" fontSize="sm">
								Folder is open in expanded view.
							</Text>
						</Flex>
					) : (
						<FolderPreview key={previewKey} viewerUrl={viewerUrl} title={title} onRetry={reload} />
					)}
				</FolderPanel>
			</Box>
			{isExpanded ? (
				<Portal>
					<ExpandedFolderDialog
						ref={dialogRef}
						aria-labelledby={expandedTitleId}
						aria-modal="true"
						onCancel={event => {
							event.preventDefault();
							setIsExpanded(false);
						}}
						position="fixed"
						inset={0}
						m={0}
						p={0}
						w="full"
						maxW="none"
						h="100dvh"
						maxH="100dvh"
						border={0}
						bg="bg.card"
						color="text.primary"
						overflow="hidden"
						css={{ '&::backdrop': { bg: 'blackAlpha.700' } }}
					>
						<FolderPanel
							{...panelProps}
							headingId={expandedTitleId}
							expanded
							onToggleExpanded={() => setIsExpanded(false)}
						>
							<FolderPreview key={previewKey} viewerUrl={viewerUrl} title={title} expanded onRetry={reload} />
						</FolderPanel>
					</ExpandedFolderDialog>
				</Portal>
			) : null}
		</>
	);
};

export default FolderResourceViewer;
