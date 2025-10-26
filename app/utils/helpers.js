export function calculateQualityMetrics(response, prompt) {
	const wordCount = response.split(/\s+/).length;
	const idealLength = Math.min(prompt.split(/\s+/).length * 10, 500);
	const lengthScore = Math.min(wordCount / idealLength, 1) * 100;

	const questionWords = ["what", "how", "why", "when", "where", "who"];
	const promptQuestions = questionWords.filter((w) =>
		prompt.toLowerCase().includes(w)
	).length;
	const hasAnswerPatterns =
		response.match(/because|due to|therefore|thus|hence|as a result/gi)?.length || 0;
	const completenessScore =
		lengthScore * 0.6 +
		(Math.min(hasAnswerPatterns / Math.max(promptQuestions, 1), 1) * 40);

	const sentences = response
		.split(/[.!?]+/)
		.filter((s) => s.trim().length > 0);
	const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
	const coherenceByLength = Math.max(0, 100 - Math.abs(avgSentenceLength - 20) * 5);

	const transitionWords =
		response.match(
			/however|furthermore|additionally|moreover|therefore|consequently|meanwhile|similarly/gi
		)?.length || 0;
	const coherenceByTransitions =
		Math.min(transitionWords / Math.max(sentences.length / 5, 1), 1) * 100;
	const coherenceScore =
		coherenceByLength * 0.5 + coherenceByTransitions * 0.5;

	const complexWords = response
		.split(/\s+/)
		.filter((word) => word.length > 12).length;
	const complexityRatio = complexWords / Math.max(wordCount, 1);
	const clarityByComplexity = Math.max(0, 100 - complexityRatio * 500);

	const passiveVoice =
		response.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi)?.length || 0;
	const passiveRatio = passiveVoice / Math.max(sentences.length, 1);
	const clarityByVoice = Math.max(0, 100 - passiveRatio * 100);
	const clarityScore =
		clarityByComplexity * 0.6 + clarityByVoice * 0.4;

	const promptKeywords = prompt
		.toLowerCase()
		.split(/\s+/)
		.filter(
			(word) =>
				word.length > 4 && !["that", "this", "with", "from", "about"].includes(word)
		);

	const matchedKeywords = promptKeywords.filter((keyword) =>
		response.toLowerCase().includes(keyword)
	).length;
	const relevanceScore =
		Math.min(matchedKeywords / Math.max(promptKeywords.length, 1), 1) * 100;

	return {
		completeness: Math.min(Math.max(completenessScore, 0), 100),
		coherence: Math.min(Math.max(coherenceScore, 0), 100),
		clarity: Math.min(Math.max(clarityScore, 0), 100),
		relevance: Math.min(Math.max(relevanceScore, 0), 100),
	};
}