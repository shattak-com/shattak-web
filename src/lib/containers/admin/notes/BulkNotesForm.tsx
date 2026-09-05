'use client';

import { Box, Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FiLayers, FiPlus } from 'react-icons/fi';

import {
	bulkCreateAdminNotes,
	type AdminNoteBulkInput,
	type AdminNoteCategory,
	type AdminNoteDepartment,
	type AdminNoteResourceType,
	type AdminNoteSubject
} from '~/lib/api/admin-notes';
import { ApiRequestError } from '~/lib/api/client';

import { NotesField, NotesInput, NotesSelect, NotesStatus } from './NotesAdminControls';
import { getIndiaCalendarDate } from './utils';

type BulkNoteRow = AdminNoteBulkInput['notes'][number];

const createBlankRow = (): BulkNoteRow => ({
	title: '',
	description: '',
	category: 'NOTES',
	resourceType: 'PDF',
	resourceUrl: '',
	resourceDate: getIndiaCalendarDate()
});

const BulkNotesForm = ({
	departments,
	subjects,
	initialDepartmentId,
	initialSubjectId,
	onCreated
}: {
	departments: AdminNoteDepartment[];
	subjects: AdminNoteSubject[];
	initialDepartmentId: string;
	initialSubjectId: string;
	onCreated: () => Promise<void>;
}) => {
	const [departmentId, setDepartmentId] = useState(initialDepartmentId);
	const [subjectId, setSubjectId] = useState(initialSubjectId);
	const [count, setCount] = useState(1);
	const [rows, setRows] = useState<BulkNoteRow[]>([createBlankRow()]);
	const [message, setMessage] = useState('');
	const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
	const [isSaving, setIsSaving] = useState(false);
	const availableSubjects = useMemo(
		() =>
			subjects.filter(
				subject => !departmentId || subject.departments.some(department => department.id === departmentId)
			),
		[departmentId, subjects]
	);

	const updateCount = (value: number) => {
		const nextCount = Math.min(50, Math.max(1, value || 1));
		setCount(nextCount);
		setRows(current => Array.from({ length: nextCount }, (_, index) => current[index] ?? createBlankRow()));
	};

	const updateRow = (index: number, field: keyof BulkNoteRow, value: string) => {
		setRows(current => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
	};

	const changeDepartment = (value: string) => {
		setDepartmentId(value);
		if (
			!subjects.some(
				subject => subject.id === subjectId && subject.departments.some(department => department.id === value)
			)
		) {
			setSubjectId('');
		}
	};

	const handleCreate = async () => {
		if (!departmentId || !subjectId) {
			setTone('error');
			setMessage('Select a department and subject before creating notes.');
			return;
		}
		if (rows.some(row => !row.title.trim() || !row.resourceUrl.trim() || !row.resourceDate)) {
			setTone('error');
			setMessage('Every row needs a title, Google Drive link, and resource date.');
			return;
		}

		setIsSaving(true);
		setMessage('');
		try {
			const result = await bulkCreateAdminNotes({
				departmentId,
				subjectId,
				notes: rows.map(row => ({
					...row,
					title: row.title.trim(),
					description: row.description?.trim() || undefined,
					resourceUrl: row.resourceUrl.trim()
				}))
			});
			await onCreated();
			setRows([createBlankRow()]);
			setCount(1);
			setTone('success');
			setMessage(`${result.createdCount} note${result.createdCount === 1 ? '' : 's'} created successfully.`);
		} catch (error) {
			setTone('error');
			setMessage(error instanceof ApiRequestError ? error.message : 'Unable to create notes. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Box border="1px solid" borderColor="border.brandSoft" borderRadius="xl" bg="bg.subtle" p={{ base: 4, md: 5 }}>
			<Stack gap={5}>
				<HStack gap={3} align="flex-start">
					<Box
						boxSize="42px"
						borderRadius="lg"
						bg="bg.card"
						color="primary"
						display="grid"
						placeItems="center"
						flexShrink={0}
					>
						<FiLayers />
					</Box>
					<Box>
						<Text fontSize="lg" fontWeight="bold">
							Bulk notes upload
						</Text>
						<Text mt={1} color="text.muted" fontSize="sm">
							Generate compact input cards and save all rows in one atomic operation.
						</Text>
					</Box>
				</HStack>

				<Box
					display="grid"
					gridTemplateColumns={{ base: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr) 120px auto' }}
					gap={3}
					alignItems="end"
				>
					<NotesSelect label="Department" value={departmentId} onChange={changeDepartment}>
						<option value="">Select department</option>
						{departments.map(department => (
							<option key={department.id} value={department.id}>
								{department.name}
							</option>
						))}
					</NotesSelect>
					<NotesSelect label="Subject" value={subjectId} onChange={setSubjectId} disabled={!departmentId}>
						<option value="">Select subject</option>
						{availableSubjects.map(subject => (
							<option key={subject.id} value={subject.id}>
								{subject.name}
							</option>
						))}
					</NotesSelect>
					<NotesField label="Number of notes">
						<NotesInput
							type="number"
							min={1}
							max={50}
							value={count}
							onChange={event => updateCount(Number(event.currentTarget.value))}
						/>
					</NotesField>
					<Button borderRadius="full" variant="outline" onClick={() => updateCount(count)}>
						<FiPlus /> Generate
					</Button>
				</Box>

				<SimpleGrid columns={{ base: 1, xl: 2 }} gap={3}>
					{rows.map((row, index) => (
						// The generated rows are positional and cannot be reordered.
						// eslint-disable-next-line react/no-array-index-key
						<Box key={index} border="1px solid" borderColor="border.default" borderRadius="lg" bg="bg.card" p={4}>
							<Stack gap={3}>
								<Text fontSize="sm" fontWeight="bold">
									Note {index + 1}
								</Text>
								<NotesField label="Note title">
									<NotesInput
										value={row.title}
										onChange={event => updateRow(index, 'title', event.currentTarget.value)}
										placeholder="Unit 01 — Introduction & Fundamentals"
									/>
								</NotesField>
								<Box display="grid" gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr 150px' }} gap={3}>
									<NotesSelect
										label="Category"
										value={row.category}
										onChange={value => updateRow(index, 'category', value as AdminNoteCategory)}
									>
										<option value="NOTES">Notes</option>
										<option value="PYQ">PYQ</option>
										<option value="LAB">Lab</option>
									</NotesSelect>
									<NotesSelect
										label="Resource type"
										value={row.resourceType}
										onChange={value => updateRow(index, 'resourceType', value as AdminNoteResourceType)}
									>
										<option value="PDF">PDF</option>
										<option value="PPT">PPT</option>
										<option value="FOLDER">Folder</option>
									</NotesSelect>
									<NotesField label="Resource date">
										<NotesInput
											type="date"
											value={row.resourceDate}
											onChange={event => updateRow(index, 'resourceDate', event.currentTarget.value)}
										/>
									</NotesField>
								</Box>
								<NotesField label="Google Drive link">
									<NotesInput
										type="url"
										value={row.resourceUrl}
										onChange={event => updateRow(index, 'resourceUrl', event.currentTarget.value)}
										placeholder="https://drive.google.com/..."
									/>
								</NotesField>
								<NotesField label="Description">
									<NotesInput
										value={row.description ?? ''}
										onChange={event => updateRow(index, 'description', event.currentTarget.value)}
										placeholder="Optional short description"
									/>
								</NotesField>
							</Stack>
						</Box>
					))}
				</SimpleGrid>

				<HStack justify="space-between" gap={3} flexWrap="wrap">
					<Box flex="1" minW={{ base: '100%', md: '260px' }}>
						<NotesStatus message={message} tone={tone} />
					</Box>
					<Button
						borderRadius="full"
						bg="primary"
						color="text.inverse"
						disabled={isSaving}
						onClick={() => handleCreate().catch(() => undefined)}
					>
						{isSaving ? 'Creating notes...' : `Create ${rows.length} note${rows.length === 1 ? '' : 's'}`}
					</Button>
				</HStack>
			</Stack>
		</Box>
	);
};

export default BulkNotesForm;
