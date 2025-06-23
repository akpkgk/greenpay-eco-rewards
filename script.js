
// GreenPay Application Logic
let currentUser = null;
let allUsers = {};
let transactions = [];
let verificationData = {};
let pendingPayment = null;
let lastAnalysisScore = 0;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    setupEventListeners();
    setupNavigation();
    checkAuthStatus();
    updateUI();
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', handleNavigation);
    });

    // Authentication
    document.getElementById('login-btn').addEventListener('click', function() {
        showModal('login-modal');
    });

    document.getElementById('signup-btn').addEventListener('click', function() {
        showModal('signup-modal');
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    // Get Started button
    document.getElementById('get-started-btn').addEventListener('click', function() {
        if (currentUser) {
            showSection('home');
            document.getElementById('main-app').classList.remove('hidden');
        } else {
            showModal('signup-modal');
        }
    });

    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);

    // Auth switching
    document.getElementById('switch-to-signup').addEventListener('click', function(e) {
        e.preventDefault();
        hideModal('login-modal');
        showModal('signup-modal');
    });

    document.getElementById('switch-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        hideModal('signup-modal');
        showModal('login-modal');
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var modal = btn.closest('.modal');
            hideModal(modal.id);
        });
    });

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

    // Mobile menu toggle
    document.querySelector('.mobile-menu-toggle').addEventListener('click', function() {
        var navMenu = document.querySelector('.nav-menu');
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });
}

function setupNavigation() {
    // Handle navigation clicks
    document.addEventListener('click', function(e) {
        if (e.target.matches('.nav-link')) {
            e.preventDefault();
            var href = e.target.getAttribute('href');
            var sectionId = href.substring(1); // Remove #
            showSection(sectionId);
        }
    });
}

function handleNavigation(e) {
    e.preventDefault();
    var href = e.target.getAttribute('href');
    var sectionId = href.substring(1); // Remove #
    
    // Check if user needs to be logged in
    if ((sectionId === 'wallet' || sectionId === 'admin') && !currentUser) {
        showModal('login-modal');
        return;
    }
    
    // Admin section requires admin privileges
    if (sectionId === 'admin' && (!currentUser || !currentUser.isAdmin)) {
        showMessage('Admin access required', 'error');
        return;
    }
    
    showSection(sectionId);
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(function(section) {
        section.classList.remove('active');
    });
    
    // Show target section
    var targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update content based on section
        if (sectionId === 'home' && currentUser) {
            document.getElementById('main-app').classList.remove('hidden');
            displayTransactions();
            displayVerifications();
        } else if (sectionId === 'wallet' && currentUser) {
            updateWalletDisplay();
        } else if (sectionId === 'admin' && currentUser && currentUser.isAdmin) {
            updateAdminDashboard();
        }
    }
}

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;
    
    // Simple authentication check
    var user = findUserByEmail(email);
    if (user && user.password === password) {
        currentUser = user;
        hideModal('login-modal');
        updateAuthUI();
        showMessage('Welcome back, ' + user.name + '!', 'success');
        loadUserTransactions();
        updateUI();
        
        // Show main app if on home page
        if (document.getElementById('home').classList.contains('active')) {
            document.getElementById('main-app').classList.remove('hidden');
        }
    } else {
        showMessage('Invalid email or password', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    var name = document.getElementById('signup-name').value;
    var email = document.getElementById('signup-email').value;
    var phone = document.getElementById('signup-phone').value;
    var password = document.getElementById('signup-password').value;
    
    // Check if user already exists
    if (findUserByEmail(email)) {
        showMessage('User with this email already exists', 'error');
        return;
    }
    
    // Create new user
    var userId = 'user_' + Date.now();
    var newUser = {
        id: userId,
        name: name,
        email: email,
        phone: phone,
        password: password,
        points: 0,
        pendingPoints: 0,
        redeemedPoints: 0,
        isAdmin: email === 'admin@greenpay.com' // Make admin@greenpay.com an admin
    };
    
    allUsers[userId] = newUser;
    currentUser = newUser;
    
    saveAllData();
    hideModal('signup-modal');
    updateAuthUI();
    showMessage('Welcome to GreenPay, ' + name + '!', 'success');
    
    // Show main app
    if (document.getElementById('home').classList.contains('active')) {
        document.getElementById('main-app').classList.remove('hidden');
    }
}

function logout() {
    currentUser = null;
    transactions = [];
    updateAuthUI();
    showSection('home');
    document.getElementById('main-app').classList.add('hidden');
    showMessage('Logged out successfully', 'success');
}

function updateAuthUI() {
    var authButtons = document.getElementById('auth-buttons');
    var userMenu = document.getElementById('user-menu');
    
    if (currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        document.getElementById('user-name').textContent = currentUser.name;
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

function checkAuthStatus() {
    var savedUserId = localStorage.getItem('greenpay_current_user');
    if (savedUserId && allUsers[savedUserId]) {
        currentUser = allUsers[savedUserId];
        loadUserTransactions();
        updateAuthUI();
    }
}

function findUserByEmail(email) {
    return Object.values(allUsers).find(function(user) {
        return user.email === email;
    });
}

function loadUserTransactions() {
    if (!currentUser) return;
    
    var allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    transactions = allTransactions.filter(function(tx) {
        return tx.userId === currentUser.id;
    });
}

function saveUserSession() {
    if (currentUser) {
        localStorage.setItem('greenpay_current_user', currentUser.id);
    } else {
        localStorage.removeItem('greenpay_current_user');
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
    if (!currentUser) {
        showMessage('Please login to make a purchase', 'error');
        showModal('login-modal');
        return;
    }

    var partner = document.getElementById('partner-select').value;
    var amount = document.getElementById('partner-amount').value;

    if (!partner || !amount) {
        showMessage('Please select a partner and enter amount', 'error');
        return;
    }

    showPaymentModal(amount, 'trusted', { partner: partner });
}

function processOpenPurchasePayment() {
    if (!currentUser) {
        showMessage('Please login to make a purchase', 'error');
        showModal('login-modal');
        return;
    }

    var amount = document.getElementById('open-amount').value;
    var analysisResult = document.getElementById('analysis-result');

    if (!amount || analysisResult.classList.contains('hidden')) {
        showMessage('Please analyze image and enter amount', 'error');
        return;
    }

    var ecoScore = lastAnalysisScore || 0;
    showPaymentModal(amount, 'open', { ecoScore: ecoScore });
}

function analyzeImage() {
    var fileInput = document.getElementById('bill-image');
    var file = fileInput.files[0];

    if (!file) {
        showMessage('Please select an image', 'error');
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

        showMessage('Payment successful! Earned ' + points + ' eco-points instantly!', 'success');

    } else if (type === 'open') {
        // Pending verification for open purchases
        var potentialPoints = Math.floor(amount * 0.05 * (data.ecoScore + 1)); // Variable points based on eco-score
        
        transaction.ecoScore = data.ecoScore;
        transaction.points = potentialPoints;
        transaction.description = 'Open purchase - awaiting verification';

        currentUser.pendingPoints += potentialPoints;
        
        // Add to verification tracking
        addToVerificationPool(transaction);
        
        showMessage('Payment successful! ' + potentialPoints + ' points pending verification', 'success');
    }

    transactions.push(transaction);
    saveAllData();
    updateUI();
    displayTransactions();
    displayVerifications();
    updateWalletDisplay();
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
    
    var firstTransaction = allTransactions.find(function(tx) { return tx.id === transactionIds[0]; });
    var totalPoints = transactionIds.length * firstTransaction.points;
    showMessage('🎉 Verification completed! Earned ' + totalPoints + ' total points!', 'success');
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

function updateWalletDisplay() {
    if (!currentUser) return;
    
    document.getElementById('wallet-total-points').textContent = currentUser.points;
    document.getElementById('wallet-pending-points').textContent = currentUser.pendingPoints || 0;
    document.getElementById('wallet-redeemed-points').textContent = currentUser.redeemedPoints || 0;
    
    // Display recent transactions in wallet
    var walletTransactionsList = document.getElementById('wallet-transactions');
    if (transactions.length === 0) {
        walletTransactionsList.innerHTML = '<p>No transactions yet</p>';
        return;
    }
    
    var recentTransactions = transactions.slice(0, 5); // Show last 5 transactions
    var transactionsHTML = '';
    recentTransactions.forEach(function(tx) {
        transactionsHTML += 
            '<div class="transaction-item ' + tx.status + '">' +
                '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                    '<span>₹' + tx.amount + ' - ' + tx.description + '</span>' +
                    '<span class="status-badge ' + tx.status + '">' + tx.points + ' pts</span>' +
                '</div>' +
            '</div>';
    });
    
    walletTransactionsList.innerHTML = transactionsHTML;
}

function updateAdminDashboard() {
    if (!currentUser || !currentUser.isAdmin) return;
    
    // Get all data for admin view
    var allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    var totalUsers = Object.keys(allUsers).length;
    var pendingVerifications = Object.keys(verificationData).filter(function(key) {
        return !verificationData[key].completed;
    }).length;
    
    // Update stats
    document.getElementById('admin-total-users').textContent = totalUsers;
    document.getElementById('admin-pending-verifications').textContent = pendingVerifications;
    document.getElementById('admin-total-transactions').textContent = allTransactions.length;
    
    // Display pending verifications
    var adminVerificationList = document.getElementById('admin-verification-list');
    if (pendingVerifications === 0) {
        adminVerificationList.innerHTML = '<p>No pending verifications</p>';
    } else {
        var verificationsHTML = '';
        Object.keys(verificationData).forEach(function(key) {
            if (!verificationData[key].completed) {
                var verification = verificationData[key];
                var progress = (verification.transactions.length / verification.requiredCount) * 100;
                verificationsHTML += 
                    '<div class="verification-item">' +
                        '<div><strong>' + verification.description + '</strong></div>' +
                        '<div>Progress: ' + verification.transactions.length + '/' + verification.requiredCount + ' (' + Math.round(progress) + '%)</div>' +
                    '</div>';
            }
        });
        adminVerificationList.innerHTML = verificationsHTML;
    }
    
    // Display all transactions
    var adminTransactionsList = document.getElementById('admin-transactions-list');
    if (allTransactions.length === 0) {
        adminTransactionsList.innerHTML = '<p>No transactions yet</p>';
    } else {
        var transactionsHTML = '';
        var sortedTransactions = allTransactions.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        sortedTransactions.slice(0, 10).forEach(function(tx) { // Show last 10 transactions
            var user = allUsers[tx.userId];
            transactionsHTML += 
                '<div class="transaction-item ' + tx.status + '">' +
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">' +
                        '<strong>₹' + tx.amount + '</strong>' +
                        '<span class="status-badge ' + tx.status + '">' + tx.status.toUpperCase() + '</span>' +
                    '</div>' +
                    '<div style="font-size: 0.9em; color: #666;">' +
                        'User: ' + (user ? user.name : 'Unknown') + '<br>' +
                        tx.description + '<br>' +
                        'Points: ' + tx.points + ' | ' + new Date(tx.timestamp).toLocaleDateString() +
                    '</div>' +
                '</div>';
        });
        adminTransactionsList.innerHTML = transactionsHTML;
    }
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
    document.getElementById('user-points').textContent = currentUser ? currentUser.points : 0;
}

function showMessage(message, type) {
    // Remove existing messages
    var existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(function(msg) {
        msg.remove();
    });

    var messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    var container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);

    // Auto-remove message after 5 seconds
    setTimeout(function() {
        messageDiv.remove();
    }, 5000);
}

// Data persistence methods
function loadAllData() {
    var savedUsers = localStorage.getItem('greenpay_all_users');
    allUsers = savedUsers ? JSON.parse(savedUsers) : {};
    
    var savedVerifications = localStorage.getItem('greenpay_verifications');
    verificationData = savedVerifications ? JSON.parse(savedVerifications) : {};
}

function saveAllData() {
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
    saveUserSession();
}
