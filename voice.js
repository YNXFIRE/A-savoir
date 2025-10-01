// MAteacher - Gestionnaire de Reconnaissance Vocale

class VoiceManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.voices = [];
        this.selectedVoice = null;
        this.settings = {
            language: 'fr-FR',
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8
        };
        this.init();
    }

    init() {
        this.setupSpeechRecognition();
        this.setupSpeechSynthesis();
        this.setupEventListeners();
        this.loadVoices();
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        }

        if (this.recognition) {
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = this.settings.language;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceUI(true);
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    this.processSpeechInput(finalTranscript);
                }

                // Afficher le texte interim dans l'input
                const chatInput = document.getElementById('chat-input');
                if (chatInput && interimTranscript) {
                    chatInput.placeholder = `En cours: "${interimTranscript}"`;
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Erreur de reconnaissance vocale:', event.error);
                this.handleSpeechError(event.error);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceUI(false);
                
                const chatInput = document.getElementById('chat-input');
                if (chatInput) {
                    chatInput.placeholder = 'Pose ta question à MAteacher...';
                }
            };
        }
    }

    setupSpeechSynthesis() {
        if (this.synthesis) {
            this.synthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    loadVoices() {
        if (!this.synthesis) return;

        this.voices = this.synthesis.getVoices();
        
        // Privilégier les voix françaises
        const frenchVoices = this.voices.filter(voice => 
            voice.lang.startsWith('fr') || voice.lang.includes('FR')
        );
        
        if (frenchVoices.length > 0) {
            this.selectedVoice = frenchVoices[0];
        } else {
            this.selectedVoice = this.voices[0] || null;
        }
    }

    setupEventListeners() {
        const voiceBtn = document.getElementById('voice-btn');
        const voiceInputBtn = document.getElementById('voice-input-btn');

        voiceBtn?.addEventListener('click', () => this.toggleVoiceMode());
        voiceInputBtn?.addEventListener('click', () => this.toggleListening());
    }

    toggleVoiceMode() {
        if (!this.recognition) {
            window.app?.showNotification('Reconnaissance vocale non supportée', 'error');
            return;
        }

        this.showVoiceSettings();
    }

    toggleListening() {
        if (!this.recognition) {
            window.app?.showNotification('Reconnaissance vocale non disponible', 'error');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition || this.isListening) return;

        try {
            this.recognition.start();
            window.app?.showNotification('🎤 Écoute activée - Parlez maintenant !', 'info');
        } catch (error) {
            console.error('Erreur lors du démarrage de l\'écoute:', error);
            window.app?.showNotification('Impossible de démarrer l\'écoute', 'error');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    processSpeechInput(transcript) {
        const cleanTranscript = transcript.trim();
        if (!cleanTranscript) return;

        // Ajouter au chat
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = cleanTranscript;
            
            // Déclencher l'envoi du message
            const sendBtn = document.getElementById('send-btn');
            if (sendBtn) {
                sendBtn.click();
            }
        }
    }

    speak(text) {
        if (!this.synthesis || !text) return;

        const cleanText = text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/•/g, '')
            .replace(/\n+/g, '. ')
            .replace(/[🔍📐⭐💡✅📸✨🎯🚀]/g, '')
            .trim();

        if (this.isSpeaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = this.selectedVoice;
        utterance.rate = this.settings.rate;
        utterance.pitch = this.settings.pitch;
        utterance.volume = this.settings.volume;
        utterance.lang = this.settings.language;

        utterance.onstart = () => this.isSpeaking = true;
        utterance.onend = () => this.isSpeaking = false;

        this.synthesis.speak(utterance);
    }

    updateVoiceUI(isListening) {
        const voiceInputBtn = document.getElementById('voice-input-btn');
        if (!voiceInputBtn) return;

        if (isListening) {
            voiceInputBtn.classList.add('animate-pulse');
            voiceInputBtn.innerHTML = '<i class="fas fa-stop"></i>';
        } else {
            voiceInputBtn.classList.remove('animate-pulse');
            voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }

    showVoiceSettings() {
        // Modal simple pour les paramètres vocaux
        window.app?.showNotification('Fonctionnalité vocale activée ! 🎤', 'success');
    }

    handleSpeechError(error) {
        const errorMessages = {
            'no-speech': 'Aucun son détecté',
            'audio-capture': 'Microphone inaccessible',
            'not-allowed': 'Permission refusée',
            'network': 'Erreur réseau'
        };

        const message = errorMessages[error] || 'Erreur de reconnaissance vocale';
        window.app?.showNotification(message, 'error');
    }
}

// Initialiser
document.addEventListener('DOMContentLoaded', () => {
    window.voiceManager = new VoiceManager();
});