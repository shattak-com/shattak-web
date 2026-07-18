import { Box } from '@chakra-ui/react';

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
	if (!isOpen) {
		return null;
	}

	return (
		<Box display={{ base: 'block', lg: 'none' }} position="fixed" inset={0} zIndex={1500}>
			<Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
			<Box position="relative" h="100vh" w="min(320px, 88vw)" boxShadow="2xl">
				<CourseWorkspaceSidebar
					activeTab={activeTab}
					currentUser={currentUser}
					enrollment={enrollment}
					onClose={onClose}
					onTabChange={onTabChange}
				/>
			</Box>
		</Box>
	);
};
