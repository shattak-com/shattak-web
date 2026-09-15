'use client';

import { Badge, Box, Button, Container, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiArrowRight, FiBookOpen, FiCheckCircle, FiLogOut, FiPlayCircle } from 'react-icons/fi';

import {
	identifyAuthenticatedMixpanelUser,
	resetMixpanelIdentity,
	trackCtaClicked,
	trackEnrollmentEvent,
	trackProfileEvent
} from '~/lib/analytics/mixpanel';
import { logout, type AuthenticatedUser } from '~/lib/api/auth';
import { listMyCourseEnrollments, type CourseEnrollment } from '~/lib/api/enrollments';
import { getOnboardingStatus, type OnboardingProfile } from '~/lib/api/onboarding';
import UserAvatar from '~/lib/components/auth/UserAvatar';
import { SkeletonBlock } from '~/lib/components/feedback/LoadingStates';
import { EnrolledCoursesEmptyState, EnrolledCoursesGrid } from '~/lib/containers/profile/components/EnrolledCourses';
import LearningProfileSection from '~/lib/containers/profile/components/LearningProfileSection';
import { getProtectedUserRouteRedirectPath } from '~/lib/utils/onboarding';
import { clearCachedOnboardingStatus } from '~/lib/utils/onboarding-session';

const profileCoursePreviewLimit = 3;

const getDisplayName = (user: AuthenticatedUser) => user.name.trim() || user.email;

const ProfileDashboardSkeleton = () => (
	<Box as="main" minH="calc(100vh - 72px)" bg="bg.surface">
		<Container maxW="6xl" py={{ base: 8, md: 12 }}>
			<Stack gap={{ base: 6, md: 8 }}>
				<SkeletonBlock h={{ base: '300px', lg: '220px' }} borderRadius="surface" />
				<Box border="1px solid" borderColor="border.default" borderRadius="surface" bg="bg.card" p={{ base: 5, md: 7 }}>
					<Stack gap={6}>
						<Stack gap={3}>
							<SkeletonBlock h="14px" w="128px" />
							<SkeletonBlock h="30px" w="240px" maxW="80%" />
							<SkeletonBlock h="16px" w="480px" maxW="100%" />
						</Stack>
						<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: 5, lg: 6 }}>
							{Array.from({ length: 3 }, (_, index) => (
								<SkeletonBlock key={index} h="480px" borderRadius="card" />
							))}
						</SimpleGrid>
					</Stack>
				</Box>
				<SkeletonBlock h="320px" borderRadius="surface" />
			</Stack>
		</Container>
	</Box>
);

const ProfileStat = ({ icon, label, value }: { icon: ReactNode; label: string; value: number }) => (
	<Box border="1px solid" borderColor="border.default" borderRadius="panel" bg="bg.card" p={{ base: 3, md: 4 }}>
		<HStack gap={2} color="primary" fontSize="lg" aria-hidden="true">
			{icon}
		</HStack>
		<Text mt={3} fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" lineHeight="none">
			{value}
		</Text>
		<Text mt={1.5} color="text.muted" fontSize="xs" fontWeight="semibold">
			{label}
		</Text>
	</Box>
);

const ProfileHero = ({
	currentUser,
	displayName,
	enrollments
}: {
	currentUser: AuthenticatedUser;
	displayName: string;
	enrollments: CourseEnrollment[];
}) => {
	const completedCourses = enrollments.filter(
		enrollment => enrollment.status === 'COMPLETED' || enrollment.progressPercent === 100
	).length;
	const coursesInProgress = enrollments.filter(
		enrollment => enrollment.status === 'ACTIVE' && enrollment.progressPercent < 100
	).length;

	return (
		<Box
			as="section"
			border="1px solid"
			borderColor="border.accentSoft"
			borderRadius="surface"
			bgGradient="var(--chakra-gradients-cta-surface)"
			_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
			p={{ base: 5, md: 7, lg: 8 }}
			boxShadow="elevated"
		>
			<SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 6, lg: 8 }} alignItems="center">
				<HStack gap={{ base: 4, md: 5 }} align="center" minW={0}>
					<UserAvatar user={currentUser} label={displayName} size="88px" />
					<Box minW={0}>
						<Badge bg="bg.brand" color="text.brand" borderRadius="full" px={3} py={1}>
							Learner profile
						</Badge>
						<Heading mt={3} fontSize={{ base: '2xl', md: '3xl' }} lineHeight="title" lineClamp={2}>
							{displayName}
						</Heading>
						<Text mt={1.5} color="text.muted" fontSize={{ base: 'sm', md: 'md' }} overflowWrap="anywhere">
							{currentUser.email}
						</Text>
						<Badge mt={3} bg="bg.success" color="text.secondary" borderRadius="full" px={2.5} py={1}>
							{currentUser.status} ACCOUNT
						</Badge>
					</Box>
				</HStack>

				<SimpleGrid columns={3} gap={{ base: 2, sm: 3 }}>
					<ProfileStat icon={<FiBookOpen />} label="Enrolled" value={enrollments.length} />
					<ProfileStat icon={<FiPlayCircle />} label="In progress" value={coursesInProgress} />
					<ProfileStat icon={<FiCheckCircle />} label="Completed" value={completedCourses} />
				</SimpleGrid>
			</SimpleGrid>
		</Box>
	);
};

const EnrolledCoursesPreview = ({ enrollments }: { enrollments: CourseEnrollment[] }) => {
	const visibleEnrollments = enrollments.slice(0, profileCoursePreviewLimit);
	const hasMoreCourses = enrollments.length > profileCoursePreviewLimit;

	return (
		<Box
			as="section"
			aria-labelledby="profile-enrolled-courses-title"
			border="1px solid"
			borderColor="border.default"
			borderRadius="surface"
			bg="bg.card"
			p={{ base: 5, md: 7 }}
		>
			<Stack gap={6}>
				<Box>
					<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
						Continue learning
					</Text>
					<Heading id="profile-enrolled-courses-title" mt={2} size={{ base: 'lg', md: 'xl' }}>
						Enrolled courses
					</Heading>
					<Text mt={2} color="text.muted" fontSize="sm" lineHeight="body">
						Resume a course or review your progress from where you left off.
					</Text>
				</Box>

				{visibleEnrollments.length ? (
					<EnrolledCoursesGrid enrollments={visibleEnrollments} sourcePage="/profile" />
				) : (
					<EnrolledCoursesEmptyState />
				)}

				{hasMoreCourses ? (
					<HStack justify="center">
						<Button asChild minH="44px" borderRadius="full" variant="outline" px={6}>
							<Link
								href="/my-courses"
								onClick={() =>
									trackCtaClicked({
										label: 'View All Courses',
										location: 'profile_enrolled_courses',
										destination: '/my-courses',
										context: 'profile_preview'
									})
								}
							>
								View all courses
								<FiArrowRight />
							</Link>
						</Button>
					</HStack>
				) : null}
			</Stack>
		</Box>
	);
};

const ProfilePage = () => {
	const router = useRouter();
	const hasTrackedProfileViewRef = useRef(false);
	const hasTrackedCoursesViewRef = useRef(false);
	const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
	const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfile | null>(null);
	const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const displayName = useMemo(() => (currentUser ? getDisplayName(currentUser) : ''), [currentUser]);

	useEffect(() => {
		let isMounted = true;

		Promise.all([
			getOnboardingStatus(),
			listMyCourseEnrollments().catch(() => ({
				enrollments: []
			}))
		])
			.then(([result, enrollmentResult]) => {
				if (!isMounted) {
					return;
				}

				const redirectPath = getProtectedUserRouteRedirectPath(result.profile);
				if (redirectPath) {
					router.replace(redirectPath);
					return;
				}

				setCurrentUser(result.user);
				setOnboardingProfile(result.profile);
				setEnrollments(enrollmentResult.enrollments);
				identifyAuthenticatedMixpanelUser({
					userId: result.user.id,
					email: result.user.email,
					name: result.user.name,
					roles: result.user.roles,
					status: result.user.status,
					authContext: 'user',
					onboardingNextStep: result.profile.nextStep
				});

				if (!hasTrackedProfileViewRef.current) {
					hasTrackedProfileViewRef.current = true;
					trackProfileEvent({
						location: 'profile_account',
						eventName: 'Profile Viewed',
						hasMobileNumber: Boolean(result.profile.mobileNumberE164),
						hasCollege: Boolean(result.profile.college),
						hasDepartment: Boolean(result.profile.department),
						hasPassoutYear: Boolean(result.profile.passoutYear),
						interestsCount: result.profile.interests.length
					});
				}

				if (!hasTrackedCoursesViewRef.current) {
					hasTrackedCoursesViewRef.current = true;
					trackEnrollmentEvent({
						location: 'profile_enrolled_courses',
						eventName: 'Enrolled Courses Section Viewed',
						userId: result.user.id,
						enrollmentStatus: enrollmentResult.enrollments.length ? 'HAS_ENROLLMENTS' : 'EMPTY',
						sourcePage: '/profile'
					});
				}
			})
			.catch(() => {
				if (isMounted) {
					setCurrentUser(null);
					setOnboardingProfile(null);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [router]);

	const handleLogout = useCallback(async () => {
		setIsLoggingOut(true);
		setErrorMessage('');
		trackProfileEvent({
			location: 'profile_account',
			eventName: 'Logout Started',
			hasMobileNumber: Boolean(onboardingProfile?.mobileNumberE164),
			hasCollege: Boolean(onboardingProfile?.college),
			hasDepartment: Boolean(onboardingProfile?.department),
			hasPassoutYear: Boolean(onboardingProfile?.passoutYear),
			interestsCount: onboardingProfile?.interests.length
		});

		try {
			await logout();
			clearCachedOnboardingStatus();
			window.google?.accounts.id.disableAutoSelect();
			trackProfileEvent({ location: 'profile_account', eventName: 'Logout Succeeded' });
			resetMixpanelIdentity();
			router.replace('/login');
		} catch {
			setErrorMessage('Unable to log out. Please try again.');
			trackProfileEvent({
				location: 'profile_account',
				eventName: 'Logout Failed',
				errorType: 'api_error'
			});
		} finally {
			setIsLoggingOut(false);
		}
	}, [onboardingProfile, router]);

	if (isLoading) {
		return <ProfileDashboardSkeleton />;
	}

	let content: ReactNode;

	if (currentUser) {
		content = (
			<Stack gap={{ base: 6, md: 8 }}>
				<ProfileHero currentUser={currentUser} displayName={displayName} enrollments={enrollments} />
				<EnrolledCoursesPreview enrollments={enrollments} />
				<LearningProfileSection
					profile={onboardingProfile}
					onProfileUpdated={setOnboardingProfile}
					onRefreshRequested={() => router.refresh()}
				/>

				<Box
					as="section"
					border="1px solid"
					borderColor="border.default"
					borderRadius="card"
					bg="bg.card"
					p={{ base: 5, md: 6 }}
				>
					<Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ sm: 'center' }} gap={4}>
						<Box>
							<Heading size="md">Account access</Heading>
							<Text mt={1.5} color="text.muted" fontSize="sm">
								Sign out securely when you are finished on this device.
							</Text>
						</Box>
						<Button
							minH="44px"
							borderRadius="full"
							variant="outline"
							color="text.primary"
							onClick={() => {
								handleLogout().catch(() => undefined);
							}}
							disabled={isLoggingOut}
							loading={isLoggingOut}
							loadingText="Logging out"
						>
							<FiLogOut />
							Logout
						</Button>
					</Stack>
					{errorMessage ? (
						<Text mt={4} color="red.500" fontSize="sm" role="alert">
							{errorMessage}
						</Text>
					) : null}
				</Box>
			</Stack>
		);
	} else {
		content = (
			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 6, md: 8 }}>
				<Stack gap={5} align="flex-start">
					<Heading size="lg">Login required</Heading>
					<Text color="text.muted">Please log in to view your profile.</Text>
					<Button asChild bg="primary" color="text.inverse" borderRadius="full">
						<Link href="/login">Go to login</Link>
					</Button>
				</Stack>
			</Box>
		);
	}

	return (
		<Box as="main" minH="calc(100vh - 72px)" bg="bg.surface">
			<Container maxW="6xl" py={{ base: 8, md: 12 }}>
				{content}
			</Container>
		</Box>
	);
};

export default ProfilePage;
