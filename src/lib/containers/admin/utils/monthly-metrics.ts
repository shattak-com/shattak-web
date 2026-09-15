export const formatMonthKey = (monthKey: string, includeYear = true) => {
	const match = /^(\d{4})-(\d{2})$/.exec(monthKey);

	if (!match) {
		return monthKey;
	}

	const year = Number(match[1]);
	const month = Number(match[2]);

	return new Intl.DateTimeFormat('en-IN', {
		month: 'long',
		year: includeYear ? 'numeric' : undefined,
		timeZone: 'UTC'
	}).format(new Date(Date.UTC(year, month - 1, 1)));
};
