
// Home page specific functionality
let transactions = [];
let verificationData = {};
let pendingPayment = null;
let lastAnalysisScore = 0;

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#login' || window.location.hash === '#signup') {
        setupAuthModals();
    }
    
    setupHomeEventListeners();
    loadUserTransactions();
    updateHomeUI();
    
    // Check if user is logged in to show main app
    if (window.GreenPayCommon.currentUser()) {
        document.getElementById('main-app').classList.remove('hidden');
        displayTransactions();
        displayVerifications();
    }
});

function setupAuthModals() {
    // Show login modal
    if (window.location.hash === '#login') {
        showModal('login-modal');
    }
    
    // Show signup modal
    if (window.location.hash === '#signup') {
        showModal('signup-modal');
    }
}

function setupHomeEventListeners() {
    // Get Started button
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            if (window.GreenPayCommon.currentUser()) {
                document.getElementById('main-app').classList.remove('hidden');
            } else {
                showModal('signup-modal');
            }
        });
    }

    // Auth forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    // Auth switching
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            hideModal('login-modal');
            showModal('signup-modal');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            hideModal('signup-modal');
            showModal('login-modal');
        });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = btn.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Purchase type switching
    const trustedPartnerBtn = document.getElementById('trusted-partner-btn');
    const openPurchaseBtn = document.getElementById('open-purchase-btn');
    
    if (trustedPartnerBtn) trustedPartnerBtn.addEventListener('click', () => switchPurchaseType('trusted'));
    if (openPurchaseBtn) openPurchaseBtn.addEventListener('click', () => switchPurchaseType('open'));

    // Purchase forms
    const partnerPayBtn = document.getElementById('partner-pay-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const openPayBtn = document.getElementById('open-pay-btn');
    
    if (partnerPayBtn) partnerPayBtn.addEventListener('click', processTrustedPartnerPayment);
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeImage);
    if (openPayBtn) openPayBtn.addEventListener('click', processOpenPurchasePayment);

    // Payment modal
    const paymentSuccessBtn = document.getElementById('payment-success-btn');
    const paymentCancelBtn = document.getElementById('payment-cancel-btn');
    
    if (paymentSuccessBtn) paymentSuccessBtn.addEventListener('click', simulatePaymentSuccess);
    if (paymentCancelBtn) paymentCancelBtn.addEventListener('click', closePaymentModal);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
    
    // Clear hash when closing auth modals
    if (modalId === 'login-modal' || modalId === 'signup-modal') {
        history.replaceState(null, null, window.location.pathname);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = window.GreenPayCommon.findUserByEmail(email);
    if (user && user.password === password) {
        window.GreenPayCommon.setCurrentUser(user);
        localStorage.setItem('greenpay_current_user', user.id);
        hideModal('login-modal');
        window.GreenPayCommon.showMessage('Welcome back, ' + user.name + '!', 'success');
        loadUserTransactions();
        updateHomeUI();
        document.getElementById('main-app').classList.remove('hidden');
        displayTransactions();
        displayVerifications();
    } else {
        window.GreenPayCommon.showMessage('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    
    if (window.GreenPayCommon.findUserByEmail(email)) {
        window.GreenPayCommon.showMessage('User with this email already exists', 'error');
        return;
    }
    
    const userId = 'user_' + Date.now();
    const newUser = {
        id: userId,
        name: name,
        email: email,
        phone: phone,
        password: password,
        points: 0,
        pendingPoints: 0,
        redeemedPoints: 0,
        isAdmin: email === 'admin@greenpay.com'
    };
    
    const users = window.GreenPayCommon.allUsers();
    users[userId] = newUser;
    localStorage.setItem('greenpay_all_users', JSON.stringify(users));
    localStorage.setItem('greenpay_current_user', userId);
    
    window.GreenPayCommon.setCurrentUser(newUser);
    hideModal('signup-modal');
    window.GreenPayCommon.showMessage('Welcome to GreenPay, ' + name + '!', 'success');
    document.getElementById('main-app').classList.remove('hidden');
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
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) {
        window.GreenPayCommon.showMessage('Please login to make a purchase', 'error');
        showModal('login-modal');
        return;
    }

    const partner = document.getElementById('partner-select').value;
    const amount = document.getElementById('partner-amount').value;

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
        showModal('login-modal');
        return;
    }

    const amount = document.getElementById('open-amount').value;
    const analysisResult = document.getElementById('analysis-result');

    if (!amount || analysisResult.classList.contains('hidden')) {
        window.GreenPayCommon.showMessage('Please analyze image and enter amount', 'error');
        return;
    }

    showPaymentModal(amount, 'open', { ecoScore: lastAnalysisScore });
}

function analyzeImage() {
    const fileInput = document.getElementById('bill-image');
    const file = fileInput.files[0];

    if (!file) {
        window.GreenPayCommon.showMessage('Please select an image', 'error');
        return;
    }

    const analyzeBtn = document.getElementById('analyze-btn');
    const resultDiv = document.getElementById('analysis-result');
    
    analyzeBtn.textContent = 'Analyzing...';
    analyzeBtn.disabled = true;

    setTimeout(function() {
        const mockAnalysis = simulateOCRAnalysis(file.name);
        displayAnalysisResult(mockAnalysis);
        
        analyzeBtn.textContent = 'Analyze for Eco-Friendliness';
        analyzeBtn.disabled = false;
        resultDiv.classList.remove('hidden');
    }, 2000);
}

function simulateOCRAnalysis(filename) {
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
    
    pendingPayment = { amount: parseFloat(amount), type: type, data: data };
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
    pendingPayment = null;
}

function simulatePaymentSuccess() {
    if (!pendingPayment) return;
    
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) return;

    const amount = pendingPayment.amount;
    const type = pendingPayment.type;
    const data = pendingPayment.data;
    const transactionId = generateTransactionId();

    const transaction = {
        id: transactionId,
        userId: currentUser.id,
        amount: amount,
        type: type,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };

    if (type === 'trusted') {
        const points = Math.floor(amount * 0.1);
        currentUser.points += points;
        
        transaction.partner = data.partner;
        transaction.points = points;
        transaction.status = 'verified';
        transaction.description = 'Purchase from ' + data.partner;

        window.GreenPayCommon.showMessage('Payment successful! Earned ' + points + ' eco-points instantly!', 'success');
    } else if (type === 'open') {
        const potentialPoints = Math.floor(amount * 0.05 * (data.ecoScore + 1));
        
        transaction.ecoScore = data.ecoScore;
        transaction.points = potentialPoints;
        transaction.description = 'Open purchase - awaiting verification';

        currentUser.pendingPoints += potentialPoints;
        
        window.GreenPayCommon.showMessage('Payment successful! ' + potentialPoints + ' points pending verification', 'success');
    }

    transactions.push(transaction);
    saveTransactionData();
    updateHomeUI();
    displayTransactions();
    displayVerifications();
    closePaymentModal();
    resetForms();
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
    // Simplified verification display for now
    verificationsList.innerHTML = '<p>No pending verifications</p>';
}

function loadUserTransactions() {
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) return;
    
    const allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    transactions = allTransactions.filter(function(tx) {
        return tx.userId === currentUser.id;
    });
}

function saveTransactionData() {
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) return;
    
    // Update user data
    const users = window.GreenPayCommon.allUsers();
    users[currentUser.id] = currentUser;
    localStorage.setItem('greenpay_all_users', JSON.stringify(users));
    
    // Save transactions
    let allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    allTransactions = allTransactions.filter(function(tx) {
        return tx.userId !== currentUser.id;
    });
    allTransactions = allTransactions.concat(transactions);
    localStorage.setItem('greenpay_all_transactions', JSON.stringify(allTransactions));
}

function resetForms() {
    const partnerSelect = document.getElementById('partner-select');
    const partnerAmount = document.getElementById('partner-amount');
    const partnerImage = document.getElementById('partner-image');
    const billImage = document.getElementById('bill-image');
    const openAmount = document.getElementById('open-amount');
    const analysisResult = document.getElementById('analysis-result');
    
    if (partnerSelect) partnerSelect.value = '';
    if (partnerAmount) partnerAmount.value = '';
    if (partnerImage) partnerImage.value = '';
    if (billImage) billImage.value = '';
    if (openAmount) openAmount.value = '';
    if (analysisResult) analysisResult.classList.add('hidden');
}

function updateHomeUI() {
    const currentUser = window.GreenPayCommon.currentUser();
    const userPointsElement = document.getElementById('user-points');
    if (userPointsElement) {
        userPointsElement.textContent = currentUser ? currentUser.points : 0;
    }
}
