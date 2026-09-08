'use client';

import { Box, Button, HStack, Stack, Table, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import {
	bulkCreateAdminNotes,
	type AdminNoteBulkInput,
	type AdminNoteCategory,
	type AdminNoteResourceType,
	type AdminNoteSubject
} from '~/lib/api/admin-notes';
import { ApiRequestError } from '~/lib/api/client';

import { NotesField, NotesInput, NotesSelect, NotesSelectControl, NotesStatus } from './NotesAdminControls';

type BulkNoteRow = AdminNoteBulkInput['notes'][number];

const createBlankRow = (): BulkNoteRow => ({
	title: '',
	category: 'NOTES',
	resourceType: 'PDF',
	resourceUrl: ''
});

const BulkNotesForm = ({
	subjects,
	initialSubjectId,
	onCreated,
	onSavingChange,
	onCancel
}: {
	subjects: AdminNoteSubject[];
	initialSubjectId: string;
	onCreated: () => Promise<void>;
	onSavingChange: (isSaving: boolean) => void;
	onCancel: () => void;
}) => {
	const [subjectId, setSubjectId] = useState(initialSubjectId);
	const [count, setCount] = useState(1);
	const [rows, setRows] = useState<BulkNoteRow[]>([createBlankRow()]);
	const [message, setMessage] = useState('');
	const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
	const [isSaving, setIsSaving] = useState(false);

	const generateRows = () => {
		const nextCount = Math.min(50, Math.max(1, count || 1));
		setCount(nextCount);
		setRows(current => Array.from({ length: nextCount }, (_, index) => current[index] ?? createBlankRow()));
		setMessage('');
	};

	const updateRow = (index: number, field: keyof BulkNoteRow, value: string) => {
		setRows(current => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
	};

	const handleCreate = async () => {
		if (!subjectId) {
			setTone('error');
			setMessage('Select a subject before creating notes.');
			return;
		}
		if (rows.some(row => !row.title.trim() || !row.resourceUrl.trim())) {
			setTone('error');
			setMessage('Every row needs a title and Google Drive link.');
			return;
		}

		setIsSaving(true);
		onSavingChange(true);
		setMessage('');
		try {
			await bulkCreateAdminNotes({
				subjectId,
				notes: rows.map(row => ({ ...row, title: row.title.trim(), resourceUrl: row.resourceUrl.trim() }))
			});
			await onCreated();
		} catch (error) {
			setTone('error');
			setMessage(error instanceof ApiRequestError ? error.message : 'Unable to create notes. Please try again.');
		} finally {
			setIsSaving(false);
			onSavingChange(false);
		}
	};

	return (
		<Stack gap={5}>
			<Box
				display="grid"
				gridTemplateColumns={{ base: '1fr', md: 'minmax(0, 1fr) 140px auto' }}
				gap={3}
				alignItems="end"
			>
				<NotesSelect label="Subject" value={subjectId} onChange={setSubjectId}>
					<option value="">Select subject</option>
					{subjects.map(subject => (
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
						onChange={event => setCount(Number(event.currentTarget.value))}
						onKeyDown={event => {
							if (event.key === 'Enter') {
								event.preventDefault();
								generateRows();
							}
						}}
					/>
				</NotesField>
				<Button borderRadius="full" variant="outline" disabled={isSaving} onClick={generateRows}>
					<FiPlus /> Generate
				</Button>
			</Box>

			<Text color="text.muted" fontSize="sm">
				{rows.length} input {rows.length === 1 ? 'row' : 'rows'} ready. Dates are assigned automatically when the notes
				are created.
			</Text>

			<Box
				border="1px solid"
				borderColor="border.default"
				borderRadius="lg"
				overflowX="auto"
				maxH={{ base: 'min(48dvh, 440px)', md: 'min(54dvh, 520px)' }}
				overflowY="auto"
			>
				<Table.Root size="sm" minW="1080px" tableLayout="fixed">
					<Table.Header position="sticky" top={0} zIndex={1} bg="bg.card">
						<Table.Row>
							<Table.ColumnHeader w="52px">#</Table.ColumnHeader>
							<Table.ColumnHeader w="300px">Note title</Table.ColumnHeader>
							<Table.ColumnHeader w="150px">Category</Table.ColumnHeader>
							<Table.ColumnHeader w="160px">Resource type</Table.ColumnHeader>
							<Table.ColumnHeader>Google Drive link</Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{rows.map((row, index) => (
							// The generated rows are positional and cannot be reordered.
							// eslint-disable-next-line react/no-array-index-key
							<Table.Row key={index} _even={{ bg: 'bg.subtle' }}>
								<Table.Cell color="text.muted" fontWeight="semibold">
									{index + 1}
								</Table.Cell>
								<Table.Cell>
									<NotesInput
										aria-label={`Note ${index + 1} title`}
										value={row.title}
										onChange={event => updateRow(index, 'title', event.currentTarget.value)}
										placeholder="Unit 01 — Introduction & Fundamentals"
									/>
								</Table.Cell>
								<Table.Cell>
									<NotesSelectControl
										ariaLabel={`Note ${index + 1} category`}
										value={row.category}
										onChange={value => updateRow(index, 'category', value as AdminNoteCategory)}
									>
										<option value="NOTES">Notes</option>
										<option value="PYQ">PYQ</option>
										<option value="LAB">Lab</option>
									</NotesSelectControl>
								</Table.Cell>
								<Table.Cell>
									<NotesSelectControl
										ariaLabel={`Note ${index + 1} resource type`}
										value={row.resourceType}
										onChange={value => updateRow(index, 'resourceType', value as AdminNoteResourceType)}
									>
										<option value="PDF">PDF</option>
										<option value="PPT">PPT</option>
										<option value="FOLDER">Folder</option>
									</NotesSelectControl>
								</Table.Cell>
								<Table.Cell>
									<NotesInput
										aria-label={`Note ${index + 1} Google Drive link`}
										type="url"
										value={row.resourceUrl}
										onChange={event => updateRow(index, 'resourceUrl', event.currentTarget.value)}
										placeholder="https://drive.google.com/..."
									/>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</Box>

			<NotesStatus message={message} tone={tone} />
			<HStack justify="flex-end" gap={2} position="sticky" bottom={0} bg="bg.card" py={2}>
				<Button variant="outline" borderRadius="full" disabled={isSaving} onClick={onCancel}>
					Cancel
				</Button>
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
	);
};

export default BulkNotesForm;
