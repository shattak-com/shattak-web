'use client';

import { Badge, Box, Button, Container, Heading, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FiAward, FiBookOpen, FiClipboard, FiGift, FiLock, FiMessageCircle, FiPlayCircle } from 'react-icons/fi';

import { trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import { ApiRequestError } from '~/lib/api/client';
import { getCourseEnrollmentStatus, type CourseEnrollment, unlockCourseAccess } from '~/lib/api/enrollments';
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

const CoursePlaceholderTab = ({ label }: { label: string }) => (
	<Box border="1px dashed" borderColor="border.default" borderRadius="card" bg="bg.subtle" p={{ base: 5, md: 6 }}>
		<Stack gap={3}>
			<HStack gap={2}>
				<FiLock />
				<Heading size="md">{label}</Heading>
			</HStack>
			<Text color="text.muted">
				This section is prepared for the next phase of course delivery. The content and interactions will be connected
				after the overview access flow is finalized.
			</Text>
		</Stack>
	</Box>
);

type CourseOverviewTabProps = {
	enrollment: CourseEnrollment;
	courseId: string;
	onUnlocked: (enrollment: CourseEnrollment) => void;
};

const CourseOverviewTab = ({ enrollment, courseId, onUnlocked }: CourseOverviewTabProps) => {
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
		<SimpleGrid columns={{ base: 1, lg: 2 }} gap={5} alignItems="start">
			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
				<Stack gap={5}>
					<Box>
						<Badge colorPalette={isUnlocked ? 'green' : 'orange'}>{isUnlocked ? 'Access confirmed' : 'Locked'}</Badge>
						<Heading mt={3} size="lg">
							{isUnlocked ? 'Welcome to the course workspace' : 'Join the course WhatsApp group'}
						</Heading>
						<Text mt={2} color="text.muted">
							{isUnlocked
								? 'Your WhatsApp group access has been confirmed. The remaining course sections will be connected in the next phase.'
								: 'Start by joining the course community. The access code is shared inside the WhatsApp group so we can confirm that you joined the correct cohort.'}
						</Text>
					</Box>

					<Stack gap={3} color="text.muted" fontSize="sm">
						<Text>1. Scan the QR code or open the WhatsApp invitation link.</Text>
						<Text>2. Join the official course group.</Text>
						<Text>3. Find the course access code shared in the group.</Text>
						<Text>4. Enter the code here and click &quot;I have joined&quot;.</Text>
					</Stack>

					{hasInviteLink ? (
						<Button asChild borderRadius="full" w="fit-content" variant="outline">
							<Link href={course.whatsappGroupUrl} target="_blank" rel="noopener noreferrer">
								Open WhatsApp Group
							</Link>
						</Button>
					) : (
						<Text color="red.500" fontSize="sm">
							The WhatsApp group link is not configured for this course yet.
						</Text>
					)}
				</Stack>
			</Box>

			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
				<Stack gap={5}>
					<QrCodePreview value={course.whatsappGroupUrl} label="WhatsApp group QR" size={190} />

					<Stack gap={2}>
						<Text fontSize="sm" fontWeight="semibold">
							Access code
						</Text>
						<Input
							value={accessCode}
							onChange={event => setAccessCode(event.currentTarget.value)}
							placeholder="Enter code from WhatsApp group"
							disabled={isUnlocked}
						/>
					</Stack>

					<Button
						borderRadius="full"
						bg="primary"
						color="text.inverse"
						_hover={{ bg: 'primaryHover' }}
						loading={isSubmitting}
						disabled={isUnlocked || !accessCode.trim()}
						onClick={() => {
							handleUnlock().catch(() => undefined);
						}}
					>
						{isUnlocked ? 'Access confirmed' : 'I have joined'}
					</Button>

					{message ? (
						<Text fontSize="sm" color={isUnlocked ? 'green.500' : 'red.500'}>
							{message}
						</Text>
					) : null}
				</Stack>
			</Box>
		</SimpleGrid>
	);
};

const CourseLearningPage = ({ courseId }: CourseLearningPageProps) => {
	const router = useRouter();
	const currentPath = `/my-courses/${courseId}`;
	const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
	const [activeTab, setActiveTab] = useState<CourseTabId>('overview');
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		getCourseEnrollmentStatus(courseId)
			.then(result => {
				if (!isMounted) {
					return;
				}

				if (!result.isEnrolled || !result.enrollment) {
					setErrorMessage('You are not enrolled in this course yet.');
					return;
				}

				setEnrollment(result.enrollment);
				trackEnrollmentEvent({
					location: 'course_learning',
					eventName: 'Course Learning Page Viewed',
					courseId,
					courseTitle: result.enrollment.course.title,
					isFreeCourse: result.enrollment.course.price === 0,
					enrollmentStatus: result.enrollment.status,
					sourcePage: currentPath
				});
			})
			.catch(error => {
				if (error instanceof ApiRequestError && error.statusCode === 401) {
					router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
					return;
				}

				if (isMounted) {
					setErrorMessage('Unable to load this course right now.');
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
	}, [courseId, currentPath, router]);

	const activeTabLabel = useMemo(() => courseTabs.find(tab => tab.id === activeTab)?.label ?? 'Overview', [activeTab]);

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
		<Container maxW="7xl" py={{ base: 6, md: 8 }}>
			<Stack gap={5}>
				<Box border="1px solid" borderColor="border.default" borderRadius="surface" bg="bg.card" p={{ base: 5, md: 6 }}>
					<Stack gap={3}>
						<HStack gap={2} flexWrap="wrap">
							<Badge>{enrollment.status}</Badge>
							<Badge>{enrollment.progressPercent}% progress</Badge>
							<Badge colorPalette={enrollment.accessUnlockedAt ? 'green' : 'orange'}>
								{enrollment.accessUnlockedAt ? 'Overview unlocked' : 'Overview locked'}
							</Badge>
						</HStack>
						<Box>
							<Text fontSize="xs" fontWeight="bold" color="primary" textTransform="uppercase">
								My Course
							</Text>
							<Heading mt={2} size="xl" lineHeight="short">
								{enrollment.course.title}
							</Heading>
							<Text mt={3} color="text.muted" maxW="3xl">
								{enrollment.course.summary || 'Your enrolled course workspace is ready.'}
							</Text>
							<Text mt={2} fontSize="sm" color="text.muted">
								Enrolled on {formatDate(enrollment.enrolledAt)}
							</Text>
						</Box>
					</Stack>
				</Box>

				<Box display="grid" gridTemplateColumns={{ base: '1fr', lg: '260px 1fr' }} gap={5} alignItems="start">
					<Stack border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={3} gap={2}>
						{courseTabs.map(tab => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;

							return (
								<Button
									key={tab.id}
									justifyContent="flex-start"
									gap={3}
									borderRadius="lg"
									variant={isActive ? 'solid' : 'ghost'}
									bg={isActive ? 'primary' : undefined}
									color={isActive ? 'text.inverse' : undefined}
									onClick={() => setActiveTab(tab.id)}
								>
									<Icon />
									{tab.label}
								</Button>
							);
						})}
					</Stack>

					<Box>
						{activeTab === 'overview' ? (
							<CourseOverviewTab enrollment={enrollment} courseId={courseId} onUnlocked={setEnrollment} />
						) : (
							<CoursePlaceholderTab label={activeTabLabel} />
						)}
					</Box>
				</Box>
			</Stack>
		</Container>
	);
};

export default CourseLearningPage;
