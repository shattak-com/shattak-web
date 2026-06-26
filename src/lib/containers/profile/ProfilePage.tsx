'use client';

import {
	Badge,
	Box,
	Button,
	Container,
	Heading,
	HStack,
	Image as ChakraImage,
	SimpleGrid,
	Stack,
	Text
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
	identifyAuthenticatedMixpanelUser,
	resetMixpanelIdentity,
	trackEnrollmentEvent,
	trackProfileEvent
} from '~/lib/analytics/mixpanel';
import { logout, type AuthenticatedUser } from '~/lib/api/auth';
import { listMyCourseEnrollments, type CourseEnrollment } from '~/lib/api/enrollments';
import { getOnboardingStatus, type OnboardingProfile } from '~/lib/api/onboarding';
import UserAvatar from '~/lib/components/auth/UserAvatar';
import { ProfilePageSkeleton } from '~/lib/components/feedback/LoadingStates';
import LearningProfileSection from '~/lib/containers/profile/components/LearningProfileSection';
import { getProtectedUserRouteRedirectPath } from '~/lib/utils/onboarding';
import { clearCachedOnboardingStatus } from '~/lib/utils/onboarding-session';

const getDisplayName = (user: AuthenticatedUser) => user.name.trim() || user.email;

const formatDate = (value: string) =>
	new Intl.DateTimeFormat('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(new Date(value));

const EnrolledCourseCard = ({ enrollment }: { enrollment: CourseEnrollment }) => {
	const courseImage = enrollment.course.promoImage || enrollment.course.thumbnailImage;
	const learningPath = `/my-courses/${encodeURIComponent(enrollment.course.slug)}`;

	return (
		<Box
			border="1px solid"
			borderColor="border.default"
			borderRadius="card"
			bg="bg.card"
			overflow="hidden"
			boxShadow="soft"
		>
			<Box h="160px" bg="bg.accent" overflow="hidden">
				{courseImage ? (
					<ChakraImage src={courseImage} alt={enrollment.course.title} w="100%" h="100%" objectFit="cover" />
				) : (
					<Box h="100%" display="flex" alignItems="center" justifyContent="center">
						<Text color="text.muted" fontSize="sm">
							Course preview
						</Text>
					</Box>
				)}
			</Box>
			<Stack gap={4} p={4}>
				<Stack gap={2}>
					<HStack gap={2} flexWrap="wrap">
						<Badge>{enrollment.status}</Badge>
						<Badge>{enrollment.progressPercent}% progress</Badge>
					</HStack>
					<Text fontWeight="bold" fontSize="lg" lineHeight="short">
						{enrollment.course.title}
					</Text>
					<Text color="text.muted" fontSize="sm" lineClamp={2}>
						{enrollment.course.summary || 'Continue your enrolled Shattak learning experience.'}
					</Text>
				</Stack>
				<Text color="text.muted" fontSize="xs">
					Enrolled {formatDate(enrollment.enrolledAt)}
				</Text>
				<Button asChild bg="primary" color="text.inverse" _hover={{ bg: 'primaryHover' }} borderRadius="full" w="full">
					<Link
						href={learningPath}
						onClick={() =>
							trackEnrollmentEvent({
								location: 'profile_enrolled_courses',
								eventName: 'Go To Course Clicked',
								courseId: enrollment.course.slug,
								courseTitle: enrollment.course.title,
								isFreeCourse: enrollment.course.price === 0,
								enrollmentStatus: enrollment.status,
								sourcePage: '/profile',
								destination: learningPath
							})
						}
					>
						Continue Learning
					</Link>
				</Button>
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
				if (isMounted) {
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
			trackProfileEvent({
				location: 'profile_account',
				eventName: 'Logout Succeeded'
			});
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
		return <ProfilePageSkeleton />;
	}

	let content: ReactNode;

	if (currentUser) {
		content = (
			<Stack gap={8}>
				<Box
					border="1px solid"
					borderColor="border.default"
					borderRadius="surface"
					bgGradient="var(--chakra-gradients-cta-surface)"
					_dark={{ bgGradient: 'var(--chakra-gradients-cta-surface-dark)' }}
					p={{ base: 5, md: 7 }}
					boxShadow="soft"
				>
					<HStack gap={5} align="center" flexWrap="wrap">
						<UserAvatar user={currentUser} label={displayName} size="78px" />
						<Box>
							<Text fontSize="xs" fontWeight="bold" color="primary" textTransform="uppercase">
								Learning profile
							</Text>
							<Heading mt={2} size="xl">
								{displayName}
							</Heading>
							<Text mt={1} color="text.muted">
								{currentUser.email}
							</Text>
						</Box>
						<Box flex="1" />
						<Box
							minW={{ base: '100%', md: '240px' }}
							border="1px solid"
							borderColor="border.default"
							borderRadius="card"
							p={4}
							bg="bg.card"
						>
							<SimpleGrid columns={2} gap={4}>
								<Box>
									<Text fontSize="xs" color="text.muted">
										Account
									</Text>
									<Badge mt={1}>{currentUser.status}</Badge>
								</Box>
								<Box>
									<Text fontSize="xs" color="text.muted">
										Courses
									</Text>
									<Text mt={1} fontWeight="bold">
										{enrollments.length}
									</Text>
								</Box>
							</SimpleGrid>
						</Box>
					</HStack>
				</Box>

				<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
					<HStack justify="space-between" gap={4} align="flex-start" mb={5}>
						<Box>
							<Heading size="md">Enrolled Courses</Heading>
							<Text mt={1} color="text.muted" fontSize="sm">
								Continue learning from the courses added to your account.
							</Text>
						</Box>
					</HStack>
					{enrollments.length ? (
						<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
							{enrollments.map(enrollment => (
								<EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
							))}
						</SimpleGrid>
					) : (
						<Box border="1px dashed" borderColor="border.default" borderRadius="card" p={6} textAlign="center">
							<Heading size="sm">No enrolled courses yet</Heading>
							<Text mt={2} color="text.muted" fontSize="sm">
								Explore available Shattak courses and enroll in a free course to start learning.
							</Text>
							<Button asChild mt={4} borderRadius="full" variant="outline">
								<Link href="/">Browse courses</Link>
							</Button>
						</Box>
					)}
				</Box>

				<LearningProfileSection
					profile={onboardingProfile}
					onProfileUpdated={setOnboardingProfile}
					onRefreshRequested={() => router.refresh()}
				/>

				<Stack gap={3} align="flex-start">
					<Button
						bg="primary"
						color="text.inverse"
						_hover={{ bg: 'primaryHover' }}
						borderRadius="full"
						onClick={() => {
							handleLogout().catch(() => undefined);
						}}
						disabled={isLoggingOut}
					>
						{isLoggingOut ? 'Logging out...' : 'Logout'}
					</Button>
					{errorMessage ? (
						<Text color="red.500" fontSize="sm">
							{errorMessage}
						</Text>
					) : null}
				</Stack>
			</Stack>
		);
	} else {
		content = (
			<Stack gap={5}>
				<Heading size="lg">Login required</Heading>
				<Text color="text.muted">Please log in to view your profile.</Text>
				<Button asChild bg="primary" color="text.inverse" borderRadius="full" w="fit-content">
					<Link href="/login">Go to login</Link>
				</Button>
			</Stack>
		);
	}

	return (
		<Container maxW="7xl" py={{ base: 10, md: 14 }}>
			{content}
		</Container>
	);
};

export default ProfilePage;
