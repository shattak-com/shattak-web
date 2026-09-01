import { Badge, Box, Button, Heading, HStack, Image, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FiArrowLeft, FiMaximize2, FiMenu, FiMessageCircle, FiMinimize2 } from 'react-icons/fi';

import type { CourseEnrollment } from '~/lib/api/enrollments';
import ThemeToggle from '~/lib/components/ThemeToggle';

import { shattakMarkUrl, workspaceBoundaryColor } from './constants';
import type { CourseTabId } from './types';
import { formatCourseDate } from './utils';

type CourseWorkspaceHeaderProps = {
	activeTab: CourseTabId;
	enrollment: CourseEnrollment;
	isContentExpanded: boolean;
	onAskDoubt: () => void;
	onOpenMobileNavigation: () => void;
	onToggleContentWidth: () => void;
};

const StandardWorkspaceHeader = ({
	activeTab,
	enrollment,
	isContentExpanded,
	onAskDoubt,
	onOpenMobileNavigation,
	onToggleContentWidth
}: Pick<
	CourseWorkspaceHeaderProps,
	'activeTab' | 'enrollment' | 'isContentExpanded' | 'onAskDoubt' | 'onOpenMobileNavigation' | 'onToggleContentWidth'
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
						borderRadius="full"
						size="sm"
						variant="outline"
						onClick={onToggleContentWidth}
						aria-label={isContentExpanded ? 'Collapse lesson content width' : 'Expand lesson content width'}
						aria-pressed={isContentExpanded}
						title={isContentExpanded ? 'Return to the narrower reading width' : 'Use the full available content width'}
						display={{ base: 'none', md: 'inline-flex' }}
					>
						{isContentExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
						<Box as="span" display={{ base: 'none', xl: 'inline' }}>
							{isContentExpanded ? 'Collapse' : 'Expand'}
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
	activeTab,
	enrollment,
	isContentExpanded,
	onAskDoubt,
	onOpenMobileNavigation,
	onToggleContentWidth
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
		<StandardWorkspaceHeader
			activeTab={activeTab}
			enrollment={enrollment}
			isContentExpanded={isContentExpanded}
			onAskDoubt={onAskDoubt}
			onOpenMobileNavigation={onOpenMobileNavigation}
			onToggleContentWidth={onToggleContentWidth}
		/>
	</Box>
);
