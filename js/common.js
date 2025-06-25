// Common functionality across all pages
let currentUser = null;
let allUsers = {};

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    setupCommonEventListeners();
    checkAuthStatus();
    updateAuthUI();
});

function setupCommonEventListeners() {
    // Authentication buttons
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            window.location.href = 'signup.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

function checkAuthStatus() {
    const savedUserId = localStorage.getItem('greenpay_current_user');
    if (savedUserId && allUsers[savedUserId]) {
        currentUser = allUsers[savedUserId];
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (currentUser) {
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            const userName = document.getElementById('user-name');
            if (userName) userName.textContent = currentUser.name;
        }
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('greenpay_current_user');
    updateAuthUI();
    showMessage('Logged out successfully', 'success');
    window.location.href = 'index.html';
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
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);

        // Auto-remove message after 5 seconds
        setTimeout(function() {
            messageDiv.remove();
        }, 5000);
    }
}

function loadAllData() {
    const savedUsers = localStorage.getItem('greenpay_all_users');
    allUsers = savedUsers ? JSON.parse(savedUsers) : {};
}

function findUserByEmail(email) {
    return Object.values(allUsers).find(function(user) {
        return user.email === email;
    });
}

// Export functions for other scripts
window.GreenPayCommon = {
    currentUser: function() { return currentUser; },
    setCurrentUser: function(user) { 
        currentUser = user; 
        updateAuthUI();
    },
    allUsers: function() { return allUsers; },
    setAllUsers: function(users) { allUsers = users; },
    findUserByEmail: findUserByEmail,
    showMessage: showMessage,
    loadAllData: loadAllData
};
