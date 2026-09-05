'use client';

import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiBookOpen, FiFileText, FiFolder } from 'react-icons/fi';

import {
	listAdminNoteDepartments,
	listAdminNotes,
	listAdminNoteSubjects,
	type AdminNote,
	type AdminNoteDepartment,
	type AdminNoteListParams,
	type AdminNotePagination,
	type AdminNoteSubject
} from '~/lib/api/admin-notes';

import DepartmentManager from './DepartmentManager';
import NoteManager from './NoteManager';
import { NotesStatus } from './NotesAdminControls';
import SubjectManager from './SubjectManager';

type NotesAdminView = 'departments' | 'subjects' | 'notes';

const defaultPagination: AdminNotePagination = {
	page: 1,
	pageSize: 50,
	total: 0,
	totalPages: 1,
	hasNextPage: false,
	hasPreviousPage: false
};

const viewOptions: Array<{ id: NotesAdminView; label: string; icon: typeof FiFolder }> = [
	{ id: 'departments', label: 'Departments', icon: FiFolder },
	{ id: 'subjects', label: 'Subjects', icon: FiBookOpen },
	{ id: 'notes', label: 'Notes', icon: FiFileText }
];

const readView = (value: string | null): NotesAdminView =>
	value === 'subjects' || value === 'notes' ? value : 'departments';

const readPositiveNumber = (value: string | null, fallback: number) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const AdminNotesPage = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchKey = searchParams.toString();
	const view = readView(searchParams.get('view'));
	const departmentId = searchParams.get('departmentId') ?? '';
	const [departments, setDepartments] = useState<AdminNoteDepartment[]>([]);
	const [subjects, setSubjects] = useState<AdminNoteSubject[]>([]);
	const [notes, setNotes] = useState<AdminNote[]>([]);
	const [pagination, setPagination] = useState(defaultPagination);
	const [isLoadingReferences, setIsLoadingReferences] = useState(true);
	const [isLoadingNotes, setIsLoadingNotes] = useState(false);
	const [loadError, setLoadError] = useState('');

	const noteFilters = useMemo<AdminNoteListParams>(
		() => ({
			q: searchParams.get('q') ?? '',
			departmentId,
			subjectId: searchParams.get('subjectId') ?? '',
			category: (searchParams.get('category') as AdminNoteListParams['category']) ?? '',
			resourceType: (searchParams.get('resourceType') as AdminNoteListParams['resourceType']) ?? '',
			page: readPositiveNumber(searchParams.get('page'), 1),
			pageSize: readPositiveNumber(searchParams.get('pageSize'), 50)
		}),
		// searchKey captures every relevant URL-backed filter.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[searchKey]
	);

	const replaceSearch = useCallback(
		(params: URLSearchParams) => {
			const query = params.toString();
			router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
		},
		[pathname, router]
	);

	const loadReferences = useCallback(async () => {
		setIsLoadingReferences(true);
		setLoadError('');
		try {
			const [departmentResult, subjectResult] = await Promise.all([
				listAdminNoteDepartments(),
				listAdminNoteSubjects()
			]);
			setDepartments(departmentResult.departments);
			setSubjects(subjectResult.subjects);
		} catch {
			setLoadError('Unable to load Notes departments and subjects.');
		} finally {
			setIsLoadingReferences(false);
		}
	}, []);

	const loadNotes = useCallback(async () => {
		setIsLoadingNotes(true);
		setLoadError('');
		try {
			const result = await listAdminNotes(noteFilters);
			setNotes(result.notes);
			setPagination(result.pagination);
		} catch {
			setLoadError('Unable to load the filtered Notes list.');
		} finally {
			setIsLoadingNotes(false);
		}
	}, [noteFilters]);

	useEffect(() => {
		loadReferences().catch(() => undefined);
	}, [loadReferences]);

	useEffect(() => {
		if (view === 'notes') loadNotes().catch(() => undefined);
	}, [loadNotes, view]);

	const refreshAll = async () => {
		await Promise.all([loadReferences(), view === 'notes' ? loadNotes() : Promise.resolve()]);
	};

	const selectView = (nextView: NotesAdminView) => {
		const params = new URLSearchParams();
		if (nextView !== 'departments') params.set('view', nextView);
		replaceSearch(params);
	};

	const openDepartment = (department: AdminNoteDepartment) => {
		const params = new URLSearchParams({ view: 'subjects', departmentId: department.id });
		replaceSearch(params);
	};

	const openSubject = (subject: AdminNoteSubject, selectedDepartmentId: string) => {
		const params = new URLSearchParams({ view: 'notes', subjectId: subject.id });
		if (selectedDepartmentId) params.set('departmentId', selectedDepartmentId);
		replaceSearch(params);
	};

	const changeSubjectDepartmentFilter = (value: string) => {
		const params = new URLSearchParams({ view: 'subjects' });
		if (value) params.set('departmentId', value);
		replaceSearch(params);
	};

	const changeNoteFilters = (filters: AdminNoteListParams) => {
		const params = new URLSearchParams({ view: 'notes' });
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== '') params.set(key, String(value));
		});
		replaceSearch(params);
	};

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.card" p={{ base: 4, md: 5 }}>
				<Stack gap={4}>
					<Box>
						<Text fontSize="lg" fontWeight="bold">
							Notes content lifecycle
						</Text>
						<Text mt={1} color="text.muted" fontSize="sm">
							Manage the Department → Subject → Notes structure and Google Drive resources.
						</Text>
					</Box>
					<HStack gap={2} flexWrap="wrap" role="navigation" aria-label="Notes admin sections">
						{viewOptions.map(({ id, label, icon: Icon }) => (
							<Button
								key={id}
								borderRadius="full"
								variant={view === id ? 'solid' : 'outline'}
								bg={view === id ? 'primary' : undefined}
								color={view === id ? 'text.inverse' : undefined}
								onClick={() => selectView(id)}
							>
								<Icon /> {label}
							</Button>
						))}
					</HStack>
				</Stack>
			</Box>

			<NotesStatus message={loadError} tone="error" />

			{view === 'departments' ? (
				<DepartmentManager
					departments={departments}
					isLoading={isLoadingReferences}
					onChanged={refreshAll}
					onOpen={openDepartment}
				/>
			) : null}
			{view === 'subjects' ? (
				<SubjectManager
					key={departmentId || 'all'}
					departments={departments}
					subjects={subjects}
					isLoading={isLoadingReferences}
					initialDepartmentId={departmentId}
					onChanged={refreshAll}
					onDepartmentFilterChange={changeSubjectDepartmentFilter}
					onOpen={openSubject}
				/>
			) : null}
			{view === 'notes' ? (
				<NoteManager
					departments={departments}
					subjects={subjects}
					notes={notes}
					pagination={pagination}
					isLoading={isLoadingNotes}
					filters={noteFilters}
					onChanged={refreshAll}
					onFiltersChange={changeNoteFilters}
				/>
			) : null}
		</Stack>
	);
};

export default AdminNotesPage;
