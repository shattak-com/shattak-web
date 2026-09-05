'use client';

/* eslint-disable no-nested-ternary */

import { Box, Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FiArrowRight, FiEdit2, FiFolder, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';

import {
	createAdminNoteDepartment,
	deleteAdminNoteDepartment,
	updateAdminNoteDepartment,
	type AdminNoteDepartment
} from '~/lib/api/admin-notes';
import { ApiRequestError } from '~/lib/api/client';

import { NotesField, NotesInput, NotesStatus } from './NotesAdminControls';
import NotesDeleteDialog from './NotesDeleteDialog';

type DepartmentManagerProps = {
	departments: AdminNoteDepartment[];
	isLoading: boolean;
	onChanged: () => Promise<void>;
	onOpen: (department: AdminNoteDepartment) => void;
};

const getErrorMessage = (error: unknown) => {
	if (error instanceof ApiRequestError && error.code === 'NOTE_DEPARTMENT_HAS_SUBJECTS') {
		return 'This department still contains subjects. Remove those subject assignments before deleting it.';
	}

	return error instanceof ApiRequestError ? error.message : 'Unable to save the department. Please try again.';
};

const DepartmentManager = ({ departments, isLoading, onChanged, onOpen }: DepartmentManagerProps) => {
	const [query, setQuery] = useState('');
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

	const startEdit = (department: AdminNoteDepartment) => {
		setEditing(department);
		setName(department.name);
		setSlug(department.slug);
		setIcon(department.icon);
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
			if (editing) {
				await updateAdminNoteDepartment(editing.id, input);
			} else {
				await createAdminNoteDepartment(input);
			}
			await onChanged();
			setTone('success');
			setMessage(editing ? 'Department updated.' : 'Department created.');
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

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={{ base: 4, md: 5 }}>
				<Stack gap={4}>
					<Box>
						<Text fontSize="lg" fontWeight="bold">
							{editing ? 'Edit department' : 'Add department'}
						</Text>
						<Text mt={1} color="text.muted" fontSize="sm">
							Add a clear name and a short emoji or icon that learners can recognize quickly.
						</Text>
					</Box>
					<Box
						display="grid"
						gridTemplateColumns={{ base: '1fr', md: 'minmax(0, 2fr) minmax(0, 2fr) 120px auto' }}
						gap={3}
						alignItems="end"
					>
						<NotesField label="Department name">
							<NotesInput
								value={name}
								onChange={event => setName(event.currentTarget.value)}
								placeholder="Computer Science & Engineering"
							/>
						</NotesField>
						<NotesField label="URL slug" helper="Leave blank to generate it from the name.">
							<NotesInput
								value={slug}
								onChange={event => setSlug(event.currentTarget.value)}
								placeholder="computer-science-engineering"
							/>
						</NotesField>
						<NotesField label="Icon">
							<NotesInput
								value={icon}
								onChange={event => setIcon(event.currentTarget.value)}
								placeholder="💻"
								maxLength={24}
							/>
						</NotesField>
						<HStack gap={2}>
							<Button
								borderRadius="full"
								bg="primary"
								color="text.inverse"
								disabled={isSaving}
								onClick={() => handleSave().catch(() => undefined)}
							>
								<FiPlus /> {isSaving ? 'Saving...' : editing ? 'Save' : 'Add'}
							</Button>
							{editing ? (
								<Button
									aria-label="Cancel editing"
									title="Cancel editing"
									variant="outline"
									borderRadius="full"
									onClick={resetForm}
								>
									<FiX />
								</Button>
							) : null}
						</HStack>
					</Box>
					<NotesStatus message={message} tone={tone} />
				</Stack>
			</Box>

			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={{ base: 4, md: 5 }}>
				<Stack gap={4}>
					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Box>
							<Text fontSize="lg" fontWeight="bold">
								Departments
							</Text>
							<Text mt={1} color="text.muted" fontSize="sm">
								{departments.length} departments · alphabetical order
							</Text>
						</Box>
						<Box position="relative" w={{ base: 'full', md: '280px' }}>
							<Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="text.muted">
								<FiSearch />
							</Box>
							<NotesInput
								value={query}
								onChange={event => setQuery(event.currentTarget.value)}
								pl={9}
								placeholder="Search departments"
							/>
						</Box>
					</HStack>

					{isLoading ? (
						<Text color="text.muted">Loading departments...</Text>
					) : visibleDepartments.length ? (
						<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3}>
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
												<Text fontWeight="semibold" lineClamp={2}>
													{department.name}
												</Text>
												<Text color="text.muted" fontSize="xs">
													{department.subjectCount} subjects
												</Text>
											</Box>
										</HStack>
										<HStack gap={2} flexWrap="wrap">
											<Button
												size="xs"
												borderRadius="full"
												bg="text.primary"
												color="text.inverse"
												onClick={() => onOpen(department)}
											>
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
									</Stack>
								</Box>
							))}
						</SimpleGrid>
					) : (
						<Text color="text.muted">No departments match this search.</Text>
					)}
				</Stack>
			</Box>
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
