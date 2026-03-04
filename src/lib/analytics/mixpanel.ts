import mixpanel from 'mixpanel-browser';

let isMixpanelInitialized = false;
let lastTrackedPage = '';
let hasAnonymousProfileSynced = false;
const pendingEvents: Array<{ eventName: string; properties: MixpanelProperties }> = [];

export const ANALYTICS_EVENTS = {
	PAGE_VIEWED: 'Page Viewed',
	CTA_CLICKED: 'CTA Clicked',
	COURSE_FILTER_CHANGED: 'Course Filter Changed',
	COURSE_CARD_CLICKED: 'Course Card Clicked',
	ENROLL_CLICKED: 'Enroll Clicked',
	WHATSAPP_CTA_CLICKED: 'WhatsApp CTA Clicked',
	INSTRUCTOR_CTA_CLICKED: 'Instructor CTA Clicked',
	ANALYTICS_CONSENT_UPDATED: 'Analytics Consent Updated',
	CLIENT_ERROR_CAPTURED: 'Client Error Captured'
} as const;

type AnalyticsConsent = 'granted' | 'denied';

type FirstTouchAttribution = {
	initial_referrer: string;
	initial_landing_path: string;
	initial_utm_source: string;
	initial_utm_medium: string;
	initial_utm_campaign: string;
	initial_utm_term: string;
	initial_utm_content: string;
	recorded_at: string;
};

type MixpanelProperties = Record<string, unknown>;

const ANALYTICS_CONSENT_KEY = 'shattak-analytics-consent';
const FIRST_TOUCH_ATTRIBUTION_KEY = 'shattak-first-touch-attribution';
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? '';
const MIXPANEL_API_HOST = process.env.NEXT_PUBLIC_MIXPANEL_API_HOST ?? '';
const MIXPANEL_ENABLED = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED ?? 'true';
const MIXPANEL_TRACK_LOCALHOST = process.env.NEXT_PUBLIC_MIXPANEL_TRACK_LOCALHOST === 'true';
const MIXPANEL_AUTOCAPTURE = process.env.NEXT_PUBLIC_MIXPANEL_AUTOCAPTURE !== 'false';
const MIXPANEL_DEBUG = process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === 'true';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

const replaySamplePercent = Number(process.env.NEXT_PUBLIC_MIXPANEL_REPLAY_PERCENT ?? '25');
const MIXPANEL_REPLAY_PERCENT = Number.isFinite(replaySamplePercent)
	? Math.min(100, Math.max(0, Math.floor(replaySamplePercent)))
	: 25;

const isBrowser = () => typeof window !== 'undefined';

const isLocalhost = () => isBrowser() && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

const isTrackingEnabled = () =>
	isBrowser() &&
	Boolean(MIXPANEL_TOKEN) &&
	MIXPANEL_ENABLED !== 'false' &&
	(!isLocalhost() || MIXPANEL_TRACK_LOCALHOST);

const cleanProperties = (properties: MixpanelProperties = {}) =>
	Object.entries(properties).reduce<MixpanelProperties>((acc, [key, value]) => {
		if (value === undefined || value === null || value === '') {
			return acc;
		}
		acc[key] = value;
		return acc;
	}, {});

const getPageContext = (): MixpanelProperties => {
	if (!isBrowser()) {
		return {};
	}

	return {
		page_path: window.location.pathname,
		page_search: window.location.search,
		page_url: window.location.href
	};
};

const queueEvent = (eventName: string, properties: MixpanelProperties) => {
	pendingEvents.push({ eventName, properties });

	// Prevent unbounded growth if events are triggered before provider initialization.
	if (pendingEvents.length > 50) {
		pendingEvents.shift();
	}
};

const flushPendingEvents = () => {
	if (
		!isMixpanelInitialized ||
		(isBrowser() && window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'denied') ||
		!pendingEvents.length
	) {
		return;
	}

	const queuedEvents = [...pendingEvents];
	pendingEvents.length = 0;
	queuedEvents.forEach(item => {
		mixpanel.track(item.eventName, item.properties);
	});
};

const getStoredConsent = (): AnalyticsConsent | null => {
	if (!isBrowser()) {
		return null;
	}

	const rawValue = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
	return rawValue === 'granted' || rawValue === 'denied' ? rawValue : null;
};

export const getAnalyticsConsentStatus = () => getStoredConsent();

export const resetAnalyticsConsentChoice = () => {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
};

const readFirstTouchAttribution = (): FirstTouchAttribution | null => {
	if (!isBrowser()) {
		return null;
	}

	const rawValue = window.localStorage.getItem(FIRST_TOUCH_ATTRIBUTION_KEY);
	if (!rawValue) {
		return null;
	}

	try {
		return JSON.parse(rawValue) as FirstTouchAttribution;
	} catch {
		return null;
	}
};

const captureFirstTouchAttribution = (): FirstTouchAttribution | null => {
	if (!isBrowser()) {
		return null;
	}

	const existing = readFirstTouchAttribution();
	if (existing) {
		return existing;
	}

	const params = new URLSearchParams(window.location.search);
	const attribution: FirstTouchAttribution = {
		initial_referrer: document.referrer || 'direct',
		initial_landing_path: `${window.location.pathname}${window.location.search}`,
		initial_utm_source: params.get('utm_source') ?? '',
		initial_utm_medium: params.get('utm_medium') ?? '',
		initial_utm_campaign: params.get('utm_campaign') ?? '',
		initial_utm_term: params.get('utm_term') ?? '',
		initial_utm_content: params.get('utm_content') ?? '',
		recorded_at: new Date().toISOString()
	};

	window.localStorage.setItem(FIRST_TOUCH_ATTRIBUTION_KEY, JSON.stringify(attribution));
	return attribution;
};

const registerSuperProperties = (attribution: FirstTouchAttribution | null) => {
	if (!isMixpanelInitialized) {
		return;
	}

	const siteOrigin = SITE_URL || (isBrowser() ? window.location.origin : '');
	mixpanel.register(
		cleanProperties({
			app_name: 'shattak-web',
			environment: process.env.NODE_ENV ?? 'unknown',
			site_url: siteOrigin,
			...attribution
		})
	);
};

const getReplayControls = () => {
	const sessionReplay = mixpanel as unknown as {
		start_session_recording?: () => void;
		stop_session_recording?: () => void;
	};

	return {
		start: () => sessionReplay.start_session_recording?.(),
		stop: () => sessionReplay.stop_session_recording?.()
	};
};

const syncAnonymousProfile = () => {
	if (!isMixpanelInitialized || hasAnonymousProfileSynced) {
		return;
	}

	const distinctId = mixpanel.get_distinct_id();
	if (!distinctId) {
		return;
	}

	mixpanel.identify(distinctId);
	mixpanel.people.set_once({
		first_seen_at: new Date().toISOString(),
		visitor_type: 'anonymous',
		signup_stage: 'pre-auth',
		...cleanProperties(captureFirstTouchAttribution() ?? {})
	});

	hasAnonymousProfileSynced = true;
};

export const hasAnalyticsConsent = () => getStoredConsent() === 'granted';

export const grantAnalyticsConsent = () => {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(ANALYTICS_CONSENT_KEY, 'granted');

	if (!isMixpanelInitialized) {
		return;
	}

	mixpanel.opt_in_tracking();
	if (MIXPANEL_REPLAY_PERCENT > 0) {
		getReplayControls().start();
	}
	flushPendingEvents();
	mixpanel.track(ANALYTICS_EVENTS.ANALYTICS_CONSENT_UPDATED, {
		consent: 'granted',
		...cleanProperties(getPageContext())
	});
	syncAnonymousProfile();
};

export const revokeAnalyticsConsent = () => {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(ANALYTICS_CONSENT_KEY, 'denied');
	pendingEvents.length = 0;

	if (!isMixpanelInitialized) {
		return;
	}

	getReplayControls().stop();
	mixpanel.opt_out_tracking();
};

export const initMixpanel = () => {
	if (!isTrackingEnabled()) {
		return false;
	}

	if (isMixpanelInitialized) {
		return true;
	}

	const config = {
		autocapture: MIXPANEL_AUTOCAPTURE,
		record_sessions_percent: MIXPANEL_REPLAY_PERCENT,
		debug: MIXPANEL_DEBUG,
		...(MIXPANEL_API_HOST ? { api_host: MIXPANEL_API_HOST } : {})
	};

	mixpanel.init(MIXPANEL_TOKEN, config);
	isMixpanelInitialized = true;
	registerSuperProperties(captureFirstTouchAttribution());

	if (hasAnalyticsConsent()) {
		mixpanel.opt_in_tracking();
	} else {
		mixpanel.opt_out_tracking();
	}
	flushPendingEvents();

	return true;
};

export const identifyAnonymousMixpanelUser = () => {
	if (!hasAnalyticsConsent()) {
		return;
	}
	syncAnonymousProfile();
};

export const trackMixpanelPageView = (pathname: string, search = '') => {
	if (!isMixpanelInitialized || !hasAnalyticsConsent() || !pathname) {
		return;
	}

	const pagePath = search ? `${pathname}?${search}` : pathname;
	if (pagePath === lastTrackedPage) {
		return;
	}

	lastTrackedPage = pagePath;

	mixpanel.track(
		ANALYTICS_EVENTS.PAGE_VIEWED,
		cleanProperties({
			page: pagePath,
			pathname,
			search,
			title: typeof document !== 'undefined' ? document.title : '',
			full_url: typeof window !== 'undefined' ? window.location.href : '',
			referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : '',
			...readFirstTouchAttribution()
		})
	);
};

export const trackMixpanelEvent = (eventName: string, properties?: Record<string, unknown>) => {
	if (!eventName || !hasAnalyticsConsent()) {
		return;
	}

	const payload = cleanProperties({
		...getPageContext(),
		...(properties ?? {})
	});

	if (!isMixpanelInitialized) {
		if (isTrackingEnabled()) {
			queueEvent(eventName, payload);
		}
		return;
	}

	mixpanel.track(eventName, payload);
};

export const trackClientError = (payload: {
	source: 'window.error' | 'unhandledrejection' | 'react_error_boundary';
	message: string;
	stack?: string;
	fileName?: string;
	lineNumber?: number;
	columnNumber?: number;
	context?: string;
}) =>
	trackMixpanelEvent(ANALYTICS_EVENTS.CLIENT_ERROR_CAPTURED, {
		source: payload.source,
		message: payload.message,
		stack: payload.stack,
		file_name: payload.fileName,
		line_number: payload.lineNumber,
		column_number: payload.columnNumber,
		context: payload.context
	});

export const trackCtaClicked = (payload: { label: string; location: string; destination?: string; context?: string }) =>
	trackMixpanelEvent(ANALYTICS_EVENTS.CTA_CLICKED, {
		cta_label: payload.label,
		cta_location: payload.location,
		cta_destination: payload.destination,
		cta_context: payload.context
	});

export const trackInstructorCtaClicked = (payload: { location: string; destination?: string; context?: string }) =>
	trackMixpanelEvent(ANALYTICS_EVENTS.INSTRUCTOR_CTA_CLICKED, {
		cta_location: payload.location,
		cta_destination: payload.destination,
		cta_context: payload.context
	});

export const trackWhatsAppCtaClicked = (payload: { location: string; destination?: string; label?: string }) =>
	trackMixpanelEvent(ANALYTICS_EVENTS.WHATSAPP_CTA_CLICKED, {
		cta_location: payload.location,
		cta_destination: payload.destination,
		cta_label: payload.label ?? 'Join Now'
	});

export const trackEnrollClicked = (payload: {
	location: string;
	destination: string;
	courseId?: string;
	courseTitle?: string;
}) =>
	trackMixpanelEvent(ANALYTICS_EVENTS.ENROLL_CLICKED, {
		cta_location: payload.location,
		cta_destination: payload.destination,
		course_id: payload.courseId,
		course_title: payload.courseTitle
	});

export const trackCourseFilterChanged = (payload: {
	location: string;
	selectedCategory: string;
	previousCategory?: string;
}) =>
	trackMixpanelEvent(ANALYTICS_EVENTS.COURSE_FILTER_CHANGED, {
		location: payload.location,
		selected_category: payload.selectedCategory,
		previous_category: payload.previousCategory
	});

export const trackCourseCardClicked = (payload: {
	location: string;
	courseId: string;
	courseTitle: string;
	destination: string;
}) =>
	trackMixpanelEvent(ANALYTICS_EVENTS.COURSE_CARD_CLICKED, {
		location: payload.location,
		course_id: payload.courseId,
		course_title: payload.courseTitle,
		destination: payload.destination
	});
