
// GreenPay Application Logic
let currentUser = { points: 0 };
let transactions = [];
let verificationData = {};
let pendingPayment = null;
let lastAnalysisScore = 0;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadTransactions();
    loadVerificationData();
    setupEventListeners();
    updateUI();
    displayTransactions();
    displayVerifications();
});

function setupEventListeners() {
    // Purchase type switching
    document.getElementById('trusted-partner-btn').addEventListener('click', function() {
        switchPurchaseType('trusted');
    });

    document.getElementById('open-purchase-btn').addEventListener('click', function() {
        switchPurchaseType('open');
    });

    // Trusted partner form
    document.getElementById('partner-pay-btn').addEventListener('click', function() {
        processTrustedPartnerPayment();
    });

    // Open purchase form
    document.getElementById('analyze-btn').addEventListener('click', function() {
        analyzeImage();
    });

    document.getElementById('open-pay-btn').addEventListener('click', function() {
        processOpenPurchasePayment();
    });

    // Payment modal
    document.getElementById('payment-success-btn').addEventListener('click', function() {
        simulatePaymentSuccess();
    });

    document.getElementById('payment-cancel-btn').addEventListener('click', function() {
        closePaymentModal();
    });
}

function switchPurchaseType(type) {
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

function processTrustedPartnerPayment() {
    const partner = document.getElementById('partner-select').value;
    const amount = document.getElementById('partner-amount').value;

    if (!partner || !amount) {
        showMessage('Please select a partner and enter amount', 'error');
        return;
    }

    showPaymentModal(amount, 'trusted', { partner: partner });
}

function processOpenPurchasePayment() {
    const amount = document.getElementById('open-amount').value;
    const analysisResult = document.getElementById('analysis-result');

    if (!amount || analysisResult.classList.contains('hidden')) {
        showMessage('Please analyze image and enter amount', 'error');
        return;
    }

    const ecoScore = lastAnalysisScore || 0;
    showPaymentModal(amount, 'open', { ecoScore: ecoScore });
}

function analyzeImage() {
    const fileInput = document.getElementById('bill-image');
    const file = fileInput.files[0];

    if (!file) {
        showMessage('Please select an image', 'error');
        return;
    }

    const analyzeBtn = document.getElementById('analyze-btn');
    const resultDiv = document.getElementById('analysis-result');
    
    analyzeBtn.textContent = 'Analyzing...';
    analyzeBtn.disabled = true;

    // Simulate OCR analysis
    setTimeout(function() {
        const mockAnalysis = simulateOCRAnalysis(file.name);
        displayAnalysisResult(mockAnalysis);
        
        analyzeBtn.textContent = 'Analyze for Eco-Friendliness';
        analyzeBtn.disabled = false;
        resultDiv.classList.remove('hidden');
    }, 2000);
}

function simulateOCRAnalysis(filename) {
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

    ecoKeywords.forEach(function(keyword) {
        wordsInText.forEach(function(word) {
            if (word.includes(keyword)) {
                ecoScore++;
                foundKeywords.push(keyword);
            }
        });
    });

    lastAnalysisScore = ecoScore;

    return {
        text: randomText,
        ecoScore: ecoScore,
        foundKeywords: foundKeywords,
        recommendation: getEcoRecommendation(ecoScore)
    };
}

function getEcoRecommendation(score) {
    if (score >= 3) {
        return { level: 'high', message: '🌟 Excellent! This appears to be a highly eco-friendly product.' };
    } else if (score >= 1) {
        return { level: 'medium', message: '🌱 Good! This product has some eco-friendly features.' };
    } else {
        return { level: 'low', message: '⚠️ This product may not be eco-friendly. Consider alternatives.' };
    }
}

function displayAnalysisResult(analysis) {
    const ecoScoreDiv = document.getElementById('eco-score');
    const detectedTextDiv = document.getElementById('detected-text');

    ecoScoreDiv.innerHTML = 
        '<div class="eco-score ' + analysis.recommendation.level + '">' +
            analysis.recommendation.message +
            '<br>Eco-Score: ' + analysis.ecoScore + '/6' +
            (analysis.foundKeywords.length > 0 ? '<br>Found keywords: ' + analysis.foundKeywords.join(', ') : '') +
        '</div>';

    detectedTextDiv.innerHTML = 
        '<p><strong>Detected Text:</strong></p>' +
        '<p style="font-style: italic; color: #666;">"' + analysis.text + '"</p>';
}

function showPaymentModal(amount, type, data) {
    const modal = document.getElementById('payment-modal');
    const amountSpan = document.getElementById('payment-amount');
    
    amountSpan.textContent = amount;
    modal.classList.remove('hidden');
    
    // Store payment data for processing
    pendingPayment = { amount: parseFloat(amount), type: type, data: data };
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
    pendingPayment = null;
}

function simulatePaymentSuccess() {
    if (!pendingPayment) return;

    const amount = pendingPayment.amount;
    const type = pendingPayment.type;
    const data = pendingPayment.data;
    const transactionId = generateTransactionId();

    if (type === 'trusted') {
        // Instant rewards for trusted partners
        const points = Math.floor(amount * 0.1); // 10% of amount as points
        currentUser.points += points;
        
        const transaction = {
            id: transactionId,
            amount: amount,
            type: 'trusted',
            partner: data.partner,
            points: points,
            status: 'verified',
            timestamp: new Date().toISOString(),
            description: 'Purchase from ' + data.partner
        };

        transactions.push(transaction);
        showMessage('Payment successful! Earned ' + points + ' eco-points instantly!', 'success');

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
            description: 'Open purchase - awaiting verification'
        };

        transactions.push(transaction);
        
        // Add to verification tracking
        addToVerificationPool(transaction);
        
        showMessage('Payment successful! ' + potentialPoints + ' points pending verification', 'success');
    }

    saveData();
    updateUI();
    displayTransactions();
    displayVerifications();
    closePaymentModal();
    resetForms();
}

function addToVerificationPool(transaction) {
    const verificationKey = transaction.ecoScore + '_' + Math.floor(transaction.amount/100); // Group by eco-score and amount range
    
    if (!verificationData[verificationKey]) {
        verificationData[verificationKey] = {
            transactions: [],
            requiredCount: 5,
            description: 'Eco-score: ' + transaction.ecoScore + ', Amount range: ₹' + Math.floor(transaction.amount/100)*100 + '-' + (Math.floor(transaction.amount/100)*100+99)
        };
    }
    
    verificationData[verificationKey].transactions.push(transaction.id);
    
    // Check if verification threshold is met
    if (verificationData[verificationKey].transactions.length >= verificationData[verificationKey].requiredCount) {
        processVerification(verificationKey);
    }
}

function processVerification(verificationKey) {
    const verificationGroup = verificationData[verificationKey];
    const transactionIds = verificationGroup.transactions;
    
    // Update all transactions in this group to verified
    transactionIds.forEach(function(txId) {
        const transaction = transactions.find(function(tx) { return tx.id === txId; });
        if (transaction && transaction.status === 'pending') {
            transaction.status = 'verified';
            currentUser.points += transaction.points;
        }
    });
    
    // Mark verification group as completed
    verificationData[verificationKey].completed = true;
    verificationData[verificationKey].completedAt = new Date().toISOString();
    
    const firstTransaction = transactions.find(function(tx) { return tx.id === transactionIds[0]; });
    const totalPoints = transactionIds.length * firstTransaction.points;
    showMessage('🎉 Verification completed! Earned ' + totalPoints + ' total points!', 'success');
}

function generateTransactionId() {
    return 'TX' + Date.now() + Math.random().toString(36).substr(2, 9);
}

function displayTransactions() {
    const transactionsList = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p>No transactions yet</p>';
        return;
    }

    const sortedTransactions = transactions.sort(function(a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    let transactionsHTML = '';
    sortedTransactions.forEach(function(tx) {
        transactionsHTML += 
            '<div class="transaction-item ' + tx.status + '">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">' +
                    '<strong>₹' + tx.amount + '</strong>' +
                    '<span class="status-badge ' + tx.status + '">' + tx.status.toUpperCase() + '</span>' +
                '</div>' +
                '<div style="font-size: 0.9em; color: #666;">' +
                    tx.description +
                    '<br>Points: ' + tx.points + ' | ' + new Date(tx.timestamp).toLocaleDateString() +
                '</div>' +
            '</div>';
    });

    transactionsList.innerHTML = transactionsHTML;
}

function displayVerifications() {
    const verificationsList = document.getElementById('verification-list');
    const pendingVerifications = [];
    
    Object.keys(verificationData).forEach(function(key) {
        if (!verificationData[key].completed) {
            pendingVerifications.push({
                key: key,
                transactions: verificationData[key].transactions,
                requiredCount: verificationData[key].requiredCount,
                description: verificationData[key].description
            });
        }
    });

    if (pendingVerifications.length === 0) {
        verificationsList.innerHTML = '<p>No pending verifications</p>';
        return;
    }

    let verificationsHTML = '';
    pendingVerifications.forEach(function(verification) {
        const progress = (verification.transactions.length / verification.requiredCount) * 100;
        verificationsHTML += 
            '<div class="verification-item">' +
                '<div style="margin-bottom: 10px;">' +
                    '<strong>' + verification.description + '</strong>' +
                '</div>' +
                '<div style="font-size: 0.9em; color: #666;">' +
                    'Progress: ' + verification.transactions.length + '/' + verification.requiredCount + ' submissions' +
                    '<div style="background: #f0f0f0; height: 8px; border-radius: 4px; margin-top: 5px;">' +
                        '<div style="background: #4CAF50; height: 100%; width: ' + progress + '%; border-radius: 4px;"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });

    verificationsList.innerHTML = verificationsHTML;
}

function resetForms() {
    // Reset trusted partner form
    document.getElementById('partner-select').value = '';
    document.getElementById('partner-amount').value = '';
    document.getElementById('partner-image').value = '';
    
    // Reset open purchase form
    document.getElementById('bill-image').value = '';
    document.getElementById('open-amount').value = '';
    document.getElementById('analysis-result').classList.add('hidden');
}

function updateUI() {
    document.getElementById('user-points').textContent = currentUser.points;
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(function(msg) {
        msg.remove();
    });

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);

    // Auto-remove message after 5 seconds
    setTimeout(function() {
        messageDiv.remove();
    }, 5000);
}

// Data persistence methods
function loadUserData() {
    const saved = localStorage.getItem('greenpay_user');
    currentUser = saved ? JSON.parse(saved) : { points: 0 };
}

function loadTransactions() {
    const saved = localStorage.getItem('greenpay_transactions');
    transactions = saved ? JSON.parse(saved) : [];
}

function loadVerificationData() {
    const saved = localStorage.getItem('greenpay_verifications');
    verificationData = saved ? JSON.parse(saved) : {};
}

function saveData() {
    localStorage.setItem('greenpay_user', JSON.stringify(currentUser));
    localStorage.setItem('greenpay_transactions', JSON.stringify(transactions));
    localStorage.setItem('greenpay_verifications', JSON.stringify(verificationData));
}
