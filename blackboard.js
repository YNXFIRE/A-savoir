// MAteacher - Tableau Numérique Interactif

class BlackboardManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#ffffff';
        this.currentSize = 3;
        this.history = [];
        this.historyStep = -1;
        this.isFullscreen = false;
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.drawGrid();
        this.saveState();
        this.showWelcomeContent();
    }

    setupCanvas() {
        this.canvas = document.getElementById('blackboard-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Configuration du canvas
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        
        // Fond du tableau
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        if (!this.canvas) return;

        // Événements souris
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Événements tactiles (mobile)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Boutons de contrôle
        const clearBtn = document.getElementById('blackboard-clear');
        const saveBtn = document.getElementById('blackboard-save');
        const fullscreenBtn = document.getElementById('blackboard-fullscreen');

        clearBtn?.addEventListener('click', () => this.clearBoard());
        saveBtn?.addEventListener('click', () => this.saveBoard());
        fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());

        // Redimensionnement
        window.addEventListener('resize', () => this.resizeCanvas());

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Sauvegarder l'état actuel
        const imageData = this.ctx ? this.canvas.toDataURL() : null;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Restaurer l'état
        if (imageData) {
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#1e293b';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawGrid();
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = imageData;
        } else {
            this.redraw();
        }
    }

    drawGrid() {
        if (!this.ctx) return;
        
        const gridSize = 20;
        this.ctx.save();
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.3;
        
        // Lignes verticales
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Lignes horizontales
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    getMousePos(e) {
        if (!this.canvas) return { x: 0, y: 0 };
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        
        this.ctx.globalCompositeOperation = this.currentTool === 'eraser' ? 'destination-out' : 'source-over';
        this.ctx.globalAlpha = 1;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.ctx.beginPath();
        this.saveState();
    }

    addTextToBoard(text, x, y) {
        if (!this.ctx) return;
        
        this.ctx.save();
        this.ctx.font = '24px Inter, sans-serif';
        this.ctx.fillStyle = this.currentColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
        
        this.saveState();
    }

    clearBoard() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.showWelcomeContent();
        this.saveState();
        
        // Animation de nettoyage
        this.canvas.classList.add('animate-pulse');
        setTimeout(() => {
            this.canvas.classList.remove('animate-pulse');
        }, 200);

        window.app?.showNotification('Tableau effacé !', 'info');
    }

    saveBoard() {
        if (!this.canvas) return;
        
        const link = document.createElement('a');
        link.download = `matemacher-tableau-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        
        window.app?.showNotification('Tableau sauvegardé ! 💾', 'success');
    }

    saveState() {
        if (!this.canvas) return;
        
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.canvas.toDataURL());
        
        // Limiter l'historique à 20 étapes
        if (this.history.length > 20) {
            this.history.shift();
            this.historyStep--;
        }
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState();
        }
    }

    restoreState() {
        if (!this.canvas || !this.history[this.historyStep]) return;
        
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.history[this.historyStep];
    }

    redraw() {
        if (!this.ctx) return;
        
        // Fond
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grille
        this.drawGrid();
        
        // Restaurer le dernier état si disponible
        if (this.history.length > 0) {
            this.restoreState();
        } else {
            this.showWelcomeContent();
        }
    }

    toggleFullscreen() {
        if (!this.canvas) return;
        
        const container = this.canvas.closest('.bg-black\\/40');
        if (!container) return;
        
        if (!this.isFullscreen) {
            container.classList.add('fixed', 'inset-0', 'z-50', 'bg-slate-900');
            this.canvas.style.height = '80vh';
            this.isFullscreen = true;
            
            const fullscreenBtn = document.getElementById('blackboard-fullscreen');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress" aria-hidden="true"></i>';
                fullscreenBtn.setAttribute('aria-label', 'Quitter le plein écran');
            }
        } else {
            container.classList.remove('fixed', 'inset-0', 'z-50', 'bg-slate-900');
            this.canvas.style.height = '';
            this.isFullscreen = false;
            
            const fullscreenBtn = document.getElementById('blackboard-fullscreen');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
                fullscreenBtn.setAttribute('aria-label', 'Mode plein écran');
            }
        }
        
        setTimeout(() => this.resizeCanvas(), 100);
    }

    showWelcomeContent() {
        if (!this.ctx) return;

        // Titre de bienvenue
        this.ctx.save();
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.font = 'bold 32px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Bienvenue sur MAteacher !', this.canvas.width / 2, 80);
        
        // Sous-titre
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '18px Inter, sans-serif';
        this.ctx.fillText('Tableau numérique interactif', this.canvas.width / 2, 120);
        
        // Instructions
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        
        const instructions = [
            '✏️  Cliquez et dessinez pour écrire',
            '🎨  Utilisez les outils de la barre (à venir)',
            '📸  Ctrl+S pour sauvegarder',
            '🗑️  Clic sur effacer pour nettoyer',
            '📐  Idéal pour résoudre des équations !'
        ];
        
        instructions.forEach((instruction, index) => {
            this.ctx.fillText(instruction, 50, 180 + (index * 30));
        });
        
        // Exemple d'équation
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Exemple: 2x + 5 = 15', this.canvas.width / 2, this.canvas.height - 100);
        
        this.ctx.fillStyle = '#34d399';
        this.ctx.font = '20px Inter, sans-serif';
        this.ctx.fillText('Solution: x = 5', this.canvas.width / 2, this.canvas.height - 60);
        
        this.ctx.restore();
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveBoard();
                    break;
            }
        } else {
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    if (e.target === document.body) {
                        this.clearBoard();
                    }
                    break;
            }
        }
    }

    // Interface publique
    getCurrentTool() {
        return this.currentTool;
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    setColor(color) {
        this.currentColor = color;
    }

    setSize(size) {
        this.currentSize = size;
    }
}

// Initialiser le tableau
document.addEventListener('DOMContentLoaded', () => {
    window.blackboard = new BlackboardManager();
});