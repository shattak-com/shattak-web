'use client';

import { Button, HStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiGrid, FiList } from 'react-icons/fi';

export type NotesCollectionView = 'table' | 'card';

export const useNotesCollectionView = (storageKey: string) => {
	const [value, setValue] = useState<NotesCollectionView>('table');

	useEffect(() => {
		const saved = window.localStorage.getItem(storageKey);
		if (saved === 'table' || saved === 'card') setValue(saved);
	}, [storageKey]);

	const updateValue = (nextValue: NotesCollectionView) => {
		setValue(nextValue);
		window.localStorage.setItem(storageKey, nextValue);
	};

	return [value, updateValue] as const;
};

const NotesViewToggle = ({
	value,
	onChange
}: {
	value: NotesCollectionView;
	onChange: (value: NotesCollectionView) => void;
}) => (
	<HStack
		gap={1}
		p={1}
		border="1px solid"
		borderColor="border.default"
		borderRadius="full"
		bg="bg.subtle"
		role="group"
		aria-label="Choose collection view"
	>
		<Button
			size="xs"
			borderRadius="full"
			variant={value === 'table' ? 'solid' : 'ghost'}
			bg={value === 'table' ? 'bg.card' : undefined}
			color="text.primary"
			boxShadow={value === 'table' ? 'sm' : undefined}
			aria-pressed={value === 'table'}
			onClick={() => onChange('table')}
		>
			<FiList /> Table
		</Button>
		<Button
			size="xs"
			borderRadius="full"
			variant={value === 'card' ? 'solid' : 'ghost'}
			bg={value === 'card' ? 'bg.card' : undefined}
			color="text.primary"
			boxShadow={value === 'card' ? 'sm' : undefined}
			aria-pressed={value === 'card'}
			onClick={() => onChange('card')}
		>
			<FiGrid /> Cards
		</Button>
	</HStack>
);

export default NotesViewToggle;
