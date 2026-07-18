import type { OnboardingStatus } from '~/lib/api/onboarding';

const onboardingStatusCacheKey = 'shattak:onboarding-status';
const onboardingStatusCacheTtlMs = 60 * 1000;

type CachedOnboardingStatus = {
	savedAt: number;
	status: OnboardingStatus;
};

const canUseSessionStorage = () => typeof window !== 'undefined' && Boolean(window.sessionStorage);

export const readCachedOnboardingStatus = () => {
	if (!canUseSessionStorage()) {
		return null;
	}

	try {
		const cachedValue = window.sessionStorage.getItem(onboardingStatusCacheKey);

		if (!cachedValue) {
			return null;
		}

		const parsedValue = JSON.parse(cachedValue) as CachedOnboardingStatus;
		const isFresh = Date.now() - parsedValue.savedAt <= onboardingStatusCacheTtlMs;

		return isFresh ? parsedValue.status : null;
	} catch {
		return null;
	}
};

export const writeCachedOnboardingStatus = (status: OnboardingStatus) => {
	if (!canUseSessionStorage()) {
		return;
	}

	window.sessionStorage.setItem(
		onboardingStatusCacheKey,
		JSON.stringify({
			savedAt: Date.now(),
			status
		} satisfies CachedOnboardingStatus)
	);
};

export const clearCachedOnboardingStatus = () => {
	if (!canUseSessionStorage()) {
		return;
	}

	window.sessionStorage.removeItem(onboardingStatusCacheKey);
};
