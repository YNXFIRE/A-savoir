// MAteacher - Application principale

class MAteacherApp {
    constructor() {
        this.currentUser = null;
        this.isPremium = false;
        this.subjects = [
            { id: 'math', name: 'Maths', icon: 'fa-calculator', color: 'from-blue-500 to-cyan-500', questions: 0 },
            { id: 'physics', name: 'Physique', icon: 'fa-atom', color: 'from-purple-500 to-pink-500', questions: 0 },
            { id: 'chemistry', name: 'Chimie', icon: 'fa-flask', color: 'from-green-500 to-emerald-500', questions: 0 },
            { id: 'french', name: 'Français', icon: 'fa-book-open', color: 'from-red-500 to-orange-500', questions: 0 },
            { id: 'english', name: 'Anglais', icon: 'fa-language', color: 'from-yellow-500 to-orange-500', questions: 0 },
            { id: 'history', name: 'Histoire', icon: 'fa-landmark', color: 'from-indigo-500 to-purple-500', questions: 0 },
            { id: 'geography', name: 'Géo', icon: 'fa-globe-europe', color: 'from-teal-500 to-cyan-500', questions: 0 },
            { id: 'biology', name: 'SVT', icon: 'fa-dna', color: 'from-pink-500 to-rose-500', questions: 0 }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSubjects();
        this.loadQuickActions();
        this.hideLoadingScreen();
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);
    }

    setupEventListeners() {
        // Modal de mise à niveau
        const upgradeBtn = document.getElementById('upgrade-btn');
        const closeModal = document.getElementById('close-modal');

        upgradeBtn?.addEventListener('click', () => this.showUpgradeModal());
        closeModal?.addEventListener('click', () => this.hideUpgradeModal());

        // Zone de téléchargement
        this.setupFileUpload();
    }

    setupFileUpload() {
        const fileUploadArea = document.getElementById('file-upload-area');
        const fileUploadInput = document.getElementById('file-upload');

        if (!fileUploadArea || !fileUploadInput) return;

        fileUploadArea.addEventListener('click', () => fileUploadInput.click());
        
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('border-purple-400', 'bg-purple-500/20');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('border-purple-400', 'bg-purple-500/20');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('border-purple-400', 'bg-purple-500/20');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        fileUploadInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
    }

    loadSubjects() {
        const subjectsGrid = document.getElementById('subjects-grid');
        if (!subjectsGrid) return;

        subjectsGrid.innerHTML = '';
        
        this.subjects.forEach((subject, index) => {
            const subjectCard = document.createElement('button');
            subjectCard.className = `subject-chip bg-gradient-to-br ${subject.color} p-3 rounded-xl text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500`;
            subjectCard.dataset.subject = subject.id;
            subjectCard.setAttribute('aria-label', `Sélectionner ${subject.name}`);
            
            subjectCard.innerHTML = `
                <i class="fas ${subject.icon} text-2xl mb-2 text-white" aria-hidden="true"></i>
                <p class="text-sm font-semibold text-white">${subject.name}</p>
                <p class="text-xs text-white/80">${subject.questions} questions</p>
            `;

            subjectCard.addEventListener('click', () => this.selectSubject(subject));
            subjectsGrid.appendChild(subjectCard);
        });
    }

    loadQuickActions() {
        const quickActionsContainer = document.getElementById('quick-actions');
        if (!quickActionsContainer) return;

        const quickActions = [
            { text: 'Explique-moi cette équation', icon: 'fa-equals' },
            { text: 'Aide-moi avec cet exercice', icon: 'fa-question-circle' },
            { text: 'Corrige ma rédaction', icon: 'fa-check-circle' },
            { text: 'Méthode de révision', icon: 'fa-brain' },
            { text: 'Quiz de révision', icon: 'fa-gamepad' }
        ];

        quickActions.forEach((action) => {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-sm transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500';
            actionBtn.setAttribute('aria-label', action.text);
            actionBtn.innerHTML = `
                <i class="fas ${action.icon} mr-2" aria-hidden="true"></i>
                <span>${action.text}</span>
            `;
            
            actionBtn.addEventListener('click', () => {
                const chatInput = document.getElementById('chat-input');
                if (chatInput) {
                    chatInput.value = action.text;
                    chatInput.focus();
                }
            });

            quickActionsContainer.appendChild(actionBtn);
        });
    }

    selectSubject(subject) {
        // Retirer la classe active de tous les sujets
        document.querySelectorAll('.subject-chip').forEach(chip => {
            chip.classList.remove('ring-2', 'ring-white');
        });

        // Ajouter la classe active au sujet sélectionné
        const selectedChip = document.querySelector(`[data-subject="${subject.id}"]`);
        if (selectedChip) {
            selectedChip.classList.add('ring-2', 'ring-white');
        }

        // Envoyer un message automatique
        if (window.chatManager) {
            window.chatManager.addMessage(
                `Je veux travailler sur ${subject.name}`,
                'user'
            );
            
            setTimeout(() => {
                window.chatManager.addMessage(
                    `Parfait ! ${subject.name} est une matière passionnante. Que veux-tu étudier spécifiquement ?\\n\\n• Comprendre une notion difficile\\n• Corriger un exercice\\n• Apprendre des méthodes de révision\\n• Faire un quiz d'entraînement`,
                    'ai'
                );
            }, 1000);
        }

        this.showNotification(`Matière sélectionnée : ${subject.name}`, 'success');
    }

    handleFileUpload(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Type de fichier non supporté', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showNotification('Fichier trop volumineux (max 10MB)', 'error');
            return;
        }

        // Vérifier si premium requis
        if (!this.isPremium && window.authManager && !window.authManager.checkDailyLimit()) {
            this.showUpgradeModal();
            return;
        }

        // Simuler l'upload et l'analyse
        this.showNotification('Analyse du fichier en cours...', 'info');
        
        if (window.chatManager) {
            window.chatManager.addMessage(
                `📄 Fichier envoyé : ${file.name}`,
                'user'
            );
            
            setTimeout(() => {
                window.chatManager.addMessage(
                    `J'ai analysé ton fichier \"${file.name}\". Voici ce que j'ai trouvé :\\n\\n🎯 **Type**: ${file.type}\\n📏 **Taille**: ${(file.size / 1024).toFixed(1)} KB\\n\\nJe vais maintenant analyser le contenu et te proposer une solution détaillée...`,
                    'ai'
                );
            }, 2000);
        }

        // Déclencher gamification
        if (window.gamification) {
            window.gamification.triggerFeatureUsed('file_upload');
        }
    }

    showUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        
        // Couleurs selon le type
        const colors = {
            'success': 'bg-green-600 text-white',
            'error': 'bg-red-600 text-white',
            'info': 'bg-blue-600 text-white',
            'warning': 'bg-yellow-600 text-black'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        
        // Icônes selon le type
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle'
        };
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas ${icons[type] || icons.info}" aria-hidden="true"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animation de sortie
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Interface publique pour les autres modules
    getPremiumStatus() {
        return this.isPremium;
    }

    setPremiumStatus(status) {
        this.isPremium = status;
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MAteacherApp();
});