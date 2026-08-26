export const formatEnrollmentDateTime = (value: string | null) =>
	value
		? new Intl.DateTimeFormat('en-IN', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}).format(new Date(value))
		: 'Not available';

export const formatCoursePublishedDate = (value: string | null) =>
	value
		? new Intl.DateTimeFormat('en-IN', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
				timeZone: 'Asia/Kolkata'
			}).format(new Date(value))
		: 'Not published';

export const formatCoursePrice = (value: number) => (value <= 0 ? 'Free' : `₹${value.toLocaleString('en-IN')}`);

export const getEnrollmentUserName = (name: string, email: string) => name.trim() || email;

export const getEnrollmentUserInitials = (name: string, email: string) => {
	const displayName = getEnrollmentUserName(name, email);
	const words = displayName.split(/\s+/).filter(Boolean);

	return words
		.slice(0, 2)
		.map(word => word.charAt(0).toUpperCase())
		.join('');
};
