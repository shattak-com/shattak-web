'use client';

import { Badge, Box, Button, Container, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	FiAward,
	FiBookOpen,
	FiCheckCircle,
	FiClipboard,
	FiExternalLink,
	FiGift,
	FiLock,
	FiMenu,
	FiMessageCircle,
	FiPlayCircle,
	FiTrendingUp,
	FiUsers,
	FiX
} from 'react-icons/fi';

import { trackCourseDashboardEvent, trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import { getCurrentUser, type AuthenticatedUser } from '~/lib/api/auth';
import { ApiRequestError } from '~/lib/api/client';
import {
	getCourseEnrollmentStatus,
	getCourseLearningDashboard,
	type CourseEnrollment,
	type CourseLearningDashboard,
	unlockCourseAccess
} from '~/lib/api/enrollments';
import UserAvatar from '~/lib/components/auth/UserAvatar';
import { ProfilePageSkeleton } from '~/lib/components/feedback/LoadingStates';
import QrCodePreview from '~/lib/components/forms/QrCodePreview';

type CourseLearningPageProps = {
	courseId: string;
};

type CourseTabId = 'overview' | 'lessons' | 'recordings' | 'bonus' | 'assignment' | 'certificate' | 'peerNetwork';

const courseTabs: Array<{ id: CourseTabId; label: string; icon: typeof FiBookOpen }> = [
	{ id: 'overview', label: 'Overview', icon: FiBookOpen },
	{ id: 'lessons', label: 'Lessons', icon: FiPlayCircle },
	{ id: 'recordings', label: 'Session Recordings', icon: FiPlayCircle },
	{ id: 'bonus', label: 'Bonus Content', icon: FiGift },
	{ id: 'assignment', label: 'Assignment', icon: FiClipboard },
	{ id: 'certificate', label: 'Certificate', icon: FiAward },
	{ id: 'peerNetwork', label: 'Peer Network', icon: FiMessageCircle }
];

const formatDate = (value: string) =>
	new Intl.DateTimeFormat('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(new Date(value));

const courseNextSteps = [
	'Join the WhatsApp community.',
	'Access your course materials.',
	'Complete all study materials.',
	'Unlock and watch the live session.',
	'Complete your first assignment.',
	'Give us feedback.',
	'Get your certificate.'
];

const CoursePlaceholderTab = ({ label }: { label: string }) => (
	<Box
		border="1px solid"
		borderColor="border.default"
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
				borderColor="border.default"
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

const CourseNextStepsPanel = () => (
	<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, xl: 6 }}>
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

const getStreakTiles = (currentStreak: number) => {
	return Array.from({ length: 10 }, (_, index) => ({
		label: `Day ${index + 1}`,
		isActive: index < currentStreak
	}));
};

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

const CourseDashboardSkeleton = () => (
	<Stack gap={4}>
		<Box borderRadius="card" bg="bg.card" border="1px solid" borderColor="border.default" p={{ base: 5, md: 7 }}>
			<Stack gap={4}>
				<Box h="28px" w="240px" bg="bg.subtle" borderRadius="full" />
				<Box h="20px" w="60%" bg="bg.subtle" borderRadius="full" />
				<Box h="140px" w="full" bg="bg.subtle" borderRadius="card" />
			</Stack>
		</Box>
		<Box borderRadius="card" bg="bg.card" border="1px solid" borderColor="border.default" h="260px" />
	</Stack>
);

type CourseCompletionCardProps = {
	dashboard: CourseLearningDashboard;
};

const CourseCompletionCard = ({ dashboard }: CourseCompletionCardProps) => (
	<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
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

type CourseLeaderboardCardProps = {
	dashboard: CourseLearningDashboard;
};

const CourseLeaderboardCard = ({ dashboard }: CourseLeaderboardCardProps) => {
	if (!dashboard.leaderboard.length) {
		return null;
	}

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
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
							borderColor="border.default"
							borderRadius="lg"
							bg="bg.subtle"
							p={3}
							gap={3}
						>
							<Box
								boxSize="38px"
								borderRadius="full"
								bg="primary"
								color="text.inverse"
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
		<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
			<Stack gap={4}>
				<HStack gap={4} align="start">
					<Box
						boxSize="52px"
						borderRadius="xl"
						bg="primary"
						color="text.inverse"
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
					<Button asChild borderRadius="full" bg="primary" color="text.inverse" _hover={{ bg: 'primaryHover' }}>
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

const CourseUnlockedOverviewRail = ({
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
	const streakTiles = getStreakTiles(dashboard.streak.currentStreak);
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
			<Box borderRadius="card" bg="primary" color="text.inverse" px={{ base: 4, md: 5 }} py={3}>
				<HStack gap={3}>
					<FiCheckCircle />
					<Text fontSize="sm" fontWeight="semibold">
						Overview unlocked. Your course workspace is ready.
					</Text>
				</HStack>
			</Box>

			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 7 }}>
				<Stack gap={4}>
					<HStack gap={2} flexWrap="wrap">
						<Badge colorPalette="green" borderRadius="full" px={3} py={1}>
							Community verified
						</Badge>
						<Badge borderRadius="full" px={3} py={1}>
							{dashboard.completion.percentage}% complete
						</Badge>
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

			{!dashboard.streak.hidden ? (
				<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
					<Stack gap={4}>
						<HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
							<Box>
								<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
									Learning streak
								</Text>
								<Heading mt={1} size="lg">
									{dashboard.streak.currentStreak} day streak
								</Heading>
							</Box>
							<Box color="primary" fontSize="3xl">
								<FiTrendingUp />
							</Box>
						</HStack>

						<Box display="grid" gridTemplateColumns={{ base: 'repeat(5, 1fr)', md: 'repeat(10, 1fr)' }} gap={2}>
							{streakTiles.map(tile => (
								<Stack
									key={tile.label}
									align="center"
									gap={1}
									border="1px solid"
									borderColor={tile.isActive ? 'primary' : 'border.default'}
									borderRadius="lg"
									bg={tile.isActive ? 'bg.accent' : 'bg.subtle'}
									px={2}
									py={3}
								>
									<Text color={tile.isActive ? 'primary' : 'text.muted'} fontSize="xs" fontWeight="bold">
										{tile.label}
									</Text>
									<Box boxSize="10px" borderRadius="full" bg={tile.isActive ? 'primary' : 'border.default'} />
								</Stack>
							))}
						</Box>

						<Box borderRadius="lg" bg="bg.subtle" border="1px solid" borderColor="border.default" px={4} py={3}>
							<Text color="text.muted" fontSize="sm">
								{dashboard.streak.message}
							</Text>
						</Box>
					</Stack>
				</Box>
			) : null}

			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
				<Stack gap={4}>
					<HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
						<Box>
							<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
								Learning progress
							</Text>
							<Heading mt={1} size="md">
								{dashboard.learningProgress.title}
							</Heading>
							<Text mt={2} color="text.muted" fontSize="sm">
								{dashboard.learningProgress.subtitle}
							</Text>
						</Box>
						<Button
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							_hover={{ bg: 'primaryHover' }}
							onClick={handleProgressClick}
						>
							{dashboard.learningProgress.buttonLabel}
						</Button>
					</HStack>
					<Box borderRadius="lg" bg="bg.subtle" border="1px solid" borderColor="border.default" p={4}>
						<Text color="text.muted" fontSize="sm">
							{dashboard.completion.completedSubsections} of {dashboard.completion.totalSubsections} learning units
							completed. Assignment status: {dashboard.completion.assignmentStatus.replace('_', ' ').toLowerCase()}.
						</Text>
					</Box>
				</Stack>
			</Box>
		</Stack>
	);
};

type CourseWorkspaceSidebarProps = {
	activeTab: CourseTabId;
	currentUser: AuthenticatedUser | null;
	enrollment: CourseEnrollment;
	onClose?: () => void;
	onTabChange: (tabId: CourseTabId) => void;
};

const CourseWorkspaceSidebar = ({
	activeTab,
	currentUser,
	enrollment,
	onClose,
	onTabChange
}: CourseWorkspaceSidebarProps) => {
	const displayName = currentUser?.name || currentUser?.email || 'User';

	return (
		<Stack h="full" gap={0} bg="bg.card">
			<HStack h="72px" px={6} justify="space-between" borderBottom="1px solid" borderColor="border.default">
				<Text fontSize="3xl" fontWeight="bold" color="text.primary">
					Shattak
				</Text>
				{onClose ? (
					<Button variant="ghost" size="sm" borderRadius="full" onClick={onClose} aria-label="Close course navigation">
						<FiX />
					</Button>
				) : null}
			</HStack>

			<Stack flex="1" gap={3} px={4} py={5}>
				<Box px={2} pb={2}>
					<Text color="text.muted" fontSize="xs" fontWeight="bold" textTransform="uppercase">
						Course dashboard
					</Text>
					<Text mt={1} color="text.muted" fontSize="sm" lineClamp={2}>
						{enrollment.course.title}
					</Text>
				</Box>

				{courseTabs.map(tab => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;
					const showLock = tab.id !== 'overview' || !enrollment.accessUnlockedAt;

					return (
						<Button
							key={tab.id}
							justifyContent="space-between"
							borderRadius="lg"
							variant={isActive ? 'solid' : 'ghost'}
							bg={isActive ? 'primary' : undefined}
							color={isActive ? 'text.inverse' : 'text.primary'}
							minH="48px"
							px={4}
							onClick={() => {
								onTabChange(tab.id);
								onClose?.();
							}}
						>
							<HStack gap={3}>
								<Icon />
								<Text as="span" fontWeight="semibold">
									{tab.label}
								</Text>
							</HStack>
							{showLock ? <FiLock /> : null}
						</Button>
					);
				})}
			</Stack>

			<Box borderTop="1px solid" borderColor="border.default" p={4}>
				<HStack border="1px solid" borderColor="border.default" borderRadius="xl" bg="bg.subtle" p={3} gap={3}>
					{currentUser ? (
						<UserAvatar user={currentUser} label={displayName} size="42px" />
					) : (
						<Box
							boxSize="42px"
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							display="grid"
							flexShrink={0}
							fontWeight="bold"
							placeItems="center"
						>
							U
						</Box>
					)}
					<Box minW={0}>
						<Text fontWeight="semibold" lineClamp={1}>
							{displayName}
						</Text>
						<Text color="text.muted" fontSize="xs">
							Learner
						</Text>
					</Box>
				</HStack>
			</Box>
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
			<Box borderRadius="card" bg="primary" color="text.inverse" px={{ base: 4, md: 5 }} py={3}>
				<HStack gap={3}>
					<FiCheckCircle />
					<Text fontSize="sm" fontWeight="semibold">
						Enrollment confirmed. You have lifetime access, including all future updates.
					</Text>
				</HStack>
			</Box>

			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 7 }}>
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
				borderColor="border.default"
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
								color="text.inverse"
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
								<Button asChild borderRadius="full" bg="primary" color="text.inverse" _hover={{ bg: 'primaryHover' }}>
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
								color="text.inverse"
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
						borderColor="border.default"
						p={{ base: 5, md: 6 }}
					>
						<QrCodePreview value={course.whatsappGroupUrl} label="WhatsApp group QR" size={220} />
					</Stack>
				</Box>
			</Box>
		</Stack>
	);
};

type DashboardTrackingContext = {
	courseId: string;
	currentPath: string;
	result: {
		enrollment: CourseEnrollment;
		dashboard: CourseLearningDashboard;
	};
	trackedCertificateEnrollmentId: string | null;
	user: AuthenticatedUser | null;
};

const trackDashboardOpened = ({ courseId, currentPath, result, user }: DashboardTrackingContext) => {
	trackCourseDashboardEvent({
		eventName: 'course_opened',
		courseId,
		courseTitle: result.enrollment.course.title,
		userId: user?.id,
		streakDay: result.dashboard.streak.currentStreak,
		completionPercentage: result.dashboard.completion.percentage,
		enrollmentStatus: result.enrollment.status,
		sourcePage: currentPath
	});
};

const trackDashboardStreakUpdate = ({ courseId, currentPath, result, user }: DashboardTrackingContext) => {
	if (!result.dashboard.streak.streakUpdated) {
		return;
	}

	trackCourseDashboardEvent({
		eventName: 'course_streak_updated',
		courseId,
		courseTitle: result.enrollment.course.title,
		userId: user?.id,
		previousStreak: result.dashboard.streak.previousStreak,
		currentStreak: result.dashboard.streak.currentStreak,
		completionPercentage: result.dashboard.completion.percentage,
		enrollmentStatus: result.enrollment.status,
		sourcePage: currentPath
	});
};

const trackDashboardCertificateEarned = ({
	courseId,
	currentPath,
	result,
	trackedCertificateEnrollmentId,
	user
}: DashboardTrackingContext) => {
	if (
		result.dashboard.completion.certificateStatus !== 'EARNED' ||
		trackedCertificateEnrollmentId === result.enrollment.id
	) {
		return trackedCertificateEnrollmentId;
	}

	trackCourseDashboardEvent({
		eventName: 'course_certificate_earned',
		courseId,
		courseTitle: result.enrollment.course.title,
		userId: user?.id,
		completionPercentage: result.dashboard.completion.percentage,
		enrollmentStatus: result.enrollment.status,
		sourcePage: currentPath
	});

	return result.enrollment.id;
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

const CourseOverviewContent = ({
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
			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
				<Stack gap={4}>
					<Heading size="lg">Dashboard temporarily unavailable</Heading>
					<Text color="text.muted">{dashboardErrorMessage}</Text>
					<Button
						borderRadius="full"
						bg="primary"
						color="text.inverse"
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

const CourseLearningPage = ({ courseId }: CourseLearningPageProps) => {
	const router = useRouter();
	const currentPath = `/my-courses/${courseId}`;
	const hasTrackedCertificateRef = useRef<string | null>(null);
	const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
	const [dashboard, setDashboard] = useState<CourseLearningDashboard | null>(null);
	const [activeTab, setActiveTab] = useState<CourseTabId>('overview');
	const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
	const [learnerName, setLearnerName] = useState('');
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isDashboardLoading, setIsDashboardLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [dashboardErrorMessage, setDashboardErrorMessage] = useState('');

	const applyDashboardResult = useCallback(
		(result: { enrollment: CourseEnrollment; dashboard: CourseLearningDashboard }, user: AuthenticatedUser | null) => {
			setEnrollment(result.enrollment);
			setDashboard(result.dashboard);
			const trackingContext = {
				courseId,
				currentPath,
				result,
				trackedCertificateEnrollmentId: hasTrackedCertificateRef.current,
				user
			};

			trackDashboardOpened(trackingContext);
			trackDashboardStreakUpdate(trackingContext);
			hasTrackedCertificateRef.current = trackDashboardCertificateEarned(trackingContext);
		},
		[courseId, currentPath]
	);

	const loadDashboard = useCallback(
		async (user: AuthenticatedUser | null) => {
			setIsDashboardLoading(true);
			setDashboardErrorMessage('');

			try {
				const result = await getCourseLearningDashboard(courseId);
				applyDashboardResult(result, user);
			} catch {
				setDashboardErrorMessage('Unable to load your course dashboard right now. Please try again.');
			} finally {
				setIsDashboardLoading(false);
			}
		},
		[applyDashboardResult, courseId]
	);

	useEffect(() => {
		let isMounted = true;

		const loadCourseWorkspace = async () => {
			try {
				const [userResult, enrollmentResult] = await Promise.all([
					getCurrentUser(),
					getCourseEnrollmentStatus(courseId)
				]);

				if (!isMounted) {
					return;
				}

				setCurrentUser(userResult.user);
				setLearnerName(userResult.user.name.split(' ')[0] ?? '');

				if (!enrollmentResult.isEnrolled || !enrollmentResult.enrollment) {
					setErrorMessage('You are not enrolled in this course yet.');
					return;
				}

				setEnrollment(enrollmentResult.enrollment);
				trackEnrollmentEvent({
					location: 'course_learning',
					eventName: 'Course Learning Page Viewed',
					courseId,
					courseTitle: enrollmentResult.enrollment.course.title,
					userId: userResult.user.id,
					isFreeCourse: enrollmentResult.enrollment.course.price === 0,
					enrollmentStatus: enrollmentResult.enrollment.status,
					sourcePage: currentPath
				});

				if (enrollmentResult.enrollment.accessUnlockedAt && isMounted) {
					await loadDashboard(userResult.user);
				}
			} catch (error) {
				if (error instanceof ApiRequestError && error.statusCode === 401) {
					router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
					return;
				}

				if (isMounted) {
					setErrorMessage('Unable to load this course right now.');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadCourseWorkspace().catch(() => undefined);

		return () => {
			isMounted = false;
		};
	}, [courseId, currentPath, loadDashboard, router]);

	const handleCourseUnlocked = useCallback(
		(updatedEnrollment: CourseEnrollment) => {
			setEnrollment(updatedEnrollment);
			setDashboard(null);
			loadDashboard(currentUser).catch(() => undefined);
		},
		[currentUser, loadDashboard]
	);

	const activeTabLabel = useMemo(() => courseTabs.find(tab => tab.id === activeTab)?.label ?? 'Overview', [activeTab]);
	const shouldShowUnlockedOverviewRail =
		activeTab === 'overview' && Boolean(enrollment?.accessUnlockedAt && dashboard && !isDashboardLoading);
	const shouldShowOverviewRail = activeTab === 'overview';

	if (isLoading) {
		return <ProfilePageSkeleton />;
	}

	if (!enrollment) {
		return (
			<Container maxW="3xl" py={{ base: 12, md: 16 }}>
				<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
					<Stack gap={4}>
						<Heading size="lg">Course access unavailable</Heading>
						<Text color="text.muted">{errorMessage}</Text>
						<HStack gap={3} flexWrap="wrap">
							<Button asChild borderRadius="full" bg="primary" color="text.inverse" _hover={{ bg: 'primaryHover' }}>
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
		<Box bg="bg.subtle" minH="100vh" w="full">
			<Box
				as="aside"
				display={{ base: 'none', lg: 'block' }}
				position="fixed"
				insetY={0}
				left={0}
				w={{ lg: '280px', '2xl': '300px' }}
				borderRight="1px solid"
				borderColor="border.default"
				zIndex={20}
			>
				<CourseWorkspaceSidebar
					activeTab={activeTab}
					currentUser={currentUser}
					enrollment={enrollment}
					onTabChange={setActiveTab}
				/>
			</Box>

			{isMobileNavOpen ? (
				<Box display={{ base: 'block', lg: 'none' }} position="fixed" inset={0} zIndex={1500}>
					<Box position="absolute" inset={0} bg="blackAlpha.600" onClick={() => setIsMobileNavOpen(false)} />
					<Box position="relative" h="100vh" w="min(320px, 88vw)" boxShadow="2xl">
						<CourseWorkspaceSidebar
							activeTab={activeTab}
							currentUser={currentUser}
							enrollment={enrollment}
							onClose={() => setIsMobileNavOpen(false)}
							onTabChange={setActiveTab}
						/>
					</Box>
				</Box>
			) : null}

			<Box ml={{ lg: '280px', '2xl': '300px' }} minH="100vh">
				<Box
					position="sticky"
					top={0}
					zIndex={10}
					borderBottom="1px solid"
					borderColor="border.default"
					bg="bg.card"
					px={{ base: 4, md: 6 }}
					py={3}
				>
					<HStack justify="space-between" gap={4} flexWrap="wrap">
						<HStack gap={3} minW={0}>
							<Button
								display={{ base: 'inline-flex', lg: 'none' }}
								variant="outline"
								size="sm"
								borderRadius="full"
								onClick={() => setIsMobileNavOpen(true)}
								aria-label="Open course navigation"
							>
								<FiMenu />
							</Button>
							<Box
								boxSize="40px"
								borderRadius="lg"
								bg="primary"
								color="text.inverse"
								display="grid"
								flexShrink={0}
								fontWeight="bold"
								placeItems="center"
							>
								S
							</Box>
							<Box minW={0}>
								<Heading size="sm" lineClamp={1}>
									{enrollment.course.title}
								</Heading>
								<Text color="text.muted" fontSize="xs">
									Enrolled on {formatDate(enrollment.enrolledAt)}
								</Text>
							</Box>
						</HStack>
						<HStack gap={2} flexWrap="wrap">
							<Badge borderRadius="full" px={3} py={1}>
								{enrollment.status}
							</Badge>
							<Badge borderRadius="full" px={3} py={1}>
								{enrollment.progressPercent}% progress
							</Badge>
							<Badge colorPalette={enrollment.accessUnlockedAt ? 'green' : 'orange'} borderRadius="full" px={3} py={1}>
								{enrollment.accessUnlockedAt ? 'Overview unlocked' : 'Overview locked'}
							</Badge>
							<Button asChild borderRadius="full" size="sm" variant="outline">
								<Link href={`/course/${courseId}`}>Back to course</Link>
							</Button>
						</HStack>
					</HStack>
				</Box>

				<Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
					<Box
						display="grid"
						gridTemplateColumns={{
							base: '1fr',
							xl: 'minmax(520px, 1fr) 300px',
							'2xl': 'minmax(680px, 1fr) 340px'
						}}
						gap={{ base: 4, xl: 5 }}
						alignItems="start"
					>
						<Box minW={0}>
							{activeTab === 'overview' ? (
								<CourseOverviewContent
									courseId={courseId}
									currentUser={currentUser}
									dashboard={dashboard}
									dashboardErrorMessage={dashboardErrorMessage}
									enrollment={enrollment}
									isDashboardLoading={isDashboardLoading}
									learnerName={learnerName}
									onDashboardRetry={() => {
										loadDashboard(currentUser).catch(() => undefined);
									}}
									onTabChange={setActiveTab}
									onUnlocked={handleCourseUnlocked}
								/>
							) : (
								<CoursePlaceholderTab label={activeTabLabel} />
							)}
						</Box>

						<Box
							display={{ base: shouldShowOverviewRail ? 'block' : 'none' }}
							position={{ xl: 'sticky' }}
							top={{ xl: '96px' }}
						>
							{shouldShowUnlockedOverviewRail && dashboard ? (
								<CourseUnlockedOverviewRail
									courseId={courseId}
									currentUser={currentUser}
									dashboard={dashboard}
									enrollment={enrollment}
								/>
							) : (
								<CourseNextStepsPanel />
							)}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default CourseLearningPage;
