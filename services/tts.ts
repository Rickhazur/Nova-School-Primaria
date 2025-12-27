
// Age-Adaptive Text-to-Speech Service using Web Speech API
// Free, browser-native, no API costs

export interface TTSSettings {
    rate: number;      // Speech rate (0.1 to 10, default 1)
    pitch: number;     // Voice pitch (0 to 2, default 1)
    volume: number;    // Volume (0 to 1, default 1)
    voice: string | null; // Voice name or null for default
    language: string;  // Language code (es-ES, en-US, etc.)
}

class TTSService {
    private synth: SpeechSynthesis;
    private utterance: SpeechSynthesisUtterance | null = null;
    private settings: TTSSettings;
    private isSupported: boolean;

    constructor() {
        this.synth = window.speechSynthesis;
        this.isSupported = 'speechSynthesis' in window;
        
        // Default settings for age 8
        this.settings = this.getAgeAdaptiveSettings(8, 'es');
    }

    // Get age-adaptive TTS settings
    getAgeAdaptiveSettings(age: number, language: string): TTSSettings {
        // Younger children (6-7): Slower, higher pitch, friendly
        if (age <= 7) {
            return {
                rate: 0.8,          // Slower speech
                pitch: 1.3,         // Higher pitch (child-friendly)
                volume: 1.0,
                voice: null,
                language: language === 'es' ? 'es-ES' : 'en-US'
            };
        }
        
        // Middle primary (8-9): Moderate pace, normal pitch
        if (age <= 9) {
            return {
                rate: 0.9,          // Normal pace
                pitch: 1.1,         // Slightly higher pitch
                volume: 1.0,
                voice: null,
                language: language === 'es' ? 'es-ES' : 'en-US'
            };
        }
        
        // Older primary (10-11): Normal speech, adult-like
        return {
            rate: 1.0,              // Normal rate
            pitch: 1.0,             // Normal pitch
            volume: 1.0,
            voice: null,
            language: language === 'es' ? 'es-ES' : 'en-US'
        };
    }

    // Update settings based on age and language
    updateSettings(age: number, language: string) {
        this.settings = this.getAgeAdaptiveSettings(age, language);
    }

    // Get available voices
    getAvailableVoices(): SpeechSynthesisVoice[] {
        if (!this.isSupported) return [];
        return this.synth.getVoices();
    }

    // Get child-friendly voices (filtered by language and characteristics)
    getChildFriendlyVoices(language: string): SpeechSynthesisVoice[] {
        const voices = this.getAvailableVoices();
        const langCode = language === 'es' ? 'es' : 'en';
        
        return voices.filter(voice => 
            voice.lang.startsWith(langCode) && 
            (voice.name.includes('Female') || voice.name.includes('female') || !voice.name.includes('Male'))
        );
    }

    // Speak text with current settings
    speak(text: string, onEnd?: () => void) {
        if (!this.isSupported || !text) {
            console.warn('TTS not supported or no text provided');
            if (onEnd) onEnd();
            return;
        }

        // Cancel any ongoing speech
        this.stop();

        // Create new utterance
        this.utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        this.utterance.rate = this.settings.rate;
        this.utterance.pitch = this.settings.pitch;
        this.utterance.volume = this.settings.volume;
        this.utterance.lang = this.settings.language;

        // Set voice if specified
        if (this.settings.voice) {
            const voices = this.getAvailableVoices();
            const selectedVoice = voices.find(v => v.name === this.settings.voice);
            if (selectedVoice) {
                this.utterance.voice = selectedVoice;
            }
        } else {
            // Try to use a child-friendly voice
            const childFriendlyVoices = this.getChildFriendlyVoices(this.settings.language);
            if (childFriendlyVoices.length > 0) {
                this.utterance.voice = childFriendlyVoices[0];
            }
        }

        // Event handlers
        this.utterance.onend = () => {
            console.log('TTS finished');
            if (onEnd) onEnd();
        };

        this.utterance.onerror = (error) => {
            console.error('TTS error:', error);
            if (onEnd) onEnd();
        };

        // Speak
        this.synth.speak(this.utterance);
    }

    // Stop current speech
    stop() {
        if (this.isSupported && this.synth.speaking) {
            this.synth.cancel();
        }
    }

    // Pause current speech
    pause() {
        if (this.isSupported && this.synth.speaking) {
            this.synth.pause();
        }
    }

    // Resume paused speech
    resume() {
        if (this.isSupported && this.synth.paused) {
            this.synth.resume();
        }
    }

    // Check if currently speaking
    isSpeaking(): boolean {
        return this.isSupported && this.synth.speaking;
    }

    // Check if TTS is supported
    isAvailable(): boolean {
        return this.isSupported;
    }

    // Get current settings
    getSettings(): TTSSettings {
        return { ...this.settings };
    }

    // Set custom settings
    setCustomSettings(settings: Partial<TTSSettings>) {
        this.settings = { ...this.settings, ...settings };
    }
}

// Create singleton instance
const ttsService = new TTSService();

export default ttsService;

// Helper function to speak text with age adaptation
export function speakWithAge(text: string, age: number, language: string, onEnd?: () => void) {
    ttsService.updateSettings(age, language);
    ttsService.speak(text, onEnd);
}

// Helper function to stop speaking
export function stopSpeaking() {
    ttsService.stop();
}
