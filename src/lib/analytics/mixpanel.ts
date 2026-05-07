import mixpanel from 'mixpanel-browser';

let isMixpanelInitialized = false;
let hasAnonymousProfileSynced = false;
const pendingEvents: Array<{ eventName: string; properties: MixpanelProperties }> = [];

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

const SECTION_NAME_BY_LOCATION: Record<string, string> = {
	header_nav: 'Header',
	header_primary: 'Header',
	header_drawer: 'Header',
	footer_quick_links: 'Footer',
	footer_join_now: 'Footer',
	home_hero: 'Hero',
	home_courses: 'Courses',
	home_courses_grid: 'Courses',
	home_courses_button: 'Courses',
	instructor_cta: 'Instructor CTA',
	about_hero: 'Hero',
	about_hero_inline: 'Hero',
	about_audience: 'Audience',
	about_final_cta: 'Final CTA',
	whatsapp_banner: 'WhatsApp Banner',
	course_hero: 'Hero',
	course_sticky_banner: 'Sticky Enroll Banner',
	course_sticky_banner_mobile: 'Sticky Enroll Banner'
};

const FIRST_TOUCH_ATTRIBUTION_KEY = 'shattak-first-touch-attribution';
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? '';
const MIXPANEL_API_HOST = process.env.NEXT_PUBLIC_MIXPANEL_API_HOST ?? '';
const MIXPANEL_ENABLED = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED ?? 'true';
const MIXPANEL_TRACK_LOCALHOST = process.env.NEXT_PUBLIC_MIXPANEL_TRACK_LOCALHOST === 'true';
const MIXPANEL_AUTOCAPTURE = process.env.NEXT_PUBLIC_MIXPANEL_AUTOCAPTURE !== 'false';
const MIXPANEL_DEBUG = process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === 'true';

const replaySamplePercent = Number(process.env.NEXT_PUBLIC_MIXPANEL_REPLAY_PERCENT ?? '100');
const MIXPANEL_REPLAY_PERCENT = Number.isFinite(replaySamplePercent)
	? Math.min(100, Math.max(0, Math.floor(replaySamplePercent)))
	: 100;

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

const formatCustomProperties = (properties: MixpanelProperties = {}) =>
	Object.entries(cleanProperties(properties)).reduce<MixpanelProperties>((acc, [key, value]) => {
		const formattedKey = key.startsWith('#') || key.startsWith('$') ? key : `#${key}`;
		acc[formattedKey] = value;
		return acc;
	}, {});

const titleCase = (value: string) =>
	value
		.replace(/[_-]+/g, ' ')
		.trim()
		.replace(/\b\w/g, character => character.toUpperCase());

const getPageNameFromPath = (pathname: string) => {
	const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
	if (!normalizedPath) {
		return 'Home';
	}

	const [firstSegment] = normalizedPath.split('/');

	switch (firstSegment.toLowerCase()) {
		case 'about':
			return 'About';
		case 'course':
			return 'Course';
		case 'booking':
			return 'Booking';
		case 'admin':
			return 'Admin';
		default:
			return titleCase(firstSegment);
	}
};

const getCurrentPageName = () => {
	if (!isBrowser()) {
		return 'App';
	}

	return getPageNameFromPath(window.location.pathname);
};

const getSectionName = (location?: string) => {
	if (!location) {
		return 'App';
	}

	return SECTION_NAME_BY_LOCATION[location] ?? titleCase(location);
};

const buildEventName = (payload: { eventName: string; location?: string; pageName?: string }) =>
	`${payload.pageName ?? getCurrentPageName()} - ${getSectionName(payload.location)} - ${payload.eventName}`;

const getClientErrorEventName = (source: 'window.error' | 'unhandledrejection' | 'react_error_boundary') => {
	if (source === 'unhandledrejection') {
		return 'Unhandled Rejection Captured';
	}

	if (source === 'react_error_boundary') {
		return 'React Error Captured';
	}

	return 'Client Error Captured';
};

const getPageContext = (): MixpanelProperties => {
	if (!isBrowser()) {
		return {};
	}

	return {
		page_path: window.location.pathname,
		page_search: window.location.search
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
	if (!isMixpanelInitialized || !pendingEvents.length) {
		return;
	}

	const queuedEvents = [...pendingEvents];
	pendingEvents.length = 0;
	queuedEvents.forEach(item => {
		mixpanel.track(item.eventName, item.properties);
	});
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

	mixpanel.register(formatCustomProperties({ ...attribution }));
};

const getSessionReplayControls = () => {
	const sessionReplay = mixpanel as unknown as {
		start_session_recording?: () => void;
	};

	return {
		start: () => sessionReplay.start_session_recording?.()
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
		...formatCustomProperties({
			first_seen_at: new Date().toISOString(),
			visitor_type: 'anonymous',
			signup_stage: 'pre-auth',
			...cleanProperties(captureFirstTouchAttribution() ?? {})
		})
	});

	hasAnonymousProfileSynced = true;
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
	getSessionReplayControls().start();
	flushPendingEvents();

	return true;
};

export const ensureMixpanelSessionReplay = () => {
	if (!isMixpanelInitialized || MIXPANEL_REPLAY_PERCENT <= 0) {
		return;
	}

	getSessionReplayControls().start();
};

export const identifyAnonymousMixpanelUser = () => {
	syncAnonymousProfile();
};

export const trackMixpanelEvent = (eventName: string, properties?: Record<string, unknown>) => {
	if (!eventName) {
		return;
	}

	const payload = formatCustomProperties({
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
	trackMixpanelEvent(
		buildEventName({
			eventName: getClientErrorEventName(payload.source)
		}),
		{
			source: payload.source,
			message: payload.message,
			stack: payload.stack,
			file_name: payload.fileName,
			line_number: payload.lineNumber,
			column_number: payload.columnNumber,
			context: payload.context
		}
	);

export const trackCtaClicked = (payload: { label: string; location: string; destination?: string; context?: string }) =>
	trackMixpanelEvent(
		buildEventName({
			location: payload.location,
			eventName: `${titleCase(payload.label)} Clicked`
		}),
		{
			cta_label: payload.label,
			cta_location: payload.location,
			cta_destination: payload.destination,
			cta_context: payload.context
		}
	);

export const trackInstructorCtaClicked = (payload: { location: string; destination?: string; context?: string }) =>
	trackMixpanelEvent(
		buildEventName({
			location: payload.location,
			eventName: 'Become Instructor Clicked'
		}),
		{
			cta_location: payload.location,
			cta_destination: payload.destination,
			cta_context: payload.context
		}
	);

export const trackWhatsAppCtaClicked = (payload: { location: string; destination?: string; label?: string }) =>
	trackMixpanelEvent(
		buildEventName({
			location: payload.location,
			eventName: `${titleCase(payload.label ?? 'Join Now')} Clicked`
		}),
		{
			cta_location: payload.location,
			cta_destination: payload.destination,
			cta_label: payload.label ?? 'Join Now'
		}
	);

export const trackEnrollClicked = (payload: {
	location: string;
	destination: string;
	courseId?: string;
	courseTitle?: string;
}) =>
	trackMixpanelEvent(
		buildEventName({
			location: payload.location,
			eventName: 'Enroll Clicked'
		}),
		{
			cta_location: payload.location,
			cta_destination: payload.destination,
			course_id: payload.courseId,
			course_title: payload.courseTitle
		}
	);

export const trackCourseFilterChanged = (payload: {
	location: string;
	selectedCategory: string;
	previousCategory?: string;
}) =>
	trackMixpanelEvent(
		buildEventName({
			location: payload.location,
			eventName: 'Category Filter Changed'
		}),
		{
			location: payload.location,
			selected_category: payload.selectedCategory,
			previous_category: payload.previousCategory
		}
	);

export const trackCourseCardClicked = (payload: {
	location: string;
	courseId: string;
	courseTitle: string;
	destination: string;
}) =>
	trackMixpanelEvent(
		buildEventName({
			location: payload.location,
			eventName: 'Course Card Clicked'
		}),
		{
			location: payload.location,
			course_id: payload.courseId,
			course_title: payload.courseTitle,
			destination: payload.destination
		}
	);
