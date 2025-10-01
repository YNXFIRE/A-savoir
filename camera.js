// MAteacher - Gestionnaire de Caméra Interactive

class CameraManager {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        this.isAnalyzing = false;
        this.detectionInterval = null;
        this.facingMode = 'environment'; // 'user' for front camera, 'environment' for back camera
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createCameraInterface();
    }

    setupEventListeners() {
        const cameraBtn = document.getElementById('camera-btn');
        const closeCameraBtn = document.getElementById('close-camera');
        const captureBtn = document.getElementById('capture-btn');
        const analyzeBtn = document.getElementById('analyze-btn');

        cameraBtn?.addEventListener('click', () => this.toggleCamera());
        closeCameraBtn?.addEventListener('click', () => this.stopCamera());
        captureBtn?.addEventListener('click', () => this.captureImage());
        analyzeBtn?.addEventListener('click', () => this.analyzeContent());
    }

    createCameraInterface() {
        const cameraFeed = document.getElementById('camera-feed');
        if (!cameraFeed) return;

        // Ajouter les contrôles avancés
        const controlsHTML = `
            <div class="camera-controls mt-4 space-y-4">
                <!-- Contrôles de base -->
                <div class="flex justify-between items-center">
                    <button id="switch-camera" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition">
                        <i class="fas fa-sync-alt"></i>
                        <span>Changer caméra</span>
                    </button>
                    
                    <div class="flex space-x-2">
                        <button id="flash-btn" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition">
                            <i class="fas fa-bolt"></i>
                        </button>
                        <button id="grid-btn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
                            <i class="fas fa-th"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Filtres -->
                <div class="filters-panel bg-black/20 rounded-xl p-4">
                    <h4 class="text-sm font-medium mb-3">Filtres d'image</h4>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <label class="text-xs">Luminosité</label>
                            <input type="range" id="brightness" min="50" max="150" value="100" class="filter-slider">
                        </div>
                        <div class="flex items-center justify-between">
                            <label class="text-xs">Contraste</label>
                            <input type="range" id="contrast" min="50" max="150" value="100" class="filter-slider">
                        </div>
                        <div class="flex items-center justify-between">
                            <label class="text-xs">Saturation</label>
                            <input type="range" id="saturation" min="0" max="200" value="100" class="filter-slider">
                        </div>
                    </div>
                </div>
                
                <!-- Modes de capture -->
                <div class="capture-modes">
                    <h4 class="text-sm font-medium mb-3">Modes de capture</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <button class="mode-btn active" data-mode="document">Document</button>
                        <button class="mode-btn" data-mode="equation">Équation</button>
                        <button class="mode-btn" data-mode="diagram">Diagramme</button>
                        <button class="mode-btn" data-mode="text">Texte</button>
                    </div>
                </div>
            </div>
        `;
        
        const videoElement = cameraFeed.querySelector('video');
        if (videoElement && videoElement.nextElementSibling) {
            videoElement.nextElementSibling.insertAdjacentHTML('afterend', controlsHTML);
        }
        
        this.setupAdvancedControls();
    }

    setupAdvancedControls() {
        // Changer de caméra
        document.getElementById('switch-camera')?.addEventListener('click', () => this.switchCamera());
        
        // Grille d'aide
        document.getElementById('grid-btn')?.addEventListener('click', () => this.toggleGrid());
        
        // Filtres
        ['brightness', 'contrast', 'saturation'].forEach(filter => {
            const slider = document.getElementById(filter);
            slider?.addEventListener('input', (e) => {
                this.filters[filter] = parseInt(e.target.value);
                this.applyFilters();
            });
        });
        
        // Modes de capture
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setCaptureMode(btn.dataset.mode);
            });
        });
    }

    async toggleCamera() {
        if (this.isActive) {
            this.stopCamera();
        } else {
            await this.startCamera();
        }
    }

    async startCamera() {
        try {
            // Configuration de la caméra
            const constraints = {
                video: {
                    facingMode: this.facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            const videoElement = document.getElementById('camera-video');
            const cameraFeed = document.getElementById('camera-feed');
            
            if (videoElement && cameraFeed) {
                videoElement.srcObject = this.stream;
                videoElement.play();
                
                cameraFeed.classList.remove('hidden');
                this.isActive = true;
                
                // Mettre à jour le bouton
                const cameraBtn = document.getElementById('camera-btn');
                if (cameraBtn) {
                    cameraBtn.innerHTML = `
                        <i class="fas fa-video-slash mr-3 text-red-400 group-hover:scale-110 transition"></i>
                        <div>
                            <div class="font-medium">Arrêter caméra</div>
                            <div class="text-xs text-gray-400">Caméra active</div>
                        </div>
                    `;
                }
                
                this.setupVideoEvents(videoElement);
                this.startDocumentDetection();
                
                window.app?.showNotification('Caméra activée ! 📹', 'success');
            }
        } catch (error) {
            console.error('Erreur d\'accès à la caméra:', error);
            let errorMessage = 'Impossible d\'accéder à la caméra';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Permission caméra refusée. Veuillez autoriser l\'accès dans les paramètres.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'Aucune caméra trouvée sur cet appareil.';
            }
            
            window.app?.showNotification(errorMessage, 'error');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        const videoElement = document.getElementById('camera-video');
        const cameraFeed = document.getElementById('camera-feed');
        
        if (videoElement) {
            videoElement.srcObject = null;
        }
        
        if (cameraFeed) {
            cameraFeed.classList.add('hidden');
        }
        
        this.isActive = false;
        this.stopDocumentDetection();
        
        // Remettre le bouton à l'état initial
        const cameraBtn = document.getElementById('camera-btn');
        if (cameraBtn) {
            cameraBtn.innerHTML = `
                <i class="fas fa-video mr-3 text-blue-400 group-hover:scale-110 transition"></i>
                <div>
                    <div class="font-medium">Caméra interactive</div>
                    <div class="text-xs text-gray-400">Montre ton problème</div>
                </div>
            `;
        }
        
        window.app?.showNotification('Caméra désactivée', 'info');
    }

    setupVideoEvents(videoElement) {
        videoElement.addEventListener('loadedmetadata', () => {
            this.createCanvas(videoElement.videoWidth, videoElement.videoHeight);
        });
        
        // Gestion du plein écran
        videoElement.addEventListener('dblclick', () => {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            }
        });
    }

    createCanvas(width, height) {
        if (this.canvas) {
            this.canvas.remove();
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.display = 'none';
        this.ctx = this.canvas.getContext('2d');
        
        document.body.appendChild(this.canvas);
    }

    captureImage() {
        if (!this.isActive || !this.canvas || !this.ctx) {
            window.app?.showNotification('Caméra non active', 'error');
            return;
        }
        
        const videoElement = document.getElementById('camera-video');
        if (!videoElement) return;
        
        // Capturer l'image
        this.ctx.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);
        
        // Appliquer les filtres
        this.applyFilters();
        
        // Convertir en blob
        this.canvas.toBlob((blob) => {
            if (blob) {
                this.processCapture(blob);
                
                // Animation de capture
                this.showCaptureAnimation();
                
                window.app?.showNotification('Image capturée ! 📸', 'success');
            }
        }, 'image/jpeg', 0.9);
    }

    processCapture(blob) {
        // Créer une URL pour l'image capturée
        const imageUrl = URL.createObjectURL(blob);
        
        // Ajouter au chat
        if (window.chatManager) {
            window.chatManager.addMessage(
                `📸 **Image capturée !** Je vais analyser ton exercice...`,
                'user'
            );
            
            setTimeout(() => {
                window.chatManager.addMessage(
                    `✨ **Analyse en cours...** \\n\\nJ'ai identifié dans ton image :\\n\\n🔍 **Type :** Exercice de mathématiques\\n📐 **Sujet :** Équations du second degré\\n⭐ **Difficulté :** Niveau lycée\\n\\n💡 **Je prépare une correction détaillée !**`,
                    'ai'
                );
            }, 2000);
        }
        
        // Sauvegarder localement si nécessaire
        this.saveCapture(blob);
    }

    saveCapture(blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `matemacher-capture-${Date.now()}.jpg`;
        // link.click(); // Décommenté si on veut télécharger automatiquement
    }

    showCaptureAnimation() {
        const videoElement = document.getElementById('camera-video');
        if (!videoElement) return;
        
        // Effet flash
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            opacity: 0.8;
            pointer-events: none;
            z-index: 100;
        `;
        
        const container = videoElement.parentElement;
        container.style.position = 'relative';
        container.appendChild(flash);
        
        setTimeout(() => flash.remove(), 200);
    }

    applyFilters() {
        if (!this.ctx || !this.canvas) return;
        
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        const brightness = this.filters.brightness / 100;
        const contrast = this.filters.contrast / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            // Luminosité
            data[i] *= brightness;     // Rouge
            data[i + 1] *= brightness; // Vert
            data[i + 2] *= brightness; // Bleu
            
            // Contraste
            data[i] = ((data[i] - 128) * contrast) + 128;
            data[i + 1] = ((data[i + 1] - 128) * contrast) + 128;
            data[i + 2] = ((data[i + 2] - 128) * contrast) + 128;
            
            // Limiter les valeurs
            data[i] = Math.min(255, Math.max(0, data[i]));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    async switchCamera() {
        if (!this.isActive) return;
        
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        
        // Redémarrer avec la nouvelle caméra
        this.stopCamera();
        await this.startCamera();
        
        const mode = this.facingMode === 'user' ? 'frontale' : 'arrière';
        window.app?.showNotification(`Caméra ${mode} activée`, 'info');
    }

    toggleGrid() {
        const videoElement = document.getElementById('camera-video');
        if (!videoElement) return;
        
        let grid = videoElement.parentElement.querySelector('.camera-grid');
        
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'camera-grid';
            grid.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 10;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px);
                background-size: 33.33% 33.33%;
            `;
            videoElement.parentElement.appendChild(grid);
        } else {
            grid.remove();
        }
    }

    setCaptureMode(mode) {
        this.captureMode = mode;
        
        const messages = {
            document: 'Mode document activé - Optimisé pour les exercices',
            equation: 'Mode équation activé - Focus sur les formules mathématiques',
            diagram: 'Mode diagramme activé - Parfait pour les schémas',
            text: 'Mode texte activé - Reconnaissance de texte optimisée'
        };
        
        window.app?.showNotification(messages[mode], 'info');
    }

    analyzeContent() {
        if (!this.isActive) {
            window.app?.showNotification('Aucune image à analyser', 'error');
            return;
        }
        
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        
        // Simuler l'analyse IA
        if (window.chatManager) {
            window.chatManager.addMessage(
                `🔍 **Analyse en temps réel démarrée...**`,
                'ai'
            );
            
            setTimeout(() => {
                const analyses = [
                    `📐 **Détecté :** Équation du second degré\\n**Formule :** ax² + bx + c = 0\\n**Suggestion :** Utilise le discriminant Δ = b² - 4ac`,
                    `📊 **Détecté :** Graphique de fonction\\n**Type :** Fonction linéaire\\n**Conseil :** Identifie la pente et l'ordonnée à l'origine`,
                    `🧮 **Détecté :** Système d'équations\\n**Méthode :** Substitution recommandée\\n**Astuce :** Isole une variable dans la première équation`,
                    `📝 **Détecté :** Problème de géométrie\\n**Figure :** Triangle rectangle\\n**Théorème :** Pythagore applicable`
                ];
                
                const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
                
                window.chatManager.addMessage(
                    `✅ **Analyse terminée !**\\n\\n${randomAnalysis}\\n\\n💡 **Veux-tu que je t'explique la résolution étape par étape ?**`,
                    'ai'
                );
                
                this.isAnalyzing = false;
            }, 3000);
        }
    }

    startDocumentDetection() {
        if (this.detectionInterval) return;
        
        this.detectionInterval = setInterval(() => {
            if (this.isActive && Math.random() < 0.1) { // 10% de chance de détecter quelque chose
                this.simulateDetection();
            }
        }, 2000);
    }

    stopDocumentDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
    }

    simulateDetection() {
        const detections = [
            'Document détecté - Positionnez-vous pour une meilleure capture',
            'Équation mathématique visible',
            'Texte lisible détecté',
            'Diagramme identifié dans l\'image'
        ];
        
        const detection = detections[Math.floor(Math.random() * detections.length)];
        
        // Afficher brièvement la détection
        const notification = document.createElement('div');
        notification.className = 'detection-notification';
        notification.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 20;
        `;
        notification.textContent = detection;
        
        const videoContainer = document.getElementById('camera-video')?.parentElement;
        if (videoContainer) {
            videoContainer.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
        }
    }
}

// Styles CSS pour les contrôles caméra
const cameraStyles = `
.mode-btn {
    @apply bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs transition;
}

.mode-btn.active {
    @apply bg-blue-500 text-white;
}

.filter-slider {
    @apply bg-gray-700 rounded-lg appearance-none cursor-pointer h-2;
}

.filter-slider::-webkit-slider-thumb {
    @apply appearance-none w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

.camera-grid {
    opacity: 0.6;
}
`;

// Ajouter les styles
const cameraStyleSheet = document.createElement('style');
cameraStyleSheet.textContent = cameraStyles;
document.head.appendChild(cameraStyleSheet);

// Initialiser le gestionnaire de caméra
document.addEventListener('DOMContentLoaded', () => {
    window.cameraManager = new CameraManager();
});