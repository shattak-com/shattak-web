'use client';

import { Box, Button, HStack, Text } from '@chakra-ui/react';

type InterestSelectorProps = {
	options: readonly string[];
	selectedInterests: string[];
	maxInterests: number;
	onChange: (interests: string[]) => void;
};

const InterestSelector = ({ options, selectedInterests, maxInterests, onChange }: InterestSelectorProps) => {
	const selectedSet = new Set(selectedInterests);

	const toggleInterest = (interest: string) => {
		if (selectedSet.has(interest)) {
			onChange(selectedInterests.filter(selectedInterest => selectedInterest !== interest));
			return;
		}

		if (selectedInterests.length >= maxInterests) {
			return;
		}

		onChange([...selectedInterests, interest]);
	};

	return (
		<Box>
			<HStack justify="space-between" gap={4} mb={3} align="baseline">
				<Text fontSize="sm" color="text.muted">
					Interests
				</Text>
				<Text fontSize="xs" color="text.muted">
					{selectedInterests.length} of {maxInterests} selected
				</Text>
			</HStack>
			<Text fontSize="xs" color="text.muted" mb={3}>
				Choose at least one and up to five.
			</Text>
			<HStack gap={2} flexWrap="wrap" maxH={{ base: '260px', md: '320px' }} overflowY="auto" pr={1}>
				{options.map(interest => {
					const isSelected = selectedSet.has(interest);
					const isDisabled = !isSelected && selectedInterests.length >= maxInterests;

					return (
						<Button
							key={interest}
							type="button"
							size="xs"
							variant={isSelected ? 'solid' : 'outline'}
							borderRadius="full"
							bg={isSelected ? 'primary' : 'transparent'}
							color={isSelected ? 'text.inverse' : 'text.primary'}
							borderColor="primary"
							opacity={isDisabled ? 0.45 : 1}
							px={3}
							minH="32px"
							disabled={isDisabled}
							onClick={() => toggleInterest(interest)}
						>
							{interest}
						</Button>
					);
				})}
			</HStack>
		</Box>
	);
};

export default InterestSelector;
