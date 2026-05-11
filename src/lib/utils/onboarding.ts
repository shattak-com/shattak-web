import type { OnboardingProfile } from '~/lib/api/onboarding';

export const isEducationProfileComplete = (profile: OnboardingProfile) =>
	Boolean(profile.college && profile.department && profile.interests.length > 0);

export const getOnboardingRedirectPath = (profile: OnboardingProfile, completedPath = '/profile') => {
	if (profile.nextStep === 'MOBILE') {
		return '/onboarding/mobile';
	}

	if (profile.nextStep === 'EDUCATION') {
		return '/onboarding/education';
	}

	return completedPath;
};

export const getPostMobileSkipPath = (profile: OnboardingProfile) =>
	isEducationProfileComplete(profile) ? '/profile' : '/onboarding/education';

export const getProtectedUserRouteRedirectPath = (profile: OnboardingProfile) => {
	const hasMobileAccess = Boolean(profile.mobileNumberE164) || profile.canSkipMobile;

	if (!hasMobileAccess) {
		return '/onboarding/mobile';
	}

	if (!isEducationProfileComplete(profile)) {
		return profile.mobileNumberE164 || profile.mobileSkipCount > 0 ? '/onboarding/education' : '/onboarding/mobile';
	}

	return null;
};
