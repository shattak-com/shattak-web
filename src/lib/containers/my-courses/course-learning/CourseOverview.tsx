'use client';

import { Box, Button, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { FiCheckCircle, FiExternalLink, FiMessageCircle, FiTrendingUp, FiUsers } from 'react-icons/fi';

import { trackCourseDashboardEvent, trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import type { AuthenticatedUser } from '~/lib/api/auth';
import { ApiRequestError } from '~/lib/api/client';
import { unlockCourseAccess, type CourseEnrollment, type CourseLearningDashboard } from '~/lib/api/enrollments';
import QrCodePreview from '~/lib/components/forms/QrCodePreview';

import {
	courseNextSteps,
	workspaceActiveTextColor,
	workspaceBoundaryColor,
	workspaceSelectedBoundaryColor
} from './constants';
import CourseDashboardSkeleton from './CourseDashboardSkeleton';
import type { CourseTabId } from './types';
import { getStreakTiles } from './utils';

export const CourseNextStepsPanel = () => (
	<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" p={{ base: 5, xl: 6 }}>
		<Stack gap={5}>
			<Box>
				<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
					Your next steps
				</Text>
				<Heading mt={2} size="md">
					Keep moving through the course
				</Heading>
			</Box>
			<Stack gap={4}>
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
	</Box>
);

const CompletionRing = ({ percentage }: { percentage: number }) => (
	<Box
		boxSize={{ base: '126px', md: '148px' }}
		borderRadius="full"
		display="grid"
		placeItems="center"
		style={{
			background: `conic-gradient(#ff6557 ${Math.min(100, Math.max(0, percentage)) * 3.6}deg, rgba(255, 101, 87, 0.16) 0deg)`
		}}
	>
		<Stack
			align="center"
			justify="center"
			boxSize={{ base: '94px', md: '110px' }}
			borderRadius="full"
			bg="bg.card"
			gap={0}
		>
			<Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
				{percentage}%
			</Text>
			<Text color="text.muted" fontSize="xs" fontWeight="semibold">
				complete
			</Text>
		</Stack>
	</Box>
);

const CourseCompletionCard = ({ dashboard }: { dashboard: CourseLearningDashboard }) => (
	<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
		<Stack align="center" gap={4}>
			<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
				Course completion
			</Text>
			<CompletionRing percentage={dashboard.completion.percentage} />
			<Stack gap={2} w="full">
				<HStack justify="space-between">
					<Text color="text.muted" fontSize="sm">
						Lessons
					</Text>
					<Text fontWeight="semibold">{dashboard.completion.lessonsPercentage}% / 80%</Text>
				</HStack>
				<HStack justify="space-between">
					<Text color="text.muted" fontSize="sm">
						Assignment
					</Text>
					<Text fontWeight="semibold">{dashboard.completion.assignmentPercentage}% / 20%</Text>
				</HStack>
			</Stack>
		</Stack>
	</Box>
);

const CourseLeaderboardCard = ({ dashboard }: { dashboard: CourseLearningDashboard }) => {
	if (!dashboard.leaderboard.length) {
		return null;
	}

	return (
		<Box
			border="1px solid"
			borderColor={workspaceBoundaryColor}
			borderRadius="card"
			bg="bg.card"
			p={{ base: 5, md: 6 }}
		>
			<Stack gap={4}>
				<HStack justify="space-between" align="center">
					<Box>
						<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
							Leaderboard
						</Text>
						<Heading mt={1} size="sm">
							Recently certified
						</Heading>
					</Box>
					<Box color="primary" fontSize="2xl">
						<FiUsers />
					</Box>
				</HStack>
				<Stack gap={3}>
					{dashboard.leaderboard.map(item => (
						<HStack
							key={item.id}
							border="1px solid"
							borderColor={workspaceBoundaryColor}
							borderRadius="lg"
							bg="bg.subtle"
							p={3}
							gap={3}
						>
							<Box
								boxSize="38px"
								borderRadius="full"
								bg="primary"
								color={workspaceActiveTextColor}
								display="grid"
								flexShrink={0}
								fontWeight="bold"
								placeItems="center"
							>
								{item.learnerName.charAt(0).toUpperCase()}
							</Box>
							<Box minW={0}>
								<Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
									{item.learnerName}
								</Text>
								<Text color="text.muted" fontSize="xs" lineClamp={1}>
									Certified in {item.courseName}
								</Text>
							</Box>
						</HStack>
					))}
				</Stack>
			</Stack>
		</Box>
	);
};

type CourseCommunityShortcutCardProps = {
	courseId: string;
	currentUser: AuthenticatedUser | null;
	dashboard: CourseLearningDashboard;
	enrollment: CourseEnrollment;
};

const CourseCommunityShortcutCard = ({
	courseId,
	currentUser,
	dashboard,
	enrollment
}: CourseCommunityShortcutCardProps) => {
	const { course } = enrollment;

	return (
		<Box
			border="1px solid"
			borderColor={workspaceBoundaryColor}
			borderRadius="card"
			bg="bg.card"
			p={{ base: 5, md: 6 }}
		>
			<Stack gap={4}>
				<HStack gap={4} align="start">
					<Box
						boxSize="52px"
						borderRadius="xl"
						bg="primary"
						color={workspaceActiveTextColor}
						display="grid"
						fontSize="2xl"
						placeItems="center"
					>
						<FiMessageCircle />
					</Box>
					<Box minW={0}>
						<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
							Community shortcut
						</Text>
						<Heading mt={1} size="sm">
							Go to your WhatsApp community
						</Heading>
					</Box>
				</HStack>

				<Text color="text.muted" fontSize="sm" lineHeight="tall">
					Jump back into the course group for mentor updates, peer questions, and session reminders.
				</Text>

				{dashboard.community.whatsappGroupUrl ? (
					<Button
						asChild
						borderRadius="full"
						bg="primary"
						color={workspaceActiveTextColor}
						_hover={{ bg: 'primaryHover' }}
					>
						<Link
							href={dashboard.community.whatsappGroupUrl}
							target="_blank"
							rel="noopener noreferrer"
							onClick={() =>
								trackCourseDashboardEvent({
									eventName: 'course_whatsapp_opened',
									courseId,
									courseTitle: course.title,
									userId: currentUser?.id,
									sourcePage: `/my-courses/${courseId}`
								})
							}
						>
							Go to Community <FiExternalLink />
						</Link>
					</Button>
				) : (
					<Button borderRadius="full" variant="outline" disabled>
						Community link unavailable
					</Button>
				)}
			</Stack>
		</Box>
	);
};

type CourseUnlockedOverviewRailProps = {
	courseId: string;
	currentUser: AuthenticatedUser | null;
	dashboard: CourseLearningDashboard;
	enrollment: CourseEnrollment;
};

export const CourseUnlockedOverviewRail = ({
	courseId,
	currentUser,
	dashboard,
	enrollment
}: CourseUnlockedOverviewRailProps) => (
	<Stack gap={4}>
		<CourseCompletionCard dashboard={dashboard} />
		<CourseLeaderboardCard dashboard={dashboard} />
		<CourseCommunityShortcutCard
			courseId={courseId}
			currentUser={currentUser}
			dashboard={dashboard}
			enrollment={enrollment}
		/>
	</Stack>
);

type CourseUnlockedOverviewTabProps = {
	dashboard: CourseLearningDashboard;
	enrollment: CourseEnrollment;
	courseId: string;
	currentUser: AuthenticatedUser | null;
	learnerName: string;
	onTabChange: (tabId: CourseTabId) => void;
};

const CourseUnlockedOverviewTab = ({
	dashboard,
	enrollment,
	courseId,
	currentUser,
	learnerName,
	onTabChange
}: CourseUnlockedOverviewTabProps) => {
	const streakTiles = getStreakTiles(
		dashboard.streak.currentStreak,
		dashboard.streak.lastActiveDate,
		dashboard.streak.timeZone
	);
	const { course } = enrollment;

	const handleProgressClick = () => {
		trackCourseDashboardEvent({
			eventName: 'course_progress_clicked',
			courseId,
			courseTitle: course.title,
			userId: currentUser?.id,
			destination: dashboard.learningProgress.destination,
			completionPercentage: dashboard.completion.percentage,
			enrollmentStatus: enrollment.status,
			sourcePage: `/my-courses/${courseId}`
		});
		onTabChange(dashboard.learningProgress.tabId);
	};

	return (
		<Stack gap={4}>
			<Box
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				p={{ base: 5, md: 7 }}
			>
				<Stack gap={4}>
					<HStack gap={2}>
						<Box color="green.500">
							<FiCheckCircle />
						</Box>
						<Text color="green.600" fontSize="xs" fontWeight="bold" textTransform="uppercase">
							Course workspace ready
						</Text>
					</HStack>
					<Heading size={{ base: 'xl', md: '2xl' }}>
						Welcome to the Course{learnerName ? `, ${learnerName}` : ''}.
					</Heading>
					<Text color="text.primary" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="medium">
						You&apos;ve taken the first step - now let&apos;s make it count.
					</Text>
					<Text color="text.muted" fontSize="md" lineHeight="tall" maxW="3xl">
						Use this dashboard to keep your course rhythm, jump to the next learning action, and stay connected with
						your mentors and peers.
					</Text>
				</Stack>
			</Box>

			<Box
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				p={{ base: 5, md: 6 }}
			>
				<Stack gap={5}>
					<HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
						<Box maxW="3xl">
							<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
								Your next learning action
							</Text>
							<Heading mt={2} size={{ base: 'lg', md: 'xl' }}>
								{dashboard.learningProgress.title}
							</Heading>
							<Text mt={2} color="text.muted" fontSize="md" lineHeight="tall">
								{dashboard.learningProgress.subtitle}
							</Text>
						</Box>
						<Button
							borderRadius="full"
							bg="primary"
							color={workspaceActiveTextColor}
							_hover={{ bg: 'primaryHover' }}
							onClick={handleProgressClick}
						>
							{dashboard.learningProgress.buttonLabel}
						</Button>
					</HStack>
					<Box borderRadius="lg" bg="bg.subtle" border="1px solid" borderColor={workspaceBoundaryColor} p={4}>
						<Text color="text.muted" fontSize="sm">
							{dashboard.completion.completedSubsections} of {dashboard.completion.totalSubsections} learning units
							completed. Assignment status: {dashboard.completion.assignmentStatus.replace('_', ' ').toLowerCase()}.
						</Text>
					</Box>
				</Stack>
			</Box>

			{!dashboard.streak.hidden ? (
				<Box
					border="1px solid"
					borderColor={workspaceBoundaryColor}
					borderRadius="card"
					bg="bg.card"
					p={{ base: 5, md: 6 }}
				>
					<Stack gap={4}>
						<HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
							<Box>
								<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
									Learning streak
								</Text>
								<Heading mt={1} size="lg">
									{dashboard.streak.currentStreak} {dashboard.streak.currentStreak === 1 ? 'day' : 'days'} streak
								</Heading>
								<Text mt={1} color="text.muted" fontSize="xs">
									Rolling ten-day activity window
								</Text>
							</Box>
							<Box color="primary" fontSize="3xl">
								<FiTrendingUp />
							</Box>
						</HStack>

						<Box display="grid" gridTemplateColumns={{ base: 'repeat(5, 1fr)', md: 'repeat(10, 1fr)' }} gap={2}>
							{streakTiles.map(tile => (
								<Stack
									key={tile.dateKey}
									align="center"
									gap={1}
									border="1px solid"
									borderColor={tile.isActive ? workspaceSelectedBoundaryColor : workspaceBoundaryColor}
									borderRadius="lg"
									bg={tile.isActive ? 'bg.accent' : 'bg.subtle'}
									px={2}
									py={3}
									position="relative"
								>
									<Text color={tile.isActive ? 'primary' : 'text.muted'} fontSize="xs" fontWeight="bold">
										{tile.dayLabel}
									</Text>
									<Text color="text.muted" fontSize="2xs" whiteSpace="nowrap">
										{tile.dateLabel}
									</Text>
									<Box boxSize="10px" borderRadius="full" bg={tile.isActive ? 'primary' : 'border.default'} />
									{tile.isLatest ? (
										<Box
											position="absolute"
											insetX={2}
											bottom={0}
											h="2px"
											borderRadius="full"
											bg="primary"
											aria-hidden="true"
										/>
									) : null}
								</Stack>
							))}
						</Box>

						<Box borderRadius="lg" bg="bg.subtle" border="1px solid" borderColor={workspaceBoundaryColor} px={4} py={3}>
							<Text color="text.muted" fontSize="sm">
								{dashboard.streak.message}
							</Text>
						</Box>
					</Stack>
				</Box>
			) : null}
		</Stack>
	);
};

type CourseOverviewTabProps = {
	enrollment: CourseEnrollment;
	courseId: string;
	currentUser: AuthenticatedUser | null;
	learnerName: string;
	onUnlocked: (enrollment: CourseEnrollment) => void;
};

const CourseOverviewTab = ({ enrollment, courseId, currentUser, learnerName, onUnlocked }: CourseOverviewTabProps) => {
	const [accessCode, setAccessCode] = useState('');
	const [message, setMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { course } = enrollment;
	const isUnlocked = Boolean(enrollment.accessUnlockedAt);
	const hasInviteLink = Boolean(course.whatsappGroupUrl.trim());

	const getUnlockErrorMessage = (error: unknown) => {
		if (error instanceof ApiRequestError && error.code === 'COURSE_ACCESS_CODE_NOT_CONFIGURED') {
			return 'The course access code is not configured yet. Please contact the Shattak team.';
		}

		if (error instanceof ApiRequestError && error.code === 'INVALID_COURSE_ACCESS_CODE') {
			return 'That access code does not match this course. Please check the WhatsApp group message and try again.';
		}

		return 'Unable to confirm access right now. Please try again.';
	};

	const handleUnlock = async () => {
		setMessage('');
		setIsSubmitting(true);
		trackEnrollmentEvent({
			location: 'course_learning',
			eventName: 'Course Access Unlock Attempted',
			courseId,
			courseTitle: course.title,
			enrollmentStatus: enrollment.status,
			sourcePage: `/my-courses/${courseId}`
		});

		try {
			const result = await unlockCourseAccess(courseId, accessCode);
			onUnlocked(result.enrollment);
			setAccessCode('');
			setMessage('Access confirmed. You are ready for the next course step.');
			trackCourseDashboardEvent({
				eventName: 'course_whatsapp_join_verified',
				courseId,
				courseTitle: course.title,
				userId: currentUser?.id,
				enrollmentStatus: result.enrollment.status,
				sourcePage: `/my-courses/${courseId}`
			});
			trackCourseDashboardEvent({
				eventName: 'course_overview_unlocked',
				courseId,
				courseTitle: course.title,
				userId: currentUser?.id,
				enrollmentStatus: result.enrollment.status,
				sourcePage: `/my-courses/${courseId}`
			});
			trackEnrollmentEvent({
				location: 'course_learning',
				eventName: 'Course Access Unlock Succeeded',
				courseId,
				courseTitle: course.title,
				enrollmentStatus: result.enrollment.status,
				sourcePage: `/my-courses/${courseId}`
			});
		} catch (error) {
			setMessage(getUnlockErrorMessage(error));
			trackEnrollmentEvent({
				location: 'course_learning',
				eventName: 'Course Access Unlock Failed',
				courseId,
				courseTitle: course.title,
				enrollmentStatus: enrollment.status,
				sourcePage: `/my-courses/${courseId}`,
				errorType: error instanceof ApiRequestError ? error.code : 'unknown_error'
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Stack gap={4}>
			<Box borderRadius="card" bg="primary" color={workspaceActiveTextColor} px={{ base: 4, md: 5 }} py={3}>
				<HStack gap={3}>
					<FiCheckCircle />
					<Text fontSize="sm" fontWeight="semibold">
						Enrollment confirmed. You have lifetime access, including all future updates.
					</Text>
				</HStack>
			</Box>

			<Box
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				p={{ base: 5, md: 7 }}
			>
				<Stack gap={4}>
					<Heading size={{ base: 'xl', md: '2xl' }} lineHeight="short">
						Welcome to the Course{learnerName ? `, ${learnerName}` : ''}.
					</Heading>
					<Text color="text.primary" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="medium">
						You&apos;ve taken the first step - now let&apos;s make it count.
					</Text>
					<Stack gap={2} color="text.muted" fontSize="md" lineHeight="tall" maxW="3xl">
						<Text>
							We wish you all the best on your journey. Use this workspace as your course hub while you move through the
							learning path.
						</Text>
						<Text>
							Start by joining the WhatsApp community. Your mentors and peers are already there to share updates, answer
							questions, and help you stay on track.
						</Text>
					</Stack>
					<Box borderRadius="lg" bg="text.primary" color="text.inverse" px={4} py={3} w="fit-content">
						<Text fontSize="sm" fontWeight="bold">
							Join community + confirm code + prepare your course workspace
						</Text>
					</Box>
				</Stack>
			</Box>

			<Box
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				overflow="hidden"
				boxShadow="soft"
			>
				<Box display="grid" gridTemplateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 320px' }}>
					<Stack gap={4} p={{ base: 5, md: 6 }}>
						<HStack align="start" gap={4}>
							<Box
								boxSize="56px"
								borderRadius="xl"
								bg="primary"
								color={workspaceActiveTextColor}
								display="grid"
								flexShrink={0}
								fontSize="2xl"
								placeItems="center"
							>
								<FiMessageCircle />
							</Box>
							<Box>
								<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
									Community access
								</Text>
								<Heading mt={1} size="md">
									{isUnlocked ? 'Your WhatsApp access is confirmed' : 'Join the community before you begin'}
								</Heading>
								<Text mt={2} color="text.muted" fontSize="sm" lineHeight="tall">
									{isUnlocked
										? 'Your access has been confirmed. The remaining course sections will be connected in the next phase.'
										: 'Scan the QR code or open the link, join the official group, and enter the access code shared there.'}
								</Text>
							</Box>
						</HStack>

						<HStack gap={3} flexWrap="wrap">
							{hasInviteLink ? (
								<Button
									asChild
									borderRadius="full"
									bg="primary"
									color={workspaceActiveTextColor}
									_hover={{ bg: 'primaryHover' }}
								>
									<Link href={course.whatsappGroupUrl} target="_blank" rel="noopener noreferrer">
										Join WhatsApp Group <FiExternalLink />
									</Link>
								</Button>
							) : (
								<Text color="red.500" fontSize="sm">
									The WhatsApp group link is not configured for this course yet.
								</Text>
							)}
						</HStack>

						<Stack gap={2} color="text.muted" fontSize="sm" lineHeight="tall">
							<Text>1. Join the official WhatsApp community.</Text>
							<Text>2. Get the confirmation code from the group description or pinned message.</Text>
							<Text>3. Enter the code here and click &quot;I have joined&quot;.</Text>
						</Stack>

						<Box
							display="grid"
							gridTemplateColumns={{ base: '1fr', md: 'minmax(260px, 420px) 180px' }}
							gap={3}
							alignItems="end"
							maxW="680px"
						>
							<Stack gap={2}>
								<Text fontSize="sm" fontWeight="bold" color="text.primary">
									Access code
								</Text>
								<Input
									value={accessCode}
									onChange={event => setAccessCode(event.currentTarget.value)}
									placeholder="Enter code from WhatsApp group"
									disabled={isUnlocked}
									bg="bg.card"
									h="46px"
								/>
							</Stack>

							<Button
								borderRadius="full"
								bg="primary"
								color={workspaceActiveTextColor}
								h="46px"
								_hover={{ bg: 'primaryHover' }}
								loading={isSubmitting}
								disabled={isUnlocked || !accessCode.trim()}
								onClick={() => {
									handleUnlock().catch(() => undefined);
								}}
							>
								{isUnlocked ? 'Access confirmed' : 'I have joined'}
							</Button>
						</Box>

						{message ? (
							<Text fontSize="sm" color={isUnlocked ? 'green.500' : 'red.500'}>
								{message}
							</Text>
						) : null}
					</Stack>

					<Stack
						gap={3}
						align="center"
						justify="center"
						bg="bg.subtle"
						borderLeft={{ xl: '1px solid' }}
						borderColor={workspaceBoundaryColor}
						p={{ base: 5, md: 6 }}
					>
						<QrCodePreview value={course.whatsappGroupUrl} label="WhatsApp group QR" size={220} />
					</Stack>
				</Box>
			</Box>
		</Stack>
	);
};

type CourseOverviewContentProps = {
	courseId: string;
	currentUser: AuthenticatedUser | null;
	dashboard: CourseLearningDashboard | null;
	dashboardErrorMessage: string;
	enrollment: CourseEnrollment;
	isDashboardLoading: boolean;
	learnerName: string;
	onDashboardRetry: () => void;
	onTabChange: (tabId: CourseTabId) => void;
	onUnlocked: (enrollment: CourseEnrollment) => void;
};

export const CourseOverviewContent = ({
	courseId,
	currentUser,
	dashboard,
	dashboardErrorMessage,
	enrollment,
	isDashboardLoading,
	learnerName,
	onDashboardRetry,
	onTabChange,
	onUnlocked
}: CourseOverviewContentProps) => {
	if (isDashboardLoading) {
		return <CourseDashboardSkeleton />;
	}

	if (enrollment.accessUnlockedAt && dashboard) {
		return (
			<CourseUnlockedOverviewTab
				dashboard={dashboard}
				enrollment={enrollment}
				courseId={courseId}
				currentUser={currentUser}
				learnerName={learnerName}
				onTabChange={onTabChange}
			/>
		);
	}

	if (enrollment.accessUnlockedAt && dashboardErrorMessage) {
		return (
			<Box
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				p={{ base: 5, md: 6 }}
			>
				<Stack gap={4}>
					<Heading size="lg">Dashboard temporarily unavailable</Heading>
					<Text color="text.muted">{dashboardErrorMessage}</Text>
					<Button
						borderRadius="full"
						bg="primary"
						color={workspaceActiveTextColor}
						_hover={{ bg: 'primaryHover' }}
						w="fit-content"
						onClick={onDashboardRetry}
					>
						Retry dashboard
					</Button>
				</Stack>
			</Box>
		);
	}

	return (
		<CourseOverviewTab
			enrollment={enrollment}
			courseId={courseId}
			currentUser={currentUser}
			learnerName={learnerName}
			onUnlocked={onUnlocked}
		/>
	);
};
