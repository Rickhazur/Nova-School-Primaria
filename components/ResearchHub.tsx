import React, { useState, useEffect } from 'react';
import { Search, BookMarked, Shield, Wand2, BarChart3 } from 'lucide-react';
import { Language, ResearchSource, PlagiarismCheck, ParaphrasingAttempt } from '../types';
import ResearchBrowser from './ResearchBrowser';
import CitationManager from './CitationManager';
import PlagiarismChecker from './PlagiarismChecker';
import ParaphrasingTool from './ParaphrasingTool';
import {
  saveResearchSource,
  getResearchSources,
  updateResearchSource,
  deleteResearchSource,
  savePlagiarismCheck,
  saveParaphrasingAttempt,
} from '../services/supabase';

interface ResearchHubProps {
  userId: string;
  language: Language;
  ageGroup: number;
}

type ResearchTab = 'browser' | 'citations' | 'plagiarism' | 'paraphrasing';

const ResearchHub: React.FC<ResearchHubProps> = ({ userId, language, ageGroup }) => {
  const [activeTab, setActiveTab] = useState<ResearchTab>('browser');
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const text = {
    es: {
      title: 'Centro de Investigación',
      subtitle: 'Aprende a investigar como un verdadero científico',
      browser: 'Navegador',
      citations: 'Citas',
      plagiarism: 'Verificar',
      paraphrasing: 'Parafrasear',
      loading: 'Cargando...',
    },
    en: {
      title: 'Research Center',
      subtitle: 'Learn to research like a real scientist',
      browser: 'Browser',
      citations: 'Citations',
      plagiarism: 'Check',
      paraphrasing: 'Paraphrase',
      loading: 'Loading...',
    },
  };

  const t = language === 'bilingual' ? text.en : text[language];

  useEffect(() => {
    loadSources();
  }, [userId]);

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const loadedSources = await getResearchSources(userId, currentProjectId);
      setSources(loadedSources);
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHighlight = async (text: string, url: string) => {
    try {
      // Extract metadata from URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // Check if we already have this source
      const existingSource = sources.find(s => s.url === url);
      
      if (existingSource) {
        // Add highlight to existing source
        const updatedHighlights = [...existingSource.highlights, text];
        await updateResearchSource(existingSource.id, { highlights: updatedHighlights });
        await loadSources();
      } else {
        // Create new source
        const newSource: Omit<ResearchSource, 'id' | 'createdAt'> = {
          userId,
          projectId: currentProjectId,
          title: document.title || 'Untitled',
          url,
          domain,
          dateAccessed: new Date().toISOString(),
          highlights: [text],
          screenshots: [],
        };
        await saveResearchSource(newSource);
        await loadSources();
      }
    } catch (error) {
      console.error('Error saving highlight:', error);
    }
  };

  const handleSaveScreenshot = async (dataUrl: string, url: string) => {
    try {
      const existingSource = sources.find(s => s.url === url);
      
      if (existingSource) {
        const updatedScreenshots = [...existingSource.screenshots, dataUrl];
        await updateResearchSource(existingSource.id, { screenshots: updatedScreenshots });
        await loadSources();
      } else {
        const urlObj = new URL(url);
        const newSource: Omit<ResearchSource, 'id' | 'createdAt'> = {
          userId,
          projectId: currentProjectId,
          title: document.title || 'Untitled',
          url,
          domain: urlObj.hostname,
          dateAccessed: new Date().toISOString(),
          highlights: [],
          screenshots: [dataUrl],
        };
        await saveResearchSource(newSource);
        await loadSources();
      }
    } catch (error) {
      console.error('Error saving screenshot:', error);
    }
  };

  const handleAddSource = async (source: Omit<ResearchSource, 'id' | 'createdAt'>) => {
    try {
      await saveResearchSource(source);
      await loadSources();
    } catch (error) {
      console.error('Error adding source:', error);
    }
  };

  const handleUpdateSource = async (id: string, updates: Partial<ResearchSource>) => {
    try {
      await updateResearchSource(id, updates);
      await loadSources();
    } catch (error) {
      console.error('Error updating source:', error);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await deleteResearchSource(id);
      await loadSources();
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  const handleGenerateBibliography = () => {
    // Generate bibliography text
    const bibliography = sources.map((source, index) => {
      const author = source.author || '';
      const title = source.title;
      const domain = source.domain;
      const date = new Date(source.dateAccessed).toLocaleDateString(
        language === 'es' ? 'es-ES' : 'en-US'
      );
      
      return `${index + 1}. ${author ? author + '. ' : ''}\"${title}\". ${domain}. ${date}.`;
    }).join('\n\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(bibliography);
    alert(language === 'es' ? '¡Bibliografía copiada!' : 'Bibliography copied!');
  };

  const handlePlagiarismCheckComplete = async (check: PlagiarismCheck) => {
    try {
      await savePlagiarismCheck(check);
    } catch (error) {
      console.error('Error saving plagiarism check:', error);
    }
  };

  const handleParaphrasingComplete = async (attempt: ParaphrasingAttempt) => {
    try {
      await saveParaphrasingAttempt(attempt);
    } catch (error) {
      console.error('Error saving paraphrasing attempt:', error);
    }
  };

  const tabs = [
    { id: 'browser' as ResearchTab, label: t.browser, icon: Search, color: 'sky' },
    { id: 'citations' as ResearchTab, label: t.citations, icon: BookMarked, color: 'blue' },
    { id: 'plagiarism' as ResearchTab, label: t.plagiarism, icon: Shield, color: 'green' },
    { id: 'paraphrasing' as ResearchTab, label: t.paraphrasing, icon: Wand2, color: 'purple' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-xl text-gray-600">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                    isActive
                      ? `bg-${tab.color}-500 text-white shadow-md transform scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'browser' && (
          <ResearchBrowser
            userId={userId}
            projectId={currentProjectId}
            language={language}
            onSaveHighlight={handleSaveHighlight}
            onSaveScreenshot={handleSaveScreenshot}
          />
        )}
        
        {activeTab === 'citations' && (
          <CitationManager
            userId={userId}
            projectId={currentProjectId}
            language={language}
            sources={sources}
            onAddSource={handleAddSource}
            onUpdateSource={handleUpdateSource}
            onDeleteSource={handleDeleteSource}
            onGenerateBibliography={handleGenerateBibliography}
          />
        )}
        
        {activeTab === 'plagiarism' && (
          <PlagiarismChecker
            userId={userId}
            projectId={currentProjectId}
            language={language}
            sources={sources}
            onCheckComplete={handlePlagiarismCheckComplete}
          />
        )}
        
        {activeTab === 'paraphrasing' && (
          <ParaphrasingTool
            userId={userId}
            projectId={currentProjectId}
            language={language}
            onComplete={handleParaphrasingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ResearchHub;
