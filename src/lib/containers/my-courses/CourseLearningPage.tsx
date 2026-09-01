'use client';

import { Box, Button, Container, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { ProfilePageSkeleton } from '~/lib/components/feedback/LoadingStates';

import { workspaceActiveTextColor, workspaceBoundaryColor } from './course-learning/constants';
import { CourseLearningMainContent, CourseLearningRail } from './course-learning/CourseLearningContent';
import { CourseMobileNavigation } from './course-learning/CourseMobileNavigation';
import { CourseWorkspaceHeader } from './course-learning/CourseWorkspaceHeader';
import { CourseWorkspaceSidebar } from './course-learning/CourseWorkspaceSidebar';
import type { CourseLearningPageProps } from './course-learning/types';
import { useCourseLearningPage } from './course-learning/useCourseLearningPage';

const CourseLearningPage = ({ courseId }: CourseLearningPageProps) => {
	const {
		activeLessonContext,
		activeTab,
		activeTabLabel,
		canBypassProgression,
		currentUser,
		dashboard,
		dashboardErrorMessage,
		enrollment,
		errorMessage,
		exitFocusModeButtonRef,
		focusModeButtonRef,
		handleAskDoubt,
		handleCompleteLesson,
		handleCourseUnlocked,
		handleEnterFocusMode,
		handleExitFocusMode,
		handleLessonBottomReached,
		handleLessonSelect,
		handleTabChange,
		handleToggleBrowserFullscreen,
		hasReachedLessonBottom,
		isBrowserFullscreen,
		isBrowserFullscreenSupported,
		isCompletingLesson,
		isDashboardLoading,
		isFocusMode,
		isLearningRailCollapsed,
		isLessonsLoading,
		isLoading,
		isMobileNavOpen,
		isWorkspaceSidebarCollapsed,
		learnerName,
		lessonErrorMessage,
		lessonsResult,
		loadDashboard,
		loadLessons,
		setIsLearningRailCollapsed,
		setIsMobileNavOpen,
		setIsWorkspaceSidebarCollapsed,
		shouldShowLessonRail,
		shouldShowOverviewRail,
		shouldShowUnlockedOverviewRail,
		workspaceGridColumns,
		workspaceRootRef
	} = useCourseLearningPage(courseId);

	if (isLoading) {
		return <ProfilePageSkeleton />;
	}

	if (!enrollment) {
		return (
			<Container maxW="3xl" py={{ base: 12, md: 16 }}>
				<Box
					border="1px solid"
					borderColor={workspaceBoundaryColor}
					borderRadius="card"
					bg="bg.card"
					p={{ base: 5, md: 6 }}
				>
					<Stack gap={4}>
						<Heading size="lg">Course access unavailable</Heading>
						<Text color="text.muted">{errorMessage}</Text>
						<HStack gap={3} flexWrap="wrap">
							<Button
								asChild
								borderRadius="full"
								bg="primary"
								color={workspaceActiveTextColor}
								_hover={{ bg: 'primaryHover' }}
							>
								<Link href={`/course/${courseId}`}>View course details</Link>
							</Button>
							<Button asChild borderRadius="full" variant="outline">
								<Link href="/profile">Back to profile</Link>
							</Button>
						</HStack>
					</Stack>
				</Box>
			</Container>
		);
	}

	return (
		<Box
			ref={workspaceRootRef}
			bg="bg.subtle"
			minH="100vh"
			w="full"
			css={{
				'&:fullscreen': {
					overflowY: 'auto'
				}
			}}
		>
			<Box
				as="aside"
				display={isFocusMode ? 'none' : { base: 'none', lg: 'block' }}
				position="fixed"
				insetY={0}
				left={0}
				w={{
					lg: isWorkspaceSidebarCollapsed ? '88px' : '280px',
					'2xl': isWorkspaceSidebarCollapsed ? '88px' : '300px'
				}}
				borderRight="1px solid"
				borderColor={workspaceBoundaryColor}
				zIndex={20}
				transition="width 180ms ease"
				_motionReduce={{ transition: 'none' }}
			>
				<CourseWorkspaceSidebar
					activeTab={activeTab}
					currentUser={currentUser}
					enrollment={enrollment}
					isCollapsed={isWorkspaceSidebarCollapsed}
					onTabChange={handleTabChange}
					onToggleCollapse={() => setIsWorkspaceSidebarCollapsed(value => !value)}
				/>
			</Box>

			<CourseMobileNavigation
				activeTab={activeTab}
				currentUser={currentUser}
				enrollment={enrollment}
				isOpen={isMobileNavOpen && !isFocusMode}
				onClose={() => setIsMobileNavOpen(false)}
				onTabChange={handleTabChange}
			/>

			<Box
				ml={
					isFocusMode
						? 0
						: {
								lg: isWorkspaceSidebarCollapsed ? '88px' : '280px',
								'2xl': isWorkspaceSidebarCollapsed ? '88px' : '300px'
							}
				}
				minH="100vh"
				transition="margin-left 180ms ease"
				_motionReduce={{ transition: 'none' }}
			>
				<CourseWorkspaceHeader
					activeLessonTitle={activeLessonContext?.subsection.title}
					activeTab={activeTab}
					enrollment={enrollment}
					exitFocusModeButtonRef={exitFocusModeButtonRef}
					focusModeButtonRef={focusModeButtonRef}
					isBrowserFullscreen={isBrowserFullscreen}
					isBrowserFullscreenSupported={isBrowserFullscreenSupported}
					isFocusMode={isFocusMode}
					onAskDoubt={handleAskDoubt}
					onEnterFocusMode={handleEnterFocusMode}
					onExitFocusMode={handleExitFocusMode}
					onOpenMobileNavigation={() => setIsMobileNavOpen(true)}
					onToggleBrowserFullscreen={() => {
						handleToggleBrowserFullscreen().catch(() => undefined);
					}}
				/>

				<Box px={isFocusMode ? { base: 3, md: 5, xl: 8 } : { base: 3, md: 6 }} py={{ base: 3, md: 6 }}>
					<Box display="grid" gridTemplateColumns={workspaceGridColumns} gap={{ base: 4, xl: 5 }} alignItems="start">
						<Box minW={0} w="full" maxW={isFocusMode ? '960px' : undefined} mx={isFocusMode ? 'auto' : undefined}>
							<CourseLearningMainContent
								activeTab={activeTab}
								activeTabLabel={activeTabLabel}
								canBypassProgression={canBypassProgression}
								courseId={courseId}
								currentUser={currentUser}
								dashboard={dashboard}
								dashboardErrorMessage={dashboardErrorMessage}
								enrollment={enrollment}
								hasReachedLessonBottom={hasReachedLessonBottom}
								isCompletingLesson={isCompletingLesson}
								isDashboardLoading={isDashboardLoading}
								isLessonsLoading={isLessonsLoading}
								learnerName={learnerName}
								lessonErrorMessage={lessonErrorMessage}
								lessonsResult={lessonsResult}
								onCourseUnlocked={handleCourseUnlocked}
								onDashboardRetry={() => {
									loadDashboard(currentUser).catch(() => undefined);
								}}
								onLessonBottomReached={handleLessonBottomReached}
								onLessonComplete={() => {
									handleCompleteLesson().catch(() => undefined);
								}}
								onLessonRetry={() => {
									loadLessons(lessonsResult?.lessons.activeSubsectionId).catch(() => undefined);
								}}
								onLessonSelect={handleLessonSelect}
								onTabChange={handleTabChange}
							/>
						</Box>

						{!isFocusMode ? (
							<CourseLearningRail
								courseId={courseId}
								currentUser={currentUser}
								dashboard={dashboard}
								enrollment={enrollment}
								isVisible={shouldShowOverviewRail}
								isCollapsed={isLearningRailCollapsed}
								lessons={lessonsResult?.lessons ?? null}
								onLessonSelect={handleLessonSelect}
								onToggleCollapse={() => setIsLearningRailCollapsed(value => !value)}
								showLessonRail={shouldShowLessonRail}
								showUnlockedOverviewRail={shouldShowUnlockedOverviewRail}
							/>
						) : null}
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default CourseLearningPage;
