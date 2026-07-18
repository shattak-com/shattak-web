'use client';

import { Box, Button, Input, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';

type SearchableSelectProps = {
	label: string;
	value: string;
	options: readonly string[];
	placeholder: string;
	onChange: (value: string) => void;
};

const SearchableSelect = ({ label, value, options, placeholder, onChange }: SearchableSelectProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const filteredOptions = useMemo(() => {
		const query = value.trim().toLowerCase();

		if (!query) {
			return options;
		}

		return options.filter(option => option.toLowerCase().includes(query));
	}, [options, value]);

	return (
		<Box position="relative">
			<Text fontSize="sm" mb={2} color="text.muted">
				{label}
			</Text>
			<Input
				value={value}
				onChange={event => {
					onChange(event.target.value);
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
				placeholder={placeholder}
				autoComplete="off"
			/>
			{isOpen ? (
				<Box
					position="absolute"
					zIndex={20}
					top="calc(100% + 6px)"
					left={0}
					right={0}
					bg="bg.card"
					border="1px solid"
					borderColor="border.default"
					borderRadius="soft"
					boxShadow="card"
					maxH="220px"
					overflowY="auto"
				>
					{filteredOptions.length > 0 ? (
						<Stack gap={0}>
							{filteredOptions.map(option => (
								<Button
									key={option}
									type="button"
									variant="ghost"
									justifyContent="flex-start"
									borderRadius={0}
									h="auto"
									minH="42px"
									py={2.5}
									whiteSpace="normal"
									textAlign="left"
									lineHeight="short"
									onMouseDown={event => event.preventDefault()}
									onClick={() => {
										onChange(option);
										setIsOpen(false);
									}}
								>
									{option}
								</Button>
							))}
						</Stack>
					) : (
						<Text px={4} py={3} color="text.muted" fontSize="sm">
							No matches found.
						</Text>
					)}
				</Box>
			) : null}
		</Box>
	);
};

export default SearchableSelect;
