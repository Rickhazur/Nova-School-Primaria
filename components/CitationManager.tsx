import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, Trash2, Edit, FileText, Download } from 'lucide-react';
import { ResearchSource, Language } from '../types';
import CitationBuilder from './CitationBuilder';

interface CitationManagerProps {
  userId: string;
  projectId?: string;
  language: Language;
  sources: ResearchSource[];
  onAddSource: (source: Omit<ResearchSource, 'id' | 'createdAt'>) => void;
  onUpdateSource: (id: string, updates: Partial<ResearchSource>) => void;
  onDeleteSource: (id: string) => void;
  onGenerateBibliography: () => void;
}

const CitationManager: React.FC<CitationManagerProps> = ({
  userId,
  projectId,
  language,
  sources,
  onAddSource,
  onUpdateSource,
  onDeleteSource,
  onGenerateBibliography,
}) => {
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    author: '',
    url: '',
    datePublished: '',
  });

  const text = {
    es: {
      title: 'Gestor de Citas',
      addManual: 'Añadir fuente manualmente',
      generateBibliography: 'Generar bibliografía',
      sources: 'Fuentes guardadas',
      noSources: 'Aún no has guardado ninguna fuente',
      formTitle: 'Título',
      formAuthor: 'Autor (opcional)',
      formUrl: 'Dirección web',
      formDate: 'Fecha de publicación (opcional)',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      notes: 'Notas',
      highlights: 'Texto guardado',
      viewCitation: 'Ver cita',
    },
    en: {
      title: 'Citation Manager',
      addManual: 'Add source manually',
      generateBibliography: 'Generate bibliography',
      sources: 'Saved sources',
      noSources: 'You haven\'t saved any sources yet',
      formTitle: 'Title',
      formAuthor: 'Author (optional)',
      formUrl: 'Web address',
      formDate: 'Publication date (optional)',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      notes: 'Notes',
      highlights: 'Saved text',
      viewCitation: 'View citation',
    },
  };

  const t = language === 'bilingual' ? text.en : text[language];

  const extractMetadataFromUrl = async (url: string) => {
    try {
      // In a real implementation, this would fetch the page and extract metadata
      // For now, we'll simulate it
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname;
      
      return {
        title: document.title || 'Untitled',
        domain,
        datePublished: new Date().toISOString(),
      };
    } catch {
      return {
        title: 'Untitled',
        domain: 'unknown',
        datePublished: new Date().toISOString(),
      };
    }
  };

  const handleManualSubmit = async () => {
    if (!manualForm.title || !manualForm.url) {
      alert(language === 'es' ? 'Por favor completa el título y la URL' : 'Please fill in title and URL');
      return;
    }

    const metadata = await extractMetadataFromUrl(manualForm.url);
    
    onAddSource({
      userId,
      projectId,
      title: manualForm.title,
      author: manualForm.author || undefined,
      url: manualForm.url,
      domain: metadata.domain,
      dateAccessed: new Date().toISOString(),
      datePublished: manualForm.datePublished || metadata.datePublished,
      highlights: [],
      screenshots: [],
    });

    setManualForm({ title: '', author: '', url: '', datePublished: '' });
    setIsAddingManual(false);
  };

  const handleCopyCitation = (citation: string) => {
    console.log('Citation copied:', citation);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddingManual(!isAddingManual)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.addManual}
            </button>
            <button
              onClick={onGenerateBibliography}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              {t.generateBibliography}
            </button>
          </div>
        </div>

        {/* Manual Add Form */}
        {isAddingManual && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.formTitle} *
                </label>
                <input
                  type="text"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.formAuthor}
                </label>
                <input
                  type="text"
                  value={manualForm.author}
                  onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.formUrl} *
                </label>
                <input
                  type="url"
                  value={manualForm.url}
                  onChange={(e) => setManualForm({ ...manualForm, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.formDate}
                </label>
                <input
                  type="date"
                  value={manualForm.datePublished}
                  onChange={(e) => setManualForm({ ...manualForm, datePublished: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleManualSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => setIsAddingManual(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sources List */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">{t.sources} ({sources.length})</h3>
          {sources.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <BookMarked className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t.noSources}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{source.title}</h4>
                      {source.author && (
                        <p className="text-sm text-gray-600 mb-1">By {source.author}</p>
                      )}
                      <p className="text-sm text-blue-600 mb-2">{source.domain}</p>
                      {source.highlights.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">{t.highlights}:</p>
                          <p className="text-xs text-gray-600 italic">"{source.highlights[0].substring(0, 100)}..."</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSource(source)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                        title={t.viewCitation}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSource(source.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citation Builder */}
        {selectedSource && (
          <div className="mt-6">
            <CitationBuilder
              source={selectedSource}
              language={language}
              onCopy={handleCopyCitation}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CitationManager;
