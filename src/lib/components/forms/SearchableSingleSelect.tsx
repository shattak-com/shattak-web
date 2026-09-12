'use client';

import { Box, Button, Input, Portal, Stack, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { FiCheck, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';

export type SearchableSingleSelectOption = {
	value: string;
	label: string;
};

type DropdownPosition = {
	left: number;
	top: number;
	width: number;
	openAbove: boolean;
	listMaxHeight: number;
};

type SearchableSingleSelectProps = {
	label: string;
	value: string;
	options: readonly SearchableSingleSelectOption[];
	onChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	disabled?: boolean;
};

const SearchableSingleSelect = ({
	label,
	value,
	options,
	onChange,
	placeholder = 'Select an option',
	searchPlaceholder = 'Search options',
	disabled = false
}: SearchableSingleSelectProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [position, setPosition] = useState<DropdownPosition | null>(null);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const menuId = useId();
	const selectedOption = options.find(option => option.value === value);
	const filteredOptions = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return normalizedQuery ? options.filter(option => option.label.toLowerCase().includes(normalizedQuery)) : options;
	}, [options, query]);

	const closeDropdown = useCallback(() => {
		setIsOpen(false);
		setQuery('');
	}, []);

	const updatePosition = useCallback(() => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		const viewportPadding = 12;
		const gap = 6;
		const searchHeight = 64;
		const preferredListHeight = 240;
		const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
		const spaceAbove = rect.top - gap - viewportPadding;
		const openAbove = spaceBelow < preferredListHeight + searchHeight && spaceAbove > spaceBelow;
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
			listMaxHeight: Math.max(96, Math.min(preferredListHeight, availableHeight - searchHeight))
		});
	}, []);

	useEffect(() => {
		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) closeDropdown();
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || !menuRef.current) return;
			closeDropdown();
			triggerRef.current?.focus();
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [closeDropdown]);

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

	return (
		<Box ref={rootRef} minW={0} position="relative">
			<Text fontSize="xs" fontWeight="semibold" mb={1}>
				{label}
			</Text>
			<Button
				ref={triggerRef}
				type="button"
				variant="outline"
				borderRadius="md"
				h="40px"
				w="full"
				justifyContent="space-between"
				fontWeight="normal"
				disabled={disabled}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-controls={isOpen ? menuId : undefined}
				aria-label={label}
				onClick={() => (isOpen ? closeDropdown() : setIsOpen(true))}
			>
				<Text as="span" minW={0} lineClamp={1} color={selectedOption ? 'text.primary' : 'text.muted'}>
					{selectedOption?.label ?? placeholder}
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
						<Stack gap={1} maxH={`${position.listMaxHeight}px`} overflowY="auto" role="listbox">
							{filteredOptions.map(option => (
								<Button
									key={option.value}
									type="button"
									variant="ghost"
									h="auto"
									minH="38px"
									px={2}
									py={2}
									justifyContent="space-between"
									textAlign="left"
									fontWeight="normal"
									role="option"
									aria-selected={option.value === value}
									onClick={() => {
										onChange(option.value);
										closeDropdown();
									}}
								>
									<Text as="span" lineClamp={2}>
										{option.label}
									</Text>
									{option.value === value ? <FiCheck aria-hidden /> : null}
								</Button>
							))}
							{!filteredOptions.length ? (
								<Text px={2} py={3} fontSize="sm" color="text.muted">
									No matching options.
								</Text>
							) : null}
						</Stack>
					</Box>
				</Portal>
			) : null}
		</Box>
	);
};

export default SearchableSingleSelect;
