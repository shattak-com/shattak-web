import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type OnboardingProfile = {
	mobileNumberE164: string | null;
	mobileSkipCount: number;
	canSkipMobile: boolean;
	college: string | null;
	department: string | null;
	interests: string[];
	nextStep: 'MOBILE' | 'EDUCATION' | 'COMPLETE';
};

type ApiSuccessResponse<T> = {
	success: true;
	data: T;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getDefaultApiBaseUrl = () => {
	if (process.env.NODE_ENV === 'development') {
		return 'http://localhost:5000/api/v1';
	}

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
	if (siteUrl) {
		return trimTrailingSlash(new URL('/api/v1', siteUrl).toString());
	}

	return 'http://localhost:5000/api/v1';
};

const getApiBaseUrl = () =>
	trimTrailingSlash(
		process.env.SHATTAK_API_BASE_URL ?? process.env.NEXT_PUBLIC_SHATTAK_API_BASE_URL ?? getDefaultApiBaseUrl()
	);

const userSessionCookieName = process.env.SHATTAK_USER_SESSION_COOKIE_NAME ?? 'shattak_session';
const adminSessionCookieName = process.env.SHATTAK_ADMIN_SESSION_COOKIE_NAME ?? 'shattak_admin_session';

const redirectTo = (request: NextRequest, pathname: string) => NextResponse.redirect(new URL(pathname, request.url));
const normalizePathname = (pathname: string) => (pathname === '/' ? pathname : trimTrailingSlash(pathname));

const readApiData = async <T>(path: string, request: NextRequest): Promise<T | null> => {
	const cookie = request.headers.get('cookie') ?? '';

	if (!cookie) {
		return null;
	}

	try {
		const response = await fetch(`${getApiBaseUrl()}${path}`, {
			headers: {
				Accept: 'application/json',
				cookie
			}
		});

		if (!response.ok) {
			return null;
		}

		const body = (await response.json()) as ApiSuccessResponse<T>;

		return body.success ? body.data : null;
	} catch {
		return null;
	}
};

const getOnboardingStatus = (request: NextRequest) =>
	readApiData<{ profile: OnboardingProfile }>('/onboarding/status', request);

const getAdminSession = (request: NextRequest) => readApiData('/admin/me', request);

const isEducationProfileComplete = (profile: OnboardingProfile) =>
	Boolean(profile.college && profile.department && profile.interests.length > 0);

const getProtectedUserRedirectPath = (profile: OnboardingProfile) => {
	const hasMobileAccess = Boolean(profile.mobileNumberE164) || profile.canSkipMobile;

	if (!hasMobileAccess) {
		return '/onboarding/mobile';
	}

	if (!isEducationProfileComplete(profile)) {
		return profile.mobileNumberE164 || profile.mobileSkipCount > 0 ? '/onboarding/education' : '/onboarding/mobile';
	}

	return null;
};

const getLoginRedirectPath = (profile: OnboardingProfile) => {
	if (profile.nextStep === 'MOBILE') {
		return '/onboarding/mobile';
	}

	if (profile.nextStep === 'EDUCATION') {
		return '/onboarding/education';
	}

	return '/profile';
};

const hasUserSessionCookie = (request: NextRequest) => Boolean(request.cookies.get(userSessionCookieName)?.value);

const handleLoginRoute = async (request: NextRequest) => {
	if (!hasUserSessionCookie(request)) {
		return NextResponse.next();
	}

	const onboardingStatus = await getOnboardingStatus(request);

	return onboardingStatus ? redirectTo(request, getLoginRedirectPath(onboardingStatus.profile)) : NextResponse.next();
};

const handleMobileOnboardingRoute = (request: NextRequest, profile: OnboardingProfile) => {
	if (!profile.mobileNumberE164) {
		return NextResponse.next();
	}

	return redirectTo(request, isEducationProfileComplete(profile) ? '/profile' : '/onboarding/education');
};

const handleEducationOnboardingRoute = (request: NextRequest, profile: OnboardingProfile) => {
	if (!profile.mobileNumberE164 && (profile.mobileSkipCount === 0 || !profile.canSkipMobile)) {
		return redirectTo(request, '/onboarding/mobile');
	}

	if (profile.mobileNumberE164 && isEducationProfileComplete(profile)) {
		return redirectTo(request, '/profile');
	}

	return NextResponse.next();
};

const handleProtectedUserRoute = (request: NextRequest, profile: OnboardingProfile) => {
	const protectedRedirectPath = getProtectedUserRedirectPath(profile);

	return protectedRedirectPath ? redirectTo(request, protectedRedirectPath) : NextResponse.next();
};

const handleAdminRoute = async (request: NextRequest) => {
	const pathname = normalizePathname(request.nextUrl.pathname);
	const hasAdminCookie = Boolean(request.cookies.get(adminSessionCookieName)?.value);

	if (pathname === '/admin/login') {
		if (!hasAdminCookie) {
			return NextResponse.next();
		}

		const adminSession = await getAdminSession(request);

		return adminSession ? redirectTo(request, '/admin/users') : NextResponse.next();
	}

	if (!hasAdminCookie) {
		return redirectTo(request, '/admin/login');
	}

	const adminSession = await getAdminSession(request);

	if (!adminSession) {
		return redirectTo(request, '/admin/login');
	}

	if (pathname === '/admin') {
		return redirectTo(request, '/admin/users');
	}

	return NextResponse.next();
};

const handleUserRoute = async (request: NextRequest) => {
	const pathname = normalizePathname(request.nextUrl.pathname);

	if (pathname === '/login') {
		return handleLoginRoute(request);
	}

	if (!hasUserSessionCookie(request)) {
		return redirectTo(request, '/login');
	}

	const onboardingStatus = await getOnboardingStatus(request);

	if (!onboardingStatus) {
		return redirectTo(request, '/login');
	}

	const { profile } = onboardingStatus;

	if (pathname === '/onboarding/mobile') {
		return handleMobileOnboardingRoute(request, profile);
	}

	if (pathname === '/onboarding/education') {
		return handleEducationOnboardingRoute(request, profile);
	}

	return handleProtectedUserRoute(request, profile);
};

export const proxy = async (request: NextRequest) => {
	const pathname = normalizePathname(request.nextUrl.pathname);

	if (pathname === '/admin' || pathname.startsWith('/admin/')) {
		return handleAdminRoute(request);
	}

	if (pathname === '/login' || pathname === '/profile' || pathname.startsWith('/onboarding/')) {
		return handleUserRoute(request);
	}

	return NextResponse.next();
};

export const config = {
	matcher: ['/admin/:path*', '/login/:path*', '/profile/:path*', '/onboarding/:path*']
};
