'use client';

import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react';

const NotesDeleteDialog = ({
	open,
	title,
	message,
	confirmLabel,
	isDeleting,
	onCancel,
	onConfirm
}: {
	open: boolean;
	title: string;
	message: string;
	confirmLabel: string;
	isDeleting: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}) => {
	if (!open) return null;

	return (
		<>
			<Box position="fixed" inset={0} bg="blackAlpha.700" zIndex={1690} onClick={onCancel} />
			<Box
				position="fixed"
				top="50%"
				left="50%"
				transform="translate(-50%, -50%)"
				w={{ base: 'calc(100vw - 32px)', sm: '440px' }}
				maxW="100vw"
				bg="bg.card"
				border="1px solid"
				borderColor="border.default"
				borderRadius="xl"
				boxShadow="2xl"
				p={5}
				zIndex={1700}
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="notes-delete-title"
				aria-describedby="notes-delete-description"
			>
				<Stack gap={4}>
					<Box>
						<Text id="notes-delete-title" fontSize="lg" fontWeight="bold">
							{title}
						</Text>
						<Text id="notes-delete-description" mt={2} color="text.muted" fontSize="sm">
							{message}
						</Text>
					</Box>
					<HStack justify="flex-end" gap={2} flexWrap="wrap">
						<Button variant="outline" borderRadius="full" disabled={isDeleting} onClick={onCancel}>
							Cancel
						</Button>
						<Button bg="red.500" color="white" borderRadius="full" disabled={isDeleting} onClick={onConfirm}>
							{isDeleting ? 'Deleting...' : confirmLabel}
						</Button>
					</HStack>
				</Stack>
			</Box>
		</>
	);
};

export default NotesDeleteDialog;
