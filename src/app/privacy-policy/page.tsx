import type { Metadata } from 'next';

import LegalPage from '~/lib/containers/legal/LegalPage';

const TITLE = 'Privacy Policy | Shattak';
const DESCRIPTION =
	'Placeholder privacy policy for Shattak, explaining general data collection, account authentication, platform usage, and user choices.';

export const metadata: Metadata = {
	title: { absolute: TITLE },
	description: DESCRIPTION,
	alternates: {
		canonical: '/privacy-policy/'
	}
};

const sections = [
	{
		title: 'Introduction',
		body: [
			'This Privacy Policy is placeholder, general-purpose copy for Shattak. It explains the types of information the platform may collect and how that information may be used.',
			'Final privacy language may be updated later as Shattak expands its courses, enrollment, payments, mentor features, and support workflows.'
		]
	},
	{
		title: 'Information we collect',
		body: [
			'Shattak may collect account information such as name, email address, Google account identifier, profile image, mobile number, college, department, interests, and onboarding status.',
			'The platform may also collect usage and technical information such as session activity, authentication status, device/browser details, course interactions, and basic analytics events.'
		]
	},
	{
		title: 'How we use information',
		body: [
			'Collected information may be used to create and maintain accounts, personalize learning experiences, show relevant courses, manage onboarding, provide support, and improve platform performance.',
			'Shattak may also use information to protect the platform, prevent misuse, maintain security, and communicate important course or account updates.'
		]
	},
	{
		title: 'Account and authentication',
		body: [
			'Student login currently uses Google Identity Services. When users sign in with Google, Shattak receives basic account details needed to create or access the user profile.',
			'Users should review Google account settings and Google privacy controls for details about information managed directly by Google.'
		]
	},
	{
		title: 'Cookies and sessions',
		body: [
			'Shattak may use secure cookies or similar session mechanisms to keep users signed in, protect authenticated routes, and maintain a smooth browsing experience.',
			'Users can clear cookies through their browser settings, but doing so may sign them out or reset parts of their session experience.'
		]
	},
	{
		title: 'Sharing and service providers',
		body: [
			'Shattak may use trusted service providers for hosting, database storage, authentication, media handling, analytics, communications, and operational support.',
			'Information is not intended to be sold. Data may be shared only when needed to operate the platform, comply with applicable requirements, or protect Shattak and its users.'
		]
	},
	{
		title: 'Data retention and security',
		body: [
			'Shattak keeps information for as long as needed to provide the platform, maintain account records, support users, meet operational needs, or satisfy applicable requirements.',
			'Reasonable technical and organizational safeguards should be used to protect user information, but no online system can be guaranteed to be completely secure.'
		]
	},
	{
		title: 'User choices',
		body: [
			'Users may update profile details where the platform provides editing controls. Additional account or data requests can be sent to Shattak through the contact email below.',
			'Users who no longer want to use the platform may request account support or stop using authenticated features.'
		]
	},
	{
		title: 'Changes to this policy',
		body: [
			'This placeholder Privacy Policy may be updated as Shattak adds new features, improves onboarding, introduces enrollment, enables payments, or changes service providers.',
			'When changes are published, continued use of the platform means users acknowledge the updated policy.'
		]
	},
	{
		title: 'Contact information',
		body: [
			'For privacy questions or requests, contact Shattak at hello@shattak.com.',
			'This placeholder page should be replaced with finalized privacy copy before relying on it for formal legal purposes.'
		]
	}
] as const;

const Page = () => (
	<LegalPage
		eyebrow="Privacy"
		title="Privacy Policy"
		description={DESCRIPTION}
		lastUpdated="June 1, 2026"
		sections={sections}
	/>
);

export default Page;
