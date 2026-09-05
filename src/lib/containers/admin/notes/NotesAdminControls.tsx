'use client';

import { Box, Input, Stack, Text, type InputProps } from '@chakra-ui/react';
import type { ChangeEvent, ReactNode } from 'react';

export const NotesField = ({ label, helper, children }: { label: string; helper?: string; children: ReactNode }) => (
	<Stack as="label" gap={1} minW={0}>
		<Text fontSize="xs" fontWeight="semibold">
			{label}
		</Text>
		{children}
		{helper ? (
			<Text color="text.muted" fontSize="2xs">
				{helper}
			</Text>
		) : null}
	</Stack>
);

export const NotesInput = (props: InputProps) => <Input h="40px" bg="bg.card" {...props} />;

export const NotesSelect = ({
	label,
	value,
	onChange,
	children,
	disabled = false
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	children: ReactNode;
	disabled?: boolean;
}) => (
	<NotesField label={label}>
		<Box
			asChild
			h="40px"
			w="full"
			border="1px solid"
			borderColor="border.muted"
			borderRadius="md"
			bg="bg.card"
			color="text.primary"
			px={3}
			fontSize="sm"
			_disabled={{ opacity: 0.55, cursor: 'not-allowed' }}
		>
			<select
				value={value}
				disabled={disabled}
				onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.currentTarget.value)}
			>
				{children}
			</select>
		</Box>
	</NotesField>
);

const getStatusStyles = (tone: 'neutral' | 'error' | 'success') => {
	if (tone === 'error') {
		return { borderColor: 'red.200', bg: 'red.50', color: 'red.600' };
	}

	if (tone === 'success') {
		return { borderColor: 'green.200', bg: 'green.50', color: 'green.600' };
	}

	return { borderColor: 'border.default', bg: 'bg.subtle', color: 'text.muted' };
};

export const NotesStatus = ({
	message,
	tone = 'neutral'
}: {
	message: string;
	tone?: 'neutral' | 'error' | 'success';
}) => {
	if (!message) return null;
	const styles = getStatusStyles(tone);

	return (
		<Box
			role={tone === 'error' ? 'alert' : 'status'}
			border="1px solid"
			borderColor={styles.borderColor}
			borderRadius="lg"
			bg={styles.bg}
			_dark={{ bg: 'bg.card' }}
			px={4}
			py={3}
		>
			<Text color={styles.color} fontSize="sm">
				{message}
			</Text>
		</Box>
	);
};
