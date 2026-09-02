'use client';

import { Box, Button, Container, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { ProfilePageSkeleton } from '~/lib/components/feedback/LoadingStates';

import { workspaceActiveTextColor, workspaceBoundaryColor } from './course-learning/constants';
import { CourseLearningMainContent, CourseLearningRail } from './course-learning/CourseLearningContent';
import { CourseLessonNavigationBar } from './course-learning/CourseLessonNavigationBar';
import { CourseMobileNavigation } from './course-learning/CourseMobileNavigation';
import { CourseWorkspaceHeader } from './course-learning/CourseWorkspaceHeader';
import { CourseWorkspaceSidebar } from './course-learning/CourseWorkspaceSidebar';
import type { CourseLearningPageProps } from './course-learning/types';
import { useCourseLearningPage } from './course-learning/useCourseLearningPage';

const CourseLearningPage = ({ courseId, initialRoute }: CourseLearningPageProps) => {
	const {
		activeTab,
		activeTabLabel,
		canBypassProgression,
		currentUser,
		dashboard,
		dashboardErrorMessage,
		enrollment,
		errorMessage,
		handleAskDoubt,
		handleCompleteLesson,
		handleCourseUnlocked,
		handleLessonBottomReached,
		handleLessonSelect,
		handleTabChange,
		handleToggleContentWidth,
		handleToggleLessonNavigationPinned,
		hasReachedLessonBottom,
		isCompletingLesson,
		isContentExpanded,
		isDashboardLoading,
		isLearningRailCollapsed,
		isLessonNavigationPinned,
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
		workspaceGridColumns
	} = useCourseLearningPage(courseId, initialRoute);

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
	const lessonContentBottomPadding = isLessonNavigationPinned ? { base: '84px', xl: 0 } : { base: '84px', md: '76px' };

	return (
		<Box bg="bg.subtle" minH="100vh" w="full">
			<Box
				as="aside"
				display={{ base: 'none', lg: 'block' }}
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
				isOpen={isMobileNavOpen}
				onClose={() => setIsMobileNavOpen(false)}
				onTabChange={handleTabChange}
			/>

			<Box
				ml={{
					lg: isWorkspaceSidebarCollapsed ? '88px' : '280px',
					'2xl': isWorkspaceSidebarCollapsed ? '88px' : '300px'
				}}
				minH="100vh"
				transition="margin-left 180ms ease"
				_motionReduce={{ transition: 'none' }}
			>
				<CourseWorkspaceHeader
					activeTab={activeTab}
					enrollment={enrollment}
					isContentExpanded={isContentExpanded}
					onAskDoubt={handleAskDoubt}
					onOpenMobileNavigation={() => setIsMobileNavOpen(true)}
					onToggleContentWidth={handleToggleContentWidth}
				/>

				<Box px={{ base: 3, md: 6 }} py={{ base: 3, md: 6 }}>
					<Box display="grid" gridTemplateColumns={workspaceGridColumns} gap={{ base: 4, xl: 5 }} alignItems="start">
						<Box
							minW={0}
							w="full"
							maxW={activeTab === 'lessons' && !isContentExpanded ? '760px' : undefined}
							mx="auto"
							pb={activeTab === 'lessons' ? lessonContentBottomPadding : 0}
							transition="max-width 180ms ease"
							_motionReduce={{ transition: 'none' }}
						>
							<CourseLearningMainContent
								activeTab={activeTab}
								activeTabLabel={activeTabLabel}
								canBypassProgression={canBypassProgression}
								courseId={courseId}
								currentUser={currentUser}
								dashboard={dashboard}
								dashboardErrorMessage={dashboardErrorMessage}
								enrollment={enrollment}
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
								onLessonRetry={() => {
									loadLessons(lessonsResult?.lessons.activeSubsectionId).catch(() => undefined);
								}}
								onLessonSelect={handleLessonSelect}
								onTabChange={handleTabChange}
							/>

							{activeTab === 'lessons' ? (
								<CourseLessonNavigationBar
									canComplete={canBypassProgression || hasReachedLessonBottom}
									isCompletingLesson={isCompletingLesson}
									isNavigating={isLessonsLoading}
									isLearningRailCollapsed={isLearningRailCollapsed}
									isPinned={isLessonNavigationPinned}
									isWorkspaceSidebarCollapsed={isWorkspaceSidebarCollapsed}
									lessons={lessonsResult?.lessons ?? null}
									onCompleteLesson={() => {
										handleCompleteLesson().catch(() => undefined);
									}}
									onLessonSelect={handleLessonSelect}
									onTogglePinned={handleToggleLessonNavigationPinned}
								/>
							) : null}
						</Box>

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
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default CourseLearningPage;
