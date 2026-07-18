import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react';

import type { PendingRemoval } from './types';

export const ConfirmationDialog = ({
	confirmation,
	onCancel,
	onConfirm
}: {
	confirmation: PendingRemoval;
	onCancel: () => void;
	onConfirm: () => void;
}) => (
	<>
		<Box position="fixed" inset={0} bg="blackAlpha.700" zIndex={1690} onClick={onCancel} />
		<Box
			position="fixed"
			top="50%"
			left="50%"
			transform="translate(-50%, -50%)"
			w={{ base: 'calc(100vw - 32px)', sm: '420px' }}
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
			aria-labelledby="curriculum-remove-title"
			aria-describedby="curriculum-remove-description"
		>
			<Stack gap={4}>
				<Box>
					<Text id="curriculum-remove-title" fontSize="lg" fontWeight="bold">
						{confirmation.title}
					</Text>
					<Text id="curriculum-remove-description" mt={2} fontSize="sm" color="text.muted">
						{confirmation.message}
					</Text>
				</Box>
				<HStack justify="flex-end" gap={2} flexWrap="wrap">
					<Button type="button" variant="outline" borderRadius="full" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="button" bg="red.500" color="white" borderRadius="full" onClick={onConfirm}>
						{confirmation.confirmLabel}
					</Button>
				</HStack>
			</Stack>
		</Box>
	</>
);
