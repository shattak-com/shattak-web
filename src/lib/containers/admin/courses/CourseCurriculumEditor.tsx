'use client';

import { Badge, Box, Button, HStack, Stack, Text } from '@chakra-ui/react';

import { ConfirmationDialog } from './curriculum-editor/ConfirmationDialog';
import { CurriculumModuleCard } from './curriculum-editor/CurriculumModuleCard';
import { CurriculumSubsectionPanel } from './curriculum-editor/CurriculumSubsectionPanel';
import { FeedbackBox } from './curriculum-editor/FormControls';
import type { CourseCurriculumEditorProps } from './curriculum-editor/types';
import { useCourseCurriculumEditor } from './curriculum-editor/useCourseCurriculumEditor';

const CourseCurriculumEditor = ({ courseId, sectionKey, title, description }: CourseCurriculumEditorProps) => {
	const editor = useCourseCurriculumEditor({ courseId, sectionKey });

	if (!courseId) {
		return (
			<Box border="1px dashed" borderColor="border.default" borderRadius="xl" p={5}>
				<Text fontWeight="semibold">Save the course first</Text>
				<Text mt={1} fontSize="sm" color="text.muted">
					Create the course draft before adding nested curriculum modules and enrolled-only content.
				</Text>
			</Box>
		);
	}

	if (editor.isLoading) {
		return (
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" p={5}>
				<Text color="text.muted">Loading curriculum...</Text>
			</Box>
		);
	}

	return (
		<Stack gap={4}>
			<Box border="1px solid" borderColor="border.default" borderRadius="xl" p={4}>
				<HStack justify="space-between" gap={3} flexWrap="wrap">
					<Box>
						<HStack gap={2} flexWrap="wrap">
							<Text fontWeight="bold">{title}</Text>
							<Badge colorPalette="gray">{editor.sectionModules.length} modules</Badge>
							<Badge colorPalette="gray">{editor.totalSubsections} subsections</Badge>
							<Badge colorPalette="gray">{editor.totalContentBlocks} content blocks</Badge>
							{editor.collapsedModuleCount ? (
								<Badge colorPalette="gray">{editor.collapsedModuleCount} collapsed</Badge>
							) : null}
						</HStack>
						<Text mt={1} fontSize="sm" color="text.muted">
							{description}
						</Text>
					</Box>
					<HStack gap={2} flexWrap="wrap">
						<Button
							type="button"
							variant="outline"
							borderRadius="full"
							disabled={!editor.sectionModules.length || editor.collapsedModuleCount === editor.sectionModules.length}
							onClick={editor.collapseAllModules}
						>
							Collapse all
						</Button>
						<Button
							type="button"
							variant="outline"
							borderRadius="full"
							disabled={!editor.collapsedModuleCount}
							onClick={editor.expandAllModules}
						>
							Expand all
						</Button>
						<Button type="button" variant="outline" borderRadius="full" onClick={editor.addModule}>
							Add module
						</Button>
						<Button
							type="button"
							bg="primary"
							color="text.inverse"
							borderRadius="full"
							disabled={editor.isSaving}
							onClick={editor.saveCurriculum}
						>
							{editor.isSaving ? 'Saving...' : 'Save curriculum'}
						</Button>
					</HStack>
				</HStack>
			</Box>

			{editor.feedback ? <FeedbackBox feedback={editor.feedback} /> : null}

			{editor.sectionModules.length ? null : (
				<Box border="1px dashed" borderColor="border.default" borderRadius="xl" p={5}>
					<Text fontSize="sm" color="text.muted">
						No modules added yet. Add a module, then add subsections and optional enrolled-only content blocks.
					</Text>
				</Box>
			)}

			{editor.sectionModules.map((module, moduleIndex) => (
				<CurriculumModuleCard
					key={module.id ?? `module-${moduleIndex}`}
					module={module}
					moduleIndex={moduleIndex}
					moduleCount={editor.sectionModules.length}
					isCollapsed={editor.isModuleCollapsed(module, moduleIndex)}
					onToggleCollapse={editor.toggleModuleCollapse}
					onMoveModule={editor.moveModule}
					onRequestRemoveModule={editor.requestRemoveModule}
					onUpdateModule={editor.updateModule}
					onAddSubsection={editor.addSubsection}
					onOpenSubsectionPanel={editor.openSubsectionPanel}
				/>
			))}

			<CurriculumSubsectionPanel
				selectedModuleIndex={editor.selectedModuleIndex}
				selectedModule={editor.selectedModule}
				selectedSubsectionIndex={editor.selectedSubsectionIndex}
				selectedSubsection={editor.selectedSubsection}
				uploadingBlockKey={editor.uploadingBlockKey}
				onClose={editor.closeSubsectionPanel}
				onAddSubsection={editor.addSubsection}
				onMoveSubsection={editor.moveSubsection}
				onRequestRemoveSubsection={editor.requestRemoveSubsection}
				onRequestRemoveContentBlock={editor.requestRemoveContentBlock}
				onSetSelectedSubsectionIndex={editor.setSelectedSubsectionIndex}
				onUpdateSubsection={editor.updateSubsection}
				onUpdateContentBlock={editor.updateContentBlock}
				onMediaUpload={editor.uploadMedia}
			/>

			{editor.pendingRemoval ? (
				<ConfirmationDialog
					confirmation={editor.pendingRemoval}
					onCancel={() => editor.setPendingRemoval(null)}
					onConfirm={editor.confirmPendingRemoval}
				/>
			) : null}
		</Stack>
	);
};

export default CourseCurriculumEditor;
