'use client';

import { Box, Button, HStack, Portal, Stack, Text } from '@chakra-ui/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';

const modalWidths = {
	md: '640px',
	lg: '820px',
	xl: '1320px'
} as const;

const NotesModalHeaderActions = ({
	allowFullScreen,
	isFullScreen,
	closeDisabled,
	onFullScreenChange,
	onClose
}: {
	allowFullScreen: boolean;
	isFullScreen: boolean;
	closeDisabled: boolean;
	onFullScreenChange: () => void;
	onClose: () => void;
}) => (
	<HStack gap={1} flexShrink={0}>
		{allowFullScreen ? (
			<Button
				type="button"
				size="sm"
				variant="ghost"
				borderRadius="full"
				aria-label={isFullScreen ? 'Exit full screen' : 'Open full screen'}
				title={isFullScreen ? 'Exit full screen' : 'Full screen'}
				aria-pressed={isFullScreen}
				onClick={onFullScreenChange}
			>
				{isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
				<Text as="span" display={{ base: 'none', sm: 'inline' }}>
					{isFullScreen ? 'Exit full screen' : 'Full screen'}
				</Text>
			</Button>
		) : null}
		<Button
			aria-label="Close dialog"
			title="Close"
			size="sm"
			variant="ghost"
			borderRadius="full"
			flexShrink={0}
			disabled={closeDisabled}
			onClick={onClose}
		>
			<FiX />
		</Button>
	</HStack>
);

const NotesModal = ({
	open,
	title,
	description,
	children,
	footer,
	onClose,
	size = 'lg',
	closeDisabled = false,
	allowFullScreen = false
}: {
	open: boolean;
	title: string;
	description?: string;
	children?: ReactNode;
	footer?: ReactNode;
	onClose: () => void;
	size?: keyof typeof modalWidths;
	closeDisabled?: boolean;
	allowFullScreen?: boolean;
}) => {
	const [isFullScreen, setIsFullScreen] = useState(false);
	const titleId = useId();
	const descriptionId = useId();
	const dialogRef = useRef<HTMLDivElement>(null);
	const onCloseRef = useRef(onClose);
	const closeDisabledRef = useRef(closeDisabled);

	useEffect(() => {
		onCloseRef.current = onClose;
		closeDisabledRef.current = closeDisabled;
	}, [closeDisabled, onClose]);

	useEffect(() => {
		if (!open) return undefined;
		const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		dialogRef.current?.focus();

		const handleKeyDown = (event: KeyboardEvent) => {
			const floatingControl = document.querySelector<HTMLElement>('[data-modal-floating="true"]');
			if (event.key === 'Escape' && !closeDisabledRef.current) {
				if (floatingControl) return;
				onCloseRef.current();
				return;
			}

			if (event.key !== 'Tab' || !dialogRef.current) return;
			const focusableSelector =
				'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]';
			const focusable = [
				...Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)),
				...(floatingControl ? Array.from(floatingControl.querySelectorAll<HTMLElement>(focusableSelector)) : [])
			];
			if (!focusable.length) {
				event.preventDefault();
				dialogRef.current.focus();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = previousOverflow;
			previousFocus?.focus();
		};
	}, [open]);

	if (!open) return null;

	return (
		<Portal>
			<Box position="fixed" inset={0} zIndex={1690} bg="blackAlpha.700" onClick={() => !closeDisabled && onClose()} />
			<Box
				position="fixed"
				inset={0}
				zIndex={1700}
				display="grid"
				placeItems="center"
				p={isFullScreen ? 0 : { base: 3, md: 6 }}
				pointerEvents="none"
			>
				<Box
					ref={dialogRef}
					tabIndex={-1}
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
					aria-describedby={description ? descriptionId : undefined}
					w="full"
					maxW={isFullScreen ? '100vw' : modalWidths[size]}
					h={isFullScreen ? '100dvh' : undefined}
					maxH={isFullScreen ? '100dvh' : { base: 'calc(100dvh - 24px)', md: 'calc(100dvh - 48px)' }}
					bg="bg.card"
					border="1px solid"
					borderColor="border.default"
					borderRadius={isFullScreen ? 0 : 'xl'}
					boxShadow="2xl"
					overflow="hidden"
					pointerEvents="auto"
				>
					<Stack gap={0} h="full" maxH="inherit">
						<HStack
							align="flex-start"
							justify="space-between"
							gap={4}
							px={{ base: 4, md: 5 }}
							py={4}
							borderBottom="1px solid"
							borderColor="border.default"
						>
							<Box>
								<Text id={titleId} fontSize="lg" fontWeight="bold">
									{title}
								</Text>
								{description ? (
									<Text id={descriptionId} mt={1} color="text.muted" fontSize="sm">
										{description}
									</Text>
								) : null}
							</Box>
							<NotesModalHeaderActions
								allowFullScreen={allowFullScreen}
								isFullScreen={isFullScreen}
								closeDisabled={closeDisabled}
								onFullScreenChange={() => setIsFullScreen(current => !current)}
								onClose={onClose}
							/>
						</HStack>
						{children ? (
							<Box flex="1" minH={0} px={{ base: 4, md: 5 }} py={5} overflowY="auto">
								{children}
							</Box>
						) : null}
						{footer ? (
							<Box px={{ base: 4, md: 5 }} py={4} borderTop="1px solid" borderColor="border.default" bg="bg.subtle">
								{footer}
							</Box>
						) : null}
					</Stack>
				</Box>
			</Box>
		</Portal>
	);
};

export default NotesModal;
