import type { AdminNoteBulkInput, AdminNoteCategory, AdminNoteResourceType } from '~/lib/api/admin-notes';

export const maxBulkNoteRows = 50;
export const maxCsvFileSize = 1024 * 1024;

export const csvColumns = ['title', 'category', 'resourceType', 'resourceUrl'] as const;

export type CsvNoteField = (typeof csvColumns)[number];

export type CsvNoteRow = {
	sourceRow: number;
	title: string;
	category: string;
	resourceType: string;
	resourceUrl: string;
};

export type CsvNoteRowErrors = Partial<Record<CsvNoteField, string>>;

export type CsvNoteRowValidation = {
	row: CsvNoteRow;
	errors: CsvNoteRowErrors;
	note?: AdminNoteBulkInput['notes'][number];
};

export type CsvNotesValidation = {
	rows: CsvNoteRowValidation[];
	validNotes: AdminNoteBulkInput['notes'];
	validCount: number;
	invalidCount: number;
};

const allowedCategories = new Set<AdminNoteCategory>(['NOTES', 'PYQ', 'LAB']);
const allowedResourceTypes = new Set<AdminNoteResourceType>(['PDF', 'PPT', 'FOLDER']);

const readQuotedCharacter = (contents: string, index: number, field: string) => {
	const character = contents[index];
	if (character !== '"') return { field: `${field}${character}`, index, inQuotes: true };
	if (contents[index + 1] === '"') return { field: `${field}"`, index: index + 1, inQuotes: true };
	return { field, index, inQuotes: false };
};

const parseCsvCells = (contents: string) => {
	const records: string[][] = [];
	let record: string[] = [];
	let field = '';
	let inQuotes = false;

	for (let index = 0; index < contents.length; index += 1) {
		const character = contents[index];
		if (inQuotes) {
			const next = readQuotedCharacter(contents, index, field);
			field = next.field;
			index = next.index;
			inQuotes = next.inQuotes;
		} else if (character === '"') {
			if (field.length) throw new Error('A quoted value must begin at the start of a field.');
			inQuotes = true;
		} else if (character === ',') {
			record.push(field.trim());
			field = '';
		} else if (character === '\n' || (character === '\r' && contents[index + 1] !== '\n')) {
			record.push(field.trim());
			records.push(record);
			record = [];
			field = '';
		} else if (character !== '\r') {
			field += character;
		}
	}

	if (inQuotes) throw new Error('A quoted value is missing its closing quote.');
	record.push(field.trim());
	records.push(record);
	return records;
};

const normalizeHeader = (value: string) =>
	value
		.replace(/^\uFEFF/, '')
		.trim()
		.toLowerCase();

export const parseNotesCsv = (contents: string): CsvNoteRow[] => {
	const records = parseCsvCells(contents).filter(record => record.some(cell => cell.trim()));
	if (!records.length) throw new Error('The CSV file is empty.');

	const header = records[0].map(normalizeHeader);
	const expectedColumns = csvColumns.map(column => column.toLowerCase());
	const duplicateColumns = header.filter((column, index) => column && header.indexOf(column) !== index);
	if (duplicateColumns.length) throw new Error(`Duplicate CSV column: ${duplicateColumns[0]}.`);

	const missingColumns = expectedColumns.filter(column => !header.includes(column));
	const unexpectedColumns = header.filter(column => !expectedColumns.includes(column));
	if (missingColumns.length)
		throw new Error(
			`Missing required CSV column${missingColumns.length === 1 ? '' : 's'}: ${missingColumns.join(', ')}.`
		);
	if (unexpectedColumns.length)
		throw new Error(
			`Unexpected CSV column${unexpectedColumns.length === 1 ? '' : 's'}: ${unexpectedColumns.join(', ')}.`
		);
	if (header.length !== csvColumns.length)
		throw new Error(`The CSV must contain exactly ${csvColumns.length} columns.`);

	const columnIndexes = Object.fromEntries(expectedColumns.map(column => [column, header.indexOf(column)])) as Record<
		string,
		number
	>;
	const dataRecords = records.slice(1);
	if (!dataRecords.length) throw new Error('The CSV does not contain any note rows.');
	if (dataRecords.length > maxBulkNoteRows) {
		throw new Error(`A maximum of ${maxBulkNoteRows} notes can be uploaded at once.`);
	}

	return dataRecords.map((record, index) => {
		if (record.length !== header.length) {
			throw new Error(`CSV row ${index + 2} has ${record.length} columns; expected ${header.length}.`);
		}
		return {
			sourceRow: index + 2,
			title: record[columnIndexes.title],
			category: record[columnIndexes.category].toUpperCase(),
			resourceType: record[columnIndexes.resourcetype].toUpperCase(),
			resourceUrl: record[columnIndexes.resourceurl]
		};
	});
};

const validateGoogleDriveUrl = (value: string) => {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' && ['drive.google.com', 'docs.google.com'].includes(url.hostname.toLowerCase());
	} catch {
		return false;
	}
};

export const validateCsvNoteRows = (rows: CsvNoteRow[]): CsvNotesValidation => {
	const validatedRows = rows.map(row => {
		const errors: CsvNoteRowErrors = {};
		const title = row.title.trim();
		const category = row.category.trim().toUpperCase();
		const resourceType = row.resourceType.trim().toUpperCase();
		const resourceUrl = row.resourceUrl.trim();

		if (!title) errors.title = 'Note title is required.';
		else if (title.length > 240) errors.title = 'Use 240 characters or fewer.';
		if (!allowedCategories.has(category as AdminNoteCategory)) errors.category = 'Use NOTES, PYQ, or LAB.';
		if (!allowedResourceTypes.has(resourceType as AdminNoteResourceType)) {
			errors.resourceType = 'Use PDF, PPT, or FOLDER.';
		}
		if (!resourceUrl) errors.resourceUrl = 'Google Drive link is required.';
		else if (resourceUrl.length > 2000) errors.resourceUrl = 'Use 2,000 characters or fewer.';
		else if (!validateGoogleDriveUrl(resourceUrl)) {
			errors.resourceUrl = 'Use an HTTPS Google Drive or Google Docs link.';
		}

		const hasErrors = Object.keys(errors).length > 0;
		const note = hasErrors
			? undefined
			: {
					title,
					category: category as AdminNoteCategory,
					resourceType: resourceType as AdminNoteResourceType,
					resourceUrl
				};
		return { row, errors, note };
	});
	const validNotes = validatedRows.flatMap(row => (row.note ? [row.note] : []));

	return {
		rows: validatedRows,
		validNotes,
		validCount: validNotes.length,
		invalidCount: validatedRows.length - validNotes.length
	};
};

export const createNotesCsvTemplate = () =>
	`${csvColumns.join(',')}\nUnit 01 - Introduction,NOTES,PDF,https://drive.google.com/file/d/example/view`;
