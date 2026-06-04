import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

import {
	getAdminCourseCurriculum,
	replaceAdminCourseCurriculum,
	type AdminCourseCurriculum,
	type AdminCurriculumContentBlock,
	type AdminCurriculumModule,
	type AdminCurriculumSubsection
} from '~/lib/api/admin-curriculum';
import { uploadAdminMedia } from '~/lib/api/admin-uploads';

import { contentBlockTypeOptions } from './constants';
import type { CurriculumFeedback, CurriculumSectionKey, PendingRemoval } from './types';
import {
	createModule,
	createSubsection,
	emptyCurriculum,
	getCurriculumIssues,
	getModuleStateKey,
	moveItem,
	normalizeCurriculum,
	normalizeModules
} from './utils';

export const useCourseCurriculumEditor = ({
	courseId,
	sectionKey
}: {
	courseId?: string;
	sectionKey: CurriculumSectionKey;
}) => {
	const [curriculum, setCurriculum] = useState<AdminCourseCurriculum>(emptyCurriculum);
	const [isLoading, setIsLoading] = useState(Boolean(courseId));
	const [isSaving, setIsSaving] = useState(false);
	const [uploadingBlockKey, setUploadingBlockKey] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<CurriculumFeedback | null>(null);
	const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
	const [collapsedModuleKeys, setCollapsedModuleKeys] = useState<Set<string>>(() => new Set());
	const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
	const [selectedSubsectionIndex, setSelectedSubsectionIndex] = useState<number | null>(null);

	const sectionModules = useMemo(() => curriculum.sections[sectionKey] ?? [], [curriculum.sections, sectionKey]);
	const selectedModule = selectedModuleIndex === null ? null : (sectionModules[selectedModuleIndex] ?? null);
	const selectedSubsection =
		selectedModule && selectedSubsectionIndex !== null
			? (selectedModule.subsections[selectedSubsectionIndex] ?? null)
			: null;
	const totalSubsections = sectionModules.reduce((total, module) => total + module.subsections.length, 0);
	const totalContentBlocks = sectionModules.reduce(
		(total, module) =>
			total +
			module.subsections.reduce((subsectionTotal, subsection) => subsectionTotal + subsection.contentBlocks.length, 0),
		0
	);
	const collapsedModuleCount = sectionModules.filter((module, moduleIndex) =>
		collapsedModuleKeys.has(getModuleStateKey(sectionKey, module, moduleIndex))
	).length;

	useEffect(() => {
		if (!courseId) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;

		setIsLoading(true);
		setFeedback(null);

		getAdminCourseCurriculum(courseId)
			.then(result => {
				if (isMounted) {
					setCurriculum(normalizeCurriculum(result.curriculum));
				}
			})
			.catch(error => {
				if (isMounted) {
					setFeedback({
						tone: 'error',
						message: error instanceof Error ? error.message : 'Unable to load curriculum.'
					});
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
	}, [courseId]);

	useEffect(() => {
		if (selectedModuleIndex === null) {
			return;
		}

		const currentModule = sectionModules[selectedModuleIndex];

		if (!currentModule) {
			setSelectedModuleIndex(null);
			setSelectedSubsectionIndex(null);
			return;
		}

		if (!currentModule.subsections.length) {
			setSelectedSubsectionIndex(null);
			return;
		}

		if (selectedSubsectionIndex === null || selectedSubsectionIndex >= currentModule.subsections.length) {
			setSelectedSubsectionIndex(currentModule.subsections.length - 1);
		}
	}, [sectionModules, selectedModuleIndex, selectedSubsectionIndex]);

	const updateSectionModules = (update: (modules: AdminCurriculumModule[]) => AdminCurriculumModule[]) => {
		setCurriculum(currentCurriculum => {
			const nextModules = normalizeModules(sectionKey, update(currentCurriculum.sections[sectionKey] ?? []));

			return {
				sections: {
					...currentCurriculum.sections,
					[sectionKey]: nextModules
				}
			};
		});
	};

	const addModule = () => {
		updateSectionModules(modules => [...modules, createModule(sectionKey)]);
	};

	const updateModule = (moduleIndex: number, update: (module: AdminCurriculumModule) => AdminCurriculumModule) => {
		updateSectionModules(modules => modules.map((module, index) => (index === moduleIndex ? update(module) : module)));
	};

	const updateSubsection = (
		moduleIndex: number,
		subsectionIndex: number,
		update: (subsection: AdminCurriculumSubsection) => AdminCurriculumSubsection
	) => {
		updateModule(moduleIndex, module => ({
			...module,
			subsections: module.subsections.map((subsection, index) =>
				index === subsectionIndex ? update(subsection) : subsection
			)
		}));
	};

	const updateContentBlock = (
		moduleIndex: number,
		subsectionIndex: number,
		blockIndex: number,
		update: (block: AdminCurriculumContentBlock) => AdminCurriculumContentBlock
	) => {
		updateSubsection(moduleIndex, subsectionIndex, subsection => ({
			...subsection,
			contentBlocks: subsection.contentBlocks.map((block, index) => (index === blockIndex ? update(block) : block))
		}));
	};

	const closeSubsectionPanel = () => {
		setSelectedModuleIndex(null);
		setSelectedSubsectionIndex(null);
	};

	const openSubsectionPanel = (moduleIndex: number, subsectionIndex = 0) => {
		const currentModule = sectionModules[moduleIndex];

		setSelectedModuleIndex(moduleIndex);
		setSelectedSubsectionIndex(
			currentModule?.subsections.length ? Math.min(subsectionIndex, currentModule.subsections.length - 1) : null
		);
	};

	const moveModule = (moduleIndex: number, nextIndex: number) => {
		updateSectionModules(modules => moveItem(modules, moduleIndex, nextIndex));

		setSelectedModuleIndex(currentIndex => {
			if (currentIndex === null) {
				return currentIndex;
			}

			if (currentIndex === moduleIndex) {
				return nextIndex;
			}

			if (currentIndex === nextIndex) {
				return moduleIndex;
			}

			return currentIndex;
		});
	};

	const executeRemoveModule = (moduleIndex: number) => {
		updateSectionModules(modules => modules.filter((_, index) => index !== moduleIndex));

		setSelectedModuleIndex(currentIndex => {
			if (currentIndex === null) {
				return currentIndex;
			}

			if (currentIndex === moduleIndex) {
				setSelectedSubsectionIndex(null);
				return null;
			}

			return currentIndex > moduleIndex ? currentIndex - 1 : currentIndex;
		});

		setCollapsedModuleKeys(currentKeys => {
			const nextKeys = new Set(currentKeys);
			const currentModule = sectionModules[moduleIndex];

			if (currentModule) {
				nextKeys.delete(getModuleStateKey(sectionKey, currentModule, moduleIndex));
			}

			return nextKeys;
		});
	};

	const requestRemoveModule = (moduleIndex: number) => {
		const currentModule = sectionModules[moduleIndex];
		const moduleTitle = currentModule?.title.trim() || `Module ${moduleIndex + 1}`;

		setPendingRemoval({
			title: 'Remove module?',
			message: `This will remove "${moduleTitle}" with all of its subsections and detailed content blocks. This change is not saved until you save the curriculum.`,
			confirmLabel: 'Remove module',
			onConfirm: () => executeRemoveModule(moduleIndex)
		});
	};

	const addSubsection = (moduleIndex: number) => {
		const nextSubsectionIndex = sectionModules[moduleIndex]?.subsections.length ?? 0;

		updateModule(moduleIndex, currentModule => ({
			...currentModule,
			subsections: [...currentModule.subsections, createSubsection()]
		}));
		setSelectedModuleIndex(moduleIndex);
		setSelectedSubsectionIndex(nextSubsectionIndex);
	};

	const moveSubsection = (moduleIndex: number, subsectionIndex: number, nextIndex: number) => {
		updateModule(moduleIndex, currentModule => ({
			...currentModule,
			subsections: moveItem(currentModule.subsections, subsectionIndex, nextIndex)
		}));

		if (selectedModuleIndex !== moduleIndex) {
			return;
		}

		setSelectedSubsectionIndex(currentIndex => {
			if (currentIndex === null) {
				return currentIndex;
			}

			if (currentIndex === subsectionIndex) {
				return nextIndex;
			}

			if (currentIndex === nextIndex) {
				return subsectionIndex;
			}

			return currentIndex;
		});
	};

	const executeRemoveSubsection = (moduleIndex: number, subsectionIndex: number) => {
		const subsectionCount = sectionModules[moduleIndex]?.subsections.length ?? 0;

		updateModule(moduleIndex, currentModule => ({
			...currentModule,
			subsections: currentModule.subsections.filter((_, index) => index !== subsectionIndex)
		}));

		if (selectedModuleIndex !== moduleIndex) {
			return;
		}

		setSelectedSubsectionIndex(currentIndex => {
			if (currentIndex === null) {
				return currentIndex;
			}

			if (subsectionCount <= 1) {
				return null;
			}

			if (currentIndex === subsectionIndex) {
				return Math.max(0, subsectionIndex - 1);
			}

			return currentIndex > subsectionIndex ? currentIndex - 1 : currentIndex;
		});
	};

	const requestRemoveSubsection = (moduleIndex: number, subsectionIndex: number) => {
		const subsection = sectionModules[moduleIndex]?.subsections[subsectionIndex];
		const subsectionTitle = subsection?.title.trim() || `Subsection ${subsectionIndex + 1}`;

		setPendingRemoval({
			title: 'Remove subsection?',
			message: `This will remove "${subsectionTitle}" and all detailed content blocks inside it. This change is not saved until you save the curriculum.`,
			confirmLabel: 'Remove subsection',
			onConfirm: () => executeRemoveSubsection(moduleIndex, subsectionIndex)
		});
	};

	const executeRemoveContentBlock = (moduleIndex: number, subsectionIndex: number, blockIndex: number) => {
		updateSubsection(moduleIndex, subsectionIndex, currentSubsection => ({
			...currentSubsection,
			contentBlocks: currentSubsection.contentBlocks.filter((_, index) => index !== blockIndex)
		}));
	};

	const requestRemoveContentBlock = (moduleIndex: number, subsectionIndex: number, blockIndex: number) => {
		const block = sectionModules[moduleIndex]?.subsections[subsectionIndex]?.contentBlocks[blockIndex];
		const blockLabel =
			block?.title.trim() ||
			contentBlockTypeOptions.find(option => option.value === block?.type)?.label ||
			`Content block ${blockIndex + 1}`;

		setPendingRemoval({
			title: 'Remove content block?',
			message: `This will remove "${blockLabel}" from the selected subsection. Uploaded files are not deleted from Cloudinary automatically. This change is not saved until you save the curriculum.`,
			confirmLabel: 'Remove block',
			onConfirm: () => executeRemoveContentBlock(moduleIndex, subsectionIndex, blockIndex)
		});
	};

	const confirmPendingRemoval = () => {
		const removal = pendingRemoval;

		if (!removal) {
			return;
		}

		setPendingRemoval(null);
		removal.onConfirm();
	};

	const isModuleCollapsed = (module: AdminCurriculumModule, moduleIndex: number) =>
		collapsedModuleKeys.has(getModuleStateKey(sectionKey, module, moduleIndex));

	const toggleModuleCollapse = (module: AdminCurriculumModule, moduleIndex: number) => {
		const moduleKey = getModuleStateKey(sectionKey, module, moduleIndex);

		setCollapsedModuleKeys(currentKeys => {
			const nextKeys = new Set(currentKeys);

			if (nextKeys.has(moduleKey)) {
				nextKeys.delete(moduleKey);
			} else {
				nextKeys.add(moduleKey);
			}

			return nextKeys;
		});
	};

	const collapseAllModules = () => {
		setCollapsedModuleKeys(
			new Set(sectionModules.map((module, moduleIndex) => getModuleStateKey(sectionKey, module, moduleIndex)))
		);
	};

	const expandAllModules = () => {
		setCollapsedModuleKeys(new Set());
	};

	const saveCurriculum = async () => {
		if (!courseId) {
			setFeedback({ tone: 'error', message: 'Save the course draft before adding curriculum content.' });
			return;
		}

		const normalizedCurriculum = normalizeCurriculum(curriculum);
		const issues = getCurriculumIssues(normalizedCurriculum);

		if (issues.length) {
			setFeedback({ tone: 'error', message: `Curriculum was not saved. ${issues[0]}` });
			return;
		}

		setIsSaving(true);
		setFeedback(null);

		try {
			const result = await replaceAdminCourseCurriculum(courseId, normalizedCurriculum);

			setCurriculum(normalizeCurriculum(result.curriculum));
			setFeedback({ tone: 'success', message: 'Curriculum saved.' });
		} catch (error) {
			setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to save curriculum.' });
		} finally {
			setIsSaving(false);
		}
	};

	const uploadMedia = async (
		event: ChangeEvent<HTMLInputElement>,
		moduleIndex: number,
		subsectionIndex: number,
		blockIndex: number
	) => {
		const input = event.currentTarget;
		const file = input.files?.[0];

		if (!file) {
			return;
		}

		const blockKey = `${moduleIndex}-${subsectionIndex}-${blockIndex}`;

		setUploadingBlockKey(blockKey);
		setFeedback(null);

		try {
			const result = await uploadAdminMedia(file);

			updateContentBlock(moduleIndex, subsectionIndex, blockIndex, block => ({
				...block,
				url: result.upload.url,
				publicId: result.upload.publicId,
				mimeType: result.upload.mimeType,
				fileName: result.upload.originalFilename || file.name,
				fileSize: result.upload.size ?? result.upload.bytes ?? file.size,
				metadata: {
					...block.metadata,
					resourceType: result.upload.resourceType,
					format: result.upload.format
				}
			}));
			setFeedback({ tone: 'success', message: 'Media uploaded. Save the curriculum to persist it.' });
		} catch (error) {
			setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to upload media.' });
		} finally {
			input.value = '';
			setUploadingBlockKey(null);
		}
	};

	return {
		addModule,
		addSubsection,
		closeSubsectionPanel,
		collapseAllModules,
		collapsedModuleCount,
		confirmPendingRemoval,
		expandAllModules,
		feedback,
		isLoading,
		isModuleCollapsed,
		isSaving,
		moveModule,
		moveSubsection,
		openSubsectionPanel,
		pendingRemoval,
		requestRemoveContentBlock,
		requestRemoveModule,
		requestRemoveSubsection,
		saveCurriculum,
		sectionModules,
		selectedModule,
		selectedModuleIndex,
		selectedSubsection,
		selectedSubsectionIndex,
		setPendingRemoval,
		setSelectedSubsectionIndex,
		toggleModuleCollapse,
		totalContentBlocks,
		totalSubsections,
		updateContentBlock,
		updateModule,
		updateSubsection,
		uploadMedia,
		uploadingBlockKey
	};
};
