'use client';

import { Badge, Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type MultiSelectDropdownProps = {
	label: string;
	options: readonly string[];
	selectedValues: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
	error?: string;
	minW?: { base?: string; md?: string } | string;
};

const toggleValue = (values: string[], value: string) =>
	values.includes(value) ? values.filter(item => item !== value) : [...values, value];

const getSummaryLabel = (selectedValues: string[], placeholder: string) => {
	if (!selectedValues.length) {
		return placeholder;
	}

	if (selectedValues.length === 1) {
		return selectedValues[0];
	}

	return `${selectedValues.length} categories selected`;
};

const MultiSelectDropdown = ({
	label,
	options,
	selectedValues,
	onChange,
	placeholder = 'Select categories',
	error,
	minW = { base: '100%', md: '260px' }
}: MultiSelectDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

	useEffect(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);

		return () => document.removeEventListener('pointerdown', handlePointerDown);
	}, []);

	return (
		<Box ref={rootRef} minW={minW} position="relative">
			<Text fontSize="xs" color="text.muted" mb={1}>
				{label}
			</Text>
			<Button
				type="button"
				variant="outline"
				borderRadius="md"
				h="40px"
				w="100%"
				justifyContent="space-between"
				fontWeight="normal"
				onClick={() => setIsOpen(value => !value)}
			>
				<Text as="span" lineClamp={1} color={selectedValues.length ? 'text.primary' : 'text.muted'}>
					{getSummaryLabel(selectedValues, placeholder)}
				</Text>
				<Text as="span" color="text.muted">
					{isOpen ? 'Close' : 'Open'}
				</Text>
			</Button>

			{isOpen ? (
				<Box
					position="absolute"
					top="calc(100% + 6px)"
					left={0}
					right={0}
					zIndex={20}
					bg="bg.card"
					border="1px solid"
					borderColor="border.default"
					borderRadius="lg"
					boxShadow="elevated"
					p={3}
				>
					<Stack gap={2} maxH="260px" overflowY="auto">
						{options.map(option => (
							<Box
								key={option}
								as="label"
								display="flex"
								alignItems="center"
								gap={2}
								px={2}
								py={2}
								borderRadius="md"
								cursor="pointer"
								_hover={{ bg: 'bg.subtle' }}
							>
								<input
									type="checkbox"
									checked={selectedSet.has(option)}
									onChange={() => onChange(toggleValue(selectedValues, option))}
								/>
								<Text fontSize="sm">{option}</Text>
							</Box>
						))}
					</Stack>
					<HStack mt={3} gap={2} justify="space-between">
						<Text fontSize="xs" color="text.muted">
							{selectedValues.length} selected
						</Text>
						<Button type="button" size="xs" variant="ghost" onClick={() => onChange([])}>
							Clear
						</Button>
					</HStack>
				</Box>
			) : null}

			{selectedValues.length ? (
				<HStack mt={2} gap={2} flexWrap="wrap">
					{selectedValues.map(value => (
						<Badge key={value} borderRadius="full" colorPalette="red">
							{value}
						</Badge>
					))}
				</HStack>
			) : null}

			{error ? (
				<Text mt={1} fontSize="xs" color="red.500">
					{error}
				</Text>
			) : null}
		</Box>
	);
};

export default MultiSelectDropdown;
