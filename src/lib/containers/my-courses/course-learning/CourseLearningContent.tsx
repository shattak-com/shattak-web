import { Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { FiBookOpen, FiChevronLeft, FiChevronRight, FiLock, FiTrendingUp } from 'react-icons/fi';

import type { AuthenticatedUser } from '~/lib/api/auth';
import type {
	CourseEnrollment,
	CourseLearningDashboard,
	CourseLessonsResult,
	CourseLessonsState
} from '~/lib/api/enrollments';

import { workspaceActiveTextColor, workspaceBoundaryColor } from './constants';
import {
	CourseNextLearningAction,
	CourseNextStepsPanel,
	CourseOverviewContent,
	CourseUnlockedOverviewRail
} from './CourseOverview';
import { buildCourseWorkspacePath, getCourseWorkspaceRoute } from './routes';
import type { CourseTabId } from './types';

const CourseLessonsTab = dynamic(() => import('./CourseLessons').then(module => module.CourseLessonsTab), {
	loading: () => (
		<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" p={6}>
			<Text color="text.muted">Loading lesson workspace...</Text>
		</Box>
	)
});

const LessonProgressSidebar = dynamic(() => import('./CourseLessons').then(module => module.LessonProgressSidebar), {
	loading: () => <Text color="text.muted">Loading lesson progress...</Text>
});

const CourseCertificateTab = dynamic(
	() => import('./certificate/CourseCertificateTab').then(module => module.CourseCertificateTab),
	{
		loading: () => (
			<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" p={6}>
				<Text color="text.muted">Loading certificate section...</Text>
			</Box>
		)
	}
);

type CourseLockedSectionProps = {
	actionLabel?: string;
	actionTab?: CourseTabId;
	activeTab: CourseTabId;
	courseId: string;
	currentUser: AuthenticatedUser | null;
	dashboard: CourseLearningDashboard | null;
	dashboardErrorMessage: string;
	description?: string;
	enrollment: CourseEnrollment;
	isDashboardLoading: boolean;
	label: string;
	onDashboardRetry: () => void;
	onLessonSelect: (subsectionId: string) => void;
	onTabChange: (tabId: CourseTabId) => void;
};

const CourseLockedSection = ({
	actionLabel,
	actionTab,
	activeTab,
	courseId,
	currentUser,
	dashboard,
	dashboardErrorMessage,
	description = 'Complete the course lessons to unlock this section.',
	enrollment,
	isDashboardLoading,
	label,
	onDashboardRetry,
	onLessonSelect,
	onTabChange
}: CourseLockedSectionProps) => (
	<Box
		border="1px solid"
		borderColor={workspaceBoundaryColor}
		borderRadius="card"
		bg="bg.card"
		minH={{ base: '420px', md: 'calc(100vh - 168px)' }}
		p={{ base: 5, md: 8 }}
		display="grid"
		placeItems="center"
	>
		<Stack gap={{ base: 5, md: 7 }} align="center" maxW="900px" w="full">
			<Box
				borderRadius="card"
				bg="bg.subtle"
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				p={{ base: 5, md: 7 }}
				w="full"
			>
				<HStack gap={{ base: 4, md: 6 }} align="center">
					<Box
						boxSize={{ base: '70px', md: '96px' }}
						border="4px solid"
						borderColor="primary"
						borderRadius="2xl"
						color="primary"
						display="grid"
						flexShrink={0}
						fontSize={{ base: '3xl', md: '5xl' }}
						placeItems="center"
					>
						<FiLock />
					</Box>
					<Box>
						<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
							{label}
						</Text>
						<Heading mt={2} size={{ base: 'lg', md: 'xl' }}>
							This section is locked
						</Heading>
						<Text mt={2} color="text.muted" fontSize={{ base: 'md', md: 'lg' }}>
							{description}
						</Text>
						{actionLabel && actionTab ? (
							<Button
								mt={5}
								borderRadius="full"
								bg="primary"
								color={workspaceActiveTextColor}
								_hover={{ bg: 'primaryHover' }}
								onClick={() => onTabChange(actionTab)}
							>
								{actionLabel}
								<FiChevronRight />
							</Button>
						) : null}
					</Box>
				</HStack>
			</Box>

			{!actionTab && dashboard && dashboard.completion.completedSubsections < dashboard.completion.totalSubsections ? (
				<Box w="full">
					<CourseNextLearningAction
						courseId={courseId}
						currentUser={currentUser}
						dashboard={dashboard}
						enrollment={enrollment}
						onLessonSelect={onLessonSelect}
						onTabChange={onTabChange}
						sourcePage={buildCourseWorkspacePath(courseId, getCourseWorkspaceRoute(activeTab))}
					/>
				</Box>
			) : null}

			{!actionTab && dashboard && dashboard.completion.completedSubsections >= dashboard.completion.totalSubsections ? (
				<Button borderRadius="full" variant="outline" onClick={() => onTabChange('overview')}>
					Back to course overview
				</Button>
			) : null}

			{!actionTab && !dashboard && isDashboardLoading ? (
				<Text color="text.muted">Loading your next learning action...</Text>
			) : null}

			{!actionTab && !dashboard && dashboardErrorMessage ? (
				<Stack align="center" gap={3}>
					<Text color="text.muted" textAlign="center">
						{dashboardErrorMessage}
					</Text>
					<Button borderRadius="full" variant="outline" onClick={onDashboardRetry}>
						Retry dashboard
					</Button>
				</Stack>
			) : null}
		</Stack>
	</Box>
);

type CourseLearningMainContentProps = {
	activeTab: CourseTabId;
	activeTabLabel: string;
	canBypassProgression: boolean;
	courseId: string;
	currentUser: AuthenticatedUser | null;
	dashboard: CourseLearningDashboard | null;
	dashboardErrorMessage: string;
	enrollment: CourseEnrollment;
	isDashboardLoading: boolean;
	isLessonsLoading: boolean;
	learnerName: string;
	lessonErrorMessage: string;
	lessonsResult: CourseLessonsResult | null;
	onCourseUnlocked: (enrollment: CourseEnrollment) => void;
	onDashboardRetry: () => void;
	onLessonBottomReached: () => void;
	onLessonRetry: () => void;
	onLessonSelect: (subsectionId: string) => void;
	onTabChange: (tabId: CourseTabId) => void;
};

export const CourseLearningMainContent = ({
	activeTab,
	activeTabLabel,
	canBypassProgression,
	courseId,
	currentUser,
	dashboard,
	dashboardErrorMessage,
	enrollment,
	isDashboardLoading,
	isLessonsLoading,
	learnerName,
	lessonErrorMessage,
	lessonsResult,
	onCourseUnlocked,
	onDashboardRetry,
	onLessonBottomReached,
	onLessonRetry,
	onLessonSelect,
	onTabChange
}: CourseLearningMainContentProps) => {
	const courseCompleted = Boolean(enrollment.completedAt) || (dashboard?.completion.percentage ?? 0) === 100;

	if (activeTab === 'overview') {
		return (
			<CourseOverviewContent
				courseId={courseId}
				currentUser={currentUser}
				dashboard={dashboard}
				dashboardErrorMessage={dashboardErrorMessage}
				enrollment={enrollment}
				isDashboardLoading={isDashboardLoading}
				learnerName={learnerName}
				onDashboardRetry={onDashboardRetry}
				onLessonSelect={onLessonSelect}
				onTabChange={onTabChange}
				onUnlocked={onCourseUnlocked}
			/>
		);
	}

	if (activeTab === 'lessons') {
		return (
			<CourseLessonsTab
				canBypassProgression={canBypassProgression}
				isLoading={isLessonsLoading}
				lessonsResult={lessonsResult}
				lessonErrorMessage={lessonErrorMessage}
				onRetry={onLessonRetry}
				onScrollBottomReached={onLessonBottomReached}
			/>
		);
	}

	if (activeTab === 'certificate') {
		if (!courseCompleted && !canBypassProgression) {
			return (
				<CourseLockedSection
					actionLabel="Submit Assignment"
					actionTab="assignment"
					activeTab={activeTab}
					courseId={courseId}
					currentUser={currentUser}
					dashboard={dashboard}
					dashboardErrorMessage={dashboardErrorMessage}
					description="To unlock your certificate, please submit your course assignment."
					enrollment={enrollment}
					isDashboardLoading={isDashboardLoading}
					label={activeTabLabel}
					onDashboardRetry={onDashboardRetry}
					onLessonSelect={onLessonSelect}
					onTabChange={onTabChange}
				/>
			);
		}

		return (
			<CourseCertificateTab
				courseCompleted={courseCompleted}
				courseId={courseId}
				currentPath={`/my-courses/${encodeURIComponent(courseId)}/certificate`}
				enrollment={enrollment}
				isAdmin={canBypassProgression}
				userId={currentUser?.id}
			/>
		);
	}

	return (
		<CourseLockedSection
			activeTab={activeTab}
			courseId={courseId}
			currentUser={currentUser}
			dashboard={dashboard}
			dashboardErrorMessage={dashboardErrorMessage}
			enrollment={enrollment}
			isDashboardLoading={isDashboardLoading}
			label={activeTabLabel}
			onDashboardRetry={onDashboardRetry}
			onLessonSelect={onLessonSelect}
			onTabChange={onTabChange}
		/>
	);
};

type CourseLearningRailProps = {
	courseId: string;
	currentUser: AuthenticatedUser | null;
	dashboard: CourseLearningDashboard | null;
	enrollment: CourseEnrollment;
	isVisible: boolean;
	isCollapsed: boolean;
	lessons: CourseLessonsState | null;
	onLessonSelect: (subsectionId: string) => void;
	onToggleCollapse: () => void;
	showLessonRail: boolean;
	showUnlockedOverviewRail: boolean;
};

export const CourseLearningRail = ({
	courseId,
	currentUser,
	dashboard,
	enrollment,
	isVisible,
	isCollapsed,
	lessons,
	onLessonSelect,
	onToggleCollapse,
	showLessonRail,
	showUnlockedOverviewRail
}: CourseLearningRailProps) => {
	if (!isVisible) {
		return null;
	}

	let content = <CourseNextStepsPanel />;

	if (showUnlockedOverviewRail && dashboard) {
		content = (
			<CourseUnlockedOverviewRail
				courseId={courseId}
				currentUser={currentUser}
				dashboard={dashboard}
				enrollment={enrollment}
			/>
		);
	} else if (showLessonRail) {
		content = <LessonProgressSidebar lessons={lessons} onLessonSelect={onLessonSelect} />;
	}

	if (isCollapsed) {
		const compactPercentage = showLessonRail
			? (lessons?.lessonProgressPercentage ?? enrollment.progressPercent)
			: (dashboard?.completion.percentage ?? enrollment.progressPercent);

		return (
			<Stack
				display={{ base: 'none', xl: 'flex' }}
				align="center"
				gap={3}
				justifySelf="end"
				position={{ xl: 'sticky' }}
				top={{ xl: '96px' }}
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="xl"
				bg="bg.card"
				px={2}
				py={3}
				w="64px"
			>
				<Button
					variant="ghost"
					borderRadius="lg"
					boxSize="40px"
					minW="40px"
					p={0}
					onClick={onToggleCollapse}
					aria-label="Expand course side panel"
					title="Expand course side panel"
				>
					<FiChevronLeft />
				</Button>
				<Box color="primary" fontSize="xl" aria-hidden="true">
					{showLessonRail ? <FiBookOpen /> : <FiTrendingUp />}
				</Box>
				<Text
					color="text.primary"
					fontSize="xs"
					fontWeight="bold"
					title={`${compactPercentage}% course progress`}
					writingMode="vertical-rl"
					transform="rotate(180deg)"
				>
					{compactPercentage}% progress
				</Text>
			</Stack>
		);
	}

	return (
		<Stack display={{ base: 'none', xl: 'flex' }} gap={2} position={{ xl: 'sticky' }} top={{ xl: '96px' }}>
			<HStack justify="space-between" px={2}>
				<Text color="text.muted" fontSize="xs" fontWeight="bold" textTransform="uppercase">
					Course panel
				</Text>
				<Button
					variant="ghost"
					size="sm"
					borderRadius="full"
					boxSize="34px"
					minW="34px"
					p={0}
					onClick={onToggleCollapse}
					aria-label="Collapse course side panel"
					title="Collapse course side panel"
				>
					<FiChevronRight />
				</Button>
			</HStack>
			{content}
		</Stack>
	);
};
