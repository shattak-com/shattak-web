'use client';

/* eslint-disable no-nested-ternary, sonarjs/cognitive-complexity */

import { Box, Button, HStack, Portal, SimpleGrid, Stack, Table, Text, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { FiArrowRight, FiEdit2, FiFolder, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';

import {
	createAdminNoteDepartment,
	deleteAdminNoteDepartment,
	updateAdminNoteDepartment,
	type AdminNoteDepartment
} from '~/lib/api/admin-notes';
import { ApiRequestError } from '~/lib/api/client';

import { NotesField, NotesInput, NotesStatus } from './NotesAdminControls';
import NotesDeleteDialog from './NotesDeleteDialog';
import NotesModal from './NotesModal';
import NotesViewToggle, { useNotesCollectionView } from './NotesViewToggle';

type DepartmentManagerProps = {
	departments: AdminNoteDepartment[];
	isLoading: boolean;
	onChanged: () => Promise<void>;
	onOpen: (department: AdminNoteDepartment) => void;
};

type DepartmentNameProps = {
	name: string;
	lines?: number;
};

const DepartmentName = ({ name, lines = 1 }: DepartmentNameProps) => (
	<Tooltip.Root openDelay={250} positioning={{ placement: 'top-start' }}>
		<Tooltip.Trigger asChild>
			<Text as="span" display="block" maxW="full" fontWeight="semibold" lineClamp={lines} cursor="help" tabIndex={0}>
				{name}
			</Text>
		</Tooltip.Trigger>
		<Portal>
			<Tooltip.Positioner>
				<Tooltip.Content maxW="420px" px={3} py={2} fontSize="sm" lineHeight="compact">
					{name}
					<Tooltip.Arrow>
						<Tooltip.ArrowTip />
					</Tooltip.Arrow>
				</Tooltip.Content>
			</Tooltip.Positioner>
		</Portal>
	</Tooltip.Root>
);

const getErrorMessage = (error: unknown) => {
	if (error instanceof ApiRequestError && error.code === 'NOTE_DEPARTMENT_HAS_SUBJECTS') {
		return 'This department still contains subjects. Remove those subject assignments before deleting it.';
	}

	return error instanceof ApiRequestError ? error.message : 'Unable to save the department. Please try again.';
};

const DepartmentManager = ({ departments, isLoading, onChanged, onOpen }: DepartmentManagerProps) => {
	const [query, setQuery] = useState('');
	const [viewMode, setViewMode] = useNotesCollectionView('shattak-admin-notes-department-view');
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [editing, setEditing] = useState<AdminNoteDepartment | null>(null);
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [icon, setIcon] = useState('');
	const [message, setMessage] = useState('');
	const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
	const [isSaving, setIsSaving] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<AdminNoteDepartment | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const normalizedQuery = query.trim().toLowerCase();
	const visibleDepartments = departments.filter(department =>
		[department.name, department.slug].some(value => value.toLowerCase().includes(normalizedQuery))
	);

	const resetForm = () => {
		setEditing(null);
		setName('');
		setSlug('');
		setIcon('');
	};

	const openCreate = () => {
		resetForm();
		setMessage('');
		setIsEditorOpen(true);
	};

	const startEdit = (department: AdminNoteDepartment) => {
		setEditing(department);
		setName(department.name);
		setSlug(department.slug);
		setIcon(department.icon);
		setMessage('');
		setIsEditorOpen(true);
	};

	const closeEditor = () => {
		if (isSaving) return;
		setIsEditorOpen(false);
		resetForm();
		setMessage('');
	};

	const handleSave = async () => {
		if (!name.trim()) {
			setTone('error');
			setMessage('Department name is required.');
			return;
		}

		setIsSaving(true);
		setMessage('');
		try {
			const input = { name: name.trim(), slug: slug.trim() || undefined, icon: icon.trim() || undefined };
			if (editing) await updateAdminNoteDepartment(editing.id, input);
			else await createAdminNoteDepartment(input);
			await onChanged();
			setTone('success');
			setMessage(editing ? 'Department updated.' : 'Department created.');
			setIsEditorOpen(false);
			resetForm();
		} catch (error) {
			setTone('error');
			setMessage(getErrorMessage(error));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setIsDeleting(true);
		setMessage('');
		try {
			await deleteAdminNoteDepartment(pendingDelete.id);
			await onChanged();
			setTone('success');
			setMessage('Department deleted.');
			setPendingDelete(null);
		} catch (error) {
			setTone('error');
			setMessage(getErrorMessage(error));
		} finally {
			setIsDeleting(false);
		}
	};

	const renderActions = (department: AdminNoteDepartment) => (
		<HStack gap={1} justify="flex-end" flexWrap="wrap">
			<Button size="xs" borderRadius="full" bg="text.primary" color="text.inverse" onClick={() => onOpen(department)}>
				Open <FiArrowRight />
			</Button>
			<Button size="xs" variant="outline" borderRadius="full" onClick={() => startEdit(department)}>
				<FiEdit2 /> Edit
			</Button>
			<Button
				size="xs"
				variant="outline"
				borderRadius="full"
				colorPalette="red"
				disabled={department.subjectCount > 0}
				title={department.subjectCount > 0 ? 'Remove subjects before deleting' : 'Delete department'}
				onClick={() => setPendingDelete(department)}
			>
				<FiTrash2 /> Delete
			</Button>
		</HStack>
	);

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflow="hidden">
				<Stack gap={4} p={{ base: 4, md: 5 }}>
					<HStack justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
						<Box>
							<Text fontSize="lg" fontWeight="bold">
								Departments
							</Text>
							<Text mt={1} color="text.muted" fontSize="sm">
								{departments.length} departments · alphabetical order
							</Text>
						</Box>
						<HStack gap={2} flexWrap="wrap">
							<NotesViewToggle value={viewMode} onChange={setViewMode} />
							<Button borderRadius="full" bg="primary" color="text.inverse" onClick={openCreate}>
								<FiPlus /> Add department
							</Button>
						</HStack>
					</HStack>

					<Box position="relative" w={{ base: 'full', md: '320px' }}>
						<Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="text.muted">
							<FiSearch />
						</Box>
						<NotesInput
							aria-label="Search departments"
							value={query}
							onChange={event => setQuery(event.currentTarget.value)}
							pl={9}
							placeholder="Search departments"
						/>
					</Box>
					<NotesStatus message={!isEditorOpen ? message : ''} tone={tone} />
				</Stack>

				{isLoading ? (
					<Text px={{ base: 4, md: 5 }} pb={5} color="text.muted">
						Loading departments...
					</Text>
				) : visibleDepartments.length ? (
					viewMode === 'table' ? (
						<Box overflowX="auto" borderTop="1px solid" borderColor="border.default">
							<Table.Root size="sm" minW="820px" tableLayout="fixed">
								<Table.Header>
									<Table.Row>
										<Table.ColumnHeader w="40%">Department</Table.ColumnHeader>
										<Table.ColumnHeader w="31%">URL slug</Table.ColumnHeader>
										<Table.ColumnHeader w="9%" textAlign="center">
											Subjects
										</Table.ColumnHeader>
										<Table.ColumnHeader w="20%" textAlign="right">
											Actions
										</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{visibleDepartments.map(department => (
										<Table.Row key={department.id}>
											<Table.Cell minW={0}>
												<HStack gap={3} minW={0}>
													<Box
														boxSize="36px"
														borderRadius="lg"
														bg="bg.subtle"
														display="grid"
														placeItems="center"
														fontSize="lg"
														flexShrink={0}
													>
														{department.icon || <FiFolder />}
													</Box>
													<Box minW={0} flex="1">
														<DepartmentName name={department.name} />
													</Box>
												</HStack>
											</Table.Cell>
											<Table.Cell minW={0} color="text.muted">
												<Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={department.slug}>
													{department.slug}
												</Text>
											</Table.Cell>
											<Table.Cell textAlign="center">{department.subjectCount}</Table.Cell>
											<Table.Cell>{renderActions(department)}</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table.Root>
						</Box>
					) : (
						<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3} px={{ base: 4, md: 5 }} pb={5}>
							{visibleDepartments.map(department => (
								<Box
									key={department.id}
									border="1px solid"
									borderColor="border.default"
									borderRadius="lg"
									bg="bg.subtle"
									p={4}
								>
									<Stack gap={4}>
										<HStack align="flex-start" gap={3}>
											<Box
												boxSize="42px"
												borderRadius="lg"
												bg="bg.card"
												display="grid"
												placeItems="center"
												fontSize="xl"
												flexShrink={0}
											>
												{department.icon || <FiFolder />}
											</Box>
											<Box minW={0}>
												<DepartmentName name={department.name} lines={2} />
												<Text color="text.muted" fontSize="xs">
													{department.subjectCount} subjects
												</Text>
											</Box>
										</HStack>
										{renderActions(department)}
									</Stack>
								</Box>
							))}
						</SimpleGrid>
					)
				) : (
					<Stack align="flex-start" gap={3} px={{ base: 4, md: 5 }} pb={5}>
						<Text color="text.muted">
							{query ? 'No departments match this search.' : 'No departments have been added yet.'}
						</Text>
						{!query ? (
							<Button size="sm" variant="outline" borderRadius="full" onClick={openCreate}>
								<FiPlus /> Add the first department
							</Button>
						) : null}
					</Stack>
				)}
			</Box>

			<NotesModal
				open={isEditorOpen}
				title={editing ? 'Edit department' : 'Add department'}
				description="Add a recognizable name and optional short icon. URL slugs are generated automatically when left blank."
				onClose={closeEditor}
				closeDisabled={isSaving}
				size="md"
				footer={
					<HStack justify="flex-end" gap={2} w="full">
						<Button variant="outline" borderRadius="full" disabled={isSaving} onClick={closeEditor}>
							Cancel
						</Button>
						<Button
							type="submit"
							form="department-editor-form"
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							disabled={isSaving}
						>
							{isSaving ? 'Saving...' : editing ? 'Save changes' : 'Add department'}
						</Button>
					</HStack>
				}
			>
				<Box
					as="form"
					id="department-editor-form"
					onSubmit={event => {
						event.preventDefault();
						handleSave().catch(() => undefined);
					}}
				>
					<Stack gap={4}>
						<NotesField label="Department name">
							<NotesInput
								autoFocus
								value={name}
								onChange={event => setName(event.currentTarget.value)}
								placeholder="Computer Science & Engineering"
							/>
						</NotesField>
						<SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
							<NotesField label="URL slug" helper="Leave blank to generate it from the name.">
								<NotesInput
									value={slug}
									onChange={event => setSlug(event.currentTarget.value)}
									placeholder="computer-science-engineering"
								/>
							</NotesField>
							<NotesField label="Icon" helper="Use a short emoji or icon label.">
								<NotesInput
									value={icon}
									onChange={event => setIcon(event.currentTarget.value)}
									placeholder="💻"
									maxLength={24}
								/>
							</NotesField>
						</SimpleGrid>
						<NotesStatus message={message} tone={tone} />
					</Stack>
				</Box>
			</NotesModal>

			<NotesDeleteDialog
				open={Boolean(pendingDelete)}
				title="Delete department?"
				message={`“${pendingDelete?.name ?? ''}” will be permanently removed. Departments containing subjects cannot be deleted.`}
				confirmLabel="Delete department"
				isDeleting={isDeleting}
				onCancel={() => setPendingDelete(null)}
				onConfirm={() => handleDelete().catch(() => undefined)}
			/>
		</Stack>
	);
};

export default DepartmentManager;
