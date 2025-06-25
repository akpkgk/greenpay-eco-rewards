
// Wallet page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    setupWalletPage();
    setupWalletEventListeners();
});

function setupWalletPage() {
    const currentUser = window.GreenPayCommon.currentUser();
    const loginRequired = document.getElementById('login-required');
    const walletContent = document.getElementById('wallet-content');
    const walletLoginBtn = document.getElementById('wallet-login-btn');
    
    if (!currentUser) {
        loginRequired.classList.remove('hidden');
        walletContent.classList.add('hidden');
        
        if (walletLoginBtn) {
            walletLoginBtn.addEventListener('click', function() {
                window.location.href = 'index.html#login';
            });
        }
    } else {
        loginRequired.classList.add('hidden');
        walletContent.classList.remove('hidden');
        updateWalletDisplay();
    }
}

function setupWalletEventListeners() {
    // Redeem points button
    const redeemBtn = document.querySelector('.wallet-btn:not(.secondary)');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', function() {
            window.GreenPayCommon.showMessage('Redemption feature coming soon!', 'success');
        });
    }
    
    // View history button
    const historyBtn = document.querySelector('.wallet-btn.secondary');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            window.GreenPayCommon.showMessage('Detailed history view coming soon!', 'success');
        });
    }
}

function updateWalletDisplay() {
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) return;
    
    const totalPointsElement = document.getElementById('wallet-total-points');
    const pendingPointsElement = document.getElementById('wallet-pending-points');
    const redeemedPointsElement = document.getElementById('wallet-redeemed-points');
    
    if (totalPointsElement) totalPointsElement.textContent = currentUser.points || 0;
    if (pendingPointsElement) pendingPointsElement.textContent = currentUser.pendingPoints || 0;
    if (redeemedPointsElement) redeemedPointsElement.textContent = currentUser.redeemedPoints || 0;
    
    // Load and display recent transactions
    loadWalletTransactions();
}

function loadWalletTransactions() {
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser) return;
    
    const allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    const userTransactions = allTransactions.filter(function(tx) {
        return tx.userId === currentUser.id;
    });
    
    const walletTransactionsList = document.getElementById('wallet-transactions');
    if (userTransactions.length === 0) {
        walletTransactionsList.innerHTML = '<p>No transactions yet</p>';
        return;
    }
    
    const recentTransactions = userTransactions.slice(0, 5);
    let transactionsHTML = '';
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
