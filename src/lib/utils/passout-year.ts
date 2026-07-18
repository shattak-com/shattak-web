const minimumPassoutYear = 1980;
const maximumPassoutYear = new Date().getFullYear() + 8;

export const getPassoutYearValidationMessage = (value: string) => {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return 'Passout year is required.';
	}

	if (!/^\d{4}$/.test(trimmedValue)) {
		return 'Enter a valid 4-digit passout year.';
	}

	const passoutYear = Number.parseInt(trimmedValue, 10);

	if (passoutYear < minimumPassoutYear || passoutYear > maximumPassoutYear) {
		return `Passout year must be between ${minimumPassoutYear} and ${maximumPassoutYear}.`;
	}

	return '';
};
