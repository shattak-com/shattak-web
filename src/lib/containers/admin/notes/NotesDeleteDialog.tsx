'use client';

import { Button, HStack } from '@chakra-ui/react';

import NotesModal from './NotesModal';

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
}) => (
	<NotesModal
		open={open}
		title={title}
		description={message}
		onClose={onCancel}
		closeDisabled={isDeleting}
		size="md"
		footer={
			<HStack justify="flex-end" gap={2} w="full" flexWrap="wrap">
				<Button variant="outline" borderRadius="full" disabled={isDeleting} onClick={onCancel}>
					Cancel
				</Button>
				<Button bg="red.500" color="white" borderRadius="full" disabled={isDeleting} onClick={onConfirm}>
					{isDeleting ? 'Deleting...' : confirmLabel}
				</Button>
			</HStack>
		}
	/>
);

export default NotesDeleteDialog;
