// MAteacher - Système de Gamification

class GamificationManager {
    constructor() {
        this.userStats = {
            level: 1,
            xp: 0,
            points: 0,
            streak: 0,
            questionsAnswered: 0,
            badges: [],
            achievements: []
        };
        
        this.levels = [
            { level: 1, xpRequired: 0, title: 'Débutant Curieux', color: 'from-gray-400 to-gray-600' },
            { level: 2, xpRequired: 100, title: 'Élève Motivé', color: 'from-green-400 to-green-600' },
            { level: 3, xpRequired: 250, title: 'Étudiant Assidu', color: 'from-blue-400 to-blue-600' },
            { level: 4, xpRequired: 500, title: 'Apprenant Expert', color: 'from-purple-400 to-purple-600' },
            { level: 5, xpRequired: 1000, title: 'Maître des Savoirs', color: 'from-yellow-400 to-yellow-600' },
            { level: 6, xpRequired: 2000, title: 'Génie Académique', color: 'from-red-400 to-red-600' },
            { level: 7, xpRequired: 4000, title: 'Sage Universel', color: 'from-pink-400 to-pink-600' },
            { level: 8, xpRequired: 8000, title: 'Légende Scolaire', color: 'from-indigo-400 to-indigo-600' },
            { level: 9, xpRequired: 15000, title: 'Titan Intellectuel', color: 'from-teal-400 to-teal-600' },
            { level: 10, xpRequired: 25000, title: 'Dieu des Études', color: 'from-amber-400 to-amber-600' }
        ];
        
        this.badges = [
            { id: 'first_question', name: 'Première Question', description: 'Poser votre première question', icon: 'fa-question-circle', color: 'bg-green-500' },
            { id: 'streak_3', name: 'Série de 3', description: '3 jours consécutifs', icon: 'fa-fire', color: 'bg-orange-500' },
            { id: 'streak_7', name: 'Semaine Parfaite', description: '7 jours consécutifs', icon: 'fa-calendar-week', color: 'bg-red-500' },
            { id: 'math_master', name: 'Maître des Maths', description: '50 questions de maths résolues', icon: 'fa-calculator', color: 'bg-blue-500' },
            { id: 'early_bird', name: 'Lève-tôt', description: 'Étudier avant 8h du matin', icon: 'fa-sun', color: 'bg-yellow-500' },
            { id: 'night_owl', name: 'Couche-tard', description: 'Étudier après 22h', icon: 'fa-moon', color: 'bg-purple-500' },
            { id: 'camera_user', name: 'Photographe', description: 'Utiliser la caméra 10 fois', icon: 'fa-camera', color: 'bg-teal-500' },
            { id: 'voice_user', name: 'Orateur', description: 'Utiliser la voix 20 fois', icon: 'fa-microphone', color: 'bg-pink-500' },
            { id: 'premium_user', name: 'Premium', description: 'Devenir membre Premium', icon: 'fa-crown', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
            { id: 'helpful', name: 'Serviable', description: 'Aider la communauté', icon: 'fa-heart', color: 'bg-rose-500' }
        ];
        
        this.achievements = [
            { id: 'scholar', name: 'Érudit', description: 'Atteindre le niveau 5', xpReward: 500 },
            { id: 'persistent', name: 'Persévérant', description: 'Streak de 30 jours', xpReward: 1000 },
            { id: 'explorer', name: 'Explorateur', description: 'Essayer toutes les matières', xpReward: 300 },
            { id: 'perfectionist', name: 'Perfectionniste', description: '95% de bonnes réponses', xpReward: 750 }
        ];
        
        this.init();
    }

    init() {
        this.loadUserStats();
        this.setupEventListeners();
        this.updateUI();
    }

    loadUserStats() {
        const saved = localStorage.getItem('matemacher_stats');
        if (saved) {
            try {
                this.userStats = { ...this.userStats, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Erreur lors du chargement des stats:', error);
            }
        }
    }

    saveUserStats() {
        localStorage.setItem('matemacher_stats', JSON.stringify(this.userStats));
    }

    setupEventListeners() {
        // Écouter les événements de l'application
        document.addEventListener('questionAnswered', (e) => {
            this.onQuestionAnswered(e.detail);
        });
        
        document.addEventListener('streakUpdated', (e) => {
            this.onStreakUpdated(e.detail);
        });
        
        document.addEventListener('featureUsed', (e) => {
            this.onFeatureUsed(e.detail);
        });
    }

    addXP(amount, reason = '') {
        const oldLevel = this.userStats.level;
        this.userStats.xp += amount;
        
        // Vérifier si level up
        const newLevel = this.calculateLevel(this.userStats.xp);
        if (newLevel > oldLevel) {
            this.levelUp(newLevel);
        }
        
        // Ajouter des points équivalents
        this.userStats.points += amount;
        
        this.updateUI();
        this.saveUserStats();
        
        // Afficher notification XP
        this.showXPGain(amount, reason);
    }

    calculateLevel(xp) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (xp >= this.levels[i].xpRequired) {
                return this.levels[i].level;
            }
        }
        return 1;
    }

    levelUp(newLevel) {
        const oldLevel = this.userStats.level;
        this.userStats.level = newLevel;
        
        const levelData = this.levels.find(l => l.level === newLevel);
        
        // Animation de level up
        this.showLevelUpAnimation(oldLevel, newLevel, levelData);
        
        // Récompense de level up
        const bonusXP = newLevel * 50;
        this.userStats.points += bonusXP;
        
        // Vérifier les achievements
        this.checkAchievements();
        
        window.app?.showNotification(`🎉 Level Up ! Niveau ${newLevel} : ${levelData?.title}`, 'success');
    }

    showLevelUpAnimation(oldLevel, newLevel, levelData) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-scale-in';
        modal.innerHTML = `
            <div class="text-center">
                <div class="mb-6">
                    <div class="text-8xl animate-bounce">🎉</div>
                </div>
                <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r ${levelData?.color || 'from-yellow-400 to-yellow-600'} bg-clip-text text-transparent">
                    LEVEL UP !
                </h1>
                <div class="text-xl mb-2">Niveau ${oldLevel} → Niveau ${newLevel}</div>
                <div class="text-lg text-yellow-300 mb-6">${levelData?.title}</div>
                <div class="text-sm text-gray-300">+${newLevel * 50} points bonus !</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animation de confettis
        this.showConfetti();
        
        setTimeout(() => {
            modal.remove();
        }, 4000);
    }

    showConfetti() {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}%;
                    width: 10px;
                    height: 10px;
                    background: ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][Math.floor(Math.random() * 5)]};
                    z-index: 1000;
                    animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
                    transform: rotate(${Math.random() * 360}deg);
                `;
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 5000);
            }, i * 100);
        }
        
        // Ajouter l'animation CSS
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confetti-fall {
                    to {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    awardBadge(badgeId) {
        if (this.userStats.badges.includes(badgeId)) return;
        
        const badge = this.badges.find(b => b.id === badgeId);
        if (!badge) return;
        
        this.userStats.badges.push(badgeId);
        
        // Animation d'attribution de badge
        this.showBadgeAnimation(badge);
        
        // XP bonus
        this.addXP(25, `Badge : ${badge.name}`);
        
        this.saveUserStats();
    }

    showBadgeAnimation(badge) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl border border-white/20 z-50 animate-slide-in-right';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="${badge.color} w-12 h-12 rounded-full flex items-center justify-center">
                    <i class="fas ${badge.icon} text-white"></i>
                </div>
                <div>
                    <div class="font-bold">Nouveau Badge !</div>
                    <div class="text-sm">${badge.name}</div>
                    <div class="text-xs text-gray-300">${badge.description}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-slide-out-right');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (this.userStats.achievements.includes(achievement.id)) return;
            
            let earned = false;
            
            switch (achievement.id) {
                case 'scholar':
                    earned = this.userStats.level >= 5;
                    break;
                case 'persistent':
                    earned = this.userStats.streak >= 30;
                    break;
                case 'explorer':
                    // Vérifier si toutes les matières ont été utilisées
                    earned = this.hasUsedAllSubjects();
                    break;
                case 'perfectionist':
                    earned = this.getAccuracyRate() >= 0.95;
                    break;
            }
            
            if (earned) {
                this.awardAchievement(achievement);
            }
        });
    }

    awardAchievement(achievement) {
        this.userStats.achievements.push(achievement.id);
        this.addXP(achievement.xpReward, `Succès : ${achievement.name}`);
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-8 text-center animate-scale-in">
                <div class="text-6xl mb-4">🏆</div>
                <h2 class="text-3xl font-bold mb-2">SUCCÈS DÉBLOQUÉ !</h2>
                <div class="text-xl mb-2">${achievement.name}</div>
                <div class="text-sm mb-4">${achievement.description}</div>
                <div class="text-lg font-bold">+${achievement.xpReward} XP</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => modal.remove(), 3000);
    }

    onQuestionAnswered(details) {
        this.userStats.questionsAnswered++;
        
        // XP selon la difficulté et la précision
        let xpGain = 10; // Base
        
        if (details.correct) {
            xpGain += 15; // Bonus bonne réponse
            
            if (details.difficulty === 'hard') xpGain += 10;
            else if (details.difficulty === 'medium') xpGain += 5;
            
            this.addXP(xpGain, 'Question réussie');
        } else {
            xpGain = 5; // Consolation
            this.addXP(xpGain, 'Tentative');
        }
        
        // Vérifier les badges
        if (this.userStats.questionsAnswered === 1) {
            this.awardBadge('first_question');
        }
        
        // Badge spécialisé par matière
        if (details.subject === 'math' && this.getSubjectQuestions('math') >= 50) {
            this.awardBadge('math_master');
        }
        
        this.checkDailyActivity();
    }

    onStreakUpdated(details) {
        this.userStats.streak = details.streak;
        
        // Badges de streak
        if (details.streak >= 3 && !this.userStats.badges.includes('streak_3')) {
            this.awardBadge('streak_3');
        }
        
        if (details.streak >= 7 && !this.userStats.badges.includes('streak_7')) {
            this.awardBadge('streak_7');
        }
        
        // XP bonus pour les streaks
        if (details.streak > 1) {
            const streakBonus = Math.min(details.streak * 2, 50);
            this.addXP(streakBonus, `Série de ${details.streak} jours`);
        }
    }

    onFeatureUsed(details) {
        const { feature } = details;
        
        // Compter l'utilisation des fonctionnalités
        const usageKey = `${feature}_usage`;
        const currentUsage = parseInt(localStorage.getItem(usageKey) || '0') + 1;
        localStorage.setItem(usageKey, currentUsage.toString());
        
        // Badges d'utilisation
        if (feature === 'camera' && currentUsage >= 10) {
            this.awardBadge('camera_user');
        }
        
        if (feature === 'voice' && currentUsage >= 20) {
            this.awardBadge('voice_user');
        }
        
        // XP pour utilisation de nouvelles fonctionnalités
        if (currentUsage <= 3) {
            this.addXP(5, `Utilisation ${feature}`);
        }
    }

    checkDailyActivity() {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('last_active_date');
        
        if (lastActive !== today) {
            localStorage.setItem('last_active_date', today);
            
            // Bonus journalier
            this.addXP(20, 'Connexion quotidienne');
            
            // Vérifier l'heure pour les badges spéciaux
            const hour = new Date().getHours();
            if (hour < 8) {
                this.awardBadge('early_bird');
            } else if (hour >= 22) {
                this.awardBadge('night_owl');
            }
        }
    }

    showXPGain(amount, reason) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50 animate-slide-in-right';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-plus text-yellow-300"></i>
                <span class="font-bold">${amount} XP</span>
                ${reason ? `<span class="text-sm opacity-80">• ${reason}</span>` : ''}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-slide-out-right');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    updateUI() {
        // Mettre à jour les éléments d'interface
        const userPoints = document.getElementById('user-points');
        if (userPoints) {
            userPoints.innerHTML = `
                <i class="fas fa-star text-yellow-300"></i>
                <span class="text-sm font-medium">${this.userStats.points.toLocaleString()} pts</span>
            `;
        }
        
        const levelBadge = document.querySelector('.bg-purple-500\\/20');
        if (levelBadge) {
            const levelData = this.levels.find(l => l.level === this.userStats.level);
            levelBadge.innerHTML = `
                <span class="text-sm font-medium">
                    Niveau ${this.userStats.level} - ${levelData?.title || 'Apprenant'}
                </span>
            `;
        }
        
        // Barre de progression XP
        this.updateXPBar();
    }

    updateXPBar() {
        const currentLevel = this.levels.find(l => l.level === this.userStats.level);
        const nextLevel = this.levels.find(l => l.level === this.userStats.level + 1);
        
        if (currentLevel && nextLevel) {
            const currentLevelXP = currentLevel.xpRequired;
            const nextLevelXP = nextLevel.xpRequired;
            const progress = ((this.userStats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
            
            let progressBar = document.querySelector('.xp-progress-bar');
            if (!progressBar) {
                // Créer la barre de progression si elle n'existe pas
                const container = document.querySelector('.flex.items-center.space-x-4');
                if (container) {
                    const xpBar = document.createElement('div');
                    xpBar.className = 'hidden md:flex items-center space-x-2';
                    xpBar.innerHTML = `
                        <div class="text-xs text-gray-400">XP</div>
                        <div class="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div class="xp-progress-bar h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                        <div class="text-xs text-gray-400">${Math.round(progress)}%</div>
                    `;
                    container.appendChild(xpBar);
                }
            } else {
                progressBar.style.width = `${progress}%`;
                progressBar.nextElementSibling.textContent = `${Math.round(progress)}%`;
            }
        }
    }

    getSubjectQuestions(subject) {
        // Simuler le nombre de questions par matière
        const subjectCounts = JSON.parse(localStorage.getItem('subject_questions') || '{}');
        return subjectCounts[subject] || 0;
    }

    hasUsedAllSubjects() {
        const requiredSubjects = ['math', 'physics', 'chemistry', 'french', 'english', 'history'];
        const usedSubjects = JSON.parse(localStorage.getItem('used_subjects') || '[]');
        return requiredSubjects.every(subject => usedSubjects.includes(subject));
    }

    getAccuracyRate() {
        const correctAnswers = parseInt(localStorage.getItem('correct_answers') || '0');
        const totalAnswers = this.userStats.questionsAnswered || 1;
        return correctAnswers / totalAnswers;
    }

    // Méthodes utilitaires pour déclencher les événements
    triggerQuestionAnswered(correct, difficulty = 'medium', subject = 'general') {
        document.dispatchEvent(new CustomEvent('questionAnswered', {
            detail: { correct, difficulty, subject }
        }));
    }

    triggerFeatureUsed(feature) {
        document.dispatchEvent(new CustomEvent('featureUsed', {
            detail: { feature }
        }));
    }

    // Interface publique pour les autres modules
    addPoints(amount, reason) {
        this.addXP(amount, reason);
    }

    getCurrentLevel() {
        return this.userStats.level;
    }

    getPoints() {
        return this.userStats.points;
    }

    getBadges() {
        return this.userStats.badges.map(badgeId => 
            this.badges.find(b => b.id === badgeId)
        ).filter(Boolean);
    }
}

// Initialiser le système de gamification
document.addEventListener('DOMContentLoaded', () => {
    window.gamification = new GamificationManager();
});