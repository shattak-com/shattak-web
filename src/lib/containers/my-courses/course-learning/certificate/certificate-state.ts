export type CertificateAvailability = 'LOCKED' | 'AWAITING_FEEDBACK' | 'COMING_SOON' | 'AVAILABLE';

export type CertificateAvailabilityContext = {
	isAdmin: boolean;
	courseCompleted: boolean;
	feedbackSubmitted: boolean;
};

export interface CertificateAvailabilityResolver {
	resolve: (context: CertificateAvailabilityContext) => CertificateAvailability;
}

export const currentCertificateAvailabilityResolver: CertificateAvailabilityResolver = {
	resolve: ({ isAdmin, courseCompleted, feedbackSubmitted }) => {
		if (isAdmin) {
			return 'COMING_SOON';
		}

		if (!courseCompleted) {
			return 'LOCKED';
		}

		if (!feedbackSubmitted) {
			return 'AWAITING_FEEDBACK';
		}

		return 'COMING_SOON';
	}
};
