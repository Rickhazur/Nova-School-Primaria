import React, { useState } from 'react';
import { Wand2, Copy, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { ParaphrasingAttempt, Language } from '../types';
import { generateParaphrases, highlightDifferences } from '../services/paraphrasing';

interface ParaphrasingToolProps {
  userId: string;
  projectId?: string;
  language: Language;
  onComplete: (attempt: ParaphrasingAttempt) => void;
}

const ParaphrasingTool: React.FC<ParaphrasingToolProps> = ({
  userId,
  projectId,
  language,
  onComplete,
}) => {
  const [originalText, setOriginalText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ParaphrasingAttempt | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const text = {
    es: {
      title: 'Herramienta de Parafraseo',
      subtitle: 'Aprende a escribir con tus propias palabras',
      inputLabel: 'Texto original que quieres reescribir:',
      inputPlaceholder: 'Pega el texto que quieres parafrasear aquí...',
      generateButton: 'Generar Paráfrasis',
      generating: 'Generando...',
      results: 'Versiones Parafraseadas',
      selectVersion: 'Seleccionar esta versión',
      selected: 'Seleccionada',
      copyButton: 'Copiar',
      copied: '¡Copiado!',
      comparison: 'Comparación Lado a Lado',
      original: 'Original',
      paraphrased: 'Parafraseado',
      explanations: '¿Qué cambió?',
      vocabulary: 'Vocabulario Interesante',
      whyBetter: '¿Por qué es mejor?',
      benefitOriginal: 'Usas tus propias palabras',
      benefitUnderstanding: 'Demuestras que entiendes el tema',
      benefitAcademic: 'Evitas el plagio',
      benefitSkills: 'Mejoras tu escritura',
      tips: 'Consejos para parafrasear:',
      tip1: '1. Lee el texto original varias veces',
      tip2: '2. Cierra el texto original',
      tip3: '3. Escribe lo que entendiste con TUS palabras',
      tip4: '4. Compara tu versión con el original',
      tip5: '5. Asegúrate de que el significado sea el mismo',
    },
    en: {
      title: 'Paraphrasing Tool',
      subtitle: 'Learn to write in your own words',
      inputLabel: 'Original text you want to rewrite:',
      inputPlaceholder: 'Paste the text you want to paraphrase here...',
      generateButton: 'Generate Paraphrases',
      generating: 'Generating...',
      results: 'Paraphrased Versions',
      selectVersion: 'Select this version',
      selected: 'Selected',
      copyButton: 'Copy',
      copied: 'Copied!',
      comparison: 'Side-by-Side Comparison',
      original: 'Original',
      paraphrased: 'Paraphrased',
      explanations: 'What Changed?',
      vocabulary: 'Interesting Vocabulary',
      whyBetter: 'Why is this better?',
      benefitOriginal: 'You use your own words',
      benefitUnderstanding: 'You show that you understand the topic',
      benefitAcademic: 'You avoid plagiarism',
      benefitSkills: 'You improve your writing',
      tips: 'Tips for paraphrasing:',
      tip1: '1. Read the original text several times',
      tip2: '2. Close the original text',
      tip3: '3. Write what you understood in YOUR words',
      tip4: '4. Compare your version with the original',
      tip5: '5. Make sure the meaning is the same',
    },
  };

  const t = language === 'bilingual' ? text.en : text[language];

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      alert(language === 'es' ? 'Por favor ingresa algún texto para parafrasear' : 'Please enter some text to paraphrase');
      return;
    }

    setIsGenerating(true);
    try {
      const attempt = await generateParaphrases(
        originalText,
        language === 'bilingual' ? 'en' : language,
        userId,
        projectId
      );
      setResult(attempt);
      onComplete(attempt);
    } catch (error) {
      console.error('Paraphrasing error:', error);
      alert(language === 'es' ? 'Error al generar paráfrasis' : 'Error generating paraphrases');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelect = (index: number) => {
    setSelectedVersion(index);
    if (result) {
      const updated = { ...result, selectedVersion: index };
      setResult(updated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Wand2 className="w-8 h-8 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
        </div>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>

        {/* Tips Section */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-purple-800 mb-2">{t.tips}</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>{t.tip1}</li>
            <li>{t.tip2}</li>
            <li>{t.tip3}</li>
            <li>{t.tip4}</li>
            <li>{t.tip5}</li>
          </ul>
        </div>

        {/* Input Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.inputLabel}
          </label>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="w-full h-48 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !originalText.trim()}
          className="w-full py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t.generating}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              {t.generateButton}
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t.results}</h3>
            
            {/* Why Better Section */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-green-800 mb-2">{t.whyBetter}</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ {t.benefitOriginal}</li>
                    <li>✓ {t.benefitUnderstanding}</li>
                    <li>✓ {t.benefitAcademic}</li>
                    <li>✓ {t.benefitSkills}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Paraphrased Versions */}
            <div className="space-y-6">
              {result.paraphrasedVersions.map((version, index) => (
                <div key={index} className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800">{version.readingLevel}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(version.text, index)}
                        className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                          copiedIndex === index
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {copiedIndex === index ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {t.copied}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            {t.copyButton}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleSelect(index)}
                        className={`px-3 py-1 rounded font-medium transition-colors ${
                          selectedVersion === index
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {selectedVersion === index ? t.selected : t.selectVersion}
                      </button>
                    </div>
                  </div>

                  {/* Paraphrased Text */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 leading-relaxed">{version.text}</p>
                  </div>

                  {/* Explanations */}
                  {version.explanations.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        {t.explanations}
                      </h5>
                      <ul className="space-y-1">
                        {version.explanations.map((exp, expIndex) => (
                          <li key={expIndex} className="text-sm text-gray-600 pl-6">
                            • {exp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Vocabulary */}
                  {version.vocabularySuggestions.length > 0 && (
                    <div>
                      <h5 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        {t.vocabulary}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {version.vocabularySuggestions.map((vocab, vocabIndex) => (
                          <span
                            key={vocabIndex}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                          >
                            {vocab}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Side-by-Side Comparison */}
            {selectedVersion !== null && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t.comparison}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">{t.original}</h4>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 h-64 overflow-y-auto">
                      <p className="text-gray-800 leading-relaxed">{originalText}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-700 mb-2">{t.paraphrased}</h4>
                    <div className="bg-purple-50 border border-purple-300 rounded-lg p-4 h-64 overflow-y-auto">
                      <p className="text-gray-800 leading-relaxed">
                        {result.paraphrasedVersions[selectedVersion].text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParaphrasingTool;
