import { Badge, Box, Button, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiChevronDown, FiChevronRight, FiEdit3 } from 'react-icons/fi';

import type { AdminCurriculumModule } from '~/lib/api/admin-curriculum';

import { FieldLabel } from './FormControls';
import type { UpdateModule } from './types';

type CurriculumModuleCardProps = {
	module: AdminCurriculumModule;
	moduleIndex: number;
	moduleCount: number;
	isCollapsed: boolean;
	onToggleCollapse: (module: AdminCurriculumModule, moduleIndex: number) => void;
	onMoveModule: (moduleIndex: number, nextIndex: number) => void;
	onRequestRemoveModule: (moduleIndex: number) => void;
	onUpdateModule: UpdateModule;
	onAddSubsection: (moduleIndex: number) => void;
	onOpenSubsectionPanel: (moduleIndex: number, subsectionIndex?: number) => void;
};

export const CurriculumModuleCard = ({
	module,
	moduleIndex,
	moduleCount,
	isCollapsed,
	onToggleCollapse,
	onMoveModule,
	onRequestRemoveModule,
	onUpdateModule,
	onAddSubsection,
	onOpenSubsectionPanel
}: CurriculumModuleCardProps) => (
	<Box
		key={module.id ?? `module-${moduleIndex}`}
		border="1px solid"
		borderColor="gray.500"
		borderLeftWidth="4px"
		borderLeftColor={isCollapsed ? 'gray.500' : 'brand.600'}
		borderRadius="xl"
		bg={isCollapsed ? 'bg.subtle' : 'bg.card'}
		p={4}
	>
		<Stack gap={4}>
			<HStack justify="space-between" gap={3} flexWrap="wrap">
				<HStack gap={2} flexWrap="wrap">
					<Badge colorPalette="orange">Module {moduleIndex + 1}</Badge>
					<Badge colorPalette="gray">{module.subsections.length} subsections</Badge>
					<Badge colorPalette="gray">
						{module.subsections.reduce((total, subsection) => total + subsection.contentBlocks.length, 0)} content
						blocks
					</Badge>
					<Badge colorPalette={isCollapsed ? 'gray' : 'green'}>{isCollapsed ? 'Collapsed' : 'Expanded'}</Badge>
					<Text fontWeight="semibold">{module.title.trim() || 'Untitled module'}</Text>
				</HStack>
				<HStack gap={2}>
					<Button
						type="button"
						size="xs"
						variant="outline"
						borderRadius="full"
						onClick={() => onToggleCollapse(module, moduleIndex)}
					>
						<HStack gap={1}>
							{isCollapsed ? <FiChevronRight aria-hidden /> : <FiChevronDown aria-hidden />}
							<Text as="span">{isCollapsed ? 'Expand' : 'Collapse'}</Text>
						</HStack>
					</Button>
					<Button
						type="button"
						size="xs"
						variant="outline"
						borderRadius="full"
						disabled={moduleIndex === 0}
						onClick={() => onMoveModule(moduleIndex, moduleIndex - 1)}
					>
						Move up
					</Button>
					<Button
						type="button"
						size="xs"
						variant="outline"
						borderRadius="full"
						disabled={moduleIndex === moduleCount - 1}
						onClick={() => onMoveModule(moduleIndex, moduleIndex + 1)}
					>
						Move down
					</Button>
					<Button
						type="button"
						size="xs"
						variant="outline"
						borderRadius="full"
						color="red.500"
						onClick={() => onRequestRemoveModule(moduleIndex)}
					>
						Remove
					</Button>
				</HStack>
			</HStack>

			{isCollapsed ? (
				<Box borderTop="1px solid" borderColor="border.default" pt={4}>
					<Text fontSize="sm" color="text.muted">
						Module details are collapsed. Expand this module to edit its title, description, and subsections.
					</Text>
				</Box>
			) : (
				<>
					<SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
						<Box>
							<FieldLabel>Module title</FieldLabel>
							<Input
								value={module.title}
								onChange={event => {
									const nextTitle = event.currentTarget.value ?? '';

									onUpdateModule(moduleIndex, currentModule => ({
										...currentModule,
										title: nextTitle
									}));
								}}
								placeholder="Guitar fundamentals"
							/>
						</Box>
						<Box>
							<FieldLabel>Short description</FieldLabel>
							<Input
								value={module.description}
								onChange={event => {
									const nextDescription = event.currentTarget.value ?? '';

									onUpdateModule(moduleIndex, currentModule => ({
										...currentModule,
										description: nextDescription
									}));
								}}
								placeholder="Optional admin/public context"
							/>
						</Box>
					</SimpleGrid>

					<Box borderTop="1px solid" borderColor="border.default" pt={4}>
						<HStack justify="space-between" gap={3} flexWrap="wrap">
							<Box>
								<HStack gap={2} flexWrap="wrap">
									<Text fontSize="sm" fontWeight="semibold">
										Subsections
									</Text>
									<Badge colorPalette="gray">{module.subsections.length} total</Badge>
									<Badge colorPalette="gray">
										{module.subsections.reduce((total, subsection) => total + subsection.contentBlocks.length, 0)}{' '}
										content blocks
									</Badge>
								</HStack>
								<Text mt={1} fontSize="xs" color="text.muted">
									Manage subsection details in the side panel to keep this page compact.
								</Text>
							</Box>
							<HStack gap={2} flexWrap="wrap">
								<Button
									type="button"
									size="sm"
									variant="outline"
									borderRadius="full"
									onClick={() => onAddSubsection(moduleIndex)}
								>
									Add subsection
								</Button>
								<Button
									type="button"
									size="sm"
									bg="primary"
									color="ink.900"
									borderRadius="full"
									onClick={() => onOpenSubsectionPanel(moduleIndex)}
								>
									Manage subsections
								</Button>
							</HStack>
						</HStack>

						{module.subsections.length ? (
							<SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={2} mt={3}>
								{module.subsections.slice(0, 6).map((subsection, subsectionIndex) => (
									<Button
										key={subsection.id ?? `subsection-summary-${subsectionIndex}`}
										type="button"
										variant="outline"
										borderColor="gray.500"
										borderRadius="lg"
										h="auto"
										justifyContent="flex-start"
										p={3}
										_hover={{ borderColor: 'primary', bg: 'bg.subtle' }}
										_focusVisible={{ borderColor: 'primary', boxShadow: 'primary' }}
										onClick={() => onOpenSubsectionPanel(moduleIndex, subsectionIndex)}
									>
										<Stack gap={1.5} align="stretch" minW={0} w="full">
											<HStack gap={2} flexWrap="wrap">
												<Badge colorPalette="gray">Subsection {subsectionIndex + 1}</Badge>
												{subsection.contentBlocks.length ? (
													<Badge colorPalette="purple">{subsection.contentBlocks.length} blocks</Badge>
												) : null}
											</HStack>
											<Text fontSize="sm" fontWeight="semibold" textAlign="left">
												{subsection.title.trim() || 'Untitled subsection'}
											</Text>
											<Text fontSize="xs" color="text.muted" textAlign="left">
												{subsection.durationLabel.trim() || 'No duration set'}
											</Text>
											<HStack gap={1} color="brand.600">
												<FiEdit3 aria-hidden />
												<Text fontSize="xs" fontWeight="bold">
													Edit content
												</Text>
												<FiChevronRight aria-hidden />
											</HStack>
										</Stack>
									</Button>
								))}
								{module.subsections.length > 6 ? (
									<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={3}>
										<Text fontSize="sm" fontWeight="semibold">
											+{module.subsections.length - 6} more subsections
										</Text>
										<Text mt={1} fontSize="xs" color="text.muted">
											Open the side panel to view and edit the full list.
										</Text>
									</Box>
								) : null}
							</SimpleGrid>
						) : (
							<Box border="1px dashed" borderColor="border.default" borderRadius="lg" p={4} mt={3}>
								<Text fontSize="sm" color="text.muted">
									No subsections in this module yet.
								</Text>
							</Box>
						)}
					</Box>
				</>
			)}
		</Stack>
	</Box>
);
