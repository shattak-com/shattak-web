export {};

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: GoogleIdentityInitializeConfig) => void;
					prompt: (momentListener?: (notification: GooglePromptMomentNotification) => void) => void;
					renderButton: (parent: HTMLElement, options: GoogleIdentityButtonOptions) => void;
					cancel: () => void;
					disableAutoSelect: () => void;
				};
			};
		};
	}
}

export type GoogleCredentialResponse = {
	credential?: string;
	select_by?: string;
	clientId?: string;
};

type GoogleIdentityInitializeConfig = {
	client_id: string;
	callback: (response: GoogleCredentialResponse) => void;
	auto_select?: boolean;
	cancel_on_tap_outside?: boolean;
	context?: 'signin' | 'signup' | 'use';
	ux_mode?: 'popup' | 'redirect';
	use_fedcm_for_prompt?: boolean;
};

type GoogleIdentityButtonOptions = {
	type?: 'standard' | 'icon';
	theme?: 'outline' | 'filled_blue' | 'filled_black';
	size?: 'large' | 'medium' | 'small';
	text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
	shape?: 'rectangular' | 'pill' | 'circle' | 'square';
	logo_alignment?: 'left' | 'center';
	width?: number | string;
};

type GooglePromptMomentNotification = {
	isDisplayMoment: () => boolean;
	isDisplayed: () => boolean;
	isNotDisplayed: () => boolean;
	getNotDisplayedReason: () => string;
	isSkippedMoment: () => boolean;
	getSkippedReason: () => string;
	isDismissedMoment: () => boolean;
	getDismissedReason: () => string;
};
