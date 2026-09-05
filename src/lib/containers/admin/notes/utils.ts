export const getIndiaCalendarDate = (value = new Date()) => {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: 'Asia/Kolkata',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(value);
	const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? '';
	return `${part('year')}-${part('month')}-${part('day')}`;
};

export const formatCalendarDate = (dateKey: string) => {
	const [year, month, day] = dateKey.split('-').map(Number);
	if (!year || !month || !day) return dateKey;

	return new Intl.DateTimeFormat('en-IN', {
		timeZone: 'UTC',
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(new Date(Date.UTC(year, month - 1, day)));
};
