import React, { useState } from 'react';
import { BookOpen, Copy, CheckCircle } from 'lucide-react';
import { ResearchSource, CitationFormat, Language } from '../types';

interface CitationBuilderProps {
  source: ResearchSource;
  language: Language;
  onCopy: (citation: string) => void;
}

const CitationBuilder: React.FC<CitationBuilderProps> = ({ source, language, onCopy }) => {
  const [format, setFormat] = useState<CitationFormat>('kid-friendly');
  const [copied, setCopied] = useState(false);

  const text = {
    es: {
      title: 'Constructor de Citas',
      formatLabel: 'Formato:',
      kidFriendly: 'Para Niños',
      mla: 'MLA',
      apa: 'APA',
      copyButton: 'Copiar cita',
      copied: '¡Copiado!',
      preview: 'Vista previa:',
    },
    en: {
      title: 'Citation Builder',
      formatLabel: 'Format:',
      kidFriendly: 'Kid-Friendly',
      mla: 'MLA',
      apa: 'APA',
      copyButton: 'Copy citation',
      copied: 'Copied!',
      preview: 'Preview:',
    },
  };

  const t = language === 'bilingual' ? text.en : text[language];

  const generateCitation = (): string => {
    const { title, author, url, domain, dateAccessed, datePublished } = source;
    const accessDate = new Date(dateAccessed).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');
    const pubDate = datePublished
      ? new Date(datePublished).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')
      : language === 'es'
      ? 's.f.'
      : 'n.d.';

    switch (format) {
      case 'kid-friendly':
        if (language === 'es') {
          return author
            ? `${author}. "${title}". ${domain}. Leí esto el ${accessDate}.`
            : `"${title}". ${domain}. Leí esto el ${accessDate}.`;
        } else {
          return author
            ? `${author}. "${title}". ${domain}. I read this on ${accessDate}.`
            : `"${title}". ${domain}. I read this on ${accessDate}.`;
        }

      case 'mla':
        // MLA format: Author. "Title." Website, Date Published. URL. Accessed Date.
        return author
          ? `${author}. "${title}." ${domain}, ${pubDate}. ${url}. Accessed ${accessDate}.`
          : `"${title}." ${domain}, ${pubDate}. ${url}. Accessed ${accessDate}.`;

      case 'apa':
        // APA format: Author. (Date). Title. Website. URL
        const year = datePublished ? new Date(datePublished).getFullYear() : pubDate;
        return author
          ? `${author}. (${year}). ${title}. ${domain}. ${url}`
          : `${title}. (${year}). ${domain}. ${url}`;

      default:
        return '';
    }
  };

  const citation = generateCitation();

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    onCopy(citation);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-gray-800">{t.title}</h3>
      </div>

      {/* Format Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.formatLabel}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setFormat('kid-friendly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              format === 'kid-friendly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.kidFriendly}
          </button>
          <button
            onClick={() => setFormat('mla')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              format === 'mla'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.mla}
          </button>
          <button
            onClick={() => setFormat('apa')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              format === 'apa'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.apa}
          </button>
        </div>
      </div>

      {/* Citation Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.preview}
        </label>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-800 font-mono">{citation}</p>
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
          copied
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {copied ? (
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
    </div>
  );
};

export default CitationBuilder;
