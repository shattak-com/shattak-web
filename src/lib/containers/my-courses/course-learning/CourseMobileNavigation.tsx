'use client';

import { Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import type { AuthenticatedUser } from '~/lib/api/auth';
import type { CourseEnrollment } from '~/lib/api/enrollments';

import { CourseWorkspaceSidebar } from './CourseWorkspaceSidebar';
import type { CourseTabId } from './types';

type CourseMobileNavigationProps = {
	activeTab: CourseTabId;
	currentUser: AuthenticatedUser | null;
	enrollment: CourseEnrollment;
	isOpen: boolean;
	onClose: () => void;
	onTabChange: (tabId: CourseTabId) => void;
};

export const CourseMobileNavigation = ({
	activeTab,
	currentUser,
	enrollment,
	isOpen,
	onClose,
	onTabChange
}: CourseMobileNavigationProps) => {
	const dialogRef = useRef<HTMLDialogElement | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}

		if (isOpen && !dialog.open) {
			dialog.showModal();
		} else if (!isOpen && dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	return (
		<Box
			asChild
			position="fixed"
			inset={0}
			m={0}
			maxH="none"
			maxW="none"
			h="100dvh"
			w="full"
			border={0}
			bg="transparent"
			color="text.primary"
			p={0}
			css={{ '&::backdrop': { background: 'rgba(17, 24, 39, 0.6)' } }}
		>
			<dialog
				ref={dialogRef}
				aria-label="Course navigation"
				onCancel={event => {
					event.preventDefault();
					onClose();
				}}
			>
				<Box asChild position="absolute" inset={0} border={0} bg="transparent" p={0}>
					<button type="button" tabIndex={-1} aria-label="Close course navigation" onClick={onClose} />
				</Box>
				<Box position="relative" zIndex={1} h="100dvh" w="min(320px, 88vw)" bg="bg.card" boxShadow="2xl">
					<CourseWorkspaceSidebar
						activeTab={activeTab}
						currentUser={currentUser}
						enrollment={enrollment}
						onClose={onClose}
						onTabChange={onTabChange}
					/>
				</Box>
			</dialog>
		</Box>
	);
};
