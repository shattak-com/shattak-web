type MetaPixelEventProperties = Record<string, unknown>;

type MetaPixelFunction = {
	(...args: unknown[]): void;
	callMethod?: (...args: unknown[]) => void;
	queue?: unknown[][];
	push?: (...args: unknown[]) => void;
	loaded?: boolean;
	version?: string;
};

declare global {
	interface Window {
		fbq?: MetaPixelFunction;
		_fbq?: MetaPixelFunction;
	}
}

let isMetaPixelInitialized = false;

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';
const META_PIXEL_ENABLED = process.env.NEXT_PUBLIC_META_PIXEL_ENABLED ?? 'true';
const META_PIXEL_TRACK_LOCALHOST = process.env.NEXT_PUBLIC_META_PIXEL_TRACK_LOCALHOST === 'true';
const META_PIXEL_SCRIPT_ID = 'meta-pixel-script';
const LEGACY_FBQ_KEY = '_fbq';

const isBrowser = () => typeof window !== 'undefined';

const isLocalhost = () => isBrowser() && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

const canTrackMetaPixel = () =>
	isBrowser() &&
	Boolean(META_PIXEL_ID) &&
	META_PIXEL_ENABLED !== 'false' &&
	(!isLocalhost() || META_PIXEL_TRACK_LOCALHOST);

const getFbq = () => window.fbq;

const ensureMetaPixelStub = () => {
	if (!isBrowser()) {
		return null;
	}

	if (window.fbq) {
		return window.fbq;
	}

	const fbq: MetaPixelFunction = (...args: unknown[]) => {
		if (fbq.callMethod) {
			fbq.callMethod(...args);
			return;
		}

		fbq.queue = fbq.queue ?? [];
		fbq.queue.push(args);
	};

	if (!window[LEGACY_FBQ_KEY]) {
		window[LEGACY_FBQ_KEY] = fbq;
	}

	fbq.push = fbq;
	fbq.loaded = true;
	fbq.version = '2.0';
	fbq.queue = [];
	window.fbq = fbq;

	return fbq;
};

const injectMetaPixelScript = () => {
	if (!isBrowser() || document.getElementById(META_PIXEL_SCRIPT_ID)) {
		return;
	}

	const script = document.createElement('script');
	script.id = META_PIXEL_SCRIPT_ID;
	script.async = true;
	script.src = 'https://connect.facebook.net/en_US/fbevents.js';
	document.head.appendChild(script);
};

export const initMetaPixel = () => {
	if (!canTrackMetaPixel()) {
		return false;
	}

	if (isMetaPixelInitialized) {
		return true;
	}

	const fbq = ensureMetaPixelStub();
	if (!fbq) {
		return false;
	}

	injectMetaPixelScript();
	fbq('init', META_PIXEL_ID);
	fbq('track', 'PageView');
	isMetaPixelInitialized = true;

	return true;
};

export const trackMetaPixelPageView = () => {
	if (!isMetaPixelInitialized) {
		return;
	}

	getFbq()?.('track', 'PageView');
};

export const trackMetaPixelEvent = (eventName: string, properties?: MetaPixelEventProperties) => {
	if (!isMetaPixelInitialized || !eventName) {
		return;
	}

	if (properties && Object.keys(properties).length > 0) {
		getFbq()?.('trackCustom', eventName, properties);
		return;
	}

	getFbq()?.('trackCustom', eventName);
};
