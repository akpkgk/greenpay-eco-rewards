
// GreenPay Application Logic
class GreenPayApp {
    constructor() {
        this.currentUser = this.loadUserData();
        this.transactions = this.loadTransactions();
        this.verificationData = this.loadVerificationData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.displayTransactions();
        this.displayVerifications();
    }

    setupEventListeners() {
        // Purchase type switching
        document.getElementById('trusted-partner-btn').addEventListener('click', () => {
            this.switchPurchaseType('trusted');
        });

        document.getElementById('open-purchase-btn').addEventListener('click', () => {
            this.switchPurchaseType('open');
        });

        // Trusted partner form
        document.getElementById('partner-pay-btn').addEventListener('click', () => {
            this.processTrustedPartnerPayment();
        });

        // Open purchase form
        document.getElementById('analyze-btn').addEventListener('click', () => {
            this.analyzeImage();
        });

        document.getElementById('open-pay-btn').addEventListener('click', () => {
            this.processOpenPurchasePayment();
        });

        // Payment modal
        document.getElementById('payment-success-btn').addEventListener('click', () => {
            this.simulatePaymentSuccess();
        });

        document.getElementById('payment-cancel-btn').addEventListener('click', () => {
            this.closePaymentModal();
        });
    }

    switchPurchaseType(type) {
        const trustedBtn = document.getElementById('trusted-partner-btn');
        const openBtn = document.getElementById('open-purchase-btn');
        const trustedForm = document.getElementById('trusted-partner-form');
        const openForm = document.getElementById('open-purchase-form');

        if (type === 'trusted') {
            trustedBtn.classList.add('active');
            openBtn.classList.remove('active');
            trustedForm.classList.remove('hidden');
            openForm.classList.add('hidden');
        } else {
            openBtn.classList.add('active');
            trustedBtn.classList.remove('active');
            openForm.classList.remove('hidden');
            trustedForm.classList.add('hidden');
        }
    }

    processTrustedPartnerPayment() {
        const partner = document.getElementById('partner-select').value;
        const amount = document.getElementById('partner-amount').value;

        if (!partner || !amount) {
            this.showMessage('Please select a partner and enter amount', 'error');
            return;
        }

        this.showPaymentModal(amount, 'trusted', { partner });
    }

    processOpenPurchasePayment() {
        const amount = document.getElementById('open-amount').value;
        const analysisResult = document.getElementById('analysis-result');

        if (!amount || analysisResult.classList.contains('hidden')) {
            this.showMessage('Please analyze image and enter amount', 'error');
            return;
        }

        const ecoScore = this.lastAnalysisScore || 0;
        this.showPaymentModal(amount, 'open', { ecoScore });
    }

    async analyzeImage() {
        const fileInput = document.getElementById('bill-image');
        const file = fileInput.files[0];

        if (!file) {
            this.showMessage('Please select an image', 'error');
            return;
        }

        const analyzeBtn = document.getElementById('analyze-btn');
        const resultDiv = document.getElementById('analysis-result');
        
        analyzeBtn.textContent = 'Analyzing...';
        analyzeBtn.disabled = true;

        // Simulate OCR analysis
        setTimeout(() => {
            const mockAnalysis = this.simulateOCRAnalysis(file.name);
            this.displayAnalysisResult(mockAnalysis);
            
            analyzeBtn.textContent = 'Analyze for Eco-Friendliness';
            analyzeBtn.disabled = false;
            resultDiv.classList.remove('hidden');
        }, 2000);
    }

    simulateOCRAnalysis(filename) {
        // Mock OCR results based on filename or random generation
        const ecoKeywords = ['eco', 'organic', 'bamboo', 'recycled', 'bio', 'natural', 'sustainable', 'green'];
        const mockTexts = [
            'Organic Cotton T-Shirt Made from 100% Organic Cotton Eco-Friendly Material',
            'Bamboo Toothbrush Natural Biodegradable Sustainable Living',
            'Recycled Paper Notebook Made from 80% Recycled Materials',
            'Regular Plastic Bottle Mineral Water 500ml',
            'Bio-degradable Plates Made from Natural Fibres Eco Product',
            'Conventional Detergent Powder Regular Formula'
        ];

        const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
        const wordsInText = randomText.toLowerCase().split(' ');
        
        let ecoScore = 0;
        const foundKeywords = [];

        ecoKeywords.forEach(keyword => {
            if (wordsInText.some(word => word.includes(keyword))) {
                ecoScore++;
                foundKeywords.push(keyword);
            }
        });

        this.lastAnalysisScore = ecoScore;

        return {
            text: randomText,
            ecoScore: ecoScore,
            foundKeywords: foundKeywords,
            recommendation: this.getEcoRecommendation(ecoScore)
        };
    }

    getEcoRecommendation(score) {
        if (score >= 3) {
            return { level: 'high', message: '🌟 Excellent! This appears to be a highly eco-friendly product.' };
        } else if (score >= 1) {
            return { level: 'medium', message: '🌱 Good! This product has some eco-friendly features.' };
        } else {
            return { level: 'low', message: '⚠️ This product may not be eco-friendly. Consider alternatives.' };
        }
    }

    displayAnalysisResult(analysis) {
        const ecoScoreDiv = document.getElementById('eco-score');
        const detectedTextDiv = document.getElementById('detected-text');

        ecoScoreDiv.innerHTML = `
            <div class="eco-score ${analysis.recommendation.level}">
                ${analysis.recommendation.message}
                <br>Eco-Score: ${analysis.ecoScore}/6
                ${analysis.foundKeywords.length > 0 ? `<br>Found keywords: ${analysis.foundKeywords.join(', ')}` : ''}
            </div>
        `;

        detectedTextDiv.innerHTML = `
            <p><strong>Detected Text:</strong></p>
            <p style="font-style: italic; color: #666;">"${analysis.text}"</p>
        `;
    }

    showPaymentModal(amount, type, data) {
        const modal = document.getElementById('payment-modal');
        const amountSpan = document.getElementById('payment-amount');
        
        amountSpan.textContent = amount;
        modal.classList.remove('hidden');
        
        // Store payment data for processing
        this.pendingPayment = { amount: parseFloat(amount), type, data };
    }

    closePaymentModal() {
        document.getElementById('payment-modal').classList.add('hidden');
        this.pendingPayment = null;
    }

    simulatePaymentSuccess() {
        if (!this.pendingPayment) return;

        const { amount, type, data } = this.pendingPayment;
        const transactionId = this.generateTransactionId();

        if (type === 'trusted') {
            // Instant rewards for trusted partners
            const points = Math.floor(amount * 0.1); // 10% of amount as points
            this.currentUser.points += points;
            
            const transaction = {
                id: transactionId,
                amount: amount,
                type: 'trusted',
                partner: data.partner,
                points: points,
                status: 'verified',
                timestamp: new Date().toISOString(),
                description: `Purchase from ${data.partner}`
            };

            this.transactions.push(transaction);
            this.showMessage(`Payment successful! Earned ${points} eco-points instantly!`, 'success');

        } else if (type === 'open') {
            // Pending verification for open purchases
            const potentialPoints = Math.floor(amount * 0.05 * (data.ecoScore + 1)); // Variable points based on eco-score
            
            const transaction = {
                id: transactionId,
                amount: amount,
                type: 'open',
                ecoScore: data.ecoScore,
                points: potentialPoints,
                status: 'pending',
                timestamp: new Date().toISOString(),
                description: `Open purchase - awaiting verification`
            };

            this.transactions.push(transaction);
            
            // Add to verification tracking
            this.addToVerificationPool(transaction);
            
            this.showMessage(`Payment successful! ${potentialPoints} points pending verification`, 'success');
        }

        this.saveData();
        this.updateUI();
        this.displayTransactions();
        this.displayVerifications();
        this.closePaymentModal();
        this.resetForms();
    }

    addToVerificationPool(transaction) {
        const verificationKey = `${transaction.ecoScore}_${Math.floor(transaction.amount/100)}`; // Group by eco-score and amount range
        
        if (!this.verificationData[verificationKey]) {
            this.verificationData[verificationKey] = {
                transactions: [],
                requiredCount: 5,
                description: `Eco-score: ${transaction.ecoScore}, Amount range: ₹${Math.floor(transaction.amount/100)*100}-${Math.floor(transaction.amount/100)*100+99}`
            };
        }
        
        this.verificationData[verificationKey].transactions.push(transaction.id);
        
        // Check if verification threshold is met
        if (this.verificationData[verificationKey].transactions.length >= this.verificationData[verificationKey].requiredCount) {
            this.processVerification(verificationKey);
        }
    }

    processVerification(verificationKey) {
        const verificationGroup = this.verificationData[verificationKey];
        const transactionIds = verificationGroup.transactions;
        
        // Update all transactions in this group to verified
        transactionIds.forEach(txId => {
            const transaction = this.transactions.find(tx => tx.id === txId);
            if (transaction && transaction.status === 'pending') {
                transaction.status = 'verified';
                this.currentUser.points += transaction.points;
            }
        });
        
        // Mark verification group as completed
        this.verificationData[verificationKey].completed = true;
        this.verificationData[verificationKey].completedAt = new Date().toISOString();
        
        this.showMessage(`🎉 Verification completed! Earned ${transactionIds.length * this.transactions.find(tx => tx.id === transactionIds[0]).points} total points!`, 'success');
    }

    generateTransactionId() {
        return 'TX' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    displayTransactions() {
        const transactionsList = document.getElementById('transactions-list');
        
        if (this.transactions.length === 0) {
            transactionsList.innerHTML = '<p>No transactions yet</p>';
            return;
        }

        const transactionsHTML = this.transactions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(tx => `
                <div class="transaction-item ${tx.status}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <strong>₹${tx.amount}</strong>
                        <span class="status-badge ${tx.status}">${tx.status.toUpperCase()}</span>
                    </div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${tx.description}
                        <br>Points: ${tx.points} | ${new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                </div>
            `).join('');

        transactionsList.innerHTML = transactionsHTML;
    }

    displayVerifications() {
        const verificationsList = document.getElementById('verification-list');
        const pendingVerifications = Object.keys(this.verificationData)
            .filter(key => !this.verificationData[key].completed)
            .map(key => ({
                key,
                ...this.verificationData[key]
            }));

        if (pendingVerifications.length === 0) {
            verificationsList.innerHTML = '<p>No pending verifications</p>';
            return;
        }

        const verificationsHTML = pendingVerifications.map(verification => `
            <div class="verification-item">
                <div style="margin-bottom: 10px;">
                    <strong>${verification.description}</strong>
                </div>
                <div style="font-size: 0.9em; color: #666;">
                    Progress: ${verification.transactions.length}/${verification.requiredCount} submissions
                    <div style="background: #f0f0f0; height: 8px; border-radius: 4px; margin-top: 5px;">
                        <div style="background: #4CAF50; height: 100%; width: ${(verification.transactions.length/verification.requiredCount)*100}%; border-radius: 4px;"></div>
                    </div>
                </div>
            </div>
        `).join('');

        verificationsList.innerHTML = verificationsHTML;
    }

    resetForms() {
        // Reset trusted partner form
        document.getElementById('partner-select').value = '';
        document.getElementById('partner-amount').value = '';
        document.getElementById('partner-image').value = '';
        
        // Reset open purchase form
        document.getElementById('bill-image').value = '';
        document.getElementById('open-amount').value = '';
        document.getElementById('analysis-result').classList.add('hidden');
    }

    updateUI() {
        document.getElementById('user-points').textContent = this.currentUser.points;
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        const main = document.querySelector('main');
        main.insertBefore(messageDiv, main.firstChild);

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Data persistence methods
    loadUserData() {
        const saved = localStorage.getItem('greenpay_user');
        return saved ? JSON.parse(saved) : { points: 0 };
    }

    loadTransactions() {
        const saved = localStorage.getItem('greenpay_transactions');
        return saved ? JSON.parse(saved) : [];
    }

    loadVerificationData() {
        const saved = localStorage.getItem('greenpay_verifications');
        return saved ? JSON.parse(saved) : {};
    }

    saveData() {
        localStorage.setItem('greenpay_user', JSON.stringify(this.currentUser));
        localStorage.setItem('greenpay_transactions', JSON.stringify(this.transactions));
        localStorage.setItem('greenpay_verifications', JSON.stringify(this.verificationData));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.greenPayApp = new GreenPayApp();
});

// Add some sample data for demonstration (optional)
function addSampleData() {
    const app = window.greenPayApp;
    if (app && app.transactions.length === 0) {
        // Add some sample transactions for demo
        const sampleTransactions = [
            {
                id: 'TX_SAMPLE_1',
                amount: 250,
                type: 'trusted',
                partner: 'EcoMart',
                points: 25,
                status: 'verified',
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                description: 'Purchase from EcoMart'
            },
            {
                id: 'TX_SAMPLE_2',
                amount: 150,
                type: 'open',
                ecoScore: 2,
                points: 15,
                status: 'pending',
                timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                description: 'Open purchase - awaiting verification'
            }
        ];
        
        app.transactions = sampleTransactions;
        app.currentUser.points = 25; // Points from verified transaction
        app.saveData();
        app.updateUI();
        app.displayTransactions();
    }
}

// Uncomment the line below to add sample data for demo purposes
// setTimeout(addSampleData, 1000);
