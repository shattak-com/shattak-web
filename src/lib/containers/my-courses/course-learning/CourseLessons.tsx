import { Badge, Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import {
	FiBookOpen,
	FiCheck,
	FiCheckCircle,
	FiChevronDown,
	FiChevronRight,
	FiLock,
	FiPlayCircle
} from 'react-icons/fi';

import type { CourseLessonsResult, CourseLessonsState } from '~/lib/api/enrollments';

import { workspaceActiveTextColor, workspaceBoundaryColor, workspaceSelectedBoundaryColor } from './constants';
import CourseDashboardSkeleton from './CourseDashboardSkeleton';
import { CourseLessonMobileNavigator } from './CourseLessonMobileNavigator';
import { LessonContentBlockView } from './LessonContentBlockView';
import { getActiveLessonContext, getLessonStateLabel, getNextLessonRow, getPreviousUnlockedLessonRow } from './utils';

type LessonProgressSidebarProps = {
	embedded?: boolean;
	isVisible?: boolean;
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

export const LessonProgressSidebar = ({
	embedded = false,
	isVisible = true,
	lessons,
	onLessonSelect
}: LessonProgressSidebarProps) => {
	const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>([]);
	const activeLessonRef = useRef<HTMLButtonElement | null>(null);
	const moduleIds = lessons?.modules.map(courseModule => courseModule.id).join('|') ?? '';
	const activeModuleId =
		lessons?.modules.find(courseModule =>
			courseModule.subsections.some(subsection => subsection.id === lessons.activeSubsectionId)
		)?.id ?? '';

	useEffect(() => {
		if (!lessons?.modules.length) {
			setExpandedModuleIds([]);
			return;
		}

		setExpandedModuleIds(prev => {
			const validExpandedIds = prev.filter(moduleId =>
				lessons.modules.some(courseModule => courseModule.id === moduleId)
			);

			if (!activeModuleId) {
				return validExpandedIds.length ? validExpandedIds : [lessons.modules[0].id];
			}

			return validExpandedIds.includes(activeModuleId) ? validExpandedIds : [...validExpandedIds, activeModuleId];
		});
	}, [activeModuleId, lessons, moduleIds]);

	useEffect(() => {
		if (!isVisible || !activeModuleId || !expandedModuleIds.includes(activeModuleId)) {
			return undefined;
		}

		const frame = window.requestAnimationFrame(() => {
			activeLessonRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		});

		return () => window.cancelAnimationFrame(frame);
	}, [activeModuleId, expandedModuleIds, isVisible, lessons?.activeSubsectionId]);

	if (!lessons) {
		return (
			<Box border="1px solid" borderColor={workspaceBoundaryColor} borderRadius="card" bg="bg.card" p={5}>
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
		<Box
			border={embedded ? 0 : '1px solid'}
			borderColor={workspaceBoundaryColor}
			borderRadius={embedded ? 0 : 'card'}
			bg="bg.card"
			p={embedded ? 0 : { base: 4, md: 5 }}
		>
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
						const containsActiveLesson = courseModule.id === activeModuleId;

						return (
							<Box
								key={courseModule.id}
								border="1px solid"
								borderColor={containsActiveLesson ? workspaceSelectedBoundaryColor : workspaceBoundaryColor}
								borderRadius="lg"
								overflow="hidden"
								bg={containsActiveLesson ? 'bg.accent' : 'bg.card'}
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
									aria-expanded={isExpanded}
								>
									<HStack gap={2} minW={0}>
										{isExpanded ? <FiChevronDown /> : <FiChevronRight />}
										<Box minW={0} textAlign="left">
											<Text fontSize="xs" color="primary" fontWeight="bold">
												Module {moduleIndex + 1}
											</Text>
											<Text fontSize="sm" fontWeight="semibold" lineClamp={2}>
												{courseModule.title || 'Untitled module'}
											</Text>
										</Box>
									</HStack>
									{courseModule.isLocked ? <FiLock /> : null}
								</Button>

								{isExpanded ? (
									<Stack gap={1} px={2} pb={2}>
										{courseModule.subsections.map((subsection, subsectionIndex) => {
											const lessonState = getLessonStateLabel(subsection);

											return (
												<Button
													key={subsection.id}
													ref={subsection.isActive ? activeLessonRef : undefined}
													variant="ghost"
													borderRadius="md"
													disabled={subsection.isLocked}
													h="auto"
													justifyContent="space-between"
													px={3}
													py={2.5}
													bg={subsection.isActive ? 'bg.card' : undefined}
													border="1px solid"
													borderColor={subsection.isActive ? workspaceSelectedBoundaryColor : 'transparent'}
													onClick={() => onLessonSelect(subsection.id)}
													aria-current={subsection.isActive ? 'step' : undefined}
												>
													<Box minW={0} textAlign="left">
														<Text color="text.muted" fontSize="xs">
															{subsectionIndex + 1}. {lessonState}
															{subsection.durationLabel ? ` \u00c2\u00b7 ${subsection.durationLabel}` : ''}
														</Text>
														<Text fontSize="sm" fontWeight="semibold" lineClamp={2}>
															{subsection.title || 'Untitled lesson'}
														</Text>
													</Box>
													<Box color={getLessonProgressColor(subsection)}>{getLessonProgressIcon(subsection)}</Box>
												</Button>
											);
										})}
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
	onCompleteLesson: () => void;
	onLessonSelect: (subsectionId: string) => void;
	onPreviousLesson: (subsectionId: string) => void;
	onRetry: () => void;
	onScrollBottomReached: () => void;
};

type LessonNavigationFooterProps = {
	canComplete: boolean;
	isCompletingLesson: boolean;
	nextButtonLabel: string;
	onCompleteLesson: () => void;
	onPreviousLesson: () => void;
	showPreviousLesson: boolean;
};

const LessonNavigationFooter = ({
	canComplete,
	isCompletingLesson,
	nextButtonLabel,
	onCompleteLesson,
	onPreviousLesson,
	showPreviousLesson
}: LessonNavigationFooterProps) => (
	<Box
		border="1px solid"
		borderColor={workspaceBoundaryColor}
		borderRadius="card"
		bg="bg.card"
		boxShadow="sm"
		pb={{ base: 'calc(1rem + env(safe-area-inset-bottom))', md: 5 }}
		px={{ base: 4, md: 5 }}
		pt={{ base: 4, md: 5 }}
	>
		<Stack direction={{ base: 'column', md: 'row' }} justify="space-between" gap={3} align={{ md: 'center' }}>
			<Stack gap={2}>
				<Text color="text.muted" fontSize="xs" fontWeight="bold" textTransform="uppercase">
					Lesson navigation
				</Text>
				<HStack gap={2} aria-live="polite">
					<Box color={canComplete ? 'green.500' : 'text.muted'}>{canComplete ? <FiCheckCircle /> : <FiBookOpen />}</Box>
					<Text color={canComplete ? 'text.primary' : 'text.muted'} fontSize="sm" fontWeight="semibold">
						{canComplete ? 'Lesson ready to complete.' : 'Reach the end of this lesson to continue.'}
					</Text>
				</HStack>
			</Stack>

			<HStack gap={3} flexWrap="wrap" justify={{ base: 'stretch', md: 'flex-end' }}>
				<Button
					flex={{ base: 1, md: 'initial' }}
					minH="44px"
					borderRadius="full"
					variant="outline"
					disabled={!showPreviousLesson}
					onClick={onPreviousLesson}
				>
					Previous
				</Button>
				<Button
					flex={{ base: 1, md: 'initial' }}
					minH="44px"
					borderRadius="full"
					bg="primary"
					color={workspaceActiveTextColor}
					_hover={{ bg: 'primaryHover' }}
					disabled={!canComplete}
					loading={isCompletingLesson}
					onClick={onCompleteLesson}
				>
					{nextButtonLabel}
				</Button>
			</HStack>
		</Stack>
	</Box>
);

export const CourseLessonsTab = ({
	canBypassProgression,
	hasReachedBottom,
	isCompletingLesson,
	isLoading,
	lessonsResult,
	lessonErrorMessage,
	onCompleteLesson,
	onLessonSelect,
	onPreviousLesson,
	onRetry,
	onScrollBottomReached
}: CourseLessonsTabProps) => {
	const lessonStartRef = useRef<HTMLDivElement | null>(null);
	const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
	const previousActiveSubsectionIdRef = useRef('');
	const lessons = lessonsResult?.lessons ?? null;
	const activeContext = getActiveLessonContext(lessons);
	const activeSubsectionId = activeContext?.subsection.id ?? '';

	useEffect(() => {
		if (!activeSubsectionId || isLoading || lessonErrorMessage) {
			return undefined;
		}

		const previousActiveSubsectionId = previousActiveSubsectionIdRef.current;
		previousActiveSubsectionIdRef.current = activeSubsectionId;

		if (previousActiveSubsectionId && previousActiveSubsectionId !== activeSubsectionId) {
			window.requestAnimationFrame(() => {
				lessonStartRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
			});
		}

		if (canBypassProgression) {
			onScrollBottomReached();
			return undefined;
		}

		const bottomSentinel = bottomSentinelRef.current;
		if (!bottomSentinel) {
			return undefined;
		}

		const observer = new IntersectionObserver(
			entries => {
				if (entries.some(entry => entry.isIntersecting)) {
					onScrollBottomReached();
				}
			},
			{
				root: null,
				rootMargin: '0px 0px 48px',
				threshold: 0.5
			}
		);

		observer.observe(bottomSentinel);
		return () => observer.disconnect();
	}, [activeSubsectionId, canBypassProgression, isLoading, lessonErrorMessage, onScrollBottomReached]);

	if (isLoading) {
		return <CourseDashboardSkeleton />;
	}

	if (lessonErrorMessage) {
		return (
			<Box
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				p={{ base: 5, md: 6 }}
			>
				<Stack gap={4}>
					<Heading size="lg">Lessons unavailable</Heading>
					<Text color="text.muted">{lessonErrorMessage}</Text>
					<Button
						borderRadius="full"
						bg="primary"
						color={workspaceActiveTextColor}
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
			<Box
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				p={{ base: 5, md: 6 }}
			>
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
	const handlePreviousLesson = () => {
		if (previousLesson) {
			onPreviousLesson(previousLesson.subsection.id);
		}
	};

	return (
		<Stack gap={4}>
			<Box display={{ base: 'block', xl: 'none' }} position="sticky" top="72px" zIndex={8} bg="bg.subtle" py={1}>
				<CourseLessonMobileNavigator lessons={lessons} onLessonSelect={onLessonSelect}>
					{(handleMobileLessonSelect, isMobileNavigatorOpen) => (
						<LessonProgressSidebar
							lessons={lessons}
							onLessonSelect={handleMobileLessonSelect}
							embedded
							isVisible={isMobileNavigatorOpen}
						/>
					)}
				</CourseLessonMobileNavigator>
			</Box>

			<Box
				ref={lessonStartRef}
				border="1px solid"
				borderColor={workspaceBoundaryColor}
				borderRadius="card"
				bg="bg.card"
				p={{ base: 4, md: 6 }}
				scrollMarginTop={{ base: '148px', xl: '88px' }}
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
				border={{ base: '0', md: '1px solid' }}
				borderColor={workspaceBoundaryColor}
				borderRadius={{ base: 0, md: 'card' }}
				bg={{ base: 'transparent', md: 'bg.subtle' }}
				p={{ base: 0, md: 5 }}
			>
				<Stack gap={5}>
					{subsection.contentBlocks.length ? (
						subsection.contentBlocks.map(block => <LessonContentBlockView key={block.id} block={block} />)
					) : (
						<Box border="1px dashed" borderColor={workspaceBoundaryColor} borderRadius="lg" bg="bg.card" p={6}>
							<Text color="text.muted">No detailed content has been added to this lesson yet.</Text>
						</Box>
					)}
					<Box ref={bottomSentinelRef} h="1px" aria-hidden="true" />
				</Stack>
			</Box>

			<LessonNavigationFooter
				canComplete={canComplete}
				isCompletingLesson={isCompletingLesson}
				nextButtonLabel={nextButtonLabel}
				onCompleteLesson={onCompleteLesson}
				onPreviousLesson={handlePreviousLesson}
				showPreviousLesson={Boolean(previousLesson)}
			/>
		</Stack>
	);
};
