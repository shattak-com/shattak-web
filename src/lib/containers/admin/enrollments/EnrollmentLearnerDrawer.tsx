import { Box, Button, HStack, Portal, Text } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import type { AdminCourseEnrollment, AdminEnrollmentCourseSummary } from '~/lib/api/admin-enrollments';
import EnrollmentLearnerPanel from '~/lib/containers/admin/enrollments/EnrollmentLearnerPanel';

type EnrollmentLearnerDrawerProps = {
	enrollments: AdminCourseEnrollment[];
	errorMessage: string;
	isLoading: boolean;
	isOpen: boolean;
	onClose: () => void;
	selectedCourse: AdminEnrollmentCourseSummary | null;
};

const EnrollmentLearnerDrawer = ({
	enrollments,
	errorMessage,
	isLoading,
	isOpen,
	onClose,
	selectedCourse
}: EnrollmentLearnerDrawerProps) => {
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const previousBodyOverflow = document.body.style.overflow;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
				return;
			}

			if (event.key !== 'Tab' || !dialogRef.current) {
				return;
			}

			const focusableElements = Array.from(
				dialogRef.current.querySelectorAll<HTMLElement>(
					'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			);

			if (!focusableElements.length) {
				event.preventDefault();
				return;
			}

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		};

		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', handleKeyDown);
		closeButtonRef.current?.focus();

		return () => {
			document.body.style.overflow = previousBodyOverflow;
			document.removeEventListener('keydown', handleKeyDown);
			previouslyFocusedElement?.focus();
		};
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	return (
		<Portal>
			<Box
				ref={dialogRef}
				position="fixed"
				inset={0}
				zIndex={1800}
				bg="bg.canvas"
				role="dialog"
				aria-modal="true"
				aria-labelledby="enrollment-learner-drawer-title"
				display="grid"
				gridTemplateRows="auto minmax(0, 1fr)"
			>
				<HStack
					justify="space-between"
					align="center"
					gap={3}
					px={{ base: 4, md: 5 }}
					py={3}
					borderBottom="1px solid"
					borderColor="border.default"
					bg="bg.card"
				>
					<Text id="enrollment-learner-drawer-title" fontSize="md" fontWeight="bold" lineClamp={1}>
						{selectedCourse?.title ?? 'Enrolled learners'}
					</Text>
					<Button ref={closeButtonRef} type="button" variant="outline" borderRadius="full" onClick={onClose}>
						Close
					</Button>
				</HStack>
				<Box p={{ base: 3, md: 5 }} overflowY="auto">
					<EnrollmentLearnerPanel
						enrollments={enrollments}
						errorMessage={errorMessage}
						isLoading={isLoading}
						selectedCourse={selectedCourse}
					/>
				</Box>
			</Box>
		</Portal>
	);
};

export default EnrollmentLearnerDrawer;
