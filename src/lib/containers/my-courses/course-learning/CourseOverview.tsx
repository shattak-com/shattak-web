'use client';

import { AspectRatio, Box, Button, Heading, HStack, Image, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import {
	FiBookOpen,
	FiCheckCircle,
	FiExternalLink,
	FiLock,
	FiMessageCircle,
	FiShield,
	FiTrendingUp,
	FiUsers
} from 'react-icons/fi';

import { trackCourseDashboardEvent, trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import type { AuthenticatedUser } from '~/lib/api/auth';
import { ApiRequestError } from '~/lib/api/client';
import { unlockCourseAccess, type CourseEnrollment, type CourseLearningDashboard } from '~/lib/api/enrollments';
import UserAvatar from '~/lib/components/auth/UserAvatar';
import QrCodePreview from '~/lib/components/forms/QrCodePreview';
import ExperienceVideo from '~/lib/components/media/ExperienceVideo';

import {
	courseNextSteps,
	shattakMarkUrl,
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
				{courseNextSteps.map((step, index) => {
					const isComplete = index === 0;
					const isCurrent = index === 1;
					let indicator: ReactNode = <FiLock />;
					let indicatorBg = 'bg.muted';
					let indicatorColor = 'text.muted';

					if (isComplete) {
						indicator = <FiCheckCircle />;
						indicatorBg = 'text.muted';
						indicatorColor = 'text.inverse';
					} else if (isCurrent) {
						indicator = index + 1;
						indicatorBg = 'primary';
						indicatorColor = 'text.inverse';
					}

					return (
						<HStack key={step} align="center" gap={3}>
							<Box
								boxSize="24px"
								borderRadius="full"
								bg={indicatorBg}
								color={indicatorColor}
								display="grid"
								flexShrink={0}
								fontSize="xs"
								placeItems="center"
							>
								{indicator}
							</Box>
							<Text
								color={isCurrent ? 'text.primary' : 'text.muted'}
								fontSize="sm"
								fontWeight={isCurrent ? 'semibold' : 'normal'}
								lineHeight="tall"
							>
								{index + 1}. {step}
							</Text>
						</HStack>
					);
				})}
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
	onUnlocked: (enrollment: CourseEnrollment) => void;
};

const communityButtonPulse = keyframes`
	0%, 100% {
		box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.28);
		transform: translateY(0);
	}
	50% {
		box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
		transform: translateY(-1px);
	}
`;

const communityBenefits = [
	{ icon: FiUsers, label: 'Mentor guidance' },
	{ icon: FiMessageCircle, label: 'Peer support' },
	{ icon: FiBookOpen, label: 'Course updates' }
];

const communityJoinSteps = [
	{ title: 'Join the official WhatsApp community', detail: 'Open the course group using the link above.' },
	{ title: 'Get the confirmation code', detail: 'Find it in the group description or pinned message.' },
	{ title: 'Confirm your access', detail: 'Enter the code below and click “I have joined”.' }
];

const CourseWelcomeVideo = ({
	courseTitle,
	promoImage,
	thumbnailImage
}: {
	courseTitle: string;
	promoImage: string;
	thumbnailImage: string;
}) => {
	const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() ?? '';
	const fallbackImage = promoImage || thumbnailImage || shattakMarkUrl;

	return (
		<Box
			border="1px solid"
			borderColor={workspaceBoundaryColor}
			borderRadius="panel"
			bg="black"
			overflow="hidden"
			boxShadow="soft"
		>
			<ExperienceVideo
				videoUrl={videoUrl}
				title="Welcome to Shattak video"
				fallback={
					<AspectRatio ratio={16 / 9} bg="bg.subtle">
						<Image src={fallbackImage} alt={`${courseTitle} course preview`} objectFit="cover" w="full" h="full" />
					</AspectRatio>
				}
			/>
		</Box>
	);
};

const CourseMentorImages = ({ instructors }: { instructors: CourseEnrollment['course']['instructors'] }) => {
	const mentors = instructors.filter(instructor => instructor.photo.trim()).slice(0, 3);

	if (!mentors.length) {
		return null;
	}

	return (
		<HStack gap={3} flexShrink={0}>
			<Box textAlign="right">
				<Text fontSize="xs" fontWeight="semibold">
					Meet your course mentors
				</Text>
				<Text color="text.muted" fontSize="2xs">
					Guidance from the people teaching this course
				</Text>
			</Box>
			<HStack gap={0} aria-label="Course mentors">
				{mentors.map((mentor, index) => (
					<Box
						key={mentor.id}
						ml={index === 0 ? 0 : '-10px'}
						title={[mentor.name, mentor.role].filter(Boolean).join(' — ')}
					>
						<UserAvatar
							user={{ avatarUrl: mentor.photo, email: '', name: mentor.name }}
							label={mentor.name}
							size="42px"
						/>
					</Box>
				))}
			</HStack>
		</HStack>
	);
};

const CourseOverviewTab = ({ enrollment, courseId, currentUser, onUnlocked }: CourseOverviewTabProps) => {
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
			<Box
				display={{ base: 'none', md: 'block' }}
				borderRadius="card"
				bg="primary"
				color={workspaceActiveTextColor}
				px={{ base: 4, md: 5 }}
				py={3}
			>
				<HStack gap={3}>
					<FiCheckCircle />
					<Text fontSize="sm" fontWeight="semibold">
						Enrollment confirmed. You have lifetime access, including all future updates.
					</Text>
				</HStack>
			</Box>

			<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(min(100%, 320px), 1fr))" gap={4}>
				<CourseWelcomeVideo
					courseTitle={course.title}
					promoImage={course.promoImage}
					thumbnailImage={course.thumbnailImage}
				/>

				<Box
					display={{ base: 'none', md: 'block' }}
					border="1px solid"
					borderColor={workspaceBoundaryColor}
					borderRadius="card"
					bg="bg.card"
					p={{ md: 5, xl: 6 }}
				>
					<Stack gap={3} h="full">
						<Heading size={{ md: 'lg', xl: 'xl' }} lineHeight="short">
							Welcome to Shattak
						</Heading>
						<Text color="text.primary" fontWeight="semibold">
							You&apos;ve taken the first step. Now, let&apos;s make it count.
						</Text>
						<Stack gap={2} color="text.muted" fontSize="sm" lineHeight="tall">
							<Text>We&apos;re excited to have you with us and wish you the best on your learning journey.</Text>
							<Text>Use this workspace as your course hub and follow the learning path at your own pace.</Text>
							<Text>
								Start by joining the WhatsApp community to connect with mentors and peers, get updates, clear doubts,
								and stay on track.
							</Text>
						</Stack>
						<Box mt="auto" borderRadius="full" bg="text.primary" color="text.inverse" px={4} py={2.5} w="fit-content">
							<Text fontSize="sm" fontWeight="bold">
								Let&apos;s learn, build, and grow together
							</Text>
						</Box>
					</Stack>
				</Box>
			</Box>

			<Box
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				overflow="hidden"
				boxShadow="soft"
			>
				<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(min(100%, 440px), 1fr))">
					<Stack gap={{ base: 4, md: 6 }} p={{ base: 5, md: 7 }} minW={0}>
						<Box display="grid" gridTemplateColumns={{ base: '1fr', md: '56px minmax(0, 1fr)' }} gap={4}>
							<Box
								boxSize="56px"
								borderRadius="xl"
								bg="primary"
								color={workspaceActiveTextColor}
								display={{ base: 'none', md: 'grid' }}
								fontSize="2xl"
								placeItems="center"
							>
								<FiMessageCircle />
							</Box>

							<Stack gap={4} minW={0}>
								<Box>
									<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
										Community access
									</Text>
									<Heading mt={1} size="md">
										{isUnlocked ? 'Your WhatsApp access is confirmed' : 'Join the community before you begin'}
									</Heading>
									<Text mt={2} color="text.muted" fontSize="sm" lineHeight="tall" maxW="2xl">
										{isUnlocked
											? 'Your community access is confirmed. You can revisit the group whenever you need course updates or support.'
											: 'Connect with mentors and peers, get course updates, clear doubts, and stay motivated throughout your learning journey.'}
									</Text>
								</Box>

								<Box>
									{hasInviteLink ? (
										<Button
											asChild
											borderRadius="full"
											bg="green.500"
											color="white"
											animation={`${communityButtonPulse} 2.4s ease-in-out infinite`}
											_hover={{ bg: 'green.600', transform: 'translateY(-1px)' }}
											_motionReduce={{ animation: 'none', _hover: { transform: 'none' } }}
										>
											<Link
												href={course.whatsappGroupUrl}
												target="_blank"
												rel="noopener noreferrer"
												onClick={() =>
													trackCourseDashboardEvent({
														eventName: 'course_whatsapp_opened',
														courseId,
														courseTitle: course.title,
														userId: currentUser?.id,
														destination: 'community',
														enrollmentStatus: enrollment.status,
														sourcePage: `/my-courses/${courseId}`
													})
												}
											>
												<FaWhatsapp /> Join WhatsApp Group <FiExternalLink />
											</Link>
										</Button>
									) : (
										<Text color="red.500" fontSize="sm">
											The WhatsApp group link is not configured for this course yet.
										</Text>
									)}
								</Box>
							</Stack>
						</Box>

						<SimpleGrid display={{ base: 'none', md: 'grid' }} columns={3} gap={3}>
							{communityBenefits.map(({ icon: Icon, label }) => (
								<HStack
									key={label}
									border="1px solid"
									borderColor={workspaceBoundaryColor}
									borderRadius="lg"
									bg="bg.subtle"
									p={3}
									gap={2}
								>
									<Box color="primary" flexShrink={0}>
										<Icon />
									</Box>
									<Text fontSize="xs" fontWeight="semibold">
										{label}
									</Text>
								</HStack>
							))}
						</SimpleGrid>

						<Stack display={{ base: 'none', md: 'flex' }} gap={3}>
							{communityJoinSteps.map((step, index) => (
								<HStack key={step.title} align="start" gap={3}>
									<Box
										boxSize="24px"
										borderRadius="full"
										bg="bg.brand"
										color="primary"
										display="grid"
										flexShrink={0}
										fontSize="xs"
										fontWeight="bold"
										placeItems="center"
									>
										{index + 1}
									</Box>
									<Box minW={0}>
										<Text fontSize="sm" fontWeight="semibold">
											{step.title}
										</Text>
										<Text color="text.muted" fontSize="xs">
											{step.detail}
										</Text>
									</Box>
								</HStack>
							))}
						</Stack>

						<Box
							display="grid"
							gridTemplateColumns={{ base: '1fr', sm: 'minmax(0, 1fr) auto' }}
							gap={3}
							alignItems="end"
							maxW="720px"
						>
							<Stack gap={2}>
								<Text id="course-access-code-label" fontSize="sm" fontWeight="bold" color="text.primary">
									Access code
								</Text>
								<Input
									id="course-access-code"
									aria-labelledby="course-access-code-label"
									value={accessCode}
									onChange={event => setAccessCode(event.currentTarget.value)}
									placeholder="Enter code from WhatsApp group"
									autoComplete="off"
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
								minW={{ sm: '168px' }}
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

						<HStack
							display={{ base: 'none', md: 'flex' }}
							border="1px solid"
							borderColor={workspaceBoundaryColor}
							borderRadius="lg"
							bg="bg.subtle"
							px={4}
							py={3}
							gap={4}
							justify="space-between"
							align="center"
							flexWrap="wrap"
						>
							<HStack gap={3} minW={0}>
								<Box color="primary" fontSize="lg">
									<FiShield />
								</Box>
								<Box minW={0}>
									<Text color="primary" fontSize="xs" fontWeight="bold">
										A supportive community for your success
									</Text>
									<Text color="text.muted" fontSize="xs">
										We&apos;re here to help you learn, grow, and achieve your goals together.
									</Text>
								</Box>
							</HStack>
							<CourseMentorImages instructors={course.instructors ?? []} />
						</HStack>
					</Stack>

					<Stack display={{ base: 'none', lg: 'flex' }} gap={3} align="center" justify="center" bg="bg.card" p={7}>
						<Box textAlign="center">
							<Text fontWeight="bold">WhatsApp Group QR</Text>
							<Text mt={1} color="text.muted" fontSize="xs">
								Scan with WhatsApp Camera or Google Lens
							</Text>
						</Box>
						<QrCodePreview value={course.whatsappGroupUrl} label="WhatsApp group QR" size={210} />
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
		<CourseOverviewTab enrollment={enrollment} courseId={courseId} currentUser={currentUser} onUnlocked={onUnlocked} />
	);
};
