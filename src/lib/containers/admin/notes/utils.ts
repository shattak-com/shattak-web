export const formatResourceTimestamp = (timestamp: string) => {
	const value = new Date(timestamp);
	if (Number.isNaN(value.getTime())) return timestamp;

	return new Intl.DateTimeFormat('en-IN', {
		timeZone: 'Asia/Kolkata',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(value);
};
