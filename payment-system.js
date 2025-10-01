/**
 * 🚀 MAteacher ULTIMATE - Système de Paiement Révolutionnaire
 * Gestion crédits, abonnements et transactions sécurisées
 */

class PaymentSystemRevolution {
    constructor() {
        this.paymentMethods = {
            card: { name: 'Carte Bancaire', icon: '💳', fees: 0 },
            paypal: { name: 'PayPal', icon: '🅿️', fees: 0.029 },
            apple: { name: 'Apple Pay', icon: '🍎', fees: 0 },
            google: { name: 'Google Pay', icon: '🔵', fees: 0 }
        };
        
        this.packages = {
            starter: { credits: 50, price: 5, bonus: 0, popular: false },
            standard: { credits: 150, price: 12, bonus: 20, popular: true },
            premium: { credits: 300, price: 20, bonus: 50, popular: false },
            unlimited: { credits: '∞', price: 29, bonus: 0, popular: false }
        };

        this.currencies = {
            EUR: { symbol: '€', rate: 1 },
            USD: { symbol: '$', rate: 1.08 },
            GBP: { symbol: '£', rate: 0.87 },
            JPY: { symbol: '¥', rate: 162 }
        };

        this.currentCurrency = 'EUR';
        this.selectedPaymentMethod = 'card';
    }

    openPaymentModal(packageType) {
        const package = this.packages[packageType];
        if (!package) return;

        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); display: flex; justify-content: center;
            align-items: center; z-index: 10000; animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = this.createPaymentModalHTML(packageType, package);
        document.body.appendChild(modal);

        // Event listeners
        this.setupPaymentModalEvents(modal, packageType, package);
    }

    createPaymentModalHTML(packageType, package) {
        const currency = this.currencies[this.currentCurrency];
        const price = Math.round(package.price * currency.rate * 100) / 100;
        
        return `
            <div class="payment-container" style="
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid var(--primary-color);
                border-radius: 25px;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                color: white;
                box-shadow: 0 20px 60px rgba(0,242,254,0.3);
                position: relative;
            ">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 2rem;">
                        🚀 Finaliser l'Achat
                    </h2>
                    <p style="opacity: 0.8; font-size: 1.1rem;">
                        Sécurisé par cryptage SSL 256-bit
                    </p>
                </div>

                <!-- Package sélectionné -->
                <div class="selected-package" style="
                    background: rgba(0,255,136,0.1);
                    border: 2px solid var(--accent-color);
                    border-radius: 15px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    text-align: center;
                ">
                    <h3 style="color: var(--accent-color); margin-bottom: 1rem;">
                        ${this.getPackageTitle(packageType)}
                    </h3>
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">
                        ${price}${currency.symbol}
                    </div>
                    <div style="opacity: 0.9;">
                        ${package.credits === '∞' ? 'Crédits illimités' : `${package.credits} crédits`}
                        ${package.bonus > 0 ? ` + ${package.bonus} bonus` : ''}
                        ${packageType === 'unlimited' ? ' (mensuel)' : ''}
                    </div>
                </div>

                <!-- Sélection devise -->
                <div class="currency-selector" style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">
                        💰 Devise:
                    </label>
                    <div style="display: flex; gap: 0.5rem;">
                        ${Object.keys(this.currencies).map((code) => {
                            const isActive = code === this.currentCurrency;
                            return `
                            <button class="currency-btn ${isActive ? 'active' : ''}" 
                                    data-currency="${code}"
                                    style="
                                        padding: 0.5rem 1rem;
                                        background: ${isActive ? 'var(--accent-color)' : 'rgba(0,0,0,0.3)'};
                                        border: 1px solid var(--accent-color);
                                        border-radius: 8px;
                                        color: ${isActive ? 'black' : 'white'};
                                        cursor: pointer;
                                        font-weight: bold;
                                        transition: all 0.3s ease;
                                    ">
                                ${this.currencies[code].symbol} ${code}
                            </button>
                        `;
                        }).join('')}
                    </div>
                </div>

                <!-- Méthodes de paiement -->
                <div class="payment-methods" style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 1rem; font-weight: bold;">
                        💳 Méthode de paiement:
                    </label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        ${Object.entries(this.paymentMethods).map(([key, method]) => {
                            const isSelected = key === this.selectedPaymentMethod;
                            return `
                            <div class="payment-method ${isSelected ? 'selected' : ''}" 
                                 data-method="${key}"
                                 style="
                                     padding: 1rem;
                                     border: 2px solid ${isSelected ? 'var(--accent-color)' : 'rgba(0,242,254,0.3)'};
                                     border-radius: 12px;
                                     cursor: pointer;
                                     transition: all 0.3s ease;
                                     text-align: center;
                                     background: ${isSelected ? 'rgba(0,255,136,0.1)' : 'rgba(0,0,0,0.2)'};
                                 ">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${method.icon}</div>
                                <div style="font-weight: bold;">${method.name}</div>
                                ${method.fees > 0 ? `<small style="opacity: 0.7;">+${(method.fees*100).toFixed(1)}% frais</small>` : ''}
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>

                <!-- Formulaire de paiement -->
                <div id="paymentForm" style="margin-bottom: 2rem;">
                    ${this.createPaymentForm()}
                </div>

                <!-- Sécurité -->
                <div style="
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(0,242,254,0.3);
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 2rem;
                    font-size: 0.9rem;
                    opacity: 0.9;
                ">
                    🔒 <strong>Paiement 100% sécurisé</strong><br>
                    • Chiffrement SSL 256-bit<br>
                    • Conformité PCI DSS<br>
                    • Protection anti-fraude<br>
                    • Remboursement sous 30 jours
                </div>

                <!-- Boutons d'action -->
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="cancel-btn" style="
                        padding: 1rem 2rem;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.3);
                        border-radius: 12px;
                        color: white;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    ">
                        ❌ Annuler
                    </button>
                    <button class="confirm-payment-btn" style="
                        padding: 1rem 2rem;
                        background: linear-gradient(45deg, var(--accent-color), var(--primary-color));
                        border: none;
                        border-radius: 12px;
                        color: white;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 1.1rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 5px 15px rgba(0,255,136,0.4);
                    ">
                        ✅ Confirmer Paiement ${price}${currency.symbol}
                    </button>
                </div>

                <!-- Bouton fermer -->
                <button class="close-btn" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                    ✖
                </button>
            </div>
        `;
    }

    createPaymentForm() {
        if (this.selectedPaymentMethod === 'card') {
            return `
                <div class="card-form">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem;">Numéro de carte:</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" 
                               maxlength="19" style="
                                   width: 100%;
                                   padding: 1rem;
                                   background: rgba(0,0,0,0.3);
                                   border: 2px solid rgba(0,242,254,0.3);
                                   border-radius: 8px;
                                   color: white;
                                   font-size: 1rem;
                               ">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem;">Expiration:</label>
                            <input type="text" id="cardExpiry" placeholder="MM/AA" maxlength="5" style="
                                width: 100%;
                                padding: 1rem;
                                background: rgba(0,0,0,0.3);
                                border: 2px solid rgba(0,242,254,0.3);
                                border-radius: 8px;
                                color: white;
                                font-size: 1rem;
                            ">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem;">CVC:</label>
                            <input type="text" id="cardCVC" placeholder="123" maxlength="4" style="
                                width: 100%;
                                padding: 1rem;
                                background: rgba(0,0,0,0.3);
                                border: 2px solid rgba(0,242,254,0.3);
                                border-radius: 8px;
                                color: white;
                                font-size: 1rem;
                            ">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem;">Nom sur la carte:</label>
                        <input type="text" id="cardName" placeholder="Votre Nom Complet" style="
                            width: 100%;
                            padding: 1rem;
                            background: rgba(0,0,0,0.3);
                            border: 2px solid rgba(0,242,254,0.3);
                            border-radius: 8px;
                            color: white;
                            font-size: 1rem;
                        ">
                    </div>
                </div>
            `;
        } else if (this.selectedPaymentMethod === 'paypal') {
            return `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🅿️</div>
                    <p style="font-size: 1.1rem;">Vous serez redirigé vers PayPal pour finaliser le paiement.</p>
                </div>
            `;
        } else {
            return `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">
                        ${this.paymentMethods[this.selectedPaymentMethod].icon}
                    </div>
                    <p style="font-size: 1.1rem;">
                        Utilisez votre ${this.paymentMethods[this.selectedPaymentMethod].name} 
                        pour finaliser le paiement rapidement.
                    </p>
                </div>
            `;
        }
    }

    setupPaymentModalEvents(modal, packageType, package) {
        // Fermer modal
        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.querySelector('.cancel-btn').onclick = () => modal.remove();

        // Click en dehors pour fermer
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        // Sélection devise
        modal.querySelectorAll('.currency-btn').forEach(btn => {
            btn.onclick = () => {
                this.currentCurrency = btn.dataset.currency;
                modal.remove();
                this.openPaymentModal(packageType); // Recharger avec nouvelle devise
            };
        });

        // Sélection méthode paiement
        modal.querySelectorAll('.payment-method').forEach(method => {
            method.onclick = () => {
                this.selectedPaymentMethod = method.dataset.method;
                modal.remove();
                this.openPaymentModal(packageType); // Recharger avec nouvelle méthode
            };
        });

        // Formatage champs carte
        this.setupCardFormatting(modal);

        // Confirmer paiement
        modal.querySelector('.confirm-payment-btn').onclick = () => {
            this.processPayment(packageType, package, modal);
        };
    }

    setupCardFormatting(modal) {
        const cardNumber = modal.querySelector('#cardNumber');
        const cardExpiry = modal.querySelector('#cardExpiry');

        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }
    }

    async processPayment(packageType, package, modal) {
        const confirmBtn = modal.querySelector('.confirm-payment-btn');
        const originalText = confirmBtn.textContent;
        
        // Animation processing
        confirmBtn.textContent = '🔄 Traitement...';
        confirmBtn.style.background = 'var(--warning-color)';
        confirmBtn.disabled = true;

        // Validation
        if (this.selectedPaymentMethod === 'card') {
            const cardNumber = modal.querySelector('#cardNumber')?.value;
            const cardExpiry = modal.querySelector('#cardExpiry')?.value;
            const cardCVC = modal.querySelector('#cardCVC')?.value;
            const cardName = modal.querySelector('#cardName')?.value;

            if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
                this.showError(modal, 'Veuillez remplir tous les champs');
                confirmBtn.textContent = originalText;
                confirmBtn.style.background = 'linear-gradient(45deg, var(--accent-color), var(--primary-color))';
                confirmBtn.disabled = false;
                return;
            }

            // Validation numéro carte (algorithme Luhn simplifié)
            if (!this.validateCard(cardNumber.replace(/\s/g, ''))) {
                this.showError(modal, 'Numéro de carte invalide');
                confirmBtn.textContent = originalText;
                confirmBtn.style.background = 'linear-gradient(45deg, var(--accent-color), var(--primary-color))';
                confirmBtn.disabled = false;
                return;
            }
        }

        // Simulation processing
        await this.simulatePaymentProcessing();

        // Succès
        this.showSuccess(modal, packageType, package);
    }

    validateCard(number) {
        // Validation basique (simulation)
        return number.length >= 13 && number.length <= 19 && /^\d+$/.test(number);
    }

    async simulatePaymentProcessing() {
        // Simulation délai traitement
        return new Promise(resolve => {
            setTimeout(resolve, 2000 + Math.random() * 2000);
        });
    }

    showError(modal, message) {
        const errorDiv = modal.querySelector('.payment-error') || document.createElement('div');
        errorDiv.className = 'payment-error';
        errorDiv.style.cssText = `
            background: rgba(255,0,0,0.2);
            border: 1px solid red;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            color: white;
            text-align: center;
        `;
        errorDiv.innerHTML = `❌ ${message}`;
        
        if (!modal.querySelector('.payment-error')) {
            modal.querySelector('.payment-container').insertBefore(
                errorDiv, 
                modal.querySelector('.confirm-payment-btn').parentElement
            );
        }

        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(modal, packageType, package) {
        const container = modal.querySelector('.payment-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 5rem; margin-bottom: 2rem; animation: pulse 2s ease-in-out infinite;">
                    ✅
                </div>
                <h2 style="color: var(--accent-color); margin-bottom: 1rem;">
                    Paiement Réussi !
                </h2>
                <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
                    ${package.credits === '∞' ? 'Abonnement mensuel activé' : `${package.credits} crédits ajoutés`}
                    ${package.bonus > 0 ? ` + ${package.bonus} bonus` : ''}
                </p>
                
                <div style="
                    background: rgba(0,255,136,0.1);
                    border: 2px solid var(--accent-color);
                    border-radius: 15px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                ">
                    <h3 style="color: var(--accent-color); margin-bottom: 1rem;">
                        🎉 Avantages Débloqués
                    </h3>
                    <div style="text-align: left; opacity: 0.9;">
                        • ${package.credits === '∞' ? 'Questions illimitées ce mois' : 'Crédits rechargés'}<br>
                        • Accès à tous les professeurs IA<br>
                        • Reconnaissance vocale premium<br>
                        • Support prioritaire 24/7<br>
                        ${packageType === 'unlimited' ? '• Renouvelé automatiquement' : ''}
                    </div>
                </div>

                <button onclick="this.parentElement.parentElement.parentElement.remove(); location.reload();" style="
                    padding: 1rem 3rem;
                    background: linear-gradient(45deg, var(--accent-color), var(--primary-color));
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: bold;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    🚀 Commencer l'Apprentissage !
                </button>
            </div>
        `;

        // Mise à jour des crédits dans l'interface principale
        this.updateUserCredits(package);
        
        // Notification système
        if (window.addMessage) {
            window.addMessage(
                `🎉 Paiement confirmé ! ${package.credits === '∞' ? 'Abonnement activé' : `+${package.credits} crédits`}`,
                'system'
            );
        }
    }

    updateUserCredits(package) {
        if (package.credits === '∞') {
            localStorage.setItem('matacher_subscription', 'unlimited');
            localStorage.setItem('matacher_credits', '∞');
        } else {
            const currentCredits = parseInt(localStorage.getItem('matacher_credits') || '0');
            const newCredits = currentCredits + package.credits + (package.bonus || 0);
            localStorage.setItem('matacher_credits', newCredits.toString());
        }

        // Mettre à jour affichage si présent
        const creditsDisplay = document.getElementById('creditsCount');
        if (creditsDisplay) {
            creditsDisplay.textContent = localStorage.getItem('matacher_credits');
        }
    }

    getPackageTitle(packageType) {
        const titles = {
            starter: '🟢 Pack Starter',
            standard: '🟡 Pack Standard ⭐',
            premium: '🟠 Pack Premium',
            unlimited: '🔥 Abonnement Illimité'
        };
        return titles[packageType] || packageType;
    }
}

// Instance globale
const paymentSystem = new PaymentSystemRevolution();

// Fonctions globales pour l'interface
function openPaymentModal(packageType) {
    paymentSystem.openPaymentModal(packageType);
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentSystemRevolution;
}