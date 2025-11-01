export type ReportTopicKey = 'sexual' | 'racism' | 'vulgar' | 'non_outfit' | 'other';

export const reportTopics: { key: ReportTopicKey; label: string }[] = [
	{ key: 'sexual', label: 'sexual' },
	{ key: 'racism', label: 'racism' },
	{ key: 'vulgar', label: 'vulgar' },
	{ key: 'non_outfit', label: 'non related with outfits' },
	{ key: 'other', label: 'other' },
];