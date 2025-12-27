import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ResearchSource, PlagiarismCheck, Language } from '../types';
import { checkPlagiarism, generatePlagiarismFeedback, getSimilarityColor } from '../services/plagiarism';

interface PlagiarismCheckerProps {
  userId: string;
  projectId?: string;
  language: Language;
  sources: ResearchSource[];
  onCheckComplete: (check: PlagiarismCheck) => void;
}

const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({
  userId,
  projectId,
  language,
  sources,
  onCheckComplete,
}) => {
  const [studentText, setStudentText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PlagiarismCheck | null>(null);
  const [highlightedText, setHighlightedText] = useState('');

  const text = {
    es: {
      title: 'Detector de Plagio',
      subtitle: 'Verifica que estés usando tus propias palabras',
      textareaLabel: 'Pega o escribe tu texto aquí:',
      textareaPlaceholder: 'Escribe tu texto aquí para verificar si es original...',
      checkButton: 'Verificar Originalidad',
      checking: 'Verificando...',
      results: 'Resultados',
      overallScore: 'Puntuación de Originalidad',
      matches: 'Coincidencias Encontradas',
      noMatches: '¡Excelente! No se encontraron coincidencias.',
      matchDetails: 'Detalles de las coincidencias:',
      yourText: 'Tu texto:',
      sourceText: 'Texto de la fuente:',
      similarity: 'Similitud',
      from: 'de',
      explanation: 'Qué significa esto:',
      excellent: '🌟 Excelente - Tu trabajo es muy original',
      good: '📝 Bueno - Algunas secciones necesitan ser reescritas',
      needsWork: '📚 Necesita trabajo - Varias partes están copiadas',
      poor: '⚠️ Preocupante - Mucho texto copiado',
      helpTitle: '¿Qué debo hacer?',
      helpExcellent: '¡Sigue así! Estás escribiendo con tus propias palabras.',
      helpGood: 'Intenta reescribir las partes resaltadas usando tus propias palabras.',
      helpNeedsWork: 'Necesitas reescribir la mayoría del texto. Usa la Herramienta de Parafraseo para ayudarte.',
      helpPoor: 'Este texto está mayormente copiado. Recuerda: puedes usar ideas de otros, pero debes escribirlas con TUS palabras.',
      colorGuide: 'Guía de colores:',
      greenLabel: 'Verde = Original (😊 Bien hecho!)',
      yellowLabel: 'Amarillo = Parafraseado (mejorar)',
      redLabel: 'Rojo = Copiado (⚠️ cambiar)',
    },
    en: {
      title: 'Plagiarism Checker',
      subtitle: 'Check that you\'re using your own words',
      textareaLabel: 'Paste or write your text here:',
      textareaPlaceholder: 'Write your text here to check if it\'s original...',
      checkButton: 'Check Originality',
      checking: 'Checking...',
      results: 'Results',
      overallScore: 'Originality Score',
      matches: 'Matches Found',
      noMatches: 'Excellent! No matches found.',
      matchDetails: 'Match details:',
      yourText: 'Your text:',
      sourceText: 'Source text:',
      similarity: 'Similarity',
      from: 'from',
      explanation: 'What this means:',
      excellent: '🌟 Excellent - Your work is very original',
      good: '📝 Good - Some sections need to be rewritten',
      needsWork: '📚 Needs work - Several parts are copied',
      poor: '⚠️ Concerning - A lot of text is copied',
      helpTitle: 'What should I do?',
      helpExcellent: 'Keep it up! You\'re writing in your own words.',
      helpGood: 'Try rewriting the highlighted parts using your own words.',
      helpNeedsWork: 'You need to rewrite most of the text. Use the Paraphrasing Tool to help you.',
      helpPoor: 'This text is mostly copied. Remember: you can use others\' ideas, but you should write them in YOUR words.',
      colorGuide: 'Color guide:',
      greenLabel: 'Green = Original (😊 Well done!)',
      yellowLabel: 'Yellow = Paraphrased (improve)',
      redLabel: 'Red = Copied (⚠️ change)',
    },
  };

  const t = language === 'bilingual' ? text.en : text[language];

  const handleCheck = async () => {
    if (!studentText.trim()) {
      alert(language === 'es' ? 'Por favor ingresa algún texto para verificar' : 'Please enter some text to check');
      return;
    }

    if (sources.length === 0) {
      alert(language === 'es' ? 'No hay fuentes guardadas para comparar' : 'No saved sources to compare against');
      return;
    }

    setIsChecking(true);
    try {
      const check = await checkPlagiarism(studentText, sources, userId, projectId);
      setResult(check);
      onCheckComplete(check);
      
      // Generate highlighted version
      highlightMatches(studentText, check.results.matches);
    } catch (error) {
      console.error('Plagiarism check error:', error);
      alert(language === 'es' ? 'Error al verificar el texto' : 'Error checking text');
    } finally {
      setIsChecking(false);
    }
  };

  const highlightMatches = (text: string, matches: PlagiarismCheck['results']['matches']) => {
    let highlighted = text;
    const sortedMatches = [...matches].sort((a, b) => b.startIndex - a.startIndex);
    
    sortedMatches.forEach(match => {
      const before = highlighted.substring(0, match.startIndex);
      const matchedPart = highlighted.substring(match.startIndex, match.endIndex);
      const after = highlighted.substring(match.endIndex);
      
      const colorClass = getSimilarityColor(match.similarity);
      highlighted = `${before}<span class="${colorClass} px-1 rounded border-2">${matchedPart}</span>${after}`;
    });
    
    setHighlightedText(highlighted);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 65) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 85) return t.excellent;
    if (score >= 65) return t.good;
    if (score >= 40) return t.needsWork;
    return t.poor;
  };

  const getHelpMessage = (score: number) => {
    if (score >= 85) return t.helpExcellent;
    if (score >= 65) return t.helpGood;
    if (score >= 40) return t.helpNeedsWork;
    return t.helpPoor;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
        </div>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>

        {/* Color Guide */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">{t.colorGuide}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded"></div>
              <span className="text-gray-700">{t.greenLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
              <span className="text-gray-700">{t.yellowLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded"></div>
              <span className="text-gray-700">{t.redLabel}</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.textareaLabel}
          </label>
          <textarea
            value={studentText}
            onChange={(e) => setStudentText(e.target.value)}
            placeholder={t.textareaPlaceholder}
            className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
          />
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheck}
          disabled={isChecking || !studentText.trim()}
          className="w-full py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isChecking ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t.checking}
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              {t.checkButton}
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t.results}</h3>
            
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-700">{t.overallScore}:</span>
                <span className={`text-4xl font-bold ${getScoreColor(100 - result.results.overallSimilarity)}`}>
                  {100 - result.results.overallSimilarity}%
                </span>
              </div>
              <p className="text-gray-700 mb-3">{getScoreMessage(100 - result.results.overallSimilarity)}</p>
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <p className="font-medium text-gray-800 mb-1">{t.helpTitle}</p>
                <p className="text-gray-600 text-sm">{getHelpMessage(100 - result.results.overallSimilarity)}</p>
              </div>
            </div>

            {/* Highlighted Text */}
            {highlightedText && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-800 mb-3">{t.yourText}</h4>
                <div
                  className="text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>
            )}

            {/* Matches */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-3">
                {t.matches}: {result.results.matches.length}
              </h4>
              {result.results.matches.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-800 font-medium">{t.noMatches}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.results.matches.map((match, index) => (
                    <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {t.from} {match.sourceTitle}
                        </span>
                        <span className={`font-bold ${getScoreColor(100 - match.similarity)}`}>
                          {t.similarity}: {match.similarity}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">{t.yourText}</p>
                          <p className={`text-sm p-2 rounded ${getSimilarityColor(match.similarity)}`}>
                            "{match.studentText}"
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">{t.sourceText}</p>
                          <p className="text-sm bg-gray-100 p-2 rounded">
                            "{match.matchedText}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Educational Feedback */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 mb-1">{t.explanation}</p>
                  <p className="text-sm text-yellow-700">
                    {generatePlagiarismFeedback(result, language === 'bilingual' ? 'en' : language)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlagiarismChecker;
