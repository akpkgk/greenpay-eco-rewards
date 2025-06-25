// Home page specific functionality
let transactions = [];
let verificationData = {};
let pendingPayment = null;
let lastAnalysisScore = 0;

document.addEventListener('DOMContentLoaded', function() {
    setupHomeEventListeners();
    updateUI();
});

function setupHomeEventListeners() {
    // Get Started button
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            const currentUser = window.GreenPayCommon.currentUser();
            if (currentUser) {
                document.getElementById('main-app').classList.remove('hidden');
            } else {
                window.location.href = 'signup.html';
            }
        });
    }

    // Purchase type switching
    const trustedPartnerBtn = document.getElementById('trusted-partner-btn');
    const openPurchaseBtn = document.getElementById('open-purchase-btn');
    
    if (trustedPartnerBtn) {
        trustedPartnerBtn.addEventListener('click', function() {
            switchPurchaseType('trusted');
        });
    }

    if (openPurchaseBtn) {
        openPurchaseBtn.addEventListener('click', function() {
            switchPurchaseType('open');
        });
    }

    // Payment buttons
    const partnerPayBtn = document.getElementById('partner-pay-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const openPayBtn = document.getElementById('open-pay-btn');

    if (partnerPayBtn) {
        partnerPayBtn.addEventListener('click', processTrustedPartnerPayment);
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeImage);
    }

    if (openPayBtn) {
        openPayBtn.addEventListener('click', processOpenPurchasePayment);
    }

    // Payment modal buttons
    const paymentSuccessBtn = document.getElementById('payment-success-btn');
    const paymentCancelBtn = document.getElementById('payment-cancel-btn');

    if (paymentSuccessBtn) {
        paymentSuccessBtn.addEventListener('click', simulatePaymentSuccess);
    }

    if (paymentCancelBtn) {
        paymentCancelBtn.addEventListener('click', closePaymentModal);
    }

    // Load user data if logged in
    const currentUser = window.GreenPayCommon.currentUser();
    if (currentUser) {
        document.getElementById('main-app').classList.remove('hidden');
        loadUserTransactions();
        displayTransactions();
        displayVerifications();
    }
}

function switchPurchaseType(type) {
    var trustedBtn = document.getElementById('trusted-partner-btn');
    var openBtn = document.getElementById('open-purchase-btn');
    var trustedForm = document.getElementById('trusted-partner-form');
    var openForm = document.getElementById('open-purchase-form');

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
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) {
        window.GreenPayCommon.showMessage('Please login to make a purchase', 'error');
        window.location.href = 'login.html';
        return;
    }

    var partner = document.getElementById('partner-select').value;
    var amount = document.getElementById('partner-amount').value;

    if (!partner || !amount) {
        window.GreenPayCommon.showMessage('Please select a partner and enter amount', 'error');
        return;
    }

    showPaymentModal(amount, 'trusted', { partner: partner });
}

function processOpenPurchasePayment() {
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) {
        window.GreenPayCommon.showMessage('Please login to make a purchase', 'error');
        window.location.href = 'login.html';
        return;
    }

    var amount = document.getElementById('open-amount').value;
    var analysisResult = document.getElementById('analysis-result');

    if (!amount || analysisResult.classList.contains('hidden')) {
        window.GreenPayCommon.showMessage('Please analyze image and enter amount', 'error');
        return;
    }

    var ecoScore = lastAnalysisScore || 0;
    showPaymentModal(amount, 'open', { ecoScore: ecoScore });
}

function analyzeImage() {
    var fileInput = document.getElementById('bill-image');
    var file = fileInput.files[0];

    if (!file) {
        window.GreenPayCommon.showMessage('Please select an image', 'error');
        return;
    }

    var analyzeBtn = document.getElementById('analyze-btn');
    var resultDiv = document.getElementById('analysis-result');
    
    analyzeBtn.textContent = 'Analyzing...';
    analyzeBtn.disabled = true;

    // Simulate OCR analysis
    setTimeout(function() {
        var mockAnalysis = simulateOCRAnalysis(file.name);
        displayAnalysisResult(mockAnalysis);
        
        analyzeBtn.textContent = 'Analyze for Eco-Friendliness';
        analyzeBtn.disabled = false;
        resultDiv.classList.remove('hidden');
    }, 2000);
}

function simulateOCRAnalysis(filename) {
    // Mock OCR results based on filename or random generation
    var ecoKeywords = ['eco', 'organic', 'bamboo', 'recycled', 'bio', 'natural', 'sustainable', 'green'];
    var mockTexts = [
        'Organic Cotton T-Shirt Made from 100% Organic Cotton Eco-Friendly Material',
        'Bamboo Toothbrush Natural Biodegradable Sustainable Living',
        'Recycled Paper Notebook Made from 80% Recycled Materials',
        'Regular Plastic Bottle Mineral Water 500ml',
        'Bio-degradable Plates Made from Natural Fibres Eco Product',
        'Conventional Detergent Powder Regular Formula'
    ];

    var randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    var wordsInText = randomText.toLowerCase().split(' ');
    
    var ecoScore = 0;
    var foundKeywords = [];

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
    var ecoScoreDiv = document.getElementById('eco-score');
    var detectedTextDiv = document.getElementById('detected-text');

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
    var modal = document.getElementById('payment-modal');
    var amountSpan = document.getElementById('payment-amount');
    
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
    const currentUser = window.GreenPayCommon.currentUser();
    if (!pendingPayment || !currentUser) return;

    var amount = pendingPayment.amount;
    var type = pendingPayment.type;
    var data = pendingPayment.data;
    var transactionId = generateTransactionId();

    var transaction = {
        id: transactionId,
        userId: currentUser.id,
        amount: amount,
        type: type,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };

    if (type === 'trusted') {
        // Instant rewards for trusted partners
        var points = Math.floor(amount * 0.1); // 10% of amount as points
        currentUser.points += points;
        
        transaction.partner = data.partner;
        transaction.points = points;
        transaction.status = 'verified';
        transaction.description = 'Purchase from ' + data.partner;

        window.GreenPayCommon.showMessage('Payment successful! Earned ' + points + ' eco-points instantly!', 'success');

    } else if (type === 'open') {
        // Pending verification for open purchases
        var potentialPoints = Math.floor(amount * 0.05 * (data.ecoScore + 1)); // Variable points based on eco-score
        
        transaction.ecoScore = data.ecoScore;
        transaction.points = potentialPoints;
        transaction.description = 'Open purchase - awaiting verification';

        currentUser.pendingPoints += potentialPoints;
        
        // Add to verification tracking
        addToVerificationPool(transaction);
        
        window.GreenPayCommon.showMessage('Payment successful! ' + potentialPoints + ' points pending verification', 'success');
    }

    transactions.push(transaction);
    saveAllData();
    updateUI();
    displayTransactions();
    displayVerifications();
    closePaymentModal();
    resetForms();
}

function addToVerificationPool(transaction) {
    var verificationKey = transaction.ecoScore + '_' + Math.floor(transaction.amount/100); // Group by eco-score and amount range
    
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
    var verificationGroup = verificationData[verificationKey];
    var transactionIds = verificationGroup.transactions;
    
    // Get all transactions from all users
    var allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    const allUsers = window.GreenPayCommon.allUsers();
    
    // Update all transactions in this group to verified
    transactionIds.forEach(function(txId) {
        var transaction = allTransactions.find(function(tx) { return tx.id === txId; });
        if (transaction && transaction.status === 'pending') {
            transaction.status = 'verified';
            
            // Update user points
            var user = allUsers[transaction.userId];
            if (user) {
                user.points += transaction.points;
                user.pendingPoints -= transaction.points;
            }
        }
    });
    
    // Update local transactions if current user is affected
    transactionIds.forEach(function(txId) {
        var transaction = transactions.find(function(tx) { return tx.id === txId; });
        if (transaction && transaction.status === 'pending') {
            transaction.status = 'verified';
        }
    });
    
    // Mark verification group as completed
    verificationData[verificationKey].completed = true;
    verificationData[verificationKey].completedAt = new Date().toISOString();
    
    // Save all transactions back
    localStorage.setItem('greenpay_all_transactions', JSON.stringify(allTransactions));
    localStorage.setItem('greenpay_all_users', JSON.stringify(allUsers));
    
    var firstTransaction = allTransactions.find(function(tx) { return tx.id === transactionIds[0]; });
    var totalPoints = transactionIds.length * firstTransaction.points;
    window.GreenPayCommon.showMessage('🎉 Verification completed! Earned ' + totalPoints + ' total points!', 'success');
}

function generateTransactionId() {
    return 'TX' + Date.now() + Math.random().toString(36).substr(2, 9);
}

function displayTransactions() {
    var transactionsList = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p>No transactions yet</p>';
        return;
    }

    var sortedTransactions = transactions.sort(function(a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    var transactionsHTML = '';
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
    var verificationsList = document.getElementById('verification-list');
    var pendingVerifications = [];
    
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

    var verificationsHTML = '';
    pendingVerifications.forEach(function(verification) {
        var progress = (verification.transactions.length / verification.requiredCount) * 100;
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
    const currentUser = window.GreenPayCommon.currentUser();
    document.getElementById('user-points').textContent = currentUser ? currentUser.points : 0;
}

function loadUserTransactions() {
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) return;
    
    var allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    transactions = allTransactions.filter(function(tx) {
        return tx.userId === currentUser.id;
    });
}

function saveAllData() {
    const currentUser = window.GreenPayCommon.currentUser();
    const allUsers = window.GreenPayCommon.allUsers();
    
    localStorage.setItem('greenpay_all_users', JSON.stringify(allUsers));
    localStorage.setItem('greenpay_verifications', JSON.stringify(verificationData));
    
    // Save all transactions
    var allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    
    // Remove existing transactions for current user
    allTransactions = allTransactions.filter(function(tx) {
        return !currentUser || tx.userId !== currentUser.id;
    });
    
    // Add current user's transactions
    if (currentUser) {
        transactions.forEach(function(tx) {
            if (!allTransactions.find(function(existing) { return existing.id === tx.id; })) {
                allTransactions.push(tx);
            }
        });
    }
    
    localStorage.setItem('greenpay_all_transactions', JSON.stringify(allTransactions));
}
