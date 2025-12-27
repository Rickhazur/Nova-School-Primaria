import { ParaphrasingAttempt } from '../types';

/**
 * Generate paraphrased versions of text at different reading levels
 * Uses Abacus.AI for intelligent paraphrasing
 */
export async function generateParaphrases(
  originalText: string,
  language: 'es' | 'en',
  userId: string,
  projectId?: string
): Promise<ParaphrasingAttempt> {
  try {
    const readingLevels = [
      { level: 'simple', description: language === 'es' ? 'Simple (6-7 años)' : 'Simple (Ages 6-7)' },
      { level: 'intermediate', description: language === 'es' ? 'Intermedio (8-9 años)' : 'Intermediate (Ages 8-9)' },
      { level: 'advanced', description: language === 'es' ? 'Avanzado (10-11 años)' : 'Advanced (Ages 10-11)' }
    ];

    const paraphrasedVersions = [];

    for (const { level, description } of readingLevels) {
      const prompt = language === 'es'
        ? `Eres un asistente de parafraseo para niños de primaria.

Texto original: "${originalText}"

Reescribe este texto en tus propias palabras para un nivel de lectura ${description}.

Responde en formato JSON:
{
  "paraphrasedText": "tu versión reescrita",
  "explanations": [
    "Cambié 'X' por 'Y' porque es más claro",
    "Reorganicé la oración para que sea más fácil de entender"
  ],
  "vocabularySuggestions": [
    "palabra interesante 1: definición",
    "palabra interesante 2: definición"
  ]
}

Asegúrate de:
1. Mantener el significado original
2. Usar sinónimos apropiados para la edad
3. Cambiar la estructura de las oraciones
4. Hacer el texto más claro y natural`
        : `You are a paraphrasing assistant for primary school children.

Original text: "${originalText}"

Rewrite this text in your own words for a ${description} reading level.

Respond in JSON format:
{
  "paraphrasedText": "your rewritten version",
  "explanations": [
    "I changed 'X' to 'Y' because it's clearer",
    "I reorganized the sentence to make it easier to understand"
  ],
  "vocabularySuggestions": [
    "interesting word 1: definition",
    "interesting word 2: definition"
  ]
}

Make sure to:
1. Keep the original meaning
2. Use age-appropriate synonyms
3. Change sentence structure
4. Make the text clearer and more natural`;

      // Call Abacus.AI Chat LLM
      const response = await fetch('https://api.abacus.ai/api/v0/chatLLM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_ABACUS_API_KEY || ''}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.response || '{}');

        paraphrasedVersions.push({
          text: result.paraphrasedText || originalText,
          readingLevel: description,
          explanations: result.explanations || [],
          vocabularySuggestions: result.vocabularySuggestions || []
        });
      } else {
        // Fallback version if API fails
        paraphrasedVersions.push({
          text: originalText,
          readingLevel: description,
          explanations: [language === 'es' ? 'Error al generar paráfrasis' : 'Error generating paraphrase'],
          vocabularySuggestions: []
        });
      }
    }

    return {
      id: `para_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      originalText,
      paraphrasedVersions,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Paraphrasing error:', error);
    throw new Error('Failed to generate paraphrases. Please try again.');
  }
}

/**
 * Highlight differences between original and paraphrased text
 */
export function highlightDifferences(
  original: string,
  paraphrased: string
): { original: string[]; paraphrased: string[] } {
  const originalWords = original.toLowerCase().split(/\s+/);
  const paraphrasedWords = paraphrased.toLowerCase().split(/\s+/);

  // Simple word-by-word comparison
  // In a production app, you'd want a more sophisticated diff algorithm
  const originalHighlights: string[] = [];
  const paraphrasedHighlights: string[] = [];

  originalWords.forEach(word => {
    if (!paraphrasedWords.includes(word)) {
      originalHighlights.push(word);
    }
  });

  paraphrasedWords.forEach(word => {
    if (!originalWords.includes(word)) {
      paraphrasedHighlights.push(word);
    }
  });

  return {
    original: originalHighlights,
    paraphrased: paraphrasedHighlights
  };
}
