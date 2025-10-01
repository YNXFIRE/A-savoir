// Script d'Automatisation Magazine A SAVOIR
// Version Gratuite avec Sources RSS et Traduction

class MagazineAutoUpdater {
    constructor() {
        this.sources = {
            tech: [
                'https://feeds.feedburner.com/oreilly/radar/atom',
                'https://www.wired.com/feed/rss',
                'https://techcrunch.com/feed/',
                'https://www.theverge.com/rss/index.xml'
            ],
            health: [
                'https://www.sciencedaily.com/rss/health_medicine.xml',
                'https://www.medscape.com/rss/clinical-advances'
            ],
            innovation: [
                'https://www.fastcompany.com/section/innovation/rss',
                'https://www.innovationnewsnetwork.com/feed/'
            ]
        };
        
        this.lastUpdate = new Date();
        this.articles = [];
    }

    // Récupération automatique des actualités
    async fetchNews(category = 'tech') {
        console.log(`🔄 Récupération actualités: ${category}`);
        
        const allArticles = [];
        
        for (const feedUrl of this.sources[category]) {
            try {
                // Utiliser l'API gratuite RSS2JSON
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=FREE&count=5`);
                const data = await response.json();
                
                if (data.status === 'ok') {
                    allArticles.push(...data.items);
                    console.log(`✅ ${data.items.length} articles récupérés de ${feedUrl}`);
                }
            } catch (error) {
                console.error(`❌ Erreur source ${feedUrl}:`, error);
            }
            
            // Délai pour éviter rate limiting
            await this.sleep(1000);
        }
        
        return allArticles.slice(0, 10); // Top 10 articles
    }

    // Traduction automatique gratuite
    async translateToFrench(text, maxLength = 500) {
        if (!text) return '';
        
        // Nettoyer le texte
        const cleanText = text.replace(/<[^>]*>/g, '').substring(0, maxLength);
        
        try {
            // API MyMemory gratuite (1000 mots/jour)
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|fr`);
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                return data.responseData.translatedText;
            }
        } catch (error) {
            console.error('Erreur traduction:', error);
        }
        
        // Fallback : retourner le texte original si traduction échoue
        return cleanText;
    }

    // Génération du contenu HTML
    generateArticleHTML(article, category) {
        const categoryIcons = {
            tech: '💻',
            health: '🏥', 
            innovation: '💡',
            science: '🔬'
        };
        
        const icon = categoryIcons[category] || '📰';
        const publishDate = new Date(article.pubDate || Date.now());
        const timeAgo = this.getTimeAgo(publishDate);
        
        return `
            <div class="article">
                <h3>${icon} ${article.title}</h3>
                <div class="article-meta">
                    <span>📅 ${timeAgo}</span>
                    <span>👁️ ${Math.floor(Math.random() * 3000) + 500} vues</span>
                    <span>⏱️ ${Math.ceil(article.content?.length / 1000) || 3} min de lecture</span>
                </div>
                <p>${article.description}</p>
                
                <div class="stats-mini">
                    <div class="stat-mini">
                        <span class="stat-number">${Math.floor(Math.random() * 100)}%</span>
                        <span class="stat-label">Impact</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-number">${Math.floor(Math.random() * 50) + 10}</span>
                        <span class="stat-label">Partages</span>
                    </div>
                </div>
                
                <div class="social-share">
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(article.link)}" class="social-btn" target="_blank">📱 Twitter</a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.link)}" class="social-btn" target="_blank">💼 LinkedIn</a>
                    <a href="${article.link}" class="social-btn" target="_blank">🔗 Source</a>
                </div>
            </div>
        `;
    }

    // Mise à jour automatique du magazine
    async updateMagazine() {
        console.log('🚀 Démarrage mise à jour automatique...');
        
        try {
            // Récupérer articles de toutes les catégories
            const techArticles = await this.fetchNews('tech');
            const healthArticles = await this.fetchNews('health');
            const innovationArticles = await this.fetchNews('innovation');
            
            // Traduire les articles
            console.log('🔄 Traduction en français...');
            
            const translatedTech = await this.translateArticles(techArticles, 'tech');
            const translatedHealth = await this.translateArticles(healthArticles, 'health');
            const translatedInnovation = await this.translateArticles(innovationArticles, 'innovation');
            
            // Générer le HTML mis à jour
            const updatedHTML = this.generateUpdatedHTML({
                tech: translatedTech,
                health: translatedHealth,
                innovation: translatedInnovation
            });
            
            // Sauvegarder (ou envoyer vers GitHub via API)
            console.log('💾 Sauvegarde du contenu mis à jour...');
            this.saveUpdatedContent(updatedHTML);
            
            this.lastUpdate = new Date();
            console.log('✅ Mise à jour terminée avec succès !');
            
            return {
                success: true,
                articlesCount: techArticles.length + healthArticles.length + innovationArticles.length,
                updateTime: this.lastUpdate
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
            return { success: false, error: error.message };
        }
    }

    // Traduire un lot d'articles
    async translateArticles(articles, category) {
        const translated = [];
        
        for (const article of articles) {
            try {
                const translatedTitle = await this.translateToFrench(article.title, 100);
                const translatedDescription = await this.translateToFrench(article.description, 300);
                
                translated.push({
                    ...article,
                    title: translatedTitle || article.title,
                    description: translatedDescription || article.description,
                    category: category,
                    originalLink: article.link,
                    translatedAt: new Date()
                });
                
                // Délai entre traductions pour respecter les limites API
                await this.sleep(500);
                
            } catch (error) {
                console.error(`Erreur traduction article: ${article.title}`, error);
                // Garder l'article original en cas d'erreur
                translated.push({ ...article, category: category });
            }
        }
        
        return translated;
    }

    // Générer le HTML complet mis à jour
    generateUpdatedHTML(categorizedArticles) {
        const sections = {
            accueil: this.generateMixedFeed(categorizedArticles),
            sante: categorizedArticles.health,
            innovation: categorizedArticles.innovation,
            tech: categorizedArticles.tech
        };
        
        let html = '';
        
        // Générer chaque section
        for (const [sectionId, articles] of Object.entries(sections)) {
            if (sectionId === 'accueil') {
                html += this.generateAccueilSection(articles);
            } else {
                html += this.generateCategorySection(sectionId, articles);
            }
        }
        
        return html;
    }

    // Générer la section d'accueil avec mix d'articles
    generateAccueilSection(mixedArticles) {
        let html = `
            <section id="accueil" class="section active">
                <h2>🚀 Dernières Actualités Innovation</h2>
        `;
        
        mixedArticles.forEach(article => {
            html += this.generateArticleHTML(article, article.category);
        });
        
        html += '</section>';
        return html;
    }

    // Générer section par catégorie
    generateCategorySection(category, articles) {
        const titles = {
            sante: '🏥 Innovations Santé & IA Médicale',
            innovation: '💡 Innovations Technologiques',
            tech: '💻 Actualités Tech & IA'
        };
        
        let html = `
            <section id="${category}" class="section">
                <h2>${titles[category] || category}</h2>
        `;
        
        articles.forEach(article => {
            html += this.generateArticleHTML(article, category);
        });
        
        html += '</section>';
        return html;
    }

    // Mélanger articles de différentes catégories pour l'accueil
    generateMixedFeed(categorizedArticles) {
        const mixed = [];
        const maxPerCategory = 3;
        
        // Prendre les 3 premiers de chaque catégorie
        Object.values(categorizedArticles).forEach(articles => {
            mixed.push(...articles.slice(0, maxPerCategory));
        });
        
        // Mélanger aléatoirement
        return mixed.sort(() => Math.random() - 0.5).slice(0, 8);
    }

    // Sauvegarde du contenu (à adapter selon plateforme)
    saveUpdatedContent(htmlContent) {
        // Pour GitHub Pages : utiliser GitHub API
        if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem('magazine_content', htmlContent);
            localStorage.setItem('last_update', this.lastUpdate.toISOString());
        }
        
        // Pour Node.js : écrire dans fichier
        if (typeof require !== 'undefined') {
            const fs = require('fs');
            fs.writeFileSync('magazine-updated.html', htmlContent);
        }
        
        console.log('💾 Contenu sauvegardé localement');
    }

    // Utilitaires
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'Il y a moins d\'1h';
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        
        return date.toLocaleDateString('fr-FR');
    }

    // Programmer des mises à jour automatiques
    startAutoUpdate(intervalHours = 6) {
        console.log(`🕐 Programmation mises à jour toutes les ${intervalHours}h`);
        
        // Première mise à jour immédiate
        this.updateMagazine();
        
        // Puis toutes les X heures
        setInterval(() => {
            console.log('⏰ Déclenchement mise à jour programmée');
            this.updateMagazine();
        }, intervalHours * 60 * 60 * 1000);
    }

    // Analytics et monitoring
    getStats() {
        return {
            lastUpdate: this.lastUpdate,
            totalArticles: this.articles.length,
            categories: Object.keys(this.sources),
            uptime: Date.now() - this.startTime
        };
    }
}

// Initialisation et lancement automatique
const magazineUpdater = new MagazineAutoUpdater();

// Pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
    window.MagazineUpdater = magazineUpdater;
    
    // Lancer automatiquement toutes les 6 heures
    magazineUpdater.startAutoUpdate(6);
    
    console.log('📰 A SAVOIR Auto-Updater initialisé !');
    console.log('🔄 Mise à jour automatique toutes les 6h');
    console.log('🌍 Sources RSS: Tech, Santé, Innovation');
    console.log('🇫🇷 Traduction automatique en français');
}

// Export pour Node.js
if (typeof module !== 'undefined') {
    module.exports = MagazineAutoUpdater;
}

// Configuration pour GitHub Actions
const CONFIG = {
    UPDATE_INTERVAL_HOURS: 6,
    MAX_ARTICLES_PER_CATEGORY: 5,
    TRANSLATION_API: 'mymemory', // Gratuit 1000 mots/jour
    RSS_SOURCES: {
        tech: 4,
        health: 2,
        innovation: 2
    },
    GITHUB_AUTO_COMMIT: true
};

console.log('⚙️ Configuration:', CONFIG);