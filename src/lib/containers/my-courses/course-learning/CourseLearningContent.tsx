import { Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { FiBookOpen, FiCheckCircle, FiChevronLeft, FiChevronRight, FiLock, FiTrendingUp } from 'react-icons/fi';

import type { AuthenticatedUser } from '~/lib/api/auth';
import type {
	CourseEnrollment,
	CourseLearningDashboard,
	CourseLessonsResult,
	CourseLessonsState
} from '~/lib/api/enrollments';

import { courseNextSteps, workspaceBoundaryColor } from './constants';
import { CourseLessonsTab, LessonProgressSidebar } from './CourseLessons';
import { CourseNextStepsPanel, CourseOverviewContent, CourseUnlockedOverviewRail } from './CourseOverview';
import type { CourseTabId } from './types';

const CoursePlaceholderTab = ({ label }: { label: string }) => (
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
		<Stack gap={{ base: 6, md: 8 }} align="center" maxW="760px" w="full">
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
							This Section Is Locked
						</Heading>
						<Text mt={2} color="text.muted" fontSize={{ base: 'md', md: 'lg' }}>
							To unlock, please follow the steps below.
						</Text>
					</Box>
				</HStack>
			</Box>

			<Stack gap={5} w="full" maxW="560px">
				<Heading size="lg" textAlign="center">
					Your next steps
				</Heading>
				<Stack gap={3}>
					{courseNextSteps.map((step, index) => (
						<HStack key={step} align="start" gap={3}>
							<Box color="primary" pt={0.5}>
								<FiCheckCircle />
							</Box>
							<Text color="text.muted" fontSize="sm" lineHeight="tall">
								{index + 1}. {step}
							</Text>
						</HStack>
					))}
				</Stack>
			</Stack>
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
	hasReachedLessonBottom: boolean;
	isCompletingLesson: boolean;
	isDashboardLoading: boolean;
	isLessonsLoading: boolean;
	learnerName: string;
	lessonErrorMessage: string;
	lessonsResult: CourseLessonsResult | null;
	onCourseUnlocked: (enrollment: CourseEnrollment) => void;
	onDashboardRetry: () => void;
	onLessonBottomReached: () => void;
	onLessonComplete: () => void;
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
	hasReachedLessonBottom,
	isCompletingLesson,
	isDashboardLoading,
	isLessonsLoading,
	learnerName,
	lessonErrorMessage,
	lessonsResult,
	onCourseUnlocked,
	onDashboardRetry,
	onLessonBottomReached,
	onLessonComplete,
	onLessonRetry,
	onLessonSelect,
	onTabChange
}: CourseLearningMainContentProps) => {
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
				onTabChange={onTabChange}
				onUnlocked={onCourseUnlocked}
			/>
		);
	}

	if (activeTab === 'lessons') {
		return (
			<CourseLessonsTab
				canBypassProgression={canBypassProgression}
				hasReachedBottom={hasReachedLessonBottom}
				isCompletingLesson={isCompletingLesson}
				isLoading={isLessonsLoading}
				lessonsResult={lessonsResult}
				lessonErrorMessage={lessonErrorMessage}
				onCompleteLesson={onLessonComplete}
				onPreviousLesson={onLessonSelect}
				onRetry={onLessonRetry}
				onScrollBottomReached={onLessonBottomReached}
			/>
		);
	}

	return <CoursePlaceholderTab label={activeTabLabel} />;
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
		<Stack gap={2} position={{ xl: 'sticky' }} top={{ xl: '96px' }}>
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
