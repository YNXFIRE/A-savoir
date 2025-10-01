// MAteacher - Gestionnaire de Chat IA

class ChatManager {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const chatForm = document.getElementById('chat-form');
        
        chatForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        sendBtn?.addEventListener('click', () => this.sendMessage());
        
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput?.value.trim();
        
        if (!message) return;
        
        // Vérifier les limites
        if (window.authManager && !window.authManager.checkDailyLimit()) {
            window.app?.showUpgradeModal();
            return;
        }

        // Utiliser une question
        if (window.authManager) {
            window.authManager.useQuestion();
        }
        
        this.addMessage(message, 'user');
        chatInput.value = '';
        
        // Simuler la réponse de l'IA
        this.simulateAIResponse(message);
    }

    addMessage(content, sender, options = {}) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageData = {
            id: Date.now(),
            content,
            sender,
            timestamp: new Date(),
            ...options
        };

        this.messages.push(messageData);
        
        const messageElement = this.createMessageElement(messageData);
        messagesContainer.appendChild(messageElement);
        
        this.scrollToBottom();
        this.saveToHistory(messageData);

        // Déclencher gamification
        if (sender === 'user' && window.gamification) {
            window.gamification.triggerQuestionAnswered(true, 'medium', 'general');
        }
    }

    createMessageElement(messageData) {
        const { content, sender, timestamp } = messageData;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-wrapper flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`;
        
        let avatar = '';
        let bubbleClass = `message-bubble ${sender} p-4 max-w-xs lg:max-w-md xl:max-w-lg`;
        
        if (sender === 'ai') {
            avatar = `
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm" aria-hidden="true"></i>
                </div>
            `;
        } else if (sender === 'user') {
            avatar = `
                <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                    <i class="fas fa-user text-white text-sm" aria-hidden="true"></i>
                </div>
            `;
        }

        const formattedContent = this.formatMessage(content, sender);
        const timeString = timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="flex ${sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end max-w-full">
                ${avatar}
                <div class="${bubbleClass}">
                    <div class="message-content">${formattedContent}</div>
                    <div class="text-xs opacity-70 mt-2" aria-label="Heure du message">${timeString}</div>
                </div>
            </div>
        `;
        
        return messageDiv;
    }

    formatMessage(content, sender) {
        if (sender === 'ai') {
            // Formater les messages IA avec markdown-like
            content = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 rounded">$1</code>')
                .replace(/#{1,6}\s/g, '')
                .replace(/\n/g, '<br>')
                .replace(/• /g, '<br>• ')
                .replace(/\d+\./g, '<br>$&');
        }
        
        return content;
    }

    simulateAIResponse(userMessage) {
        if (this.isTyping) return;
        
        this.showTypingIndicator();
        
        const response = this.generateResponse(userMessage);
        const delay = Math.random() * 2000 + 1500; // 1.5-3.5s
        
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            
            // Synthèse vocale si activée
            if (window.voiceManager) {
                window.voiceManager.speak(response);
            }
        }, delay);
    }

    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Réponses contextuelles selon le contenu
        if (message.includes('math') || message.includes('équation') || message.includes('calcul')) {
            return `🧮 **Parfait !** Les maths, c'est ma spécialité !\\n\\nPour bien t'expliquer, j'ai besoin de savoir :\\n• Quel est le concept précis ?\\n• Ton niveau actuel ?\\n• Un exemple concret ?\\n\\n💡 **Astuce** : Je peux dessiner sur le tableau pour t'aider à visualiser !`;
        }
        
        if (message.includes('exercice') || message.includes('devoir') || message.includes('problème')) {
            return `📚 **Super !** J'adore aider avec les exercices.\\n\\n📸 **Tu peux :**\\n• Prendre une photo de l'exercice\\n• Le taper directement\\n• Me décrire le problème\\n\\n⚡ **Je te donnerai une correction détaillée étape par étape !**`;
        }
        
        if (message.includes('aide') || message.includes('help') || message.includes('comprends pas')) {
            return `🆘 **Je suis là pour t'aider !** C'est exactement mon rôle.\\n\\n💪 **Mes super-pouvoirs :**\\n• Explications simples et claires\\n• Corrections détaillées\\n• Méthodes d'apprentissage personnalisées\\n• Support 24/7\\n\\n🚀 **Dis-moi tout, on va résoudre ça ensemble !**`;
        }
        
        // Réponse générale
        const generalResponses = [
            `🤔 **Intéressant !** Peux-tu être plus précis ?\\n\\n💡 **Quelques suggestions :**\\n• \"Explique-moi [concept]\"\\n• \"Aide-moi avec cet exercice\"\\n• \"Méthode pour apprendre [matière]\"\\n\\n🎯 **Plus tu es précis, mieux je t'aide !**`,
            `🚀 **J'ai hâte de t'aider !**\\n\\n📚 **Je peux t'assister sur :**\\n• Toutes les matières scolaires\\n• Méthodes d'apprentissage\\n• Corrections d'exercices\\n• Préparation d'examens\\n\\n✨ **Que veux-tu faire en premier ?**`,
            `👋 **Salut !** Je vois que tu veux discuter.\\n\\n🎓 **Ma mission :** Te faire réussir !\\n\\n💪 **Mes forces :**\\n• Explications claires\\n• Patience infinie\\n• Adaptation à ton niveau\\n• Disponibilité 24/7\\n\\n🔥 **Par quoi on commence ?**`
        ];
        
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator-wrapper';
        typingDiv.className = 'message-wrapper flex justify-start mb-4';
        
        typingDiv.innerHTML = `
            <div class="flex flex-row items-end max-w-full">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm" aria-hidden="true"></i>
                </div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator-wrapper');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    clearMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        this.messages = [];
        
        // Message de confirmation
        setTimeout(() => {
            this.addMessage(
                `🧹 **Chat vidé !**\\n\\nPrêt pour une nouvelle conversation ? Pose-moi ta première question !`,
                'ai'
            );
        }, 500);
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.addMessage(
                `🤖 Salut ! Je suis **MAteacher**, ton nouveau prof IA !\\n\\n✨ Je peux t'aider à :\\n• Comprendre tes cours\\n• Résoudre tes exercices\\n• Te donner des méthodes d'apprentissage\\n• Créer des quiz personnalisés\\n\\n🎯 **Pose-moi une question ou choisis une matière pour commencer !**`,
                'ai'
            );
        }, 1000);
    }

    saveToHistory(messageData) {
        this.conversationHistory.push(messageData);
        
        // Sauvegarder dans localStorage (limité aux 50 derniers messages)
        const recentHistory = this.conversationHistory.slice(-50);
        localStorage.setItem('matemacher_messages', JSON.stringify(recentHistory));
    }
}

// Initialiser le gestionnaire de chat
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});