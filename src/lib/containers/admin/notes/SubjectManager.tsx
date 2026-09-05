'use client';

/* eslint-disable no-nested-ternary */

import { Box, Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FiArrowRight, FiBookOpen, FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';

import {
	createAdminNoteSubject,
	deleteAdminNoteSubject,
	updateAdminNoteSubject,
	type AdminNoteDepartment,
	type AdminNoteSubject
} from '~/lib/api/admin-notes';
import { ApiRequestError } from '~/lib/api/client';

import { NotesField, NotesInput, NotesSelect, NotesStatus } from './NotesAdminControls';
import NotesDeleteDialog from './NotesDeleteDialog';

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

	const resetForm = () => {
		setEditing(null);
		setName('');
		setSlug('');
		setDepartmentIds(departmentFilter ? [departmentFilter] : []);
	};

	const startEdit = (subject: AdminNoteSubject) => {
		setEditing(subject);
		setName(subject.name);
		setSlug(subject.slug);
		setDepartmentIds(subject.departments.map(department => department.id));
		setMessage('');
	};

	const toggleDepartment = (departmentId: string) => {
		setDepartmentIds(current =>
			current.includes(departmentId) ? current.filter(id => id !== departmentId) : [...current, departmentId]
		);
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
			if (editing) {
				await updateAdminNoteSubject(editing.id, input);
			} else {
				await createAdminNoteSubject(input);
			}
			await onChanged();
			setTone('success');
			setMessage(editing ? 'Subject updated.' : 'Subject created.');
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

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={{ base: 4, md: 5 }}>
				<Stack gap={4}>
					<Box>
						<Text fontSize="lg" fontWeight="bold">
							{editing ? 'Edit subject' : 'Add subject'}
						</Text>
						<Text mt={1} color="text.muted" fontSize="sm">
							A subject may appear under multiple departments.
						</Text>
					</Box>
					<SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
						<Stack gap={3}>
							<NotesField label="Subject name">
								<NotesInput
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
						</Stack>
						<NotesField label="Departments">
							<Box border="1px solid" borderColor="border.muted" borderRadius="lg" p={3} maxH="152px" overflowY="auto">
								<SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
									{departments.map(department => (
										<HStack as="label" key={department.id} gap={2} cursor="pointer" fontSize="sm">
											<input
												type="checkbox"
												checked={departmentIds.includes(department.id)}
												onChange={() => toggleDepartment(department.id)}
											/>
											<Text lineClamp={1}>
												{department.icon} {department.name}
											</Text>
										</HStack>
									))}
								</SimpleGrid>
							</Box>
						</NotesField>
					</SimpleGrid>
					<HStack gap={2}>
						<Button
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							disabled={isSaving || !departments.length}
							onClick={() => handleSave().catch(() => undefined)}
						>
							<FiPlus /> {isSaving ? 'Saving...' : editing ? 'Save subject' : 'Add subject'}
						</Button>
						{editing ? (
							<Button variant="outline" borderRadius="full" onClick={resetForm}>
								<FiX /> Cancel
							</Button>
						) : null}
					</HStack>
					<NotesStatus message={message} tone={tone} />
				</Stack>
			</Box>

			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={{ base: 4, md: 5 }}>
				<Stack gap={4}>
					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Box>
							<Text fontSize="lg" fontWeight="bold">
								Subjects
							</Text>
							<Text mt={1} color="text.muted" fontSize="sm">
								{visibleSubjects.length} subjects · alphabetical order
							</Text>
						</Box>
						<HStack gap={3} flexWrap="wrap" w={{ base: 'full', lg: 'auto' }}>
							<Box minW={{ base: 'full', sm: '220px' }}>
								<NotesSelect label="Department filter" value={departmentFilter} onChange={selectDepartmentFilter}>
									<option value="">All departments</option>
									{departments.map(department => (
										<option key={department.id} value={department.id}>
											{department.name}
										</option>
									))}
								</NotesSelect>
							</Box>
							<Box position="relative" minW={{ base: 'full', sm: '260px' }} alignSelf="end">
								<Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="text.muted">
									<FiSearch />
								</Box>
								<NotesInput
									value={query}
									onChange={event => setQuery(event.currentTarget.value)}
									pl={9}
									placeholder="Search subjects"
								/>
							</Box>
						</HStack>
					</HStack>

					{isLoading ? (
						<Text color="text.muted">Loading subjects...</Text>
					) : visibleSubjects.length ? (
						<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3}>
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
										<HStack gap={2} flexWrap="wrap">
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
									</Stack>
								</Box>
							))}
						</SimpleGrid>
					) : (
						<Text color="text.muted">No subjects match these filters.</Text>
					)}
				</Stack>
			</Box>
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
