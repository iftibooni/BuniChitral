// Load the current user from Firebase
let currentUser = null;

auth.onAuthStateChanged(user => {
    currentUser = user;
    updateNavbar();
});

function updateNavbar() {
    const authLink = document.getElementById('authLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        if (authLink) authLink.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        if (authLink) authLink.style.display = 'block';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

function logout() {
    auth.signOut().then(() => {
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    }).catch(error => {
        console.error('Logout error:', error);
    });
}

function requireLogin() {
    if (!currentUser) {
        alert('Please login first to continue');
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}
