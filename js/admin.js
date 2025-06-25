
// Admin page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    setupAdminPage();
});

function setupAdminPage() {
    const currentUser = window.GreenPayCommon.currentUser();
    const accessDenied = document.getElementById('admin-access-denied');
    const adminContent = document.getElementById('admin-content');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    
    if (!currentUser || !currentUser.isAdmin) {
        accessDenied.classList.remove('hidden');
        adminContent.classList.add('hidden');
        
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', function() {
                window.location.href = 'index.html#login';
            });
        }
    } else {
        accessDenied.classList.add('hidden');
        adminContent.classList.remove('hidden');
        updateAdminDashboard();
    }
}

function updateAdminDashboard() {
    const currentUser = window.GreenPayCommon.currentUser();
    if (!currentUser || !currentUser.isAdmin) return;
    
    const allUsers = window.GreenPayCommon.allUsers();
    const allTransactions = JSON.parse(localStorage.getItem('greenpay_all_transactions') || '[]');
    
    const totalUsers = Object.keys(allUsers).length;
    const pendingTransactions = allTransactions.filter(tx => tx.status === 'pending').length;
    
    // Update stats
    const totalUsersElement = document.getElementById('admin-total-users');
    const pendingVerificationsElement = document.getElementById('admin-pending-verifications');
    const totalTransactionsElement = document.getElementById('admin-total-transactions');
    
    if (totalUsersElement) totalUsersElement.textContent = totalUsers;
    if (pendingVerificationsElement) pendingVerificationsElement.textContent = pendingTransactions;
    if (totalTransactionsElement) totalTransactionsElement.textContent = allTransactions.length;
    
    // Display pending verifications
    const adminVerificationList = document.getElementById('admin-verification-list');
    if (pendingTransactions === 0) {
        adminVerificationList.innerHTML = '<p>No pending verifications</p>';
    } else {
        let verificationsHTML = '';
        allTransactions.filter(tx => tx.status === 'pending').forEach(function(tx) {
            const user = allUsers[tx.userId];
            verificationsHTML += 
                '<div class="verification-item">' +
                    '<div><strong>₹' + tx.amount + ' - ' + tx.description + '</strong></div>' +
                    '<div>User: ' + (user ? user.name : 'Unknown') + ' | Points: ' + tx.points + '</div>' +
                '</div>';
        });
        adminVerificationList.innerHTML = verificationsHTML;
    }
    
    // Display recent transactions
    const adminTransactionsList = document.getElementById('admin-transactions-list');
    if (allTransactions.length === 0) {
        adminTransactionsList.innerHTML = '<p>No transactions yet</p>';
    } else {
        let transactionsHTML = '';
        const sortedTransactions = allTransactions.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        sortedTransactions.slice(0, 10).forEach(function(tx) {
            const user = allUsers[tx.userId];
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
