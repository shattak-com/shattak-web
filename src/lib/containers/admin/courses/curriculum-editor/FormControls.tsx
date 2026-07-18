import { Box, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import type { CurriculumFeedback } from './types';

export const FieldLabel = ({ children }: { children: ReactNode }) => (
	<Text fontSize="xs" color="text.muted" mb={1}>
		{children}
	</Text>
);

export const TextareaInput = ({
	value,
	onChange,
	placeholder,
	minH = '88px'
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	minH?: string;
}) => (
	<textarea
		value={value}
		placeholder={placeholder}
		onChange={event => {
			const nextValue = event.currentTarget.value ?? '';

			onChange(nextValue);
		}}
		style={{
			minHeight: minH,
			width: '100%',
			border: '1px solid var(--chakra-colors-border-default)',
			borderRadius: '6px',
			background: 'var(--chakra-colors-bg-card)',
			padding: '8px 12px',
			fontSize: '14px',
			resize: 'vertical'
		}}
	/>
);

export const SelectInput = ({
	value,
	options,
	onChange
}: {
	value: string;
	options: Array<{ label: string; value: string }>;
	onChange: (value: string) => void;
}) => (
	<select
		value={value}
		onChange={event => {
			const nextValue = event.currentTarget.value ?? '';

			onChange(nextValue);
		}}
		style={{
			width: '100%',
			height: '40px',
			border: '1px solid var(--chakra-colors-border-default)',
			borderRadius: '6px',
			background: 'var(--chakra-colors-bg-card)',
			paddingInline: '12px',
			fontSize: '14px'
		}}
	>
		{options.map(option => (
			<option key={option.value} value={option.value}>
				{option.label}
			</option>
		))}
	</select>
);

const getFeedbackColor = (tone: CurriculumFeedback['tone']) => {
	if (tone === 'error') {
		return 'red.500';
	}

	if (tone === 'success') {
		return 'green.500';
	}

	return 'text.muted';
};

export const FeedbackBox = ({ feedback }: { feedback: CurriculumFeedback }) => (
	<Box
		border="1px solid"
		borderColor={feedback.tone === 'error' ? 'red.400' : 'border.default'}
		borderRadius="lg"
		p={3}
	>
		<Text fontSize="sm" color={getFeedbackColor(feedback.tone)}>
			{feedback.message}
		</Text>
	</Box>
);
