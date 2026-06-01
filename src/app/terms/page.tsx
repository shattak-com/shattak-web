import type { Metadata } from 'next';

import LegalPage from '~/lib/containers/legal/LegalPage';

const TITLE = 'Terms & Conditions | Shattak';
const DESCRIPTION =
	'Placeholder terms and conditions for using Shattak, including account access, platform use, responsibilities, and contact information.';

export const metadata: Metadata = {
	title: { absolute: TITLE },
	description: DESCRIPTION,
	alternates: {
		canonical: '/terms/'
	}
};

const sections = [
	{
		title: 'Introduction',
		body: [
			'These Terms & Conditions are placeholder, general-purpose terms for Shattak and are provided so users can review the expected platform rules before signing in.',
			'Final legal language may be updated later. By using the platform, users are expected to follow these terms and any future finalized policies published by Shattak.'
		]
	},
	{
		title: 'Use of the platform',
		body: [
			'Shattak provides access to learning experiences, course information, live-session details, mentor-led programs, and related educational resources.',
			'Users should use the platform only for lawful, respectful, and learning-related purposes. Misuse, disruption, unauthorized access, or attempts to interfere with platform operations are not allowed.'
		]
	},
	{
		title: 'User responsibilities',
		body: [
			'Users are responsible for keeping their profile information accurate, using course materials appropriately, and respecting instructors, mentors, students, and administrators.',
			'Course content, session materials, documents, videos, and related resources should not be copied, redistributed, resold, or shared outside the platform unless Shattak gives explicit permission.'
		]
	},
	{
		title: 'Account and authentication',
		body: [
			'Student login currently uses Google-based authentication. Users are responsible for maintaining access to their Google account and keeping their devices secure.',
			'Shattak may restrict, suspend, or remove access if an account is used in a way that violates these terms, compromises security, or harms other users.'
		]
	},
	{
		title: 'Course access and platform changes',
		body: [
			'Course availability, schedules, instructors, materials, and features may change as the platform evolves. Shattak may improve, modify, or remove features when needed.',
			'If paid courses, refunds, subscriptions, or certificates are introduced or updated, additional payment and course-specific terms may apply.'
		]
	},
	{
		title: 'Data collection and privacy',
		body: [
			'Use of Shattak may involve collection of account, profile, learning, and technical information needed to operate the platform.',
			'More details about data handling are described in the Privacy Policy. Users should review that policy before using the platform.'
		]
	},
	{
		title: 'Limitations of liability',
		body: [
			'Shattak aims to provide useful and reliable educational experiences, but the platform and content are provided on an as-available basis.',
			'To the extent permitted by applicable law, Shattak is not responsible for indirect losses, missed opportunities, third-party service outages, or outcomes that depend on user effort, external hiring decisions, or other factors outside Shattak control.'
		]
	},
	{
		title: 'Changes to these terms',
		body: [
			'These placeholder terms may be updated as Shattak adds new features, policies, courses, payments, enrollment flows, or compliance requirements.',
			'When changes are published, continued use of the platform means users accept the updated terms.'
		]
	},
	{
		title: 'Contact information',
		body: [
			'For questions about these Terms & Conditions, contact Shattak at hello@shattak.com.',
			'This placeholder page should be replaced with finalized legal copy before relying on it for formal legal purposes.'
		]
	}
] as const;

const Page = () => (
	<LegalPage
		eyebrow="Legal"
		title="Terms & Conditions"
		description={DESCRIPTION}
		lastUpdated="June 1, 2026"
		sections={sections}
	/>
);

export default Page;
