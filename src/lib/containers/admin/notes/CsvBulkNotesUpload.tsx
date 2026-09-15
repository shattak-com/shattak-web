'use client';

import { Badge, Box, Button, HStack, Stack, Table, Text } from '@chakra-ui/react';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { FiDownload, FiFileText, FiTrash2, FiUploadCloud } from 'react-icons/fi';

import {
	createNotesCsvTemplate,
	maxCsvFileSize,
	parseNotesCsv,
	type CsvNoteField,
	type CsvNoteRow,
	type CsvNotesValidation
} from './bulkNotesCsv';
import { NotesInput, NotesSelectControl } from './NotesAdminControls';

type CsvBulkNotesUploadProps = {
	rows: CsvNoteRow[];
	validation: CsvNotesValidation;
	disabled: boolean;
	onRowsChange: (rows: CsvNoteRow[]) => void;
};

const acceptedMimeTypes = new Set([
	'text/csv',
	'text/plain',
	'application/csv',
	'application/vnd.ms-excel',
	'application/octet-stream'
]);

const getDropZoneBorderColor = (fileError: string, isDragging: boolean) => {
	if (fileError) return 'red.400';
	return isDragging ? 'primary' : 'border.muted';
};

const downloadTemplate = () => {
	const blob = new Blob([`\uFEFF${createNotesCsvTemplate()}`], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = 'notes-bulk-upload-template.csv';
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
};

const CsvBulkNotesUpload = ({ rows, validation, disabled, onRowsChange }: CsvBulkNotesUploadProps) => {
	const [fileName, setFileName] = useState('');
	const [fileError, setFileError] = useState('');
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const processFile = async (file: File) => {
		setFileName(file.name);
		setFileError('');
		onRowsChange([]);
		const hasCsvExtension = file.name.toLowerCase().endsWith('.csv');
		const hasAcceptedMimeType = !file.type || acceptedMimeTypes.has(file.type.toLowerCase());
		if (!hasCsvExtension || !hasAcceptedMimeType) {
			setFileError('Choose a valid .csv file. Other spreadsheet formats are not supported.');
			return;
		}
		if (file.size > maxCsvFileSize) {
			setFileError('The CSV file must be 1 MB or smaller.');
			return;
		}

		try {
			onRowsChange(parseNotesCsv(await file.text()));
		} catch (error) {
			setFileError(error instanceof Error ? error.message : 'The CSV could not be parsed.');
		}
	};

	const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0];
		if (inputRef.current) inputRef.current.value = '';
		if (file) processFile(file).catch(() => setFileError('The CSV file could not be read.'));
	};

	const dropFile = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
		if (disabled) return;
		const file = event.dataTransfer.files[0];
		if (file) processFile(file).catch(() => setFileError('The CSV file could not be read.'));
	};

	const updateRow = (index: number, field: CsvNoteField, value: string) => {
		onRowsChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
	};

	const removeRow = (index: number) => {
		const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
		onRowsChange(nextRows);
		if (!nextRows.length) {
			setFileName('');
			setFileError('');
		}
	};

	return (
		<Stack gap={4} minH={0} flex="1">
			{!rows.length ? (
				<>
					<HStack justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
						<Box>
							<Text fontWeight="semibold">Upload notes from CSV</Text>
							<Text mt={1} color="text.muted" fontSize="sm">
								Required columns: title, category, resourceType, resourceUrl.
							</Text>
							<Text mt={1} color="text.muted" fontSize="xs">
								Categories: NOTES, PYQ, LAB · Resource types: PDF, PPT, FOLDER. Values are case-insensitive.
							</Text>
						</Box>
						<Button type="button" variant="outline" borderRadius="full" disabled={disabled} onClick={downloadTemplate}>
							<FiDownload /> Download CSV template
						</Button>
					</HStack>

					<Box
						position="relative"
						border="2px dashed"
						borderColor={getDropZoneBorderColor(fileError, isDragging)}
						borderRadius="xl"
						bg={isDragging ? 'bg.brand' : 'bg.subtle'}
						px={{ base: 4, md: 6 }}
						py={{ base: 6, md: 8 }}
						textAlign="center"
						transition="border-color 160ms ease, background-color 160ms ease"
						onDragEnter={event => {
							event.preventDefault();
							if (!disabled) setIsDragging(true);
						}}
						onDragOver={event => event.preventDefault()}
						onDragLeave={() => setIsDragging(false)}
						onDrop={dropFile}
					>
						<input
							ref={inputRef}
							type="file"
							accept=".csv,text/csv"
							disabled={disabled}
							onChange={selectFile}
							aria-label="Upload notes CSV file"
							style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
						/>
						<Stack align="center" gap={2} pointerEvents="none">
							<Box boxSize="44px" borderRadius="full" bg="bg.card" color="primary" display="grid" placeItems="center">
								<FiUploadCloud size={22} />
							</Box>
							<Text fontWeight="semibold">Drop a CSV file here or click to browse</Text>
							<Text color="text.muted" fontSize="xs">
								CSV only · maximum 1 MB · maximum 50 note rows
							</Text>
						</Stack>
					</Box>

					{fileError ? (
						<Box
							role="alert"
							border="1px solid"
							borderColor="red.300"
							bg="red.50"
							_dark={{ bg: 'bg.card' }}
							borderRadius="lg"
							px={4}
							py={3}
						>
							<Text color="red.600" _dark={{ color: 'red.300' }} fontSize="sm">
								{fileError}
							</Text>
						</Box>
					) : null}
				</>
			) : null}

			{rows.length && fileName ? (
				<HStack gap={2} color="text.muted" fontSize="sm">
					<FiFileText />
					<Text as="span" lineClamp={1}>
						{fileName}
					</Text>
				</HStack>
			) : null}
			{rows.length ? (
				<Stack gap={3} minH={0} flex="1">
					<HStack justify="space-between" gap={3} flexWrap="wrap">
						<Box>
							<Text fontWeight="semibold">Review imported notes</Text>
							<Text color="text.muted" fontSize="xs">
								Correct highlighted fields here or update the CSV and upload it again.
							</Text>
						</Box>
						<HStack gap={2}>
							<Badge colorPalette="green" borderRadius="full">
								{validation.validCount} valid
							</Badge>
							<Badge colorPalette={validation.invalidCount ? 'red' : 'gray'} borderRadius="full">
								{validation.invalidCount} invalid
							</Badge>
						</HStack>
					</HStack>
					<Box
						border="1px solid"
						borderColor="border.default"
						borderRadius="lg"
						overflow="auto"
						minH="220px"
						maxH={{ base: '44dvh', md: '50dvh' }}
					>
						<Table.Root size="sm" minW="1180px" tableLayout="fixed">
							<Table.Header position="sticky" top={0} zIndex={1} bg="bg.card">
								<Table.Row>
									<Table.ColumnHeader w="62px">CSV row</Table.ColumnHeader>
									<Table.ColumnHeader w="280px">Note title</Table.ColumnHeader>
									<Table.ColumnHeader w="150px">Category</Table.ColumnHeader>
									<Table.ColumnHeader w="160px">Resource type</Table.ColumnHeader>
									<Table.ColumnHeader>Google Drive link</Table.ColumnHeader>
									<Table.ColumnHeader w="76px" textAlign="center" whiteSpace="nowrap">
										Remove
									</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{validation.rows.map((result, index) => (
									<Table.Row
										key={result.row.sourceRow}
										bg={Object.keys(result.errors).length ? 'red.50' : undefined}
										_dark={Object.keys(result.errors).length ? { bg: 'rgba(127, 29, 29, 0.16)' } : undefined}
									>
										<Table.Cell color="text.muted" fontWeight="semibold">
											{result.row.sourceRow}
										</Table.Cell>
										<Table.Cell verticalAlign="top">
											<NotesInput
												value={result.row.title}
												aria-invalid={Boolean(result.errors.title)}
												borderColor={result.errors.title ? 'red.400' : undefined}
												onChange={event => updateRow(index, 'title', event.currentTarget.value)}
											/>
											{result.errors.title ? (
												<Text mt={1} color="red.600" _dark={{ color: 'red.300' }} fontSize="2xs">
													{result.errors.title}
												</Text>
											) : null}
										</Table.Cell>
										<Table.Cell verticalAlign="top">
											<NotesSelectControl
												value={result.row.category}
												invalid={Boolean(result.errors.category)}
												ariaLabel={`CSV row ${result.row.sourceRow} category`}
												onChange={value => updateRow(index, 'category', value)}
											>
												<option value="" disabled>
													Select category
												</option>
												{result.errors.category && result.row.category ? (
													<option value={result.row.category}>{result.row.category}</option>
												) : null}
												<option value="NOTES">Notes</option>
												<option value="PYQ">PYQ</option>
												<option value="LAB">Lab</option>
											</NotesSelectControl>
											{result.errors.category ? (
												<Text mt={1} color="red.600" _dark={{ color: 'red.300' }} fontSize="2xs">
													{result.errors.category}
												</Text>
											) : null}
										</Table.Cell>
										<Table.Cell verticalAlign="top">
											<NotesSelectControl
												value={result.row.resourceType}
												invalid={Boolean(result.errors.resourceType)}
												ariaLabel={`CSV row ${result.row.sourceRow} resource type`}
												onChange={value => updateRow(index, 'resourceType', value)}
											>
												<option value="" disabled>
													Select resource type
												</option>
												{result.errors.resourceType && result.row.resourceType ? (
													<option value={result.row.resourceType}>{result.row.resourceType}</option>
												) : null}
												<option value="PDF">PDF</option>
												<option value="PPT">PPT</option>
												<option value="FOLDER">Folder</option>
											</NotesSelectControl>
											{result.errors.resourceType ? (
												<Text mt={1} color="red.600" _dark={{ color: 'red.300' }} fontSize="2xs">
													{result.errors.resourceType}
												</Text>
											) : null}
										</Table.Cell>
										<Table.Cell verticalAlign="top">
											<NotesInput
												type="url"
												value={result.row.resourceUrl}
												aria-invalid={Boolean(result.errors.resourceUrl)}
												borderColor={result.errors.resourceUrl ? 'red.400' : undefined}
												onChange={event => updateRow(index, 'resourceUrl', event.currentTarget.value)}
											/>
											{result.errors.resourceUrl ? (
												<Text mt={1} color="red.600" _dark={{ color: 'red.300' }} fontSize="2xs">
													{result.errors.resourceUrl}
												</Text>
											) : null}
										</Table.Cell>
										<Table.Cell textAlign="center" verticalAlign="top">
											<Button
												type="button"
												size="xs"
												variant="outline"
												colorPalette="red"
												boxSize="32px"
												minW="32px"
												p={0}
												borderRadius="full"
												aria-label={`Remove CSV row ${result.row.sourceRow}`}
												title="Remove row"
												disabled={disabled}
												onClick={() => removeRow(index)}
											>
												<FiTrash2 />
											</Button>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Box>
				</Stack>
			) : null}
		</Stack>
	);
};

export default CsvBulkNotesUpload;
