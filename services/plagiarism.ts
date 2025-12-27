import { ResearchSource, PlagiarismCheck } from '../types';

/**
 * Compare student text against saved sources to detect potential plagiarism
 * Uses Abacus.AI for semantic similarity analysis
 */
export async function checkPlagiarism(
  studentText: string,
  sources: ResearchSource[],
  userId: string,
  projectId?: string
): Promise<PlagiarismCheck> {
  try {
    const matches: PlagiarismCheck['results']['matches'] = [];

    // For each source, use AI to compare similarity
    for (const source of sources) {
      // Combine all highlights from the source
      const sourceText = source.highlights.join(' ');

      if (!sourceText || sourceText.length < 20) continue;

      // Use Abacus.AI to analyze semantic similarity
      // We'll use the chat LLM to analyze text similarity
      const prompt = `You are a plagiarism detection assistant for primary school children (ages 6-11).

Compare these two texts and identify any copied or highly similar passages:

Source Text: "${sourceText}"

Student Text: "${studentText}"

Respond in JSON format with an array of matches:
{
  "matches": [
    {
      "sourceText": "exact text from source",
      "studentText": "matching text from student",
      "similarity": 0-100,
      "type": "exact" | "paraphrased" | "original"
    }
  ],
  "overallSimilarity": 0-100
}

Be strict: even minor word changes should be flagged if the sentence structure is the same.`;

      // Call Abacus.AI Chat LLM
      const response = await fetch('https://api.abacus.ai/api/v0/chatLLM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_ABACUS_API_KEY || ''}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1, // Low temperature for consistent results
          max_tokens: 2000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.response || '{}');

        if (result.matches && result.matches.length > 0) {
          result.matches.forEach((match: any) => {
            // Find the position in student text
            const startIndex = studentText.toLowerCase().indexOf(match.studentText.toLowerCase());
            if (startIndex >= 0) {
              matches.push({
                sourceId: source.id,
                sourceTitle: source.title,
                matchedText: match.sourceText,
                studentText: match.studentText,
                similarity: match.similarity,
                startIndex,
                endIndex: startIndex + match.studentText.length
              });
            }
          });
        }
      }
    }

    // Calculate overall similarity
    const overallSimilarity = matches.length > 0
      ? Math.round(matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length)
      : 0;

    return {
      id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      studentText,
      sources,
      results: {
        overallSimilarity,
        matches
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Plagiarism check error:', error);
    throw new Error('Failed to check plagiarism. Please try again.');
  }
}

/**
 * Generate child-friendly educational feedback based on plagiarism results
 */
export function generatePlagiarismFeedback(
  check: PlagiarismCheck,
  language: 'es' | 'en'
): string {
  const { overallSimilarity, matches } = check.results;

  const messages = {
    es: {
      excellent: '¡Excelente trabajo! Tu escritura es completamente original. 🌟',
      good: 'Buen trabajo, pero recuerda usar tus propias palabras cuando tomas ideas de tus fuentes. 📝',
      needsWork: 'Parece que copiaste algunas partes de tus fuentes. Intenta escribir con tus propias palabras. 📚',
      copied: 'Has copiado mucho texto. Recuerda: está bien usar ideas de otros, ¡pero debes escribirlas con tus propias palabras! 💭'
    },
    en: {
      excellent: 'Excellent work! Your writing is completely original. 🌟',
      good: 'Good job, but remember to use your own words when taking ideas from sources. 📝',
      needsWork: 'It looks like you copied some parts from your sources. Try writing in your own words. 📚',
      copied: 'You copied a lot of text. Remember: it\'s okay to use others\' ideas, but you should write them in your own words! 💭'
    }
  };

  const msg = messages[language];

  if (overallSimilarity < 15) return msg.excellent;
  if (overallSimilarity < 35) return msg.good;
  if (overallSimilarity < 60) return msg.needsWork;
  return msg.copied;
}

/**
 * Get color coding for similarity levels
 */
export function getSimilarityColor(similarity: number): string {
  if (similarity >= 80) return 'bg-red-200 border-red-400'; // Copied
  if (similarity >= 50) return 'bg-yellow-200 border-yellow-400'; // Paraphrased
  return 'bg-green-200 border-green-400'; // Original
}
