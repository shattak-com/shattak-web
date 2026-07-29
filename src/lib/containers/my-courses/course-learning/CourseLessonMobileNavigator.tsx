'use client';

import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiBookOpen, FiChevronDown, FiX } from 'react-icons/fi';

import type { CourseLessonsState } from '~/lib/api/enrollments';

import { workspaceBoundaryColor } from './constants';

type CourseLessonMobileNavigatorProps = {
	children: (onLessonSelect: (subsectionId: string) => void, isOpen: boolean) => ReactNode;
	lessons: CourseLessonsState;
	onLessonSelect: (subsectionId: string) => void;
};

export const CourseLessonMobileNavigator = ({
	children,
	lessons,
	onLessonSelect
}: CourseLessonMobileNavigatorProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const lessonRows = useMemo(
		() => lessons.modules.flatMap(courseModule => courseModule.subsections),
		[lessons.modules]
	);
	const activeLessonIndex = lessonRows.findIndex(lesson => lesson.id === lessons.activeSubsectionId);
	const activeLesson = activeLessonIndex >= 0 ? lessonRows[activeLessonIndex] : null;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}

		if (isOpen && !dialog.open) {
			dialog.showModal();
		} else if (!isOpen && dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	const handleLessonSelect = (subsectionId: string) => {
		setIsOpen(false);
		onLessonSelect(subsectionId);
	};
	const handleOpen = () => {
		if (dialogRef.current && !dialogRef.current.open) {
			dialogRef.current.showModal();
		}

		setIsOpen(true);
	};

	return (
		<>
			<Button
				display={{ base: 'flex', xl: 'none' }}
				variant="outline"
				h="auto"
				minH="56px"
				w="full"
				justifyContent="space-between"
				borderColor={workspaceBoundaryColor}
				borderRadius="xl"
				bg="bg.card"
				px={4}
				py={2.5}
				textAlign="left"
				onClick={handleOpen}
				aria-label={`Open lesson navigator. ${activeLesson?.title || 'Current lesson'}, ${lessons.lessonProgressPercentage}% complete`}
			>
				<HStack gap={3} minW={0}>
					<Box color="primary" fontSize="lg" flexShrink={0} aria-hidden="true">
						<FiBookOpen />
					</Box>
					<Box minW={0}>
						<Text color="text.muted" fontSize="xs" fontWeight="semibold">
							Lesson {Math.max(activeLessonIndex + 1, 1)} of {lessons.totalSubsections}
						</Text>
						<Text color="text.primary" fontSize="sm" fontWeight="semibold" lineClamp={1}>
							{activeLesson?.title || 'Choose a lesson'}
						</Text>
					</Box>
				</HStack>
				<HStack gap={2} flexShrink={0}>
					<Text color="primary" fontSize="sm" fontWeight="bold">
						{lessons.lessonProgressPercentage}%
					</Text>
					<FiChevronDown aria-hidden="true" />
				</HStack>
			</Button>

			<Box
				asChild
				position="fixed"
				inset={0}
				m={0}
				maxH="none"
				maxW="none"
				h="100dvh"
				w="full"
				border={0}
				bg="transparent"
				color="text.primary"
				p={0}
				css={{ '&::backdrop': { background: 'rgba(17, 24, 39, 0.6)' } }}
			>
				<dialog
					ref={dialogRef}
					aria-labelledby="mobile-lesson-navigator-title"
					onCancel={event => {
						event.preventDefault();
						setIsOpen(false);
					}}
				>
					<Box asChild position="absolute" inset={0} border={0} bg="transparent" p={0}>
						<button type="button" tabIndex={-1} aria-label="Close lesson navigator" onClick={() => setIsOpen(false)} />
					</Box>
					<Box
						position="absolute"
						insetX={0}
						bottom={0}
						zIndex={1}
						maxH="min(86dvh, 760px)"
						borderTopRadius="card"
						bg="bg.card"
						overflow="hidden"
						display="flex"
						flexDirection="column"
					>
						<Box borderBottom="1px solid" borderColor={workspaceBoundaryColor} px={4} py={4}>
							<Stack gap={1} pe={10}>
								<Text id="mobile-lesson-navigator-title" fontSize="lg" fontWeight="semibold">
									Course lessons
								</Text>
								<Text color="text.muted" fontSize="sm">
									Choose an available lesson or review your progress.
								</Text>
							</Stack>
							<Button
								autoFocus
								variant="ghost"
								borderRadius="full"
								boxSize="44px"
								minW="44px"
								position="absolute"
								top={3}
								right={3}
								aria-label="Close lesson navigator"
								onClick={() => setIsOpen(false)}
							>
								<FiX />
							</Button>
						</Box>
						<Box flex={1} minH={0} overflowY="auto" overscrollBehavior="contain" px={3} py={4}>
							{children(handleLessonSelect, isOpen)}
						</Box>
					</Box>
				</dialog>
			</Box>
		</>
	);
};
