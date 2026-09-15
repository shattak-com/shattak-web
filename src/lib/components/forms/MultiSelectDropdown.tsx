'use client';

import { Badge, Box, Button, HStack, Input, Portal, Stack, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch, FiX } from 'react-icons/fi';

type MultiSelectDropdownProps = {
	label: string;
	options: readonly string[];
	selectedValues: string[];
	onChange: (values: string[]) => void;
	placeholder?: string;
	error?: string;
	minW?: { base?: string; md?: string } | string;
	getOptionLabel?: (value: string) => string;
	selectionNoun?: string;
	searchPlaceholder?: string;
};

type DropdownPosition = {
	left: number;
	top: number;
	width: number;
	openAbove: boolean;
	listMaxHeight: number;
};

const toggleValue = (values: string[], value: string) =>
	values.includes(value) ? values.filter(item => item !== value) : [...values, value];

const getSummaryLabel = (
	selectedValues: string[],
	placeholder: string,
	getOptionLabel: (value: string) => string,
	selectionNoun: string
) => {
	if (!selectedValues.length) {
		return placeholder;
	}

	if (selectedValues.length === 1) {
		return getOptionLabel(selectedValues[0]);
	}

	return `${selectedValues.length} ${selectionNoun} selected`;
};

const MultiSelectDropdown = ({
	label,
	options,
	selectedValues,
	onChange,
	placeholder = 'Select categories',
	error,
	minW = { base: '100%', md: '260px' },
	getOptionLabel = value => value,
	selectionNoun = 'categories',
	searchPlaceholder = 'Search options'
}: MultiSelectDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [position, setPosition] = useState<DropdownPosition | null>(null);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const menuId = useId();
	const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
	const filteredOptions = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return normalizedQuery
			? options.filter(option => getOptionLabel(option).toLowerCase().includes(normalizedQuery))
			: options;
	}, [getOptionLabel, options, query]);

	const updatePosition = useCallback(() => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		const viewportPadding = 12;
		const gap = 6;
		const menuChromeHeight = 108;
		const preferredListHeight = 220;
		const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
		const spaceAbove = rect.top - gap - viewportPadding;
		const openAbove = spaceBelow < preferredListHeight + menuChromeHeight && spaceAbove > spaceBelow;
		const availableHeight = openAbove ? spaceAbove : spaceBelow;
		const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
		const left = Math.min(
			Math.max(viewportPadding, rect.left),
			Math.max(viewportPadding, window.innerWidth - width - viewportPadding)
		);

		setPosition({
			left,
			top: openAbove ? rect.top - gap : rect.bottom + gap,
			width,
			openAbove,
			listMaxHeight: Math.max(96, Math.min(preferredListHeight, availableHeight - menuChromeHeight))
		});
	}, []);

	useEffect(() => {
		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
				setIsOpen(false);
				setQuery('');
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && menuRef.current) {
				setIsOpen(false);
				setQuery('');
				triggerRef.current?.focus();
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	useEffect(() => {
		if (!isOpen) return undefined;
		updatePosition();
		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);

		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
		};
	}, [isOpen, updatePosition]);

	const closeDropdown = () => {
		setIsOpen(false);
		setQuery('');
	};

	return (
		<Box ref={rootRef} minW={minW} position="relative">
			<Text fontSize="xs" color="text.muted" mb={1}>
				{label}
			</Text>
			<Button
				ref={triggerRef}
				type="button"
				variant="outline"
				borderRadius="md"
				h="40px"
				w="100%"
				justifyContent="space-between"
				fontWeight="normal"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-controls={isOpen ? menuId : undefined}
				onClick={() => {
					if (isOpen) closeDropdown();
					else setIsOpen(true);
				}}
			>
				<Text as="span" lineClamp={1} color={selectedValues.length ? 'text.primary' : 'text.muted'}>
					{getSummaryLabel(selectedValues, placeholder, getOptionLabel, selectionNoun)}
				</Text>
				{isOpen ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
			</Button>

			{isOpen && position ? (
				<Portal>
					<Box
						ref={menuRef}
						id={menuId}
						data-modal-floating="true"
						position="fixed"
						top={`${position.top}px`}
						left={`${position.left}px`}
						w={`${position.width}px`}
						transform={position.openAbove ? 'translateY(-100%)' : undefined}
						zIndex={1800}
						bg="bg.card"
						border="1px solid"
						borderColor="border.default"
						borderRadius="lg"
						boxShadow="elevated"
						p={3}
					>
						<Box position="relative" mb={2}>
							<Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="text.muted">
								<FiSearch aria-hidden />
							</Box>
							<Input
								autoFocus
								h="36px"
								pl={9}
								value={query}
								onChange={event => setQuery(event.currentTarget.value)}
								placeholder={searchPlaceholder}
								aria-label={searchPlaceholder}
							/>
						</Box>
						<Stack
							gap={1}
							maxH={`${position.listMaxHeight}px`}
							overflowY="auto"
							role="listbox"
							aria-multiselectable="true"
						>
							{filteredOptions.map(option => (
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
									role="option"
									aria-selected={selectedSet.has(option)}
								>
									<input
										type="checkbox"
										checked={selectedSet.has(option)}
										onChange={() => onChange(toggleValue(selectedValues, option))}
									/>
									<Text fontSize="sm">{getOptionLabel(option)}</Text>
								</Box>
							))}
							{!filteredOptions.length ? (
								<Text px={2} py={3} fontSize="sm" color="text.muted">
									No matching options.
								</Text>
							) : null}
						</Stack>
						<HStack mt={3} gap={2} justify="space-between">
							<Text fontSize="xs" color="text.muted">
								{selectedValues.length} selected
							</Text>
							<Button
								type="button"
								size="xs"
								variant="ghost"
								disabled={!selectedValues.length}
								onClick={() => onChange([])}
							>
								Clear
							</Button>
						</HStack>
					</Box>
				</Portal>
			) : null}

			{selectedValues.length ? (
				<HStack mt={2} gap={2} flexWrap="wrap">
					{selectedValues.map(value => (
						<Badge key={value} borderRadius="full" colorPalette="red" display="inline-flex" alignItems="center" gap={1}>
							<Text as="span" lineClamp={1} maxW="240px">
								{getOptionLabel(value)}
							</Text>
							<Button
								type="button"
								aria-label={`Remove ${getOptionLabel(value)}`}
								title={`Remove ${getOptionLabel(value)}`}
								variant="ghost"
								size="2xs"
								minW="20px"
								h="20px"
								p={0}
								onClick={() => onChange(selectedValues.filter(item => item !== value))}
							>
								<FiX aria-hidden />
							</Button>
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
