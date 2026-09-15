'use client';

import { Box, Button, HStack, Stack, Table, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { FiEdit3, FiPlus, FiUploadCloud } from 'react-icons/fi';

import {
	bulkCreateAdminNotes,
	type AdminNoteBulkInput,
	type AdminNoteCategory,
	type AdminNoteResourceType,
	type AdminNoteSubject
} from '~/lib/api/admin-notes';
import { ApiRequestError } from '~/lib/api/client';
import SearchableSingleSelect from '~/lib/components/forms/SearchableSingleSelect';

import { validateCsvNoteRows, type CsvNoteRow } from './bulkNotesCsv';
import CsvBulkNotesUpload from './CsvBulkNotesUpload';
import { NotesField, NotesInput, NotesSelectControl, NotesStatus } from './NotesAdminControls';

type BulkNoteRow = AdminNoteBulkInput['notes'][number];
export type BulkUploadMode = 'manual' | 'csv';

const getSubmissionError = (subjectId: string, mode: BulkUploadMode, isCsvReady: boolean, rows: BulkNoteRow[]) => {
	if (!subjectId) return 'Select a subject before creating notes.';
	if (mode === 'csv' && !isCsvReady) return 'Upload a CSV and resolve all invalid rows before creating notes.';
	if (rows.some(row => !row.title.trim() || !row.resourceUrl.trim())) {
		return 'Every row needs a title and Google Drive link.';
	}
	return '';
};

const getCreateLabel = (isSaving: boolean, mode: BulkUploadMode, invalidCount: number, rowCount: number) => {
	if (isSaving) return 'Creating notes...';
	if (mode === 'csv' && invalidCount) {
		return `Resolve ${invalidCount} invalid row${invalidCount === 1 ? '' : 's'}`;
	}
	if (mode === 'csv' && !rowCount) return 'Upload a CSV to continue';
	return `Create ${rowCount} note${rowCount === 1 ? '' : 's'}`;
};

const createBlankRow = (
	category: AdminNoteCategory = 'NOTES',
	resourceType: AdminNoteResourceType = 'PDF'
): BulkNoteRow => ({
	title: '',
	category,
	resourceType,
	resourceUrl: ''
});

export const BulkUploadModeSwitch = ({
	value,
	disabled,
	onChange
}: {
	value: BulkUploadMode;
	disabled: boolean;
	onChange: (mode: BulkUploadMode) => void;
}) => (
	<HStack
		alignSelf="flex-start"
		gap={1}
		p={1}
		bg="bg.subtle"
		border="1px solid"
		borderColor="border.default"
		borderRadius="full"
		role="group"
		aria-label="Bulk upload mode"
	>
		<Button
			type="button"
			size="sm"
			borderRadius="full"
			variant="ghost"
			bg={value === 'manual' ? 'primary' : 'transparent'}
			color={value === 'manual' ? 'text.inverse' : 'text.secondary'}
			boxShadow={value === 'manual' ? 'sm' : 'none'}
			_hover={value === 'manual' ? { bg: 'primaryHover' } : { bg: 'bg.card', color: 'text.primary' }}
			disabled={disabled}
			aria-pressed={value === 'manual'}
			onClick={() => onChange('manual')}
		>
			<FiEdit3 /> Manual entry
		</Button>
		<Button
			type="button"
			size="sm"
			borderRadius="full"
			variant="ghost"
			bg={value === 'csv' ? 'primary' : 'transparent'}
			color={value === 'csv' ? 'text.inverse' : 'text.secondary'}
			boxShadow={value === 'csv' ? 'sm' : 'none'}
			_hover={value === 'csv' ? { bg: 'primaryHover' } : { bg: 'bg.card', color: 'text.primary' }}
			disabled={disabled}
			aria-pressed={value === 'csv'}
			onClick={() => onChange('csv')}
		>
			<FiUploadCloud /> CSV upload
		</Button>
	</HStack>
);

const ManualBulkNotesEntry = ({
	subjectId,
	subjectOptions,
	count,
	rows,
	disabled,
	onSubjectChange,
	onCountChange,
	onGenerate,
	onRowChange
}: {
	subjectId: string;
	subjectOptions: { value: string; label: string }[];
	count: number;
	rows: BulkNoteRow[];
	disabled: boolean;
	onSubjectChange: (subjectId: string) => void;
	onCountChange: (count: number) => void;
	onGenerate: () => void;
	onRowChange: (index: number, field: keyof BulkNoteRow, value: string) => void;
}) => (
	<Stack gap={4} minH={0} flex="1">
		<Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'minmax(0, 1fr) 140px auto' }} gap={3} alignItems="end">
			<SearchableSingleSelect
				label="Subject"
				value={subjectId}
				onChange={onSubjectChange}
				options={subjectOptions}
				placeholder="Select subject"
				searchPlaceholder="Search subjects"
				disabled={disabled}
			/>
			<NotesField label="Number of notes">
				<NotesInput
					type="number"
					min={1}
					max={50}
					value={count}
					disabled={disabled}
					onChange={event => onCountChange(Number(event.currentTarget.value))}
					onKeyDown={event => {
						if (event.key === 'Enter') {
							event.preventDefault();
							onGenerate();
						}
					}}
				/>
			</NotesField>
			<Button borderRadius="full" variant="outline" disabled={disabled} onClick={onGenerate}>
				<FiPlus /> Generate
			</Button>
		</Box>

		<Text color="text.muted" fontSize="sm">
			{rows.length} input {rows.length === 1 ? 'row' : 'rows'} ready. New rows inherit category and resource type from
			row 1. Dates are assigned automatically when the notes are created.
		</Text>

		<Box
			border="1px solid"
			borderColor="border.default"
			borderRadius="lg"
			flex="1"
			minH="220px"
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
									disabled={disabled}
									onChange={event => onRowChange(index, 'title', event.currentTarget.value)}
									placeholder="Unit 01 — Introduction & Fundamentals"
								/>
							</Table.Cell>
							<Table.Cell>
								<NotesSelectControl
									ariaLabel={`Note ${index + 1} category`}
									value={row.category}
									disabled={disabled}
									onChange={value => onRowChange(index, 'category', value)}
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
									disabled={disabled}
									onChange={value => onRowChange(index, 'resourceType', value)}
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
									disabled={disabled}
									onChange={event => onRowChange(index, 'resourceUrl', event.currentTarget.value)}
									placeholder="https://drive.google.com/..."
								/>
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Box>
	</Stack>
);

const BulkNotesForm = ({
	mode,
	subjects,
	initialSubjectId,
	onCreated,
	onSavingChange,
	onCancel
}: {
	mode: BulkUploadMode;
	subjects: AdminNoteSubject[];
	initialSubjectId: string;
	onCreated: () => Promise<void>;
	onSavingChange: (isSaving: boolean) => void;
	onCancel: () => void;
}) => {
	const [subjectId, setSubjectId] = useState(initialSubjectId);
	const [count, setCount] = useState(1);
	const [manualRows, setManualRows] = useState<BulkNoteRow[]>([createBlankRow()]);
	const [csvRows, setCsvRows] = useState<CsvNoteRow[]>([]);
	const [message, setMessage] = useState('');
	const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
	const [isSaving, setIsSaving] = useState(false);
	const csvValidation = useMemo(() => validateCsvNoteRows(csvRows), [csvRows]);
	const subjectOptions = useMemo(
		() => subjects.map(subject => ({ value: subject.id, label: subject.name })),
		[subjects]
	);
	const isCsvReady = Boolean(csvRows.length && !csvValidation.invalidCount);
	const activeRows = mode === 'manual' ? manualRows : csvValidation.validNotes;

	useEffect(() => {
		setMessage('');
		setTone('neutral');
	}, [mode]);

	const generateRows = () => {
		const nextCount = Math.min(50, Math.max(1, count || 1));
		setCount(nextCount);
		setManualRows(current => {
			const template = current[0] ?? createBlankRow();
			return Array.from(
				{ length: nextCount },
				(_, index) => current[index] ?? createBlankRow(template.category, template.resourceType)
			);
		});
		setMessage('');
	};

	const updateManualRow = (index: number, field: keyof BulkNoteRow, value: string) => {
		setManualRows(current => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
	};

	const handleCreate = async () => {
		const submissionError = getSubmissionError(subjectId, mode, isCsvReady, activeRows);
		if (submissionError) {
			setTone('error');
			setMessage(submissionError);
			return;
		}

		setIsSaving(true);
		onSavingChange(true);
		setMessage('');
		try {
			await bulkCreateAdminNotes({
				subjectId,
				notes: activeRows.map(row => ({ ...row, title: row.title.trim(), resourceUrl: row.resourceUrl.trim() }))
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

	const createLabel = getCreateLabel(isSaving, mode, csvValidation.invalidCount, activeRows.length);

	return (
		<Stack gap={5} h="full" minH={0}>
			{mode === 'manual' ? (
				<ManualBulkNotesEntry
					subjectId={subjectId}
					subjectOptions={subjectOptions}
					count={count}
					rows={manualRows}
					disabled={isSaving}
					onSubjectChange={setSubjectId}
					onCountChange={setCount}
					onGenerate={generateRows}
					onRowChange={updateManualRow}
				/>
			) : (
				<Stack gap={4} minH={0} flex="1">
					<SearchableSingleSelect
						label="Subject"
						value={subjectId}
						onChange={setSubjectId}
						options={subjectOptions}
						placeholder="Select subject"
						searchPlaceholder="Search subjects"
						disabled={isSaving}
					/>
					<Text mt={-3} color="text.muted" fontSize="xs">
						The selected subject applies to every imported note.
					</Text>
					<CsvBulkNotesUpload rows={csvRows} validation={csvValidation} disabled={isSaving} onRowsChange={setCsvRows} />
				</Stack>
			)}

			<NotesStatus message={message} tone={tone} />
			<HStack justify="flex-end" gap={2} position="sticky" bottom={0} bg="bg.card" py={2}>
				<Button variant="outline" borderRadius="full" disabled={isSaving} onClick={onCancel}>
					Cancel
				</Button>
				<Button
					borderRadius="full"
					bg="primary"
					color="text.inverse"
					disabled={isSaving || !subjectId || (mode === 'csv' && !isCsvReady)}
					onClick={() => handleCreate().catch(() => undefined)}
				>
					{createLabel}
				</Button>
			</HStack>
		</Stack>
	);
};

export default BulkNotesForm;
