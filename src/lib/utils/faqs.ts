import type { FaqItem } from '~/lib/constants/platform-faqs';

const normalizeQuestion = (question: string) =>
	question
		.normalize('NFKC')
		.trim()
		.toLocaleLowerCase('en')
		.replace(/\s+/g, ' ')
		.replace(/[.!?]+$/g, '');

const normalizeFaqs = (faqs: readonly FaqItem[]) => {
	const seenQuestions = new Set<string>();
	const seenIds = new Set<string>();

	return faqs.reduce<FaqItem[]>((items, faq) => {
		const question = faq.question.trim();
		const answer = faq.answer.trim();
		const normalizedQuestion = normalizeQuestion(question);

		if (!normalizedQuestion || !answer || seenQuestions.has(normalizedQuestion)) {
			return items;
		}

		seenQuestions.add(normalizedQuestion);

		const baseId = faq.id.trim() || `faq-${items.length + 1}`;
		let id = baseId;
		let suffix = 2;

		while (seenIds.has(id)) {
			id = `${baseId}-${suffix}`;
			suffix += 1;
		}

		seenIds.add(id);
		items.push({ id, question, answer });

		return items;
	}, []);
};

export const mergeFaqs = (primaryFaqs: readonly FaqItem[], fallbackFaqs: readonly FaqItem[]) =>
	normalizeFaqs([...primaryFaqs, ...fallbackFaqs]);

export const createFaqPageStructuredData = (faqs: readonly FaqItem[]) => {
	const normalizedFaqs = normalizeFaqs(faqs);

	if (!normalizedFaqs.length) {
		return null;
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: normalizedFaqs.map(faq => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	};
};
