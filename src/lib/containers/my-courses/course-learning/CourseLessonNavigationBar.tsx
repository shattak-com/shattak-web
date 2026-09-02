import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { FiArrowDown, FiArrowUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import type { CourseLessonsState } from '~/lib/api/enrollments';
import ShineButton from '~/lib/components/actions/ShineButton';

import { workspaceActiveTextColor, workspaceBoundaryColor } from './constants';
import { getActiveLessonContext, getNextLessonRow, getPreviousUnlockedLessonRow } from './utils';

type CourseLessonNavigationBarProps = {
	canComplete: boolean;
	isCompletingLesson: boolean;
	isNavigating: boolean;
	isLearningRailCollapsed: boolean;
	isPinned: boolean;
	isWorkspaceSidebarCollapsed: boolean;
	lessons: CourseLessonsState | null;
	onCompleteLesson: () => void;
	onLessonSelect: (subsectionId: string) => void;
	onTogglePinned: () => void;
};

const NextLessonButton = ({
	canComplete,
	isCompletingLesson,
	isNavigating,
	label,
	onClick
}: {
	canComplete: boolean;
	isCompletingLesson: boolean;
	isNavigating: boolean;
	label: string;
	onClick: () => void;
}) => {
	const sharedProps = {
		borderRadius: 'full',
		color: workspaceActiveTextColor,
		flexShrink: 0,
		loading: isCompletingLesson,
		minH: '44px',
		minW: { base: '112px', sm: '132px' },
		onClick
	} as const;

	if (!canComplete || isNavigating) {
		return (
			<Button
				{...sharedProps}
				bg="primary"
				disabled
				title={isNavigating ? 'Loading lesson' : 'Reach the end of this lesson to continue'}
				aria-label={isNavigating ? `${label}: loading lesson` : `${label}: reach the end of this lesson to unlock`}
			>
				{label}
				<FiChevronRight />
			</Button>
		);
	}

	return (
		<ShineButton
			{...sharedProps}
			bg="primary"
			_hover={{ bg: 'primaryHover', transform: 'translateY(-1px)' }}
			_motionReduce={{ _hover: { transform: 'none' } }}
		>
			{label}
			<FiChevronRight />
		</ShineButton>
	);
};

const getNavigationFrameProps = ({
	isLearningRailCollapsed,
	isPinned,
	isWorkspaceSidebarCollapsed
}: Pick<CourseLessonNavigationBarProps, 'isLearningRailCollapsed' | 'isPinned' | 'isWorkspaceSidebarCollapsed'>) => {
	if (isPinned) {
		return {
			bottom: undefined,
			boxShadow: 'soft',
			left: undefined,
			mt: 4,
			position: 'static' as const,
			right: undefined
		};
	}

	return {
		bottom: { base: 'calc(0.75rem + env(safe-area-inset-bottom))', md: 4 },
		boxShadow: 'float',
		left: {
			base: 3,
			lg: isWorkspaceSidebarCollapsed ? '112px' : '304px',
			'2xl': isWorkspaceSidebarCollapsed ? '112px' : '324px'
		},
		mt: 0,
		position: 'fixed' as const,
		right: {
			base: 3,
			lg: 6,
			xl: isLearningRailCollapsed ? '108px' : '384px',
			'2xl': isLearningRailCollapsed ? '108px' : '424px'
		}
	};
};

const LessonNavigationPinButton = ({
	isPinned,
	onTogglePinned
}: Pick<CourseLessonNavigationBarProps, 'isPinned' | 'onTogglePinned'>) => {
	const label = isPinned ? 'Keep floating' : 'Send to bottom';

	return (
		<Button
			minH="44px"
			minW={{ base: '44px', sm: '152px' }}
			borderRadius="full"
			variant="outline"
			onClick={onTogglePinned}
			aria-label={isPinned ? 'Keep lesson navigation floating' : 'Send lesson navigation to the page bottom'}
			title={label}
		>
			{isPinned ? <FiArrowUp /> : <FiArrowDown />}
			<Text as="span" display={{ base: 'none', sm: 'inline' }}>
				{label}
			</Text>
		</Button>
	);
};

export const CourseLessonNavigationBar = ({
	canComplete,
	isCompletingLesson,
	isNavigating,
	isLearningRailCollapsed,
	isPinned,
	isWorkspaceSidebarCollapsed,
	lessons,
	onCompleteLesson,
	onLessonSelect,
	onTogglePinned
}: CourseLessonNavigationBarProps) => {
	const activeContext = getActiveLessonContext(lessons);

	if (!lessons || !activeContext) {
		return null;
	}

	const previousLesson = getPreviousUnlockedLessonRow(lessons, activeContext.subsection.id);
	const nextLesson = getNextLessonRow(lessons, activeContext.subsection.id);
	const nextButtonLabel = nextLesson ? 'Next lesson' : 'Finish lessons';
	const frameProps = getNavigationFrameProps({
		isLearningRailCollapsed,
		isPinned,
		isWorkspaceSidebarCollapsed
	});

	return (
		<Box
			as="nav"
			aria-label="Lesson navigation"
			{...frameProps}
			zIndex={18}
			border="1px solid"
			borderColor={workspaceBoundaryColor}
			borderRadius={{ base: 'xl', md: 'card' }}
			bg="bg.header"
			backdropFilter="blur(16px)"
			px={{ base: 2.5, sm: 3, md: 4 }}
			py={{ base: 2.5, md: 3 }}
			transition="left 180ms ease, right 180ms ease, box-shadow 180ms ease"
			_motionReduce={{ transition: 'none' }}
		>
			<HStack justify="space-between" gap={{ base: 2, md: 3 }}>
				<LessonNavigationPinButton isPinned={isPinned} onTogglePinned={onTogglePinned} />

				<HStack gap={{ base: 2, md: 3 }} ml="auto">
					<Button
						minH="44px"
						minW={{ base: '84px', sm: '112px' }}
						borderRadius="full"
						variant="outline"
						disabled={!previousLesson || isNavigating}
						onClick={() => {
							if (previousLesson) {
								onLessonSelect(previousLesson.subsection.id);
							}
						}}
					>
						<FiChevronLeft />
						Previous
					</Button>

					<NextLessonButton
						canComplete={canComplete}
						isCompletingLesson={isCompletingLesson}
						isNavigating={isNavigating}
						label={nextButtonLabel}
						onClick={onCompleteLesson}
					/>
				</HStack>
			</HStack>
		</Box>
	);
};
