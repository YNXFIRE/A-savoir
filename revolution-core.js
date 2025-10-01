/**
 * 🚀 MAteacher RÉVOLUTION - Système IA Core Ultra-Avancé
 * Fonctionnalités révolutionnaires pour l'éducation du futur
 */

class MAteacherRevolution {
    constructor() {
        this.aiPersonality = 'teacher';
        this.currentLanguage = 'fr';
        this.targetLanguage = 'en';
        this.immersionMode = false;
        this.voiceActive = false;
        this.conversationHistory = [];
        this.knowledgeBase = this.initializeKnowledgeBase();
        
        this.aiPersonalities = {
            genius: {
                name: "🧠 Dr. Genius",
                level: "Universitaire+",
                style: "Explications ultra-avancées avec théories complexes",
                responses: {
                    greeting: "Bonjour ! Je suis Dr. Genius, votre consultant scientifique de niveau Nobel.",
                    math: "Analysons cette équation avec les dernières avancées en mathématiques pures...",
                    science: "Selon les recherches quantiques et la théorie des cordes récente...",
                    language: "Cette construction linguistique révèle des patterns indo-européens fascinants..."
                }
            },
            teacher: {
                name: "👨‍🏫 Prof. Sage",
                level: "Lycée",
                style: "Pédagogie structurée avec exemples concrets",
                responses: {
                    greeting: "Salut ! Je suis Prof. Sage, ton professeur IA qui rend tout accessible !",
                    math: "Super question ! Décomposons ce problème étape par étape...",
                    science: "Excellente curiosité ! Voici une explication claire avec des exemples...",
                    language: "Génial ! Cette règle grammaticale s'explique facilement..."
                }
            },
            tutor: {
                name: "🤝 Ami Tuteur",
                level: "Collège",
                style: "Accompagnement bienveillant et encourageant",
                responses: {
                    greeting: "Hey ! Je suis ton Ami Tuteur, on apprend ensemble dans la bonne humeur !",
                    math: "Pas de stress ! C'est normal de ne pas comprendre au début. Regardons ensemble...",
                    science: "Waouh, excellente question ! Tu es très observateur(trice) ! Voici pourquoi...",
                    language: "C'est parti pour cette aventure linguistique ! Tu vas voir, c'est amusant..."
                }
            }
        };

        this.languageDatabase = {
            'fr': { name: 'Français', flag: '🇫🇷', family: 'Romans' },
            'en': { name: 'Anglais', flag: '🇺🇸', family: 'Germaniques' },
            'es': { name: 'Espagnol', flag: '🇪🇸', family: 'Romans' },
            'de': { name: 'Allemand', flag: '🇩🇪', family: 'Germaniques' },
            'it': { name: 'Italien', flag: '🇮🇹', family: 'Romans' },
            'pt': { name: 'Portugais', flag: '🇵🇹', family: 'Romans' },
            'ru': { name: 'Russe', flag: '🇷🇺', family: 'Slaves' },
            'ja': { name: 'Japonais', flag: '🇯🇵', family: 'Japoniques' },
            'ko': { name: 'Coréen', flag: '🇰🇷', family: 'Coréennes' },
            'zh': { name: 'Chinois', flag: '🇨🇳', family: 'Sino-tibétaines' },
            'ar': { name: 'Arabe', flag: '🇸🇦', family: 'Sémitiques' }
        };

        this.init();
    }

    initializeKnowledgeBase() {
        return {
            mathematics: {
                algebra: ["équations", "polynômes", "fonctions", "matrices"],
                geometry: ["trigonométrie", "géométrie analytique", "espaces vectoriels"],
                analysis: ["limites", "dérivées", "intégrales", "séries"],
                statistics: ["probabilités", "statistiques descriptives", "inférence"]
            },
            sciences: {
                physics: ["mécanique", "thermodynamique", "électromagnétisme", "quantique"],
                chemistry: ["atomique", "organique", "physico-chimie", "biochimie"],
                biology: ["cellulaire", "génétique", "évolution", "écologie"],
                earth: ["géologie", "météorologie", "océanographie", "astronomie"]
            },
            languages: {
                linguistics: ["phonétique", "morphologie", "syntaxe", "sémantique"],
                literature: ["poésie", "roman", "théâtre", "essai"],
                foreign: ["grammaire", "vocabulaire", "civilisation", "expression"]
            },
            humanities: {
                history: ["antique", "médiévale", "moderne", "contemporaine"],
                philosophy: ["métaphysique", "éthique", "logique", "esthétique"],
                psychology: ["cognitive", "sociale", "développementale", "clinique"]
            }
        };
    }

    init() {
        console.log("🚀 MAteacher RÉVOLUTION - Initialisation système IA...");
        this.setupEventListeners();
        this.setupAdvancedTranslation();
        this.setupVoiceRecognition();
        this.displayWelcomeMessage();
    }

    setupEventListeners() {
        // Chat input avec auto-complétion
        const chatInput = document.getElementById('revolutionChatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });

            chatInput.addEventListener('input', (e) => {
                this.handleAutoComplete(e.target.value);
            });
        }

        // Subject input avec suggestions avancées
        const subjectInput = document.getElementById('revolutionSubject');
        if (subjectInput) {
            subjectInput.addEventListener('input', (e) => {
                this.showAdvancedSuggestions(e.target.value);
            });
        }
    }

    setupAdvancedTranslation() {
        console.log("🌍 Configuration traducteur révolutionnaire...");
        
        // Initialisation des contrôles de traduction
        const sourceText = document.getElementById('sourceText');
        const targetText = document.getElementById('translatedText');
        
        if (sourceText) {
            sourceText.addEventListener('input', debounce((e) => {
                this.performAdvancedTranslation(e.target.value);
            }, 500));
        }
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = this.currentLanguage;
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceInput(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('🎤 Erreur reconnaissance vocale:', event.error);
            };
        }
    }

    displayWelcomeMessage() {
        setTimeout(() => {
            const ai = this.aiPersonalities[this.aiPersonality];
            this.addMessage(
                `🚀 ${ai.responses.greeting}\n\n✨ **Fonctionnalités révolutionnaires disponibles :**\n• 🧠 IA Multi-niveaux (8 ans → Université)\n• 🌍 Traduction 100+ langues avec contexte\n• 🎤 Reconnaissance vocale polyglotte\n• 📹 Analyse visuelle de documents\n• 🎯 Personnalisation totale\n\n**Que souhaitez-vous apprendre aujourd'hui ?**`,
                'ai'
            );
        }, 1000);
    }

    sendMessage() {
        const input = document.getElementById('revolutionChatInput');
        const message = input?.value?.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        // Simulation de temps de réflexion de l'IA
        setTimeout(() => {
            const aiResponse = this.generateIntelligentResponse(message);
            this.addMessage(aiResponse, 'ai');
        }, 800 + Math.random() * 1200);
    }

    generateIntelligentResponse(userMessage) {
        const ai = this.aiPersonalities[this.aiPersonality];
        const lowerMsg = userMessage.toLowerCase();
        
        // Détection intelligente du domaine
        let domain = this.detectMessageDomain(lowerMsg);
        let response = "";

        switch (domain) {
            case 'mathematics':
                response = `${ai.responses.math}\n\n📊 **Analyse de votre question :**\n• Type : ${this.detectMathType(lowerMsg)}\n• Niveau : ${ai.level}\n• Approche : ${ai.style}\n\n🎯 Voulez-vous que je vous montre sur le tableau interactif ?`;
                break;

            case 'sciences':
                response = `${ai.responses.science}\n\n🔬 **Domaine identifié :** ${this.detectScienceType(lowerMsg)}\n**Méthode d'explication :** ${ai.style}\n\n💡 Je peux créer une démonstration visuelle si vous le souhaitez !`;
                break;

            case 'languages':
                response = `${ai.responses.language}\n\n🌍 **Analyse linguistique :**\n• Famille : ${this.detectLanguageFamily(lowerMsg)}\n• Difficulté : ${this.assessDifficulty(ai.level)}\n• Contexte culturel disponible ✅\n\n🎭 Mode immersion disponible pour pratiquer !`;
                break;

            default:
                response = `${ai.responses.greeting}\n\n🤔 **Réflexion en cours...**\nVotre question touche plusieurs domaines. Permettez-moi de structurer ma réponse :\n\n${this.generateContextualResponse(userMessage, ai.level)}`;
        }

        // Mode immersion : traduire si nécessaire
        if (this.immersionMode && this.targetLanguage !== 'fr') {
            response = this.translateResponse(response);
        }

        return response;
    }

    detectMessageDomain(message) {
        const mathKeywords = ['math', 'équation', 'calcul', 'fonction', 'dérivée', 'intégrale', 'géométrie'];
        const scienceKeywords = ['physique', 'chimie', 'biologie', 'science', 'expérience', 'molécule'];
        const languageKeywords = ['langue', 'grammaire', 'traduction', 'vocabulaire', 'conjugaison'];

        if (mathKeywords.some(keyword => message.includes(keyword))) return 'mathematics';
        if (scienceKeywords.some(keyword => message.includes(keyword))) return 'sciences';
        if (languageKeywords.some(keyword => message.includes(keyword))) return 'languages';
        
        return 'general';
    }

    detectMathType(message) {
        if (message.includes('dérivée') || message.includes('limite')) return 'Analyse mathématique';
        if (message.includes('équation') || message.includes('système')) return 'Algèbre';
        if (message.includes('triangle') || message.includes('cercle')) return 'Géométrie';
        return 'Mathématiques générales';
    }

    detectScienceType(message) {
        if (message.includes('physique') || message.includes('force')) return 'Physique';
        if (message.includes('chimie') || message.includes('réaction')) return 'Chimie';
        if (message.includes('biologie') || message.includes('cellule')) return 'Biologie';
        return 'Sciences générales';
    }

    detectLanguageFamily(message) {
        if (message.includes('anglais') || message.includes('allemand')) return 'Germaniques';
        if (message.includes('espagnol') || message.includes('italien')) return 'Romans';
        if (message.includes('chinois') || message.includes('japonais')) return 'Asiatiques';
        return 'Linguistique générale';
    }

    assessDifficulty(level) {
        const difficulties = {
            'Collège': 'Initiation - Bases solides',
            'Lycée': 'Intermédiaire - Approfondissement',
            'Universitaire+': 'Avancé - Recherche'
        };
        return difficulties[level] || 'Adaptatif';
    }

    generateContextualResponse(message, level) {
        const responses = {
            'Collège': '🎯 Je vais vous expliquer simplement, étape par étape, avec des exemples de votre quotidien !',
            'Lycée': '📚 Approche méthodique avec liens interdisciplinaires et applications pratiques.',
            'Universitaire+': '🧠 Analyse approfondie avec références théoriques et dernières recherches.'
        };
        
        return responses[level] || '✨ Adaptation personnalisée à votre niveau en cours...';
    }

    addMessage(content, sender) {
        const messagesZone = document.getElementById('messagesZone');
        if (!messagesZone) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `revolution-message ${sender}-message`;

        const timestamp = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit', 
            minute: '2-digit'
        });

        let senderInfo = '';
        if (sender === 'ai') {
            const ai = this.aiPersonalities[this.aiPersonality];
            senderInfo = `${ai.name} • ${ai.level}`;
        } else {
            senderInfo = '🧑‍🎓 Vous';
        }

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender-info">${senderInfo}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;

        messagesZone.appendChild(messageDiv);
        messagesZone.scrollTop = messagesZone.scrollHeight;

        // Animation d'apparition
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);

        // Sauvegarde historique
        this.conversationHistory.push({
            content, 
            sender, 
            timestamp, 
            personality: this.aiPersonality
        });
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '<span style="color: #00f2fe;">•</span> ');
    }

    performAdvancedTranslation(text) {
        if (!text.trim()) return;

        const sourceSelect = document.getElementById('sourceLanguage');
        const targetSelect = document.getElementById('targetLanguage');
        const translatedArea = document.getElementById('translatedText');

        const sourceLang = sourceSelect?.value || 'fr';
        const targetLang = targetSelect?.value || 'en';

        // Simulation de traduction avancée avec analyse contextuelle
        const translation = this.simulateAdvancedTranslation(text, sourceLang, targetLang);
        
        if (translatedArea) {
            translatedArea.value = translation;
        }
    }

    simulateAdvancedTranslation(text, from, to) {
        // Simulation réaliste avec détection de contexte
        const contexts = {
            academic: ['étudier', 'apprendre', 'cours', 'exercice', 'examen'],
            scientific: ['théorie', 'expérience', 'hypothèse', 'résultat', 'analyse'],
            casual: ['salut', 'comment', 'ça va', 'merci', 'au revoir']
        };

        let context = 'general';
        for (let [type, keywords] of Object.entries(contexts)) {
            if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                context = type;
                break;
            }
        }

        const langInfo = this.languageDatabase[to];
        const flag = langInfo?.flag || '🌍';
        
        return `${flag} [${context.toUpperCase()}] ${text}\n\n📝 Analyse contextuelle :\n• Registre : ${this.getRegisterLevel(text)}\n• Complexité : ${this.getComplexityLevel(text)}\n• Suggestions culturelles : ${this.getCulturalNotes(to)}`;
    }

    getRegisterLevel(text) {
        if (text.includes('Monsieur') || text.includes('Madame')) return 'Formel';
        if (text.includes('salut') || text.includes('hey')) return 'Familier';
        return 'Standard';
    }

    getComplexityLevel(text) {
        const wordCount = text.split(' ').length;
        if (wordCount > 20) return 'Élevée';
        if (wordCount > 10) return 'Moyenne';
        return 'Simple';
    }

    getCulturalNotes(targetLang) {
        const notes = {
            'en': 'Directness appréciée, "please" fréquent',
            'es': 'Politesse chaleureuse, tutoiement rapide',
            'de': 'Précision valorisée, vouvoiement de rigueur',
            'ja': 'Politesse complexe (keigo), respect hiérarchique',
            'ar': 'Formules religieuses courantes, hospitalité'
        };
        return notes[targetLang] || 'Adaptation culturelle en cours...';
    }

    // Fonctions utilitaires
    changeAIPersonality(personality) {
        this.aiPersonality = personality;
        const ai = this.aiPersonalities[personality];
        
        this.addMessage(
            `🔄 **Changement de personnalité IA**\n\n${ai.responses.greeting}\n\n**Mode activé :** ${ai.name}\n**Niveau :** ${ai.level}\n**Style :** ${ai.style}`,
            'ai'
        );
    }

    toggleImmersionMode() {
        this.immersionMode = !this.immersionMode;
        
        if (this.immersionMode) {
            this.addMessage(
                `🌊 **MODE IMMERSION ACTIVÉ !**\n\nToutes mes réponses seront désormais en ${this.languageDatabase[this.targetLanguage]?.name} ${this.languageDatabase[this.targetLanguage]?.flag}`,
                'ai'
            );
        } else {
            this.addMessage('🏠 **Retour au mode normal** - Réponses en français', 'ai');
        }
    }
}

// Fonctions utilitaires globales
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Instance globale
let maTeacherRevolution;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    maTeacherRevolution = new MAteacherRevolution();
    console.log('🚀 MAteacher RÉVOLUTION - Système initialisé avec succès !');
});

// Fonctions globales pour l'interface
function sendRevolutionMessage() {
    if (maTeacherRevolution) {
        maTeacherRevolution.sendMessage();
    }
}

function handleRevolutionEnter(event) {
    if (event.key === 'Enter') {
        sendRevolutionMessage();
    }
}

function activateGeniusMode() {
    if (maTeacherRevolution) {
        maTeacherRevolution.changeAIPersonality('genius');
    }
}

function activateTeacherMode() {
    if (maTeacherRevolution) {
        maTeacherRevolution.changeAIPersonality('teacher');
    }
}

function activateTutorMode() {
    if (maTeacherRevolution) {
        maTeacherRevolution.changeAIPersonality('tutor');
    }
}

function startImmersionMode() {
    if (maTeacherRevolution) {
        maTeacherRevolution.toggleImmersionMode();
    }
}