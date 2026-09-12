import { Box, Button, HStack, Image, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiLock, FiX } from 'react-icons/fi';

import type { AuthenticatedUser } from '~/lib/api/auth';
import type { CourseEnrollment } from '~/lib/api/enrollments';
import UserAvatar from '~/lib/components/auth/UserAvatar';

import {
	courseTabs,
	shattakMarkUrl,
	workspaceActiveTextColor,
	workspaceBoundaryColor,
	workspaceSelectedBoundaryColor
} from './constants';
import type { CourseTabId } from './types';
import { isAdminLearner } from './utils';

type CourseWorkspaceSidebarProps = {
	activeTab: CourseTabId;
	currentUser: AuthenticatedUser | null;
	enrollment: CourseEnrollment;
	isCollapsed?: boolean;
	onClose?: () => void;
	onTabChange: (tabId: CourseTabId) => void;
	onToggleCollapse?: () => void;
};

type CourseWorkspaceSidebarHeaderProps = Pick<
	CourseWorkspaceSidebarProps,
	'isCollapsed' | 'onClose' | 'onToggleCollapse'
>;

const CourseWorkspaceSidebarHeader = ({
	isCollapsed = false,
	onClose,
	onToggleCollapse
}: CourseWorkspaceSidebarHeaderProps) => {
	let sidebarControl: ReactNode = null;

	if (onClose) {
		sidebarControl = (
			<Button
				autoFocus
				variant="ghost"
				size="sm"
				borderRadius="full"
				boxSize="44px"
				minW="44px"
				onClick={onClose}
				aria-label="Close course navigation"
			>
				<FiX />
			</Button>
		);
	} else if (onToggleCollapse) {
		sidebarControl = (
			<Button
				variant="ghost"
				size="sm"
				borderRadius="full"
				boxSize="30px"
				minW="30px"
				p={0}
				onClick={onToggleCollapse}
				aria-label={isCollapsed ? 'Expand course navigation' : 'Collapse course navigation'}
				title={isCollapsed ? 'Expand course navigation' : 'Collapse course navigation'}
			>
				{isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
			</Button>
		);
	}

	return (
		<HStack
			h="72px"
			px={isCollapsed ? 1.5 : 6}
			justify={isCollapsed ? 'center' : 'space-between'}
			borderBottom="1px solid"
			borderColor={workspaceBoundaryColor}
			position="relative"
		>
			{isCollapsed ? (
				<Image src={shattakMarkUrl} alt="Shattak" boxSize="40px" borderRadius="lg" objectFit="cover" />
			) : (
				<Text fontSize="3xl" fontWeight="bold" color="text.primary">
					Shattak
				</Text>
			)}
			<Box position={isCollapsed ? 'absolute' : 'static'} right={isCollapsed ? 1 : undefined}>
				{sidebarControl}
			</Box>
		</HStack>
	);
};

type CourseWorkspaceNavigationProps = Pick<
	CourseWorkspaceSidebarProps,
	'activeTab' | 'isCollapsed' | 'onClose' | 'onTabChange'
> & {
	canOpenLearningTabs: boolean;
};

const CourseWorkspaceNavigation = ({
	activeTab,
	canOpenLearningTabs,
	isCollapsed = false,
	onClose,
	onTabChange
}: CourseWorkspaceNavigationProps) => (
	<Stack flex="1" gap={3} px={isCollapsed ? 2 : 4} py={5} overflowY="auto" overscrollBehavior="contain">
		{onClose ? (
			<Button asChild justifyContent="flex-start" borderRadius="lg" variant="ghost" minH="48px" px={4}>
				<Link href="/my-courses/" onClick={onClose}>
					<FiArrowLeft />
					<Text as="span" fontWeight="semibold">
						Back to Course
					</Text>
				</Link>
			</Button>
		) : null}
		{courseTabs.map(tab => {
			const Icon = tab.icon;
			const isActive = activeTab === tab.id;
			const isLocked = tab.id !== 'overview' && !canOpenLearningTabs;
			const showLock = tab.id !== 'overview' && (isLocked || tab.id !== 'lessons');

			return (
				<Button
					key={tab.id}
					justifyContent={isCollapsed ? 'center' : 'space-between'}
					borderRadius="lg"
					variant={isActive ? 'solid' : 'ghost'}
					bg={isActive ? 'primary' : undefined}
					color={isActive ? workspaceActiveTextColor : 'text.primary'}
					disabled={isLocked}
					minH="48px"
					px={isCollapsed ? 0 : 4}
					position="relative"
					title={isCollapsed ? tab.label : undefined}
					aria-current={isActive ? 'page' : undefined}
					onClick={() => {
						onTabChange(tab.id);
						onClose?.();
					}}
				>
					<HStack gap={3}>
						<Icon />
						{!isCollapsed ? (
							<Text as="span" fontWeight="semibold">
								{tab.label}
							</Text>
						) : null}
					</HStack>
					{showLock && !isCollapsed ? (
						<Box>
							<FiLock size={16} />
						</Box>
					) : null}
				</Button>
			);
		})}
	</Stack>
);

const CourseWorkspaceUser = ({
	currentUser,
	displayName,
	isCollapsed
}: {
	currentUser: AuthenticatedUser | null;
	displayName: string;
	isCollapsed: boolean;
}) => (
	<Box borderTop="1px solid" borderColor={workspaceBoundaryColor} p={isCollapsed ? 2 : 4}>
		<Box
			asChild
			display="block"
			borderRadius="xl"
			_hover={{ bg: 'bg.muted' }}
			_focusVisible={{ outline: '2px solid', outlineColor: workspaceSelectedBoundaryColor, outlineOffset: '2px' }}
			transition="background-color 150ms ease"
			_motionReduce={{ transition: 'none' }}
		>
			<Link href="/profile" aria-label={`Open ${displayName}'s profile`}>
				<HStack
					justify={isCollapsed ? 'center' : 'flex-start'}
					border="1px solid"
					borderColor={workspaceBoundaryColor}
					borderRadius="xl"
					bg="bg.subtle"
					p={isCollapsed ? 2 : 3}
					gap={3}
				>
					{currentUser ? (
						<UserAvatar user={currentUser} label={displayName} size="42px" />
					) : (
						<Box
							boxSize="42px"
							borderRadius="full"
							bg="primary"
							color={workspaceActiveTextColor}
							display="grid"
							flexShrink={0}
							fontWeight="bold"
							placeItems="center"
						>
							U
						</Box>
					)}
					<Box display={isCollapsed ? 'none' : 'block'} minW={0}>
						<Text fontWeight="semibold" lineClamp={1}>
							{displayName}
						</Text>
						<Text color="text.muted" fontSize="xs">
							Learner
						</Text>
					</Box>
				</HStack>
			</Link>
		</Box>
	</Box>
);

export const CourseWorkspaceSidebar = ({
	activeTab,
	currentUser,
	enrollment,
	isCollapsed = false,
	onClose,
	onTabChange,
	onToggleCollapse
}: CourseWorkspaceSidebarProps) => {
	const displayName = currentUser?.name || currentUser?.email || 'User';
	const canOpenLearningTabs = Boolean(enrollment.accessUnlockedAt) || isAdminLearner(currentUser);

	return (
		<Stack h="full" gap={0} bg="bg.card">
			<CourseWorkspaceSidebarHeader isCollapsed={isCollapsed} onClose={onClose} onToggleCollapse={onToggleCollapse} />
			<CourseWorkspaceNavigation
				activeTab={activeTab}
				canOpenLearningTabs={canOpenLearningTabs}
				isCollapsed={isCollapsed}
				onClose={onClose}
				onTabChange={onTabChange}
			/>
			<CourseWorkspaceUser currentUser={currentUser} displayName={displayName} isCollapsed={isCollapsed} />
		</Stack>
	);
};
