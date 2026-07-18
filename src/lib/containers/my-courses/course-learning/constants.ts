import { FiAward, FiBookOpen, FiClipboard, FiGift, FiMessageCircle, FiPlayCircle } from 'react-icons/fi';

import type { CourseTab } from './types';

export const courseTabs: CourseTab[] = [
	{ id: 'overview', label: 'Overview', icon: FiBookOpen },
	{ id: 'lessons', label: 'Lessons', icon: FiPlayCircle },
	{ id: 'recordings', label: 'Session Recordings', icon: FiPlayCircle },
	{ id: 'bonus', label: 'Bonus Content', icon: FiGift },
	{ id: 'assignment', label: 'Assignments', icon: FiClipboard },
	{ id: 'certificate', label: 'Certificate', icon: FiAward },
	{ id: 'peerNetwork', label: 'Peer Community', icon: FiMessageCircle }
];

export const workspaceBoundaryColor = 'gray.500';
export const workspaceSelectedBoundaryColor = { _light: 'brand.600', _dark: 'brand.300' };
export const workspaceActiveTextColor = 'ink.900';
export const shattakMarkUrl = '/assets/shattak-logo.jpg';

export const courseNextSteps = [
	'Join the WhatsApp community.',
	'Access your course materials.',
	'Complete all study materials.',
	'Unlock and watch the live session.',
	'Complete your first assignment.',
	'Give us feedback.',
	'Get your certificate.'
];
