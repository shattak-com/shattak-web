import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { Controller, type Control, type FieldErrors, type Path, type UseFormRegister } from 'react-hook-form';

import ImageUrlUploadField from '~/lib/components/forms/ImageUrlUploadField';

import type { CourseEditorFormValues } from './schema';
import { getFieldError } from './utils';

export const FormField = ({
	label,
	name,
	register,
	errors,
	type = 'text',
	placeholder
}: {
	label: string;
	name: Path<CourseEditorFormValues>;
	register: UseFormRegister<CourseEditorFormValues>;
	errors: FieldErrors<CourseEditorFormValues>;
	type?: string;
	placeholder?: string;
}) => {
	const error = getFieldError(errors, name);
	const registration = type === 'number' ? register(name, { valueAsNumber: true }) : register(name);

	return (
		<Box>
			<Text fontSize="xs" color="text.muted" mb={1}>
				{label}
			</Text>
			<Input {...registration} type={type} placeholder={placeholder} h="40px" />
			{error ? (
				<Text mt={1} fontSize="xs" color="red.500">
					{error}
				</Text>
			) : null}
		</Box>
	);
};

export const ImageField = ({
	label,
	name,
	control,
	errors,
	placeholder
}: {
	label: string;
	name: Path<CourseEditorFormValues>;
	control: Control<CourseEditorFormValues>;
	errors: FieldErrors<CourseEditorFormValues>;
	placeholder?: string;
}) => (
	<Controller
		control={control}
		name={name}
		render={({ field }) => (
			<ImageUrlUploadField
				label={label}
				value={typeof field.value === 'string' ? field.value : ''}
				onChange={field.onChange}
				error={getFieldError(errors, name)}
				placeholder={placeholder}
			/>
		)}
	/>
);

export const TextareaField = ({
	label,
	name,
	register,
	errors,
	minH = '100px',
	placeholder
}: {
	label: string;
	name: Path<CourseEditorFormValues>;
	register: UseFormRegister<CourseEditorFormValues>;
	errors: FieldErrors<CourseEditorFormValues>;
	minH?: string;
	placeholder?: string;
}) => {
	const error = getFieldError(errors, name);

	return (
		<Box>
			<Text fontSize="xs" color="text.muted" mb={1}>
				{label}
			</Text>
			<textarea
				{...register(name)}
				placeholder={placeholder}
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
			{error ? (
				<Text mt={1} fontSize="xs" color="red.500">
					{error}
				</Text>
			) : null}
		</Box>
	);
};

export const SelectField = ({
	label,
	name,
	register,
	options
}: {
	label: string;
	name: Path<CourseEditorFormValues>;
	register: UseFormRegister<CourseEditorFormValues>;
	options: Array<{ label: string; value: string }>;
}) => (
	<Box>
		<Text fontSize="xs" color="text.muted" mb={1}>
			{label}
		</Text>
		<select
			{...register(name)}
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
	</Box>
);

export const EmptyEditorState = ({ label }: { label: string }) => (
	<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={4}>
		<Text fontSize="sm" color="text.muted">
			No {label.toLowerCase()} added yet.
		</Text>
	</Box>
);

export const EditorCard = ({
	title,
	onRemove,
	children
}: {
	title: string;
	onRemove: () => void;
	children: React.ReactNode;
}) => (
	<Box border="1px solid" borderColor="border.default" borderRadius="lg" p={4}>
		<Stack gap={3}>
			<HStack justify="space-between" gap={3}>
				<Text fontSize="sm" fontWeight="semibold">
					{title}
				</Text>
				<Button size="xs" variant="outline" borderRadius="full" color="red.500" onClick={onRemove}>
					Remove
				</Button>
			</HStack>
			{children}
		</Stack>
	</Box>
);

export const EditorSectionHeader = ({ title, action }: { title: string; action: React.ReactNode }) => (
	<HStack justify="space-between" gap={3} flexWrap="wrap">
		<Text fontSize="sm" fontWeight="semibold">
			{title}
		</Text>
		{action}
	</HStack>
);
