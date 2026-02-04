export const scrollToId = (id: string) => {
	if (typeof window === 'undefined') {
		return;
	}

	const element = document.getElementById(id);
	if (!element) {
		return;
	}

	element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
