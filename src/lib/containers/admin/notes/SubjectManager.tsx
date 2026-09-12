'use client';

/* eslint-disable no-nested-ternary, sonarjs/cognitive-complexity */

import { Box, Button, HStack, SimpleGrid, Stack, Table, Text } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { FiArrowRight, FiBookOpen, FiEdit2, FiExternalLink, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';

import {
	createAdminNoteSubject,
	deleteAdminNoteSubject,
	updateAdminNoteSubject,
	type AdminNoteDepartment,
	type AdminNoteSubject
} from '~/lib/api/admin-notes';
import { ApiRequestError } from '~/lib/api/client';
import MultiSelectDropdown from '~/lib/components/forms/MultiSelectDropdown';

import { NotesField, NotesInput, NotesSelect, NotesStatus } from './NotesAdminControls';
import NotesDeleteDialog from './NotesDeleteDialog';
import NotesModal from './NotesModal';
import NotesViewToggle, { useNotesCollectionView } from './NotesViewToggle';

type SubjectManagerProps = {
	departments: AdminNoteDepartment[];
	subjects: AdminNoteSubject[];
	isLoading: boolean;
	initialDepartmentId: string;
	onChanged: () => Promise<void>;
	onDepartmentFilterChange: (departmentId: string) => void;
	onOpen: (subject: AdminNoteSubject, departmentId: string) => void;
};

const getErrorMessage = (error: unknown) => {
	if (error instanceof ApiRequestError && error.code === 'NOTE_SUBJECT_HAS_NOTES') {
		return 'This subject still contains notes. Move or delete those notes before deleting the subject.';
	}

	return error instanceof ApiRequestError ? error.message : 'Unable to save the subject. Please try again.';
};

const SubjectManager = ({
	departments,
	subjects,
	isLoading,
	initialDepartmentId,
	onChanged,
	onDepartmentFilterChange,
	onOpen
}: SubjectManagerProps) => {
	const [query, setQuery] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState(initialDepartmentId);
	const [viewMode, setViewMode] = useNotesCollectionView('shattak-admin-notes-subject-view');
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [editing, setEditing] = useState<AdminNoteSubject | null>(null);
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [departmentIds, setDepartmentIds] = useState<string[]>(initialDepartmentId ? [initialDepartmentId] : []);
	const [message, setMessage] = useState('');
	const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
	const [isSaving, setIsSaving] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<AdminNoteSubject | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const visibleSubjects = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return subjects.filter(
			subject =>
				(!departmentFilter || subject.departments.some(department => department.id === departmentFilter)) &&
				[subject.name, subject.slug].some(value => value.toLowerCase().includes(normalizedQuery))
		);
	}, [departmentFilter, query, subjects]);
	const departmentOptions = useMemo(() => departments.map(department => department.id), [departments]);
	const getDepartmentLabel = useCallback(
		(departmentId: string) => {
			const department = departments.find(item => item.id === departmentId);
			return department ? `${department.icon} ${department.name}`.trim() : departmentId;
		},
		[departments]
	);

	const resetForm = () => {
		setEditing(null);
		setName('');
		setSlug('');
		setDepartmentIds(departmentFilter ? [departmentFilter] : []);
	};

	const openCreate = () => {
		resetForm();
		setMessage('');
		setIsEditorOpen(true);
	};

	const startEdit = (subject: AdminNoteSubject) => {
		setEditing(subject);
		setName(subject.name);
		setSlug(subject.slug);
		setDepartmentIds(subject.departments.map(department => department.id));
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
		if (!name.trim() || !departmentIds.length) {
			setTone('error');
			setMessage('Enter a subject name and select at least one department.');
			return;
		}

		setIsSaving(true);
		setMessage('');
		try {
			const input = { name: name.trim(), slug: slug.trim() || undefined, departmentIds };
			if (editing) await updateAdminNoteSubject(editing.id, input);
			else await createAdminNoteSubject(input);
			await onChanged();
			setTone('success');
			setMessage(editing ? 'Subject updated.' : 'Subject created.');
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
			await deleteAdminNoteSubject(pendingDelete.id);
			await onChanged();
			setTone('success');
			setMessage('Subject deleted.');
			setPendingDelete(null);
		} catch (error) {
			setTone('error');
			setMessage(getErrorMessage(error));
		} finally {
			setIsDeleting(false);
		}
	};

	const selectDepartmentFilter = (value: string) => {
		setDepartmentFilter(value);
		onDepartmentFilterChange(value);
		if (!editing) setDepartmentIds(value ? [value] : []);
	};

	const renderActions = (subject: AdminNoteSubject) => {
		const department = subject.departments.find(item => item.id === departmentFilter) ?? subject.departments[0];
		const previewPath = department
			? `/notes/${encodeURIComponent(department.slug)}/${encodeURIComponent(subject.slug)}`
			: '';

		return (
			<HStack gap={1} justify="flex-end" flexWrap="wrap">
				<Button asChild size="xs" variant="outline" borderRadius="full" disabled={!previewPath}>
					<a href={previewPath} target="_blank" rel="noopener noreferrer">
						<FiExternalLink /> View
					</a>
				</Button>
				<Button
					size="xs"
					borderRadius="full"
					bg="text.primary"
					color="text.inverse"
					onClick={() => onOpen(subject, departmentFilter || subject.departments[0]?.id || '')}
				>
					Open <FiArrowRight />
				</Button>
				<Button size="xs" variant="outline" borderRadius="full" onClick={() => startEdit(subject)}>
					<FiEdit2 /> Edit
				</Button>
				<Button
					size="xs"
					variant="outline"
					borderRadius="full"
					colorPalette="red"
					disabled={subject.noteCount > 0}
					title={subject.noteCount > 0 ? 'Remove notes before deleting' : 'Delete subject'}
					onClick={() => setPendingDelete(subject)}
				>
					<FiTrash2 /> Delete
				</Button>
			</HStack>
		);
	};

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" overflow="hidden">
				<Stack gap={4} p={{ base: 4, md: 5 }}>
					<HStack justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
						<Box>
							<Text fontSize="lg" fontWeight="bold">
								Subjects
							</Text>
							<Text mt={1} color="text.muted" fontSize="sm">
								{visibleSubjects.length} subjects · alphabetical order
							</Text>
						</Box>
						<HStack gap={2} flexWrap="wrap">
							<NotesViewToggle value={viewMode} onChange={setViewMode} />
							<Button
								borderRadius="full"
								bg="primary"
								color="text.inverse"
								disabled={!departments.length}
								onClick={openCreate}
							>
								<FiPlus /> Add subject
							</Button>
						</HStack>
					</HStack>
					<Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'minmax(0, 240px) minmax(0, 320px)' }} gap={3}>
						<NotesSelect label="Department" value={departmentFilter} onChange={selectDepartmentFilter}>
							<option value="">All departments</option>
							{departments.map(department => (
								<option key={department.id} value={department.id}>
									{department.name}
								</option>
							))}
						</NotesSelect>
						<NotesField label="Search subjects">
							<Box position="relative">
								<Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="text.muted">
									<FiSearch />
								</Box>
								<NotesInput
									value={query}
									onChange={event => setQuery(event.currentTarget.value)}
									pl={9}
									placeholder="Name or URL slug"
								/>
							</Box>
						</NotesField>
					</Box>
					<NotesStatus message={!isEditorOpen ? message : ''} tone={tone} />
				</Stack>

				{isLoading ? (
					<Text px={{ base: 4, md: 5 }} pb={5} color="text.muted">
						Loading subjects...
					</Text>
				) : visibleSubjects.length ? (
					viewMode === 'table' ? (
						<Box overflowX="auto" borderTop="1px solid" borderColor="border.default">
							<Table.Root size="sm" minW="820px">
								<Table.Header>
									<Table.Row>
										<Table.ColumnHeader>Subject</Table.ColumnHeader>
										<Table.ColumnHeader>Departments</Table.ColumnHeader>
										<Table.ColumnHeader textAlign="center">Notes</Table.ColumnHeader>
										<Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{visibleSubjects.map(subject => (
										<Table.Row key={subject.id}>
											<Table.Cell>
												<HStack gap={3}>
													<Box
														boxSize="36px"
														borderRadius="lg"
														bg="bg.subtle"
														color="primary"
														display="grid"
														placeItems="center"
														flexShrink={0}
													>
														<FiBookOpen />
													</Box>
													<Box minW={0}>
														<Text fontWeight="semibold">{subject.name}</Text>
														<Text color="text.muted" fontSize="xs">
															{subject.slug}
														</Text>
													</Box>
												</HStack>
											</Table.Cell>
											<Table.Cell maxW="360px">
												<Stack gap={0.5}>
													<Text fontSize="sm" fontWeight="semibold">
														{subject.departments.length}{' '}
														{subject.departments.length === 1 ? 'department' : 'departments'}
													</Text>
													<Text color="text.muted" fontSize="xs" lineClamp={2}>
														{subject.departments.map(department => department.name).join(', ')}
													</Text>
												</Stack>
											</Table.Cell>
											<Table.Cell textAlign="center">{subject.noteCount}</Table.Cell>
											<Table.Cell>{renderActions(subject)}</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table.Root>
						</Box>
					) : (
						<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3} px={{ base: 4, md: 5 }} pb={5}>
							{visibleSubjects.map(subject => (
								<Box
									key={subject.id}
									border="1px solid"
									borderColor="border.default"
									borderRadius="lg"
									bg="bg.subtle"
									p={4}
								>
									<Stack gap={4}>
										<HStack align="flex-start" gap={3}>
											<Box
												boxSize="40px"
												borderRadius="lg"
												bg="bg.card"
												display="grid"
												placeItems="center"
												color="primary"
												flexShrink={0}
											>
												<FiBookOpen />
											</Box>
											<Box minW={0}>
												<Text fontWeight="semibold">{subject.name}</Text>
												<Text color="text.muted" fontSize="xs">
													{subject.noteCount} notes · {subject.departments.length} departments
												</Text>
											</Box>
										</HStack>
										<Text color="text.muted" fontSize="xs" lineClamp={2}>
											{subject.departments.map(department => department.name).join(', ')}
										</Text>
										{renderActions(subject)}
									</Stack>
								</Box>
							))}
						</SimpleGrid>
					)
				) : (
					<Stack align="flex-start" gap={3} px={{ base: 4, md: 5 }} pb={5}>
						<Text color="text.muted">
							{query || departmentFilter ? 'No subjects match these filters.' : 'No subjects have been added yet.'}
						</Text>
						{!query && !departmentFilter && departments.length ? (
							<Button size="sm" variant="outline" borderRadius="full" onClick={openCreate}>
								<FiPlus /> Add the first subject
							</Button>
						) : null}
					</Stack>
				)}
			</Box>

			<NotesModal
				open={isEditorOpen}
				title={editing ? 'Edit subject' : 'Add subject'}
				description="Assign a subject to one or more departments. The same subject can be reused across departments."
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
							form="subject-editor-form"
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							disabled={isSaving}
						>
							{isSaving ? 'Saving...' : editing ? 'Save changes' : 'Add subject'}
						</Button>
					</HStack>
				}
			>
				<Box
					as="form"
					id="subject-editor-form"
					onSubmit={event => {
						event.preventDefault();
						handleSave().catch(() => undefined);
					}}
				>
					<Stack gap={4}>
						<SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
							<NotesField label="Subject name">
								<NotesInput
									autoFocus
									value={name}
									onChange={event => setName(event.currentTarget.value)}
									placeholder="Data Structures"
								/>
							</NotesField>
							<NotesField label="URL slug" helper="Leave blank to generate it from the name.">
								<NotesInput
									value={slug}
									onChange={event => setSlug(event.currentTarget.value)}
									placeholder="data-structures"
								/>
							</NotesField>
						</SimpleGrid>
						<MultiSelectDropdown
							label="Departments"
							options={departmentOptions}
							selectedValues={departmentIds}
							onChange={setDepartmentIds}
							getOptionLabel={getDepartmentLabel}
							selectionNoun="departments"
							placeholder="Select one or more departments"
							searchPlaceholder="Search departments"
							minW="100%"
						/>
						<NotesStatus message={message} tone={tone} />
					</Stack>
				</Box>
			</NotesModal>

			<NotesDeleteDialog
				open={Boolean(pendingDelete)}
				title="Delete subject?"
				message={`“${pendingDelete?.name ?? ''}” will be permanently removed. Subjects containing notes cannot be deleted.`}
				confirmLabel="Delete subject"
				isDeleting={isDeleting}
				onCancel={() => setPendingDelete(null)}
				onConfirm={() => handleDelete().catch(() => undefined)}
			/>
		</Stack>
	);
};

export default SubjectManager;
