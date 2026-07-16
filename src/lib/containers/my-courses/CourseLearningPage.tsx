'use client';

import { Badge, Box, Button, Container, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	FiAward,
	FiBookOpen,
	FiCheck,
	FiCheckCircle,
	FiChevronDown,
	FiChevronLeft,
	FiChevronRight,
	FiClipboard,
	FiExternalLink,
	FiFileText,
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
	completeCourseLesson,
	getCourseEnrollmentStatus,
	getCourseLearningDashboard,
	getCourseLessons,
	type CourseEnrollment,
	type CourseLearningDashboard,
	type CourseLessonContentBlock,
	type CourseLessonModule,
	type CourseLessonsResult,
	type CourseLessonsState,
	unlockCourseAccess
} from '~/lib/api/enrollments';
import UserAvatar from '~/lib/components/auth/UserAvatar';
import { ProfilePageSkeleton } from '~/lib/components/feedback/LoadingStates';
import QrCodePreview from '~/lib/components/forms/QrCodePreview';
import { LessonMarkdownContent } from '~/lib/components/learning/lesson-content/LessonMarkdownContent';
import { getSafeExternalUrl, getYouTubeVideoId } from '~/lib/components/learning/lesson-content/lesson-content-urls';
import { PdfPreview } from '~/lib/components/learning/lesson-content/PdfPreview';
import { PresentationPreview } from '~/lib/components/learning/lesson-content/PresentationPreview';
import ThemeToggle from '~/lib/components/ThemeToggle';

type CourseLearningPageProps = {
	courseId: string;
};

type CourseTabId = 'overview' | 'lessons' | 'recordings' | 'bonus' | 'assignment' | 'certificate' | 'peerNetwork';

const courseTabs: Array<{ id: CourseTabId; label: string; icon: typeof FiBookOpen }> = [
	{ id: 'overview', label: 'Overview', icon: FiBookOpen },
	{ id: 'lessons', label: 'Lessons', icon: FiPlayCircle },
	{ id: 'recordings', label: 'Session Recordings', icon: FiPlayCircle },
	{ id: 'bonus', label: 'Bonus Content', icon: FiGift },
	{ id: 'assignment', label: 'Assignments', icon: FiClipboard },
	{ id: 'certificate', label: 'Certificate', icon: FiAward },
	{ id: 'peerNetwork', label: 'Peer Community', icon: FiMessageCircle }
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

const isAdminLearner = (user: AuthenticatedUser | null) =>
	user?.roles.some(role => role === 'ADMIN' || role === 'SUPER_ADMIN') ?? false;

const getActiveLessonContext = (lessons: CourseLessonsState | null) => {
	if (!lessons) {
		return null;
	}

	return (
		lessons.modules
			.flatMap(courseModule => courseModule.subsections.map(subsection => ({ courseModule, subsection })))
			.find(item => item.subsection.id === lessons.activeSubsectionId) ?? null
	);
};

const flattenLessonRows = (modules: CourseLessonModule[]) =>
	modules.flatMap(courseModule => courseModule.subsections.map(subsection => ({ courseModule, subsection })));

const getNextLessonRow = (lessons: CourseLessonsState, subsectionId: string) => {
	const rows = flattenLessonRows(lessons.modules);
	const currentIndex = rows.findIndex(row => row.subsection.id === subsectionId);

	return currentIndex >= 0 ? (rows[currentIndex + 1] ?? null) : null;
};

const getPreviousUnlockedLessonRow = (lessons: CourseLessonsState, subsectionId: string) => {
	const rows = flattenLessonRows(lessons.modules);
	const currentIndex = rows.findIndex(row => row.subsection.id === subsectionId);

	if (currentIndex <= 0) {
		return null;
	}

	return [...rows.slice(0, currentIndex)].reverse().find(row => !row.subsection.isLocked) ?? null;
};

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

const LessonResourceCard = ({
	block,
	label,
	children,
	showOpenAction = true
}: {
	block: CourseLessonContentBlock;
	label: string;
	children?: ReactNode;
	showOpenAction?: boolean;
}) => {
	const safeUrl = getSafeExternalUrl(block.url);

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" overflow="hidden">
			<Stack gap={4} p={{ base: 4, md: 5 }}>
				<HStack justify="space-between" gap={4} align="start">
					<HStack gap={3} minW={0}>
						<Box
							boxSize="42px"
							borderRadius="lg"
							bg="bg.subtle"
							color="primary"
							display="grid"
							flexShrink={0}
							placeItems="center"
						>
							<FiFileText />
						</Box>
						<Box minW={0}>
							<Text color="text.muted" fontSize="xs" fontWeight="bold" textTransform="uppercase">
								{label}
							</Text>
							<Heading mt={1} size="sm" lineClamp={2}>
								{block.title || block.fileName || label}
							</Heading>
						</Box>
					</HStack>
					{safeUrl && showOpenAction ? (
						<Button asChild size="sm" variant="outline" borderRadius="full" flexShrink={0}>
							<Link href={safeUrl} target="_blank" rel="noopener noreferrer">
								Open <FiExternalLink />
							</Link>
						</Button>
					) : null}
				</HStack>
				{children}
				{!safeUrl ? (
					<Text color="red.500" fontSize="sm">
						This resource is missing a valid URL.
					</Text>
				) : null}
			</Stack>
		</Box>
	);
};

const TextLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => (
	<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 7 }}>
		{block.title ? (
			<Heading size="md" mb={4}>
				{block.title}
			</Heading>
		) : null}
		<LessonMarkdownContent value={block.body} />
	</Box>
);

const YouTubeLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const videoId = getYouTubeVideoId(block.url);

	return (
		<LessonResourceCard block={block} label="YouTube video">
			{videoId ? (
				<Box aspectRatio="16 / 9" borderRadius="lg" overflow="hidden" bg="black">
					<iframe
						title={block.title || 'YouTube lesson video'}
						src={`https://www.youtube-nocookie.com/embed/${videoId}`}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						style={{ border: 0, height: '100%', width: '100%' }}
					/>
				</Box>
			) : (
				<Text color="red.500" fontSize="sm">
					Enter a valid YouTube URL to preview this video.
				</Text>
			)}
		</LessonResourceCard>
	);
};

const UploadedVideoLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const safeUrl = getSafeExternalUrl(block.url);

	return (
		<LessonResourceCard block={block} label="Uploaded video">
			{safeUrl ? (
				<>
					{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
					<video
						controls
						src={safeUrl}
						style={{
							background: '#000',
							borderRadius: 'var(--chakra-radii-lg)',
							maxHeight: '520px',
							width: '100%'
						}}
					/>
				</>
			) : null}
		</LessonResourceCard>
	);
};

const PdfLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const safeUrl = getSafeExternalUrl(block.url);

	return (
		<LessonResourceCard block={block} label={block.type === 'PDF_UPLOAD' ? 'Uploaded PDF' : 'PDF link'}>
			{safeUrl ? <PdfPreview url={safeUrl} height={560} title={block.title || 'PDF lesson resource'} /> : null}
		</LessonResourceCard>
	);
};

const PresentationLessonBlock = ({ block }: { block: CourseLessonContentBlock }) => {
	const safeUrl = getSafeExternalUrl(block.url);
	const label = block.type === 'PPT_UPLOAD' ? 'Uploaded presentation' : 'Presentation link';

	return (
		<LessonResourceCard block={block} label={label} showOpenAction={false}>
			{safeUrl ? (
				<PresentationPreview url={safeUrl} title={block.title || block.fileName || 'Course presentation'} />
			) : null}
		</LessonResourceCard>
	);
};

const LessonContentBlockView = ({ block }: { block: CourseLessonContentBlock }) => {
	switch (block.type) {
		case 'TEXT':
			return <TextLessonBlock block={block} />;
		case 'VIDEO_YOUTUBE':
			return <YouTubeLessonBlock block={block} />;
		case 'VIDEO_UPLOAD':
			return <UploadedVideoLessonBlock block={block} />;
		case 'PDF_UPLOAD':
		case 'PDF_LINK':
			return <PdfLessonBlock block={block} />;
		case 'PPT_UPLOAD':
		case 'PPT_LINK':
			return <PresentationLessonBlock block={block} />;
		default:
			return null;
	}
};

type LessonProgressSidebarProps = {
	lessons: CourseLessonsState | null;
	onLessonSelect: (subsectionId: string) => void;
};

const getLessonProgressColor = (subsection: CourseLessonsState['modules'][number]['subsections'][number]) => {
	if (subsection.isCompleted) {
		return 'green.500';
	}

	return subsection.isLocked ? 'text.muted' : 'primary';
};

const getLessonProgressIcon = (subsection: CourseLessonsState['modules'][number]['subsections'][number]) => {
	if (subsection.isCompleted) {
		return <FiCheck />;
	}

	return subsection.isLocked ? <FiLock /> : <FiPlayCircle />;
};

const LessonProgressSidebar = ({ lessons, onLessonSelect }: LessonProgressSidebarProps) => {
	const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>([]);

	useEffect(() => {
		if (!lessons?.modules.length) {
			return;
		}

		setExpandedModuleIds(prev => {
			if (prev.length) {
				return prev.filter(moduleId => lessons.modules.some(courseModule => courseModule.id === moduleId));
			}

			return lessons.modules.map(courseModule => courseModule.id);
		});
	}, [lessons]);

	if (!lessons) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={5}>
				<Stack gap={3}>
					<Box h="18px" w="160px" bg="bg.subtle" borderRadius="full" />
					<Box h="10px" w="full" bg="bg.subtle" borderRadius="full" />
					<Box h="140px" w="full" bg="bg.subtle" borderRadius="lg" />
				</Stack>
			</Box>
		);
	}

	const toggleModule = (moduleId: string) => {
		setExpandedModuleIds(prev =>
			prev.includes(moduleId) ? prev.filter(currentModuleId => currentModuleId !== moduleId) : [...prev, moduleId]
		);
	};

	return (
		<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 4, md: 5 }}>
			<Stack gap={4}>
				<Box>
					<Text color="primary" fontSize="xs" fontWeight="bold" textTransform="uppercase">
						Lesson progress
					</Text>
					<HStack mt={2} justify="space-between" gap={3}>
						<Text color="text.muted" fontSize="sm">
							{lessons.completedSubsections} of {lessons.totalSubsections} completed
						</Text>
						<Text fontWeight="bold">{lessons.lessonProgressPercentage}%</Text>
					</HStack>
					<Box mt={3} h="8px" borderRadius="full" bg="bg.subtle" overflow="hidden">
						<Box h="full" w={`${lessons.lessonProgressPercentage}%`} bg="primary" borderRadius="full" />
					</Box>
				</Box>

				<Stack gap={3}>
					{lessons.modules.map((courseModule, moduleIndex) => {
						const isExpanded = expandedModuleIds.includes(courseModule.id);

						return (
							<Box
								key={courseModule.id}
								border="1px solid"
								borderColor="border.default"
								borderRadius="lg"
								overflow="hidden"
							>
								<Button
									variant="ghost"
									borderRadius={0}
									h="auto"
									justifyContent="space-between"
									px={3}
									py={3}
									w="full"
									onClick={() => toggleModule(courseModule.id)}
								>
									<HStack gap={2} minW={0}>
										{isExpanded ? <FiChevronDown /> : <FiChevronRight />}
										<Box minW={0} textAlign="left">
											<Text fontSize="xs" color="primary" fontWeight="bold">
												Module {moduleIndex + 1}
											</Text>
											<Text fontSize="sm" fontWeight="semibold" lineClamp={1}>
												{courseModule.title || 'Untitled module'}
											</Text>
										</Box>
									</HStack>
									{courseModule.isLocked ? <FiLock /> : null}
								</Button>

								{isExpanded ? (
									<Stack gap={1} px={2} pb={2}>
										{courseModule.subsections.map((subsection, subsectionIndex) => (
											<Button
												key={subsection.id}
												variant="ghost"
												borderRadius="md"
												disabled={subsection.isLocked}
												h="auto"
												justifyContent="space-between"
												px={3}
												py={2.5}
												bg={subsection.isActive ? 'bg.accent' : undefined}
												border="1px solid"
												borderColor={subsection.isActive ? 'primary' : 'transparent'}
												onClick={() => onLessonSelect(subsection.id)}
											>
												<Box minW={0} textAlign="left">
													<Text color="text.muted" fontSize="xs">
														{subsectionIndex + 1}. {subsection.durationLabel || 'Lesson'}
													</Text>
													<Text fontSize="sm" fontWeight="semibold" lineClamp={2}>
														{subsection.title || 'Untitled lesson'}
													</Text>
												</Box>
												<Box color={getLessonProgressColor(subsection)}>{getLessonProgressIcon(subsection)}</Box>
											</Button>
										))}
									</Stack>
								) : null}
							</Box>
						);
					})}
				</Stack>
			</Stack>
		</Box>
	);
};

type CourseLessonsTabProps = {
	canBypassProgression: boolean;
	hasReachedBottom: boolean;
	isCompletingLesson: boolean;
	isLoading: boolean;
	lessonsResult: CourseLessonsResult | null;
	lessonErrorMessage: string;
	onAskDoubt: () => void;
	onCompleteLesson: () => void;
	onPreviousLesson: (subsectionId: string) => void;
	onRetry: () => void;
	onScrollBottomReached: () => void;
};

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

const CourseLessonsTab = ({
	canBypassProgression,
	hasReachedBottom,
	isCompletingLesson,
	isLoading,
	lessonsResult,
	lessonErrorMessage,
	onAskDoubt,
	onCompleteLesson,
	onPreviousLesson,
	onRetry,
	onScrollBottomReached
}: CourseLessonsTabProps) => {
	const contentRef = useRef<HTMLDivElement | null>(null);
	const lessonStartRef = useRef<HTMLDivElement | null>(null);
	const previousActiveSubsectionIdRef = useRef('');
	const lessons = lessonsResult?.lessons ?? null;
	const activeContext = getActiveLessonContext(lessons);
	const activeSubsectionId = activeContext?.subsection.id ?? '';

	useEffect(() => {
		if (!activeSubsectionId || isLoading || lessonErrorMessage) {
			return;
		}

		const contentElement = contentRef.current;
		if (!contentElement) {
			return;
		}

		const previousActiveSubsectionId = previousActiveSubsectionIdRef.current;
		previousActiveSubsectionIdRef.current = activeSubsectionId;

		if (previousActiveSubsectionId && previousActiveSubsectionId !== activeSubsectionId) {
			contentElement.scrollTo({ top: 0, behavior: 'auto' });

			const overflowY = window.getComputedStyle(contentElement).overflowY;
			if (overflowY !== 'auto' && overflowY !== 'scroll') {
				lessonStartRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
			}
		}

		if (canBypassProgression) {
			onScrollBottomReached();
			return;
		}

		if (contentElement.scrollHeight <= contentElement.clientHeight + 24) {
			onScrollBottomReached();
		}
	}, [activeSubsectionId, canBypassProgression, isLoading, lessonErrorMessage, onScrollBottomReached]);

	if (isLoading) {
		return <CourseDashboardSkeleton />;
	}

	if (lessonErrorMessage) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
				<Stack gap={4}>
					<Heading size="lg">Lessons unavailable</Heading>
					<Text color="text.muted">{lessonErrorMessage}</Text>
					<Button
						borderRadius="full"
						bg="primary"
						color="text.inverse"
						_hover={{ bg: 'primaryHover' }}
						w="fit-content"
						onClick={onRetry}
					>
						Retry lessons
					</Button>
				</Stack>
			</Box>
		);
	}

	if (!lessons || !activeContext) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 5, md: 6 }}>
				<Stack gap={3}>
					<Heading size="lg">No lessons available yet</Heading>
					<Text color="text.muted">
						The course team has not added lesson content for this course yet. Check back after the next update.
					</Text>
				</Stack>
			</Box>
		);
	}

	const { courseModule, subsection } = activeContext;
	const previousLesson = getPreviousUnlockedLessonRow(lessons, subsection.id);
	const nextLesson = getNextLessonRow(lessons, subsection.id);
	const canComplete = canBypassProgression || hasReachedBottom;
	const nextButtonLabel = nextLesson ? 'Next lesson' : 'Finish lessons';

	return (
		<Stack gap={4}>
			<Box
				ref={lessonStartRef}
				border="1px solid"
				borderColor="border.default"
				borderRadius="card"
				bg="bg.card"
				p={{ base: 5, md: 6 }}
				scrollMarginTop="88px"
			>
				<Stack gap={3}>
					<HStack gap={2} flexWrap="wrap">
						<Badge borderRadius="full" px={3} py={1}>
							{courseModule.title || 'Untitled module'}
						</Badge>
						{subsection.isCompleted ? (
							<Badge colorPalette="green" borderRadius="full" px={3} py={1}>
								Completed
							</Badge>
						) : (
							<Badge colorPalette="orange" borderRadius="full" px={3} py={1}>
								In progress
							</Badge>
						)}
						{lessons.hasAdminAccess ? (
							<Badge colorPalette="purple" borderRadius="full" px={3} py={1}>
								Admin access
							</Badge>
						) : null}
					</HStack>
					<Heading size={{ base: 'xl', md: '2xl' }}>{subsection.title || 'Untitled lesson'}</Heading>
					{subsection.previewSummary ? (
						<Text color="text.muted" fontSize="md" lineHeight="tall">
							{subsection.previewSummary}
						</Text>
					) : null}
				</Stack>
			</Box>

			<Box
				ref={contentRef}
				border="1px solid"
				borderColor="border.default"
				borderRadius="card"
				bg="bg.subtle"
				maxH={{ base: 'none', xl: 'calc(100vh - 260px)' }}
				overflowY={{ base: 'visible', xl: 'auto' }}
				p={{ base: 4, md: 5 }}
				onScroll={event => {
					const target = event.currentTarget;
					const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
					if (isAtBottom) {
						onScrollBottomReached();
					}
				}}
			>
				<Stack gap={5}>
					{subsection.contentBlocks.length ? (
						subsection.contentBlocks.map(block => <LessonContentBlockView key={block.id} block={block} />)
					) : (
						<Box border="1px dashed" borderColor="border.default" borderRadius="lg" bg="bg.card" p={6}>
							<Text color="text.muted">No detailed content has been added to this lesson yet.</Text>
						</Box>
					)}
					<Box h="1px" />
				</Stack>
			</Box>

			<Box border="1px solid" borderColor="border.default" borderRadius="card" bg="bg.card" p={{ base: 4, md: 5 }}>
				<Stack direction={{ base: 'column', md: 'row' }} justify="space-between" gap={3} align={{ md: 'center' }}>
					<HStack gap={3} flexWrap="wrap">
						<Button borderRadius="full" variant="outline" onClick={onAskDoubt}>
							Ask Doubt - Go to Community <FiExternalLink />
						</Button>
						<Button
							borderRadius="full"
							variant="outline"
							disabled={!previousLesson}
							onClick={() => {
								if (previousLesson) {
									onPreviousLesson(previousLesson.subsection.id);
								}
							}}
						>
							Previous
						</Button>
					</HStack>

					<Stack align={{ base: 'stretch', md: 'end' }} gap={2}>
						{!canComplete ? (
							<Text color="text.muted" fontSize="xs">
								Scroll to the bottom of the lesson to enable Next.
							</Text>
						) : null}
						<Button
							borderRadius="full"
							bg="primary"
							color="text.inverse"
							_hover={{ bg: 'primaryHover' }}
							disabled={!canComplete}
							loading={isCompletingLesson}
							onClick={onCompleteLesson}
						>
							{nextButtonLabel}
						</Button>
					</Stack>
				</Stack>
			</Box>
		</Stack>
	);
};

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
	isCollapsed?: boolean;
	onClose?: () => void;
	onTabChange: (tabId: CourseTabId) => void;
	onToggleCollapse?: () => void;
};

const CourseWorkspaceSidebar = ({
	activeTab,
	currentUser,
	enrollment,
	isCollapsed = false,
	onClose,
	onTabChange,
	onToggleCollapse
}: CourseWorkspaceSidebarProps) => {
	const displayName = currentUser?.name || currentUser?.email || 'User';
	const canOpenLearningTabs = Boolean(enrollment.accessUnlockedAt) || isAdminLearner(currentUser);

	return (
		<Stack h="full" gap={0} bg="bg.card">
			<HStack
				h="72px"
				px={isCollapsed ? 1.5 : 6}
				justify="space-between"
				borderBottom="1px solid"
				borderColor="border.default"
			>
				{isCollapsed ? (
					<Box
						boxSize="32px"
						borderRadius="lg"
						bg="primary"
						color="text.inverse"
						display="grid"
						fontWeight="bold"
						placeItems="center"
					>
						S
					</Box>
				) : (
					<Text fontSize="3xl" fontWeight="bold" color="text.primary">
						Shattak
					</Text>
				)}
				{onClose ? (
					<Button variant="ghost" size="sm" borderRadius="full" onClick={onClose} aria-label="Close course navigation">
						<FiX />
					</Button>
				) : onToggleCollapse ? (
					<Button
						variant="ghost"
						size="sm"
						borderRadius="full"
						boxSize="30px"
						minW="30px"
						p={0}
						onClick={onToggleCollapse}
						aria-label={isCollapsed ? 'Expand course navigation' : 'Collapse course navigation'}
						title={isCollapsed ? 'Expand course navigation' : 'Collapse course navigation'}
					>
						{isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
					</Button>
				) : null}
			</HStack>

			<Stack flex="1" gap={3} px={isCollapsed ? 2 : 4} py={5}>
				<Box display={isCollapsed ? 'none' : 'block'} px={2} pb={2}>
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
					const isLocked = tab.id !== 'overview' && !canOpenLearningTabs;
					const showLock = tab.id !== 'overview' && (isLocked || tab.id !== 'lessons');

					return (
						<Button
							key={tab.id}
							justifyContent={isCollapsed ? 'center' : 'space-between'}
							borderRadius="lg"
							variant={isActive ? 'solid' : 'ghost'}
							bg={isActive ? 'primary' : undefined}
							color={isActive ? 'text.inverse' : 'text.primary'}
							disabled={isLocked}
							minH="48px"
							px={isCollapsed ? 0 : 4}
							position="relative"
							title={isCollapsed ? tab.label : undefined}
							onClick={() => {
								onTabChange(tab.id);
								onClose?.();
							}}
						>
							<HStack gap={3}>
								<Icon />
								{!isCollapsed ? (
									<Text as="span" fontWeight="semibold">
										{tab.label}
									</Text>
								) : null}
							</HStack>
							{showLock && !isCollapsed ? (
								<Box>
									<FiLock size={16} />
								</Box>
							) : null}
						</Button>
					);
				})}
			</Stack>

			<Box borderTop="1px solid" borderColor="border.default" p={isCollapsed ? 2 : 4}>
				<HStack
					justify={isCollapsed ? 'center' : 'flex-start'}
					border="1px solid"
					borderColor="border.default"
					borderRadius="xl"
					bg="bg.subtle"
					p={isCollapsed ? 2 : 3}
					gap={3}
				>
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
					<Box display={isCollapsed ? 'none' : 'block'} minW={0}>
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
	onAskDoubt: () => void;
};

const CourseLearningMainContent = ({
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
	onTabChange,
	onAskDoubt
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
				onAskDoubt={onAskDoubt}
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

const CourseLearningRail = ({
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
		return (
			<Box justifySelf="end" position={{ xl: 'sticky' }} top={{ xl: '96px' }}>
				<Button
					variant="outline"
					borderRadius="lg"
					boxSize="44px"
					minW="44px"
					p={0}
					bg="bg.card"
					onClick={onToggleCollapse}
					aria-label="Expand course side panel"
					title="Expand course side panel"
				>
					<FiChevronLeft />
				</Button>
			</Box>
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
	const [isWorkspaceSidebarCollapsed, setIsWorkspaceSidebarCollapsed] = useState(false);
	const [isLearningRailCollapsed, setIsLearningRailCollapsed] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isDashboardLoading, setIsDashboardLoading] = useState(false);
	const [lessonsResult, setLessonsResult] = useState<CourseLessonsResult | null>(null);
	const [isLessonsLoading, setIsLessonsLoading] = useState(false);
	const [lessonErrorMessage, setLessonErrorMessage] = useState('');
	const [hasReachedLessonBottom, setHasReachedLessonBottom] = useState(false);
	const [isCompletingLesson, setIsCompletingLesson] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [dashboardErrorMessage, setDashboardErrorMessage] = useState('');
	const canBypassProgression = isAdminLearner(currentUser);
	const canOpenLearningTabs = Boolean(enrollment?.accessUnlockedAt) || canBypassProgression;

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

	const loadLessons = useCallback(
		async (subsectionId?: string) => {
			setIsLessonsLoading(true);
			setLessonErrorMessage('');

			try {
				const result = await getCourseLessons(courseId, subsectionId);
				const activeContext = getActiveLessonContext(result.lessons);

				setLessonsResult(result);
				setEnrollment(result.enrollment);
				setHasReachedLessonBottom(result.lessons.hasAdminAccess);

				if (activeContext) {
					trackCourseDashboardEvent({
						eventName: 'course_lesson_opened',
						courseId,
						courseTitle: result.course.title,
						userId: currentUser?.id,
						lessonId: activeContext.subsection.id,
						lessonTitle: activeContext.subsection.title,
						moduleId: activeContext.courseModule.id,
						moduleTitle: activeContext.courseModule.title,
						completionPercentage: result.enrollment.progressPercent,
						enrollmentStatus: result.enrollment.status,
						sourcePage: currentPath
					});
				}
			} catch (error) {
				if (error instanceof ApiRequestError && error.code === 'COURSE_ACCESS_LOCKED') {
					setLessonErrorMessage('Lessons unlock after you confirm your WhatsApp community access from Overview.');
					return;
				}

				setLessonErrorMessage('Unable to load lessons right now. Please try again.');
			} finally {
				setIsLessonsLoading(false);
			}
		},
		[courseId, currentPath, currentUser?.id]
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
			setLessonsResult(null);
			loadDashboard(currentUser).catch(() => undefined);
		},
		[currentUser, loadDashboard]
	);

	const handleTabChange = useCallback(
		(tabId: CourseTabId) => {
			if (tabId !== 'overview' && !canOpenLearningTabs) {
				setActiveTab('overview');
				return;
			}

			setActiveTab(tabId);
		},
		[canOpenLearningTabs]
	);

	useEffect(() => {
		if (activeTab !== 'lessons') {
			return;
		}

		if (!canOpenLearningTabs) {
			setActiveTab('overview');
			return;
		}

		if (!lessonsResult && !isLessonsLoading) {
			loadLessons().catch(() => undefined);
		}
	}, [activeTab, canOpenLearningTabs, isLessonsLoading, lessonsResult, loadLessons]);

	const handleLessonSelect = useCallback(
		(subsectionId: string) => {
			setHasReachedLessonBottom(canBypassProgression);
			loadLessons(subsectionId).catch(() => undefined);
		},
		[canBypassProgression, loadLessons]
	);

	const handleLessonBottomReached = useCallback(() => {
		setHasReachedLessonBottom(true);
	}, []);

	const handleAskDoubt = useCallback(() => {
		const whatsappGroupUrl = lessonsResult?.course.whatsappGroupUrl || enrollment?.course.whatsappGroupUrl || '';

		trackCourseDashboardEvent({
			eventName: 'course_doubt_clicked',
			courseId,
			courseTitle: lessonsResult?.course.title ?? enrollment?.course.title,
			userId: currentUser?.id,
			destination: 'community',
			enrollmentStatus: enrollment?.status,
			sourcePage: currentPath
		});

		if (whatsappGroupUrl && typeof window !== 'undefined') {
			window.open(whatsappGroupUrl, '_blank', 'noopener,noreferrer');
		}
	}, [courseId, currentPath, currentUser?.id, enrollment, lessonsResult]);

	const handleCompleteLesson = useCallback(async () => {
		const lessons = lessonsResult?.lessons ?? null;
		const activeContext = getActiveLessonContext(lessons);

		if (!lessons || !activeContext || !enrollment) {
			return;
		}

		const { courseModule, subsection } = activeContext;
		const nextLesson = getNextLessonRow(lessons, subsection.id);

		trackCourseDashboardEvent({
			eventName: 'course_lesson_next_clicked',
			courseId,
			courseTitle: lessonsResult?.course.title,
			userId: currentUser?.id,
			lessonId: subsection.id,
			lessonTitle: subsection.title,
			moduleId: courseModule.id,
			moduleTitle: courseModule.title,
			destination: nextLesson ? 'lesson' : 'assignment',
			completionPercentage: enrollment.progressPercent,
			enrollmentStatus: enrollment.status,
			sourcePage: currentPath
		});

		setIsCompletingLesson(true);
		setLessonErrorMessage('');

		try {
			const result = await completeCourseLesson(courseId, subsection.id);
			setLessonsResult(result);
			setEnrollment(result.enrollment);
			setHasReachedLessonBottom(result.lessons.hasAdminAccess);

			trackCourseDashboardEvent({
				eventName: 'course_lesson_completed',
				courseId,
				courseTitle: result.course.title,
				userId: currentUser?.id,
				lessonId: subsection.id,
				lessonTitle: subsection.title,
				moduleId: courseModule.id,
				moduleTitle: courseModule.title,
				completionPercentage: result.enrollment.progressPercent,
				enrollmentStatus: result.enrollment.status,
				sourcePage: currentPath
			});

			if (!nextLesson && !result.lessons.hasAdminAccess) {
				setActiveTab('assignment');
			}
		} catch {
			setLessonErrorMessage('Unable to mark this lesson complete right now. Please try again.');
		} finally {
			setIsCompletingLesson(false);
		}
	}, [courseId, currentPath, currentUser?.id, enrollment, lessonsResult]);

	const activeTabLabel = useMemo(() => courseTabs.find(tab => tab.id === activeTab)?.label ?? 'Overview', [activeTab]);
	const shouldShowUnlockedOverviewRail =
		activeTab === 'overview' && Boolean(enrollment?.accessUnlockedAt && dashboard && !isDashboardLoading);
	const shouldShowLessonRail = activeTab === 'lessons' && canOpenLearningTabs;
	const shouldShowOverviewRail = activeTab === 'overview' || shouldShowLessonRail;

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
				w={{
					lg: isWorkspaceSidebarCollapsed ? '88px' : '280px',
					'2xl': isWorkspaceSidebarCollapsed ? '88px' : '300px'
				}}
				borderRight="1px solid"
				borderColor="border.default"
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

			{isMobileNavOpen ? (
				<Box display={{ base: 'block', lg: 'none' }} position="fixed" inset={0} zIndex={1500}>
					<Box position="absolute" inset={0} bg="blackAlpha.600" onClick={() => setIsMobileNavOpen(false)} />
					<Box position="relative" h="100vh" w="min(320px, 88vw)" boxShadow="2xl">
						<CourseWorkspaceSidebar
							activeTab={activeTab}
							currentUser={currentUser}
							enrollment={enrollment}
							onClose={() => setIsMobileNavOpen(false)}
							onTabChange={handleTabChange}
						/>
					</Box>
				</Box>
			) : null}

			<Box
				ml={{
					lg: isWorkspaceSidebarCollapsed ? '88px' : '280px',
					'2xl': isWorkspaceSidebarCollapsed ? '88px' : '300px'
				}}
				minH="100vh"
				transition="margin-left 180ms ease"
				_motionReduce={{ transition: 'none' }}
			>
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
							<ThemeToggle />
							<Button asChild borderRadius="full" size="sm" variant="outline">
								<Link href={`/course/${courseId}`}>Back to course</Link>
							</Button>
						</HStack>
					</HStack>
				</Box>

				<Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
					<Box
						display="grid"
						gridTemplateColumns={
							shouldShowOverviewRail
								? {
										base: '1fr',
										xl: isLearningRailCollapsed ? 'minmax(0, 1fr) 44px' : 'minmax(520px, 1fr) 340px',
										'2xl': isLearningRailCollapsed ? 'minmax(0, 1fr) 44px' : 'minmax(680px, 1fr) 380px'
									}
								: '1fr'
						}
						gap={{ base: 4, xl: 5 }}
						alignItems="start"
					>
						<Box minW={0}>
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
								onAskDoubt={handleAskDoubt}
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
