'use client';

import { Badge, Box, Button, Container, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
	FiAward,
	FiBookOpen,
	FiCheckCircle,
	FiClipboard,
	FiExternalLink,
	FiGift,
	FiLock,
	FiMessageCircle,
	FiPlayCircle
} from 'react-icons/fi';

import { trackEnrollmentEvent } from '~/lib/analytics/mixpanel';
import { getCurrentUser } from '~/lib/api/auth';
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

type CourseOverviewTabProps = {
	enrollment: CourseEnrollment;
	courseId: string;
	learnerName: string;
	onUnlocked: (enrollment: CourseEnrollment) => void;
};

const CourseOverviewTab = ({ enrollment, courseId, learnerName, onUnlocked }: CourseOverviewTabProps) => {
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

const CourseLearningPage = ({ courseId }: CourseLearningPageProps) => {
	const router = useRouter();
	const currentPath = `/my-courses/${courseId}`;
	const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
	const [activeTab, setActiveTab] = useState<CourseTabId>('overview');
	const [learnerName, setLearnerName] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		getCurrentUser()
			.then(result => {
				if (isMounted) {
					setLearnerName(result.user.name.split(' ')[0] ?? '');
				}
			})
			.catch(() => undefined);

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
		<Box bg="bg.subtle" minH="calc(100vh - 72px)" w="full">
			<Stack gap={0}>
				<Box borderBottom="1px solid" borderColor="border.default" bg="bg.card" px={{ base: 4, md: 6 }} py={3}>
					<HStack justify="space-between" gap={4} flexWrap="wrap">
						<HStack gap={3} minW={0}>
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
							lg: '280px minmax(0, 1fr)',
							xl: '280px minmax(520px, 1fr) 300px',
							'2xl': '300px minmax(680px, 1fr) 340px'
						}}
						gap={{ base: 4, xl: 5 }}
						alignItems="start"
					>
						<Stack
							border="1px solid"
							borderColor="border.default"
							borderRadius="card"
							bg="bg.card"
							p={{ base: 3, md: 4 }}
							gap={2}
							boxShadow="soft"
							position={{ lg: 'sticky' }}
							top={{ lg: '88px' }}
							minH={{ lg: 'calc(100vh - 128px)' }}
						>
							<Box px={3} pt={2} pb={3}>
								<Text color="text.muted" fontSize="xs" fontWeight="bold" textTransform="uppercase">
									Course dashboard
								</Text>
								<Text mt={1} color="text.muted" fontSize="sm" lineClamp={2}>
									{enrollment.course.summary || 'Your course workspace'}
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
										borderRadius="xl"
										variant={isActive ? 'solid' : 'ghost'}
										bg={isActive ? 'primary' : undefined}
										color={isActive ? 'text.inverse' : 'text.primary'}
										minH="52px"
										px={4}
										onClick={() => setActiveTab(tab.id)}
									>
										<HStack gap={3}>
											<Icon />
											<Text as="span" fontWeight="semibold">
												{tab.label}
											</Text>
										</HStack>
										{showLock && !isActive ? <FiLock /> : null}
									</Button>
								);
							})}
						</Stack>

						<Box minW={0}>
							{activeTab === 'overview' ? (
								<CourseOverviewTab
									enrollment={enrollment}
									courseId={courseId}
									learnerName={learnerName}
									onUnlocked={setEnrollment}
								/>
							) : (
								<CoursePlaceholderTab label={activeTabLabel} />
							)}
						</Box>

						<Box
							display={{
								base: activeTab === 'overview' ? 'block' : 'none',
								xl: activeTab === 'overview' ? 'block' : 'none'
							}}
						>
							<CourseNextStepsPanel />
						</Box>
					</Box>
				</Box>
			</Stack>
		</Box>
	);
};

export default CourseLearningPage;
