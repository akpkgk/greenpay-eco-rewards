
// Authentication page functionality
document.addEventListener('DOMContentLoaded', function() {
    setupAuthEventListeners();
    checkAuthStatus();
    updateAuthUI();
});

function setupAuthEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Navigation auth buttons
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
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple authentication check
    const user = window.GreenPayCommon.findUserByEmail(email);
    if (user && user.password === password) {
        localStorage.setItem('greenpay_current_user', user.id);
        window.GreenPayCommon.setCurrentUser(user);
        window.GreenPayCommon.showMessage('Welcome back, ' + user.name + '!', 'success');
        
        // Redirect to home page
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
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
    
    // Check if user already exists
    if (window.GreenPayCommon.findUserByEmail(email)) {
        window.GreenPayCommon.showMessage('User with this email already exists', 'error');
        return;
    }
    
    // Create new user
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
    
    const allUsers = window.GreenPayCommon.allUsers();
    allUsers[userId] = newUser;
    localStorage.setItem('greenpay_all_users', JSON.stringify(allUsers));
    localStorage.setItem('greenpay_current_user', userId);
    
    window.GreenPayCommon.setCurrentUser(newUser);
    window.GreenPayCommon.showMessage('Welcome to GreenPay, ' + name + '!', 'success');
    
    // Redirect to home page
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1000);
}

function logout() {
    localStorage.removeItem('greenpay_current_user');
    window.GreenPayCommon.setCurrentUser(null);
    window.GreenPayCommon.showMessage('Logged out successfully', 'success');
    window.location.href = 'index.html';
}

function checkAuthStatus() {
    const savedUserId = localStorage.getItem('greenpay_current_user');
    const allUsers = window.GreenPayCommon.allUsers();
    if (savedUserId && allUsers[savedUserId]) {
        window.GreenPayCommon.setCurrentUser(allUsers[savedUserId]);
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const currentUser = window.GreenPayCommon.currentUser();
    
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
