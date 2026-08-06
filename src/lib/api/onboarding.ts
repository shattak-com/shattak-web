import type { AuthenticatedUser } from '~/lib/api/auth';
import { getJson, postJson } from '~/lib/api/client';

export type OnboardingStep = 'MOBILE' | 'EDUCATION' | 'COMPLETE';

export type OnboardingProfile = {
	mobileNumberE164: string | null;
	mobileCountryCode: string | null;
	college: string | null;
	department: string | null;
	passoutYear: string | null;
	interests: string[];
	onboardingCompleted: boolean;
	nextStep: OnboardingStep;
};

export type OnboardingStatus = {
	user: AuthenticatedUser;
	profile: OnboardingProfile;
};

export const getOnboardingStatus = () => getJson<OnboardingStatus>('/onboarding/status');

export const submitMobileNumber = (mobileNumber: string, countryCode = 'IN') =>
	postJson<OnboardingStatus>('/onboarding/mobile', {
		mobileNumber,
		countryCode
	});

export const submitEducationProfile = (college: string, department: string, passoutYear: string, interests: string[]) =>
	postJson<OnboardingStatus>('/onboarding/education', {
		college,
		department,
		passoutYear,
		interests
	});
