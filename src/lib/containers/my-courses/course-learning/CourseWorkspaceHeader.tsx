import { Badge, Box, Button, Heading, HStack, Image, Text } from '@chakra-ui/react';
import Link from 'next/link';
import type { RefObject } from 'react';
import { FiArrowLeft, FiMaximize2, FiMenu, FiMessageCircle, FiMinimize2 } from 'react-icons/fi';

import type { CourseEnrollment } from '~/lib/api/enrollments';
import ThemeToggle from '~/lib/components/ThemeToggle';

import { shattakMarkUrl, workspaceActiveTextColor, workspaceBoundaryColor } from './constants';
import type { CourseTabId } from './types';
import { formatCourseDate } from './utils';

type CourseWorkspaceHeaderProps = {
	activeLessonTitle?: string;
	activeTab: CourseTabId;
	enrollment: CourseEnrollment;
	exitFocusModeButtonRef: RefObject<HTMLButtonElement | null>;
	focusModeButtonRef: RefObject<HTMLButtonElement | null>;
	isBrowserFullscreen: boolean;
	isBrowserFullscreenSupported: boolean;
	isFocusMode: boolean;
	onAskDoubt: () => void;
	onEnterFocusMode: () => void;
	onExitFocusMode: () => void;
	onOpenMobileNavigation: () => void;
	onToggleBrowserFullscreen: () => void;
};

const FocusModeHeader = ({
	activeLessonTitle,
	enrollment,
	exitFocusModeButtonRef,
	isBrowserFullscreen,
	isBrowserFullscreenSupported,
	onAskDoubt,
	onExitFocusMode,
	onToggleBrowserFullscreen
}: Pick<
	CourseWorkspaceHeaderProps,
	| 'activeLessonTitle'
	| 'enrollment'
	| 'exitFocusModeButtonRef'
	| 'isBrowserFullscreen'
	| 'isBrowserFullscreenSupported'
	| 'onAskDoubt'
	| 'onExitFocusMode'
	| 'onToggleBrowserFullscreen'
>) => (
	<HStack w="full" justify="space-between" gap={4}>
		<Box minW={0}>
			<Text color="text.muted" fontSize="xs" fontWeight="semibold" lineClamp={1}>
				{enrollment.course.title}
			</Text>
			<Heading size="sm" lineClamp={1}>
				{activeLessonTitle || 'Lessons'}
			</Heading>
		</Box>

		<HStack gap={2} flexShrink={0}>
			<Badge display={{ base: 'none', sm: 'inline-flex' }} borderRadius="full" px={3} py={1}>
				{enrollment.progressPercent}% progress
			</Badge>
			<Button
				borderRadius="full"
				size="sm"
				variant="outline"
				onClick={onAskDoubt}
				aria-label="Ask a doubt in the course community"
				title="Ask a doubt in the course community"
			>
				<FiMessageCircle />
				<Box as="span" display={{ base: 'none', md: 'inline' }}>
					Ask doubt
				</Box>
			</Button>
			{isBrowserFullscreenSupported ? (
				<Button
					borderRadius="full"
					size="sm"
					variant="outline"
					onClick={onToggleBrowserFullscreen}
					aria-label={isBrowserFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
					title={isBrowserFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
				>
					{isBrowserFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
					<Box as="span" display={{ base: 'none', lg: 'inline' }}>
						{isBrowserFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
					</Box>
				</Button>
			) : null}
			<ThemeToggle />
			<Button
				ref={exitFocusModeButtonRef}
				borderRadius="full"
				size="sm"
				bg="primary"
				color={workspaceActiveTextColor}
				_hover={{ bg: 'primaryHover' }}
				onClick={onExitFocusMode}
				aria-label="Exit focus mode"
				aria-pressed
			>
				<FiMinimize2 />
				<Box as="span" display={{ base: 'none', sm: 'inline' }}>
					Exit focus
				</Box>
			</Button>
		</HStack>
	</HStack>
);

const StandardWorkspaceHeader = ({
	activeTab,
	enrollment,
	focusModeButtonRef,
	onAskDoubt,
	onEnterFocusMode,
	onOpenMobileNavigation
}: Pick<
	CourseWorkspaceHeaderProps,
	'activeTab' | 'enrollment' | 'focusModeButtonRef' | 'onAskDoubt' | 'onEnterFocusMode' | 'onOpenMobileNavigation'
>) => (
	<HStack w="full" justify="space-between" gap={{ base: 2, md: 4 }}>
		<HStack gap={{ base: 2, sm: 3 }} minW={0} flex={1}>
			<Button
				display={{ base: 'inline-flex', lg: 'none' }}
				variant="outline"
				size="sm"
				borderRadius="full"
				boxSize="44px"
				minW="44px"
				onClick={onOpenMobileNavigation}
				aria-label="Open course navigation"
			>
				<FiMenu />
			</Button>
			<Image
				src={enrollment.course.thumbnailImage || enrollment.course.promoImage || shattakMarkUrl}
				alt=""
				boxSize="40px"
				display={{ base: 'none', sm: 'block' }}
				borderRadius="lg"
				flexShrink={0}
				objectFit="cover"
			/>
			<Box minW={0}>
				<Heading size="sm" lineClamp={1}>
					{enrollment.course.title}
				</Heading>
				<Text display={{ base: 'none', sm: 'block' }} color="text.muted" fontSize="xs">
					Enrolled on {formatCourseDate(enrollment.enrolledAt)}
				</Text>
			</Box>
		</HStack>
		<HStack gap={{ base: 1, md: 2 }} flexShrink={0}>
			<Badge display={{ base: 'none', lg: 'inline-flex' }} borderRadius="full" px={3} py={1}>
				{enrollment.progressPercent}% progress
			</Badge>
			{activeTab === 'lessons' ? (
				<>
					<Button
						borderRadius="full"
						size="sm"
						variant="outline"
						onClick={onAskDoubt}
						aria-label="Ask a doubt in the course community"
						title="Ask a doubt in the course community"
						boxSize={{ base: '44px', xl: 'auto' }}
						minW={{ base: '44px', xl: 'auto' }}
						px={{ base: 0, xl: 3 }}
					>
						<FiMessageCircle />
						<Box as="span" display={{ base: 'none', xl: 'inline' }}>
							Ask doubt
						</Box>
					</Button>
					<Button
						ref={focusModeButtonRef}
						borderRadius="full"
						size="sm"
						variant="outline"
						onClick={onEnterFocusMode}
						aria-label="Enter focus mode"
						aria-pressed={false}
						title="Hide course navigation and focus on this lesson"
						display={{ base: 'none', md: 'inline-flex' }}
					>
						<FiMaximize2 />
						<Box as="span" display={{ base: 'none', xl: 'inline' }}>
							Focus mode
						</Box>
					</Button>
				</>
			) : null}
			<ThemeToggle />
			<Button
				asChild
				borderRadius="full"
				size="sm"
				variant="outline"
				boxSize={{ base: '44px', md: 'auto' }}
				minW={{ base: '44px', md: 'auto' }}
				px={{ base: 0, md: 3 }}
			>
				<Link href="/my-courses/" aria-label="Back to all courses">
					<FiArrowLeft />
					<Box as="span" display={{ base: 'none', md: 'inline' }}>
						Back to all courses
					</Box>
				</Link>
			</Button>
		</HStack>
	</HStack>
);

export const CourseWorkspaceHeader = ({
	activeLessonTitle,
	activeTab,
	enrollment,
	exitFocusModeButtonRef,
	focusModeButtonRef,
	isBrowserFullscreen,
	isBrowserFullscreenSupported,
	isFocusMode,
	onAskDoubt,
	onEnterFocusMode,
	onExitFocusMode,
	onOpenMobileNavigation,
	onToggleBrowserFullscreen
}: CourseWorkspaceHeaderProps) => (
	<Box
		position="sticky"
		top={0}
		zIndex={10}
		minH="72px"
		borderBottom="1px solid"
		borderColor={workspaceBoundaryColor}
		bg="bg.card"
		px={{ base: 4, md: 6 }}
		py={{ base: 3, lg: 0 }}
		display="flex"
		alignItems="center"
	>
		{isFocusMode ? (
			<FocusModeHeader
				activeLessonTitle={activeLessonTitle}
				enrollment={enrollment}
				exitFocusModeButtonRef={exitFocusModeButtonRef}
				isBrowserFullscreen={isBrowserFullscreen}
				isBrowserFullscreenSupported={isBrowserFullscreenSupported}
				onAskDoubt={onAskDoubt}
				onExitFocusMode={onExitFocusMode}
				onToggleBrowserFullscreen={onToggleBrowserFullscreen}
			/>
		) : (
			<StandardWorkspaceHeader
				activeTab={activeTab}
				enrollment={enrollment}
				focusModeButtonRef={focusModeButtonRef}
				onAskDoubt={onAskDoubt}
				onEnterFocusMode={onEnterFocusMode}
				onOpenMobileNavigation={onOpenMobileNavigation}
			/>
		)}
	</Box>
);
