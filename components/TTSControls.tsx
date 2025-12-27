
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw } from 'lucide-react';
import ttsService from '../services/tts';
import { Language } from '../types';

interface TTSControlsProps {
    text?: string;
    language: Language;
    studentAge: number;
    autoPlay?: boolean;
    onEnd?: () => void;
}

const TTSControls: React.FC<TTSControlsProps> = ({ 
    text, 
    language, 
    studentAge, 
    autoPlay = false,
    onEnd 
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (autoPlay && text) {
            playText();
        }
    }, [text, autoPlay]);

    useEffect(() => {
        // Update TTS settings when age or language changes
        const lang = language === 'bilingual' ? 'es' : language;
        ttsService.updateSettings(studentAge, lang);
    }, [studentAge, language]);

    const playText = () => {
        if (!text) return;

        const lang = language === 'bilingual' ? 'es' : language;
        ttsService.updateSettings(studentAge, lang);
        
        setIsPlaying(true);
        setIsPaused(false);
        
        ttsService.speak(text, () => {
            setIsPlaying(false);
            if (onEnd) onEnd();
        });
    };

    const handlePlayPause = () => {
        if (isPlaying && !isPaused) {
            ttsService.pause();
            setIsPaused(true);
        } else if (isPaused) {
            ttsService.resume();
            setIsPaused(false);
        } else {
            playText();
        }
    };

    const handleStop = () => {
        ttsService.stop();
        setIsPlaying(false);
        setIsPaused(false);
    };

    const handleMute = () => {
        if (isMuted) {
            const settings = ttsService.getSettings();
            ttsService.setCustomSettings({ volume: 1.0 });
            setIsMuted(false);
        } else {
            ttsService.setCustomSettings({ volume: 0 });
            setIsMuted(true);
        }
    };

    const t = {
        es: {
            play: 'Reproducir',
            pause: 'Pausar',
            stop: 'Detener',
            mute: 'Silenciar',
            unmute: 'Activar sonido'
        },
        en: {
            play: 'Play',
            pause: 'Pause',
            stop: 'Stop',
            mute: 'Mute',
            unmute: 'Unmute'
        },
        bilingual: {
            play: 'Reproducir / Play',
            pause: 'Pausar / Pause',
            stop: 'Detener / Stop',
            mute: 'Silenciar / Mute',
            unmute: 'Activar / Unmute'
        }
    };

    const labels = t[language] || t.es;

    if (!ttsService.isAvailable()) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-xl border-2 border-purple-200 shadow-sm">
            {/* Play/Pause Button */}
            <button
                onClick={handlePlayPause}
                disabled={!text}
                className={`p-3 rounded-xl font-bold transition-all ${
                    isPlaying && !isPaused
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110 shadow-lg'
                        : 'bg-white text-purple-600 hover:bg-purple-50'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={isPaused ? labels.play : isPlaying ? labels.pause : labels.play}
            >
                {isPaused ? <Play className="w-5 h-5" /> : isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* Stop Button */}
            {isPlaying && (
                <button
                    onClick={handleStop}
                    className="p-3 rounded-xl font-bold transition-all bg-white text-red-600 hover:bg-red-50"
                    title={labels.stop}
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            )}

            {/* Mute Button */}
            <button
                onClick={handleMute}
                className="p-3 rounded-xl font-bold transition-all bg-white text-purple-600 hover:bg-purple-50"
                title={isMuted ? labels.unmute : labels.mute}
            >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Status Text */}
            <div className="ml-2 px-3 py-1 bg-white rounded-lg">
                <span className="text-sm font-bold text-purple-700">
                    {isPlaying ? (isPaused ? '⏸️' : '▶️') : '🔇'}
                </span>
            </div>

            {/* Visual indicator for playing */}
            {isPlaying && !isPaused && (
                <div className="flex gap-1 ml-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-pulse"
                            style={{
                                height: '20px',
                                animationDelay: `${i * 150}ms`
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TTSControls;
