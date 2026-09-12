'use client';

/* eslint-disable complexity, no-nested-ternary, sonarjs/cognitive-complexity, sonarjs/no-nested-template-literals */

import { Badge, Box, Button, HStack, SimpleGrid, Stack, Table, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FiCopy, FiEdit2, FiExternalLink, FiFileText, FiLayers, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';

import {
	createAdminNote,
	deleteAdminNote,
	updateAdminNote,
	type AdminNote,
	type AdminNoteCategory,
	type AdminNoteDepartment,
	type AdminNoteInput,
	type AdminNoteListParams,
	type AdminNotePagination,
	type AdminNoteResourceType,
	type AdminNoteSubject
} from '~/lib/api/admin-notes';
import { ApiRequestError } from '~/lib/api/client';
import SearchableSingleSelect from '~/lib/components/forms/SearchableSingleSelect';

import BulkNotesForm from './BulkNotesForm';
import { NotesField, NotesInput, NotesSelect, NotesStatus } from './NotesAdminControls';
import NotesDeleteDialog from './NotesDeleteDialog';
import NotesModal from './NotesModal';
import { formatResourceTimestamp } from './utils';

type NoteManagerProps = {
	departments: AdminNoteDepartment[];
	subjects: AdminNoteSubject[];
	notes: AdminNote[];
	pagination: AdminNotePagination;
	isLoading: boolean;
	filters: AdminNoteListParams;
	onChanged: () => Promise<void>;
	onFiltersChange: (filters: AdminNoteListParams) => void;
};

const createBlankNote = (subjectId = ''): AdminNoteInput => ({
	subjectId,
	title: '',
	category: 'NOTES',
	resourceType: 'PDF',
	resourceUrl: ''
});

const NoteManager = ({
	departments,
	subjects,
	notes,
	pagination,
	isLoading,
	filters,
	onChanged,
	onFiltersChange
}: NoteManagerProps) => {
	const [draftFilters, setDraftFilters] = useState<AdminNoteListParams>(filters);
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [isBulkOpen, setIsBulkOpen] = useState(false);
	const [isBulkSaving, setIsBulkSaving] = useState(false);
	const [editing, setEditing] = useState<AdminNote | null>(null);
	const [form, setForm] = useState<AdminNoteInput>(createBlankNote(filters.subjectId));
	const [message, setMessage] = useState('');
	const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
	const [isSaving, setIsSaving] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<AdminNote | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const filteredSubjects = useMemo(
		() =>
			subjects.filter(
				subject =>
					!draftFilters.departmentId ||
					subject.departments.some(department => department.id === draftFilters.departmentId)
			),
		[draftFilters.departmentId, subjects]
	);
	const hasActiveFilters = Boolean(
		filters.q || filters.departmentId || filters.subjectId || filters.category || filters.resourceType
	);

	const updateForm = <K extends keyof AdminNoteInput>(field: K, value: AdminNoteInput[K]) => {
		setForm(current => ({ ...current, [field]: value }));
	};

	const resetForm = () => {
		setEditing(null);
		setForm(createBlankNote(filters.subjectId));
	};

	const openCreate = () => {
		resetForm();
		setMessage('');
		setIsEditorOpen(true);
	};

	const closeEditor = () => {
		if (isSaving) return;
		setIsEditorOpen(false);
		resetForm();
		setMessage('');
	};

	const startEdit = (note: AdminNote) => {
		setEditing(note);
		setForm({
			subjectId: note.subjectId,
			title: note.title,
			slug: note.slug,
			category: note.category,
			resourceType: note.resourceType,
			resourceUrl: note.resourceUrl
		});
		setMessage('');
		setIsEditorOpen(true);
	};

	const handleSave = async () => {
		if (!form.subjectId || !form.title.trim() || !form.resourceUrl.trim()) {
			setTone('error');
			setMessage('Select a subject and enter the note title and Google Drive link.');
			return;
		}

		setIsSaving(true);
		setMessage('');
		try {
			const input: AdminNoteInput = {
				...form,
				title: form.title.trim(),
				slug: form.slug?.trim() || undefined,
				resourceUrl: form.resourceUrl.trim()
			};
			if (editing) await updateAdminNote(editing.id, input);
			else await createAdminNote(input);
			await onChanged();
			setTone('success');
			setMessage(editing ? 'Note updated.' : 'Note created.');
			setIsEditorOpen(false);
			resetForm();
		} catch (error) {
			setTone('error');
			setMessage(error instanceof ApiRequestError ? error.message : 'Unable to save the note. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setIsDeleting(true);
		setMessage('');
		try {
			await deleteAdminNote(pendingDelete.id);
			await onChanged();
			setTone('success');
			setMessage('Note deleted.');
			setPendingDelete(null);
		} catch (error) {
			setTone('error');
			setMessage(error instanceof ApiRequestError ? error.message : 'Unable to delete the note.');
		} finally {
			setIsDeleting(false);
		}
	};

	const changeDepartmentFilter = (departmentId: string) => {
		const subjectMatches = subjects.some(
			subject =>
				subject.id === draftFilters.subjectId && subject.departments.some(department => department.id === departmentId)
		);
		setDraftFilters(current => ({
			...current,
			departmentId,
			subjectId: departmentId && !subjectMatches ? '' : current.subjectId,
			page: 1
		}));
	};

	const applyFilters = () => onFiltersChange({ ...draftFilters, page: 1 });
	const resetFilters = () => {
		const next = { page: 1, pageSize: filters.pageSize ?? 50 };
		setDraftFilters(next);
		onFiltersChange(next);
	};

	const copyFilteredLink = async () => {
		const department = departments.find(item => item.id === filters.departmentId);
		const subject = subjects.find(item => item.id === filters.subjectId);
		let pathname = '/notes';
		if (department) pathname += `/${encodeURIComponent(department.slug)}`;
		if (department && subject) pathname += `/${encodeURIComponent(subject.slug)}`;
		const search = new URLSearchParams();
		if (filters.q) search.set('q', filters.q);
		if (filters.category) search.set('category', filters.category);
		if (filters.resourceType) search.set('resourceType', filters.resourceType);
		if (!department && subject) search.set('subject', subject.slug);
		const suffix = search.toString();
		const url = `${window.location.origin}${pathname}${suffix ? `?${suffix}` : ''}`;
		try {
			await navigator.clipboard.writeText(url);
			setTone('success');
			setMessage('Filtered public Notes link copied. It will become active with the user-facing Notes release.');
		} catch {
			setTone('error');
			setMessage('Unable to copy automatically. Please copy the URL from the address bar.');
		}
	};

	const getNotePreviewPath = (note: AdminNote) => {
		const department = note.departments.find(item => item.id === filters.departmentId) ?? note.departments[0];
		return department
			? `/notes/${encodeURIComponent(department.slug)}/${encodeURIComponent(note.subject.slug)}/${encodeURIComponent(note.slug)}`
			: '';
	};

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={{ base: 4, md: 5 }}>
				<Stack gap={4}>
					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Box>
							<Text fontSize="lg" fontWeight="bold">
								Notes library
							</Text>
							<Text mt={1} color="text.muted" fontSize="sm">
								{pagination.total} linked resources · newest first
							</Text>
						</Box>
						<HStack gap={2} flexWrap="wrap">
							<Button variant="outline" borderRadius="full" onClick={() => copyFilteredLink().catch(() => undefined)}>
								<FiCopy /> Copy link
							</Button>
							<Button
								variant="outline"
								borderRadius="full"
								disabled={!subjects.length}
								onClick={() => setIsBulkOpen(true)}
							>
								<FiLayers /> Bulk upload
							</Button>
							<Button
								borderRadius="full"
								bg="primary"
								color="text.inverse"
								disabled={!subjects.length}
								onClick={openCreate}
							>
								<FiPlus /> Add note
							</Button>
						</HStack>
					</HStack>
					<NotesStatus message={!isEditorOpen && !isBulkOpen ? message : ''} tone={tone} />
					<Box
						as="form"
						display="grid"
						gridTemplateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr)) auto' }}
						gap={3}
						alignItems="end"
						onSubmit={event => {
							event.preventDefault();
							applyFilters();
						}}
					>
						<NotesField label="Search">
							<Box position="relative">
								<Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="text.muted">
									<FiSearch />
								</Box>
								<NotesInput
									value={draftFilters.q ?? ''}
									onChange={event => {
										const q = event.currentTarget.value;
										setDraftFilters(current => ({ ...current, q }));
									}}
									pl={9}
									placeholder="Title or URL slug"
								/>
							</Box>
						</NotesField>
						<NotesSelect label="Department" value={draftFilters.departmentId ?? ''} onChange={changeDepartmentFilter}>
							<option value="">All departments</option>
							{departments.map(department => (
								<option key={department.id} value={department.id}>
									{department.name}
								</option>
							))}
						</NotesSelect>
						<NotesSelect
							label="Subject"
							value={draftFilters.subjectId ?? ''}
							onChange={value => setDraftFilters(current => ({ ...current, subjectId: value }))}
						>
							<option value="">All subjects</option>
							{filteredSubjects.map(subject => (
								<option key={subject.id} value={subject.id}>
									{subject.name}
								</option>
							))}
						</NotesSelect>
						<NotesSelect
							label="Category"
							value={draftFilters.category ?? ''}
							onChange={value =>
								setDraftFilters(current => ({ ...current, category: value as AdminNoteCategory | '' }))
							}
						>
							<option value="">All categories</option>
							<option value="NOTES">Notes</option>
							<option value="PYQ">PYQ</option>
							<option value="LAB">Lab</option>
						</NotesSelect>
						<NotesSelect
							label="Resource"
							value={draftFilters.resourceType ?? ''}
							onChange={value =>
								setDraftFilters(current => ({ ...current, resourceType: value as AdminNoteResourceType | '' }))
							}
						>
							<option value="">All resources</option>
							<option value="PDF">PDF</option>
							<option value="PPT">PPT</option>
							<option value="FOLDER">Folder</option>
						</NotesSelect>
						<HStack gap={2}>
							<Button type="submit" borderRadius="full" bg="primary" color="text.inverse">
								Filter
							</Button>
							<Button type="button" variant="outline" borderRadius="full" onClick={resetFilters}>
								Reset
							</Button>
						</HStack>
					</Box>

					<Box overflowX="auto" mx={{ base: -4, md: 0 }}>
						{isLoading ? (
							<Text p={4} color="text.muted">
								Loading notes...
							</Text>
						) : notes.length ? (
							<Table.Root size="sm" minW="980px">
								<Table.Header>
									<Table.Row>
										<Table.ColumnHeader minW="300px">Note</Table.ColumnHeader>
										<Table.ColumnHeader>Subject</Table.ColumnHeader>
										<Table.ColumnHeader>Type</Table.ColumnHeader>
										<Table.ColumnHeader>Added</Table.ColumnHeader>
										<Table.ColumnHeader>Activity</Table.ColumnHeader>
										<Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{notes.map(note => (
										<Table.Row key={note.id}>
											<Table.Cell>
												<HStack gap={3}>
													<Box
														boxSize="34px"
														borderRadius="md"
														bg="bg.subtle"
														color="primary"
														display="grid"
														placeItems="center"
														flexShrink={0}
													>
														<FiFileText />
													</Box>
													<Box minW={0}>
														<Text fontWeight="semibold" lineClamp={1}>
															{note.title}
														</Text>
														<Text color="text.muted" fontSize="xs" lineClamp={1}>
															{note.slug}
														</Text>
													</Box>
												</HStack>
											</Table.Cell>
											<Table.Cell>
												<Text fontSize="sm">{note.subject.name}</Text>
												<Text color="text.muted" fontSize="xs" lineClamp={1}>
													{note.departments.map(department => department.name).join(', ')}
												</Text>
											</Table.Cell>
											<Table.Cell>
												<HStack gap={1}>
													<Badge>{note.category}</Badge>
													<Badge variant="outline">{note.resourceType}</Badge>
												</HStack>
											</Table.Cell>
											<Table.Cell>
												<Text fontSize="sm">{formatResourceTimestamp(note.resourceDate)}</Text>
											</Table.Cell>
											<Table.Cell>
												<Text fontSize="xs">
													{note.viewCount} views · {note.downloadCount} downloads
												</Text>
											</Table.Cell>
											<Table.Cell textAlign="right">
												<HStack justify="flex-end" gap={1}>
													<Button
														asChild
														size="xs"
														variant="outline"
														borderRadius="full"
														disabled={!getNotePreviewPath(note)}
													>
														<a href={getNotePreviewPath(note)} target="_blank" rel="noopener noreferrer">
															<FiExternalLink /> View
														</a>
													</Button>
													<Button asChild size="xs" variant="outline" borderRadius="full">
														<a href={note.resourceUrl} target="_blank" rel="noopener noreferrer">
															<FiExternalLink /> Open
														</a>
													</Button>
													<Button size="xs" variant="outline" borderRadius="full" onClick={() => startEdit(note)}>
														<FiEdit2 /> Edit
													</Button>
													<Button
														size="xs"
														variant="outline"
														borderRadius="full"
														colorPalette="red"
														onClick={() => setPendingDelete(note)}
													>
														<FiTrash2 /> Delete
													</Button>
												</HStack>
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table.Root>
						) : (
							<Stack align="flex-start" gap={3} p={4}>
								<Text color="text.muted">
									{hasActiveFilters ? 'No notes match these filters.' : 'No notes have been added yet.'}
								</Text>
								<HStack gap={2} flexWrap="wrap">
									{hasActiveFilters ? (
										<Button size="sm" variant="outline" borderRadius="full" onClick={resetFilters}>
											Reset filters
										</Button>
									) : null}
									<Button
										size="sm"
										variant="outline"
										borderRadius="full"
										disabled={!subjects.length}
										onClick={openCreate}
									>
										<FiPlus /> Add note
									</Button>
								</HStack>
							</Stack>
						)}
					</Box>

					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Text color="text.muted" fontSize="sm">
							Page {pagination.page} of {pagination.totalPages}
						</Text>
						<HStack gap={2}>
							<Button
								variant="outline"
								borderRadius="full"
								disabled={!pagination.hasPreviousPage}
								onClick={() => onFiltersChange({ ...filters, page: Math.max(1, (filters.page ?? 1) - 1) })}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								borderRadius="full"
								disabled={!pagination.hasNextPage}
								onClick={() => onFiltersChange({ ...filters, page: (filters.page ?? 1) + 1 })}
							>
								Next
							</Button>
						</HStack>
					</HStack>
				</Stack>
			</Box>

			<NotesModal
				open={isEditorOpen}
				title={editing ? 'Edit note' : 'Add note'}
				description="Link a Google Drive file or folder. The note date is assigned automatically when it is created."
				onClose={closeEditor}
				closeDisabled={isSaving}
				size="lg"
				footer={
					<HStack justify="flex-end" gap={2} w="full">
						<Button variant="outline" borderRadius="full" disabled={isSaving} onClick={closeEditor}>
							Cancel
						</Button>
						<Button
							type="submit"
							form="note-editor-form"
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							disabled={isSaving || !subjects.length}
						>
							{isSaving ? 'Saving...' : editing ? 'Save changes' : 'Add note'}
						</Button>
					</HStack>
				}
			>
				<Box
					as="form"
					id="note-editor-form"
					onSubmit={event => {
						event.preventDefault();
						handleSave().catch(() => undefined);
					}}
				>
					<Stack gap={4}>
						<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
							<SearchableSingleSelect
								label="Subject"
								value={form.subjectId}
								onChange={value => updateForm('subjectId', value)}
								options={subjects.map(subject => ({ value: subject.id, label: subject.name }))}
								placeholder="Select subject"
								searchPlaceholder="Search subjects"
							/>
							<NotesField label="Note title">
								<NotesInput
									autoFocus
									value={form.title}
									onChange={event => updateForm('title', event.currentTarget.value)}
									placeholder="Unit 01 — Introduction & Fundamentals"
								/>
							</NotesField>
						</SimpleGrid>
						<SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
							<NotesField label="URL slug" helper="Leave blank to generate it from the title.">
								<NotesInput
									value={form.slug ?? ''}
									onChange={event => updateForm('slug', event.currentTarget.value)}
									placeholder="unit-01-introduction"
								/>
							</NotesField>
							<NotesSelect
								label="Category"
								value={form.category}
								onChange={value => updateForm('category', value as AdminNoteCategory)}
							>
								<option value="NOTES">Notes</option>
								<option value="PYQ">PYQ</option>
								<option value="LAB">Lab</option>
							</NotesSelect>
							<NotesSelect
								label="Resource type"
								value={form.resourceType}
								onChange={value => updateForm('resourceType', value as AdminNoteResourceType)}
							>
								<option value="PDF">PDF</option>
								<option value="PPT">PPT</option>
								<option value="FOLDER">Folder</option>
							</NotesSelect>
						</SimpleGrid>
						<NotesField label="Google Drive link" helper="Use an HTTPS drive.google.com or docs.google.com link.">
							<NotesInput
								type="url"
								value={form.resourceUrl}
								onChange={event => updateForm('resourceUrl', event.currentTarget.value)}
								placeholder="https://drive.google.com/..."
							/>
						</NotesField>
						<NotesStatus message={message} tone={tone} />
					</Stack>
				</Box>
			</NotesModal>

			<NotesModal
				open={isBulkOpen}
				title="Bulk upload notes"
				description="Create up to 50 linked resources for one subject. Department visibility is inherited from the subject."
				onClose={() => {
					if (!isBulkSaving) setIsBulkOpen(false);
				}}
				closeDisabled={isBulkSaving}
				size="xl"
				allowFullScreen
			>
				<BulkNotesForm
					subjects={subjects}
					initialSubjectId={filters.subjectId ?? ''}
					onSavingChange={setIsBulkSaving}
					onCancel={() => setIsBulkOpen(false)}
					onCreated={async () => {
						await onChanged();
						setIsBulkOpen(false);
						setTone('success');
						setMessage('Notes created successfully.');
					}}
				/>
			</NotesModal>

			<NotesDeleteDialog
				open={Boolean(pendingDelete)}
				title="Delete note?"
				message={`“${pendingDelete?.title ?? ''}” will be permanently removed. This action cannot be undone.`}
				confirmLabel="Delete note"
				isDeleting={isDeleting}
				onCancel={() => setPendingDelete(null)}
				onConfirm={() => handleDelete().catch(() => undefined)}
			/>
		</Stack>
	);
};

export default NoteManager;
