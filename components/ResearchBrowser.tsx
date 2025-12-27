import React, { useState, useEffect } from 'react';
import { Globe, Save, Camera, History, AlertTriangle, CheckCircle } from 'lucide-react';
import { ResearchSession, Language } from '../types';

interface ResearchBrowserProps {
  userId: string;
  projectId?: string;
  language: Language;
  onSaveHighlight: (text: string, url: string) => void;
  onSaveScreenshot: (dataUrl: string, url: string) => void;
}

// Whitelist of safe educational sites for primary school children
const SAFE_DOMAINS = [
  'wikipedia.org',
  'nationalgeographic.com',
  'kids.nationalgeographic.com',
  'kids.britannica.com',
  'britannica.com',
  'nasa.gov',
  'khanacademy.org',
  'ducksters.com',
  'sciencekids.co.nz',
  'timeforkids.com',
  'scholastic.com',
  'pbskids.org',
  'kids.gov',
  'smithsonianeducation.org',
  '.edu', // All educational domains
  '.gov', // All government domains
];

const ResearchBrowser: React.FC<ResearchBrowserProps> = ({
  userId,
  projectId,
  language,
  onSaveHighlight,
  onSaveScreenshot,
}) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isUrlSafe, setIsUrlSafe] = useState<boolean | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [history, setHistory] = useState<{ url: string; title: string; timestamp: string }[]>([]);

  const text = {
    es: {
      title: 'Navegador de Investigación',
      urlPlaceholder: 'Ingresa la dirección web (ej: wikipedia.org)',
      goButton: 'Ir',
      safeMessage: '✔️ Sitio seguro para investigar',
      unsafeMessage: '⚠️ Este sitio no está en nuestra lista de sitios educativos seguros',
      saveHighlight: 'Guardar texto seleccionado',
      takeScreenshot: 'Tomar captura de pantalla',
      viewHistory: 'Ver historial',
      instructions: 'Instrucciones:',
      step1: '1. Escribe la dirección del sitio web que quieres visitar',
      step2: '2. Solo puedes visitar sitios educativos seguros',
      step3: '3. Selecciona texto importante y guárdalo para tu bibliografía',
      step4: '4. Toma capturas de pantalla de imágenes o diagramas importantes',
      noTextSelected: 'Selecciona texto en la página primero',
      historyTitle: 'Historial de Navegación',
      noHistory: 'Aún no has visitado ningún sitio',
    },
    en: {
      title: 'Research Browser',
      urlPlaceholder: 'Enter web address (e.g., wikipedia.org)',
      goButton: 'Go',
      safeMessage: '✔️ Safe site for research',
      unsafeMessage: '⚠️ This site is not on our list of safe educational sites',
      saveHighlight: 'Save selected text',
      takeScreenshot: 'Take screenshot',
      viewHistory: 'View history',
      instructions: 'Instructions:',
      step1: '1. Type the website address you want to visit',
      step2: '2. You can only visit safe educational sites',
      step3: '3. Select important text and save it for your bibliography',
      step4: '4. Take screenshots of important images or diagrams',
      noTextSelected: 'Select text on the page first',
      historyTitle: 'Browsing History',
      noHistory: 'You haven\'t visited any sites yet',
    },
  };

  const t = language === 'bilingual' ? text.en : text[language];

  useEffect(() => {
    // Start a new research session
    const newSession: ResearchSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      startTime: new Date().toISOString(),
      visitedUrls: [],
      savedHighlights: [],
    };
    setSession(newSession);
  }, [userId, projectId]);

  const checkUrlSafety = (url: string): boolean => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname;
      
      return SAFE_DOMAINS.some(safeDomain => {
        if (safeDomain.startsWith('.')) {
          return domain.endsWith(safeDomain);
        }
        return domain.includes(safeDomain);
      });
    } catch {
      return false;
    }
  };

  const handleNavigate = () => {
    const safe = checkUrlSafety(urlInput);
    setIsUrlSafe(safe);
    
    if (safe) {
      const fullUrl = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
      setCurrentUrl(fullUrl);
      
      // Add to history
      const historyEntry = {
        url: fullUrl,
        title: urlInput,
        timestamp: new Date().toISOString(),
      };
      setHistory(prev => [historyEntry, ...prev]);
      
      // Update session
      if (session) {
        setSession({
          ...session,
          visitedUrls: [...session.visitedUrls, { ...historyEntry, duration: 0 }],
        });
      }
    }
  };

  const handleSaveHighlight = () => {
    if (!selectedText || !currentUrl) {
      alert(t.noTextSelected);
      return;
    }
    
    onSaveHighlight(selectedText, currentUrl);
    
    // Update session
    if (session) {
      setSession({
        ...session,
        savedHighlights: [
          ...session.savedHighlights,
          { text: selectedText, url: currentUrl, timestamp: new Date().toISOString() },
        ],
      });
    }
    
    setSelectedText('');
  };

  const handleScreenshot = () => {
    if (!currentUrl) return;
    
    // In a real implementation, this would capture the iframe content
    // For now, we'll simulate it
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.fillText('Screenshot of: ' + currentUrl, 50, 300);
    }
    
    const dataUrl = canvas.toDataURL();
    onSaveScreenshot(dataUrl, currentUrl);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-sky-500" />
          <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">{t.instructions}</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>{t.step1}</li>
            <li>{t.step2}</li>
            <li>{t.step3}</li>
            <li>{t.step4}</li>
          </ul>
        </div>

        {/* URL Bar */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
            placeholder={t.urlPlaceholder}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-sky-500 focus:outline-none"
          />
          <button
            onClick={handleNavigate}
            className="px-6 py-3 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors"
          >
            {t.goButton}
          </button>
        </div>

        {/* Safety Message */}
        {isUrlSafe !== null && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
            isUrlSafe ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isUrlSafe ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isUrlSafe ? t.safeMessage : t.unsafeMessage}
            </span>
          </div>
        )}

        {/* Browser Controls */}
        {currentUrl && isUrlSafe && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSaveHighlight}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              {t.saveHighlight}
            </button>
            <button
              onClick={handleScreenshot}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Camera className="w-4 h-4" />
              {t.takeScreenshot}
            </button>
            <button
              onClick={() => setHistory(prev => prev)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors ml-auto"
            >
              <History className="w-4 h-4" />
              {t.viewHistory}
            </button>
          </div>
        )}

        {/* Browser Frame */}
        {currentUrl && isUrlSafe ? (
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={currentUrl}
                className="w-full h-full border-0"
                title="Research Browser"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onLoad={(e) => {
                  // Detect text selection
                  const iframe = e.target as HTMLIFrameElement;
                  try {
                    iframe.contentWindow?.document.addEventListener('mouseup', () => {
                      const selection = iframe.contentWindow?.getSelection();
                      if (selection && selection.toString().length > 0) {
                        setSelectedText(selection.toString());
                      }
                    });
                  } catch (err) {
                    // Cross-origin restrictions may prevent this
                    console.log('Cannot access iframe content due to CORS');
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-12 text-center" style={{ height: '600px' }}>
            <Globe className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'es' 
                ? 'Ingresa una dirección web arriba para comenzar tu investigación'
                : 'Enter a web address above to start your research'}
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-gray-800 mb-3">{t.historyTitle}</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => {
                    setUrlInput(entry.url);
                    handleNavigate();
                  }}
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 flex-1">{entry.title}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchBrowser;
