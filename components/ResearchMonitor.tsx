import React, { useState, useEffect } from 'react';
import { Eye, Calendar, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { getStudentResearchActivity } from '../services/supabase';

interface ResearchMonitorProps {
  studentId: string;
  studentName: string;
  language: Language;
}

const ResearchMonitor: React.FC<ResearchMonitorProps> = ({ studentId, studentName, language }) => {
  const [activity, setActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  const text = {
    es: {
      title: 'Monitor de Investigación',
      subtitle: 'Actividad de investigación de',
      loading: 'Cargando...',
      period: 'Período:',
      week: 'Esta semana',
      month: 'Este mes',
      all: 'Todo',
      overview: 'Resumen General',
      totalSources: 'Fuentes guardadas',
      totalSessions: 'Sesiones de investigación',
      totalChecks: 'Verificaciones de plagio',
      totalParaphrases: 'Intentos de parafraseo',
      avgSimilarity: 'Similitud promedio',
      recentSources: 'Fuentes Recientes',
      plagiarismHistory: 'Historial de Plagio',
      excellentScore: 'Excelente',
      goodScore: 'Bueno',
      needsImprovement: 'Necesita mejora',
      concerningScore: 'Preocupante',
      noData: 'No hay datos disponibles para este período',
      recommendations: 'Recomendaciones',
      recEncourage: 'Animar al estudiante a seguir usando sus propias palabras',
      recPractice: 'Practicar más con la herramienta de parafraseo',
      recReview: 'Revisar las fuentes y enseñar sobre citación apropiada',
      recIntervention: 'Intervención necesaria - discutir la importancia de la originalidad',
    },
    en: {
      title: 'Research Monitor',
      subtitle: 'Research activity for',
      loading: 'Loading...',
      period: 'Period:',
      week: 'This week',
      month: 'This month',
      all: 'All time',
      overview: 'Overview',
      totalSources: 'Sources saved',
      totalSessions: 'Research sessions',
      totalChecks: 'Plagiarism checks',
      totalParaphrases: 'Paraphrasing attempts',
      avgSimilarity: 'Average similarity',
      recentSources: 'Recent Sources',
      plagiarismHistory: 'Plagiarism History',
      excellentScore: 'Excellent',
      goodScore: 'Good',
      needsImprovement: 'Needs improvement',
      concerningScore: 'Concerning',
      noData: 'No data available for this period',
      recommendations: 'Recommendations',
      recEncourage: 'Encourage student to continue using their own words',
      recPractice: 'Practice more with the paraphrasing tool',
      recReview: 'Review sources and teach about proper citation',
      recIntervention: 'Intervention needed - discuss the importance of originality',
    },
  };

  const t = language === 'bilingual' ? text.en : text[language];

  useEffect(() => {
    loadActivity();
  }, [studentId, selectedPeriod]);

  const loadActivity = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentResearchActivity(studentId);
      setActivity(data);
    } catch (error) {
      console.error('Error loading research activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (similarity: number) => {
    if (similarity < 15) return 'text-green-600';
    if (similarity < 35) return 'text-yellow-600';
    if (similarity < 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (similarity: number) => {
    if (similarity < 15) return t.excellentScore;
    if (similarity < 35) return t.goodScore;
    if (similarity < 60) return t.needsImprovement;
    return t.concerningScore;
  };

  const getRecommendation = (avgSimilarity: number) => {
    if (avgSimilarity < 15) return t.recEncourage;
    if (avgSimilarity < 35) return t.recPractice;
    if (avgSimilarity < 60) return t.recReview;
    return t.recIntervention;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-xl text-gray-600">{t.loading}</span>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 text-lg">{t.noData}</p>
        </div>
      </div>
    );
  }

  const { summary, sources, plagiarismChecks, paraphrasingAttempts } = activity;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
        </div>
        <p className="text-gray-600">
          {t.subtitle} <span className="font-semibold">{studentName}</span>
        </p>

        {/* Period Selector */}
        <div className="flex items-center gap-4 mt-4">
          <span className="font-medium text-gray-700">{t.period}</span>
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t[period]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-blue-600 mb-1">{summary.totalSources}</div>
          <div className="text-sm text-gray-600">{t.totalSources}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-purple-600 mb-1">{summary.totalSessions}</div>
          <div className="text-sm text-gray-600">{t.totalSessions}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-green-600 mb-1">{summary.totalChecks}</div>
          <div className="text-sm text-gray-600">{t.totalChecks}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-orange-600 mb-1">{summary.totalParaphrases}</div>
          <div className="text-sm text-gray-600">{t.totalParaphrases}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className={`text-3xl font-bold mb-1 ${getScoreColor(summary.averageSimilarity)}`}>
            {Math.round(100 - summary.averageSimilarity)}%
          </div>
          <div className="text-sm text-gray-600">{t.avgSimilarity}</div>
          <div className={`text-xs font-medium ${getScoreColor(summary.averageSimilarity)}`}>
            {getScoreLabel(summary.averageSimilarity)}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-800 mb-2">{t.recommendations}</h3>
            <p className="text-blue-700">{getRecommendation(summary.averageSimilarity)}</p>
          </div>
        </div>
      </div>

      {/* Recent Sources */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.recentSources}</h3>
        {sources && sources.length > 0 ? (
          <div className="space-y-3">
            {sources.slice(0, 5).map((source: any) => (
              <div key={source.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-1">{source.title}</h4>
                <p className="text-sm text-blue-600 mb-2">{source.domain}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(source.dateAccessed).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                  </span>
                  <span>{source.highlights?.length || 0} highlights</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">{t.noData}</p>
        )}
      </div>

      {/* Plagiarism History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.plagiarismHistory}</h3>
        {plagiarismChecks && plagiarismChecks.length > 0 ? (
          <div className="space-y-3">
            {plagiarismChecks.slice(0, 5).map((check: any, index: number) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {new Date(check.timestamp).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(check.overall_similarity)}`}>
                      {100 - check.overall_similarity}%
                    </span>
                    <span className={`text-sm font-medium ${getScoreColor(check.overall_similarity)}`}>
                      {getScoreLabel(check.overall_similarity)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{check.student_text.substring(0, 150)}...</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">{t.noData}</p>
        )}
      </div>
    </div>
  );
};

export default ResearchMonitor;
