
import React from 'react';
import { Globe, Languages } from 'lucide-react';
import { Language } from '../types';

interface LanguageSelectorProps {
    language: Language;
    onLanguageChange: (lang: Language) => void;
    isPrimary?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
    language, 
    onLanguageChange, 
    isPrimary = false 
}) => {
    const languages = [
        { 
            code: 'es' as Language, 
            label: 'Español', 
            flag: '🇪🇸',
            color: 'from-red-400 to-yellow-400'
        },
        { 
            code: 'en' as Language, 
            label: 'English', 
            flag: '🇺🇸',
            color: 'from-blue-400 to-red-400'
        },
        { 
            code: 'bilingual' as Language, 
            label: 'Bilingüe / Bilingual', 
            flag: '🌎',
            color: 'from-purple-400 to-pink-400'
        }
    ];

    return (
        <div className={`bg-white rounded-2xl shadow-lg p-4 ${isPrimary ? 'border-4 border-purple-200' : 'border border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-xl ${isPrimary ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-100'}`}>
                    <Languages className={`w-5 h-5 ${isPrimary ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <h3 className={`font-black ${isPrimary ? 'text-xl text-purple-800' : 'text-sm text-slate-700'}`}>
                    {language === 'es' ? 'Idioma / Language' : 'Language / Idioma'}
                </h3>
            </div>

            <div className={`grid ${isPrimary ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-2'}`}>
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code)}
                        className={`relative overflow-hidden rounded-xl transition-all ${
                            language === lang.code
                                ? isPrimary
                                    ? 'scale-105 shadow-lg ring-4 ring-purple-400'
                                    : 'scale-105 shadow-md ring-2 ring-indigo-400'
                                : isPrimary
                                    ? 'hover:scale-105 opacity-70 hover:opacity-100'
                                    : 'hover:scale-105 opacity-60 hover:opacity-100'
                        }`}
                    >
                        <div className={`bg-gradient-to-r ${lang.color} p-4 text-white`}>
                            <div className={`text-center ${isPrimary ? 'space-y-2' : ''}`}>
                                <div className={`${isPrimary ? 'text-5xl' : 'text-3xl'} mb-2`}>
                                    {lang.flag}
                                </div>
                                <div className={`font-black ${isPrimary ? 'text-lg' : 'text-xs'}`}>
                                    {lang.label}
                                </div>
                            </div>
                        </div>
                        
                        {language === lang.code && (
                            <div className="absolute top-2 right-2">
                                <div className={`bg-white rounded-full p-1 ${isPrimary ? 'w-8 h-8' : 'w-6 h-6'} flex items-center justify-center`}>
                                    <span className={`${isPrimary ? 'text-xl' : 'text-sm'}`}>✓</span>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Explanation for primary students */}
            {isPrimary && (
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border-2 border-purple-100">
                    <p className="text-purple-700 font-bold text-sm text-center">
                        {language === 'es' 
                            ? '✨ ¡Elige tu idioma favorito! Nova te ayudará en el idioma que prefieras.'
                            : language === 'en'
                            ? '✨ Choose your favorite language! Nova will help you in your preferred language.'
                            : '✨ ¡Aprende en ambos idiomas! / Learn in both languages!'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
