import type { OnboardingProfile } from '~/lib/api/onboarding';

export const isEducationProfileComplete = (profile: OnboardingProfile) =>
	Boolean(profile.college && profile.department && profile.passoutYear && profile.interests.length > 0);

export const getOnboardingRedirectPath = (profile: OnboardingProfile, completedPath = '/profile') => {
	if (profile.nextStep === 'MOBILE') {
		return '/onboarding/mobile';
	}

	if (profile.nextStep === 'EDUCATION') {
		return '/onboarding/education';
	}

	return completedPath;
};

export const getProtectedUserRouteRedirectPath = (profile: OnboardingProfile) => {
	if (!profile.mobileNumberE164) {
		return '/onboarding/mobile';
	}

	if (!isEducationProfileComplete(profile)) {
		return '/onboarding/education';
	}

	return null;
};
