console.log('✅ auth-page.js loaded successfully');

function switchTab(tab) {
    console.log('📌 Switching to tab:', tab);
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');

    if (tab === 'login') {
        tabs[0].classList.add('active');
        loginForm.classList.add('active');
    } else {
        tabs[1].classList.add('active');
        signupForm.classList.add('active');
    }
}

function loginUser() {
    // If Firebase init fails, make the problem visible in the UI.
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        const errorMsg = document.getElementById('loginError');
        errorMsg.textContent = 'Firebase not initialized. Please reload the page and check console errors.';
        return;
    }

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('loginError');

    if (!email || !password) {
        errorMsg.textContent = 'Please fill in all fields';
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Verify user is a tourist
            checkUserRole(userCredential.user.uid);
        })
        .catch(error => {
            errorMsg.textContent = 'Error: ' + error.message;
        });
}

function loginWithGoogle() {
    // If Firebase init fails, make the problem visible in the UI.
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        const errorMsg = document.getElementById('loginError');
        errorMsg.textContent = 'Firebase not initialized. Please reload the page and check console errors.';
        return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    const errorMsg = document.getElementById('loginError');
    errorMsg.textContent = 'Opening Google sign-in...';

    auth.signInWithPopup(provider)
        .then(result => {
            console.log('✅ Google sign-in successful:', result.user.email);
            checkUserRole(result.user.uid);
        })
        .catch(error => {
            console.error('❌ Google sign-in error:', error);
            errorMsg.textContent = 'Error: ' + (error.message || error);
        });
}

function signupWithGoogle() {
    // If Firebase init fails, make the problem visible in the UI.
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        const errorMsg = document.getElementById('signupError');
        errorMsg.textContent = 'Firebase not initialized. Please reload the page and check console errors.';
        return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    const errorMsg = document.getElementById('signupError');

    errorMsg.textContent = 'Opening Google sign-in...';
    console.log('Starting Google sign-in...');

    auth.signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            console.log('✅ Google login successful:', user.email);

            // Check if user already exists
            return db.collection('users').doc(user.uid).get().then(doc => {
                if (!doc.exists) {
                    // Create new tourist user
                    console.log('Creating new tourist user...');
                    return db.collection('users').doc(user.uid).set({
                        name: user.displayName,
                        email: user.email,
                        phone: '',
                        role: 'tourist',
                        photoURL: user.photoURL,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else if (doc.data().role !== 'tourist') {
                    // User exists but is not a tourist
                    auth.signOut();
                    errorMsg.textContent = 'This account is not registered as a tourist. Please contact admin.';
                    return Promise.reject('Not a tourist account');
                }
            }).then(() => {
                document.getElementById('signupError').textContent = '';
                document.getElementById('authSuccess').textContent = '✅ Sign up successful! Redirecting...';
                setTimeout(() => {
                    window.location.href = 'guides.html';
                }, 2000);
            });
        })
        .catch(error => {
            console.error('❌ Google sign-in error:', error);
            if (error === 'Not a tourist account') {
                // Error already set above
            } else {
                errorMsg.textContent = 'Error: ' + (error.message || error);
            }
        });
}

function signupWithEmail() {
    // If Firebase init fails, make the problem visible in the UI.
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        const errorMsg = document.getElementById('signupError');
        errorMsg.textContent = 'Firebase not initialized. Please reload the page and check console errors.';
        return;
    }

    const nameEl = document.getElementById('signupName');
    const name = (nameEl && nameEl.value ? nameEl.value : '').trim();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorMsg = document.getElementById('signupError');

    if (!email || !password) {
        errorMsg.textContent = 'Please fill in all required fields';
        return;
    }

    errorMsg.textContent = 'Creating account...';
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            return db.collection('users').doc(user.uid).set({
                name: name || user.displayName || '',
                email: user.email,
                phone: '',
                role: 'tourist',
                photoURL: user.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            document.getElementById('signupError').textContent = '';
            document.getElementById('authSuccess').textContent = '✅ Sign up successful! Redirecting...';
            setTimeout(() => {
                window.location.href = 'guides.html';
            }, 2000);
        })
        .catch(error => {
            console.error('❌ Email sign-up error:', error);
            errorMsg.textContent = 'Error: ' + (error.message || error);
        });
}

function checkUserRole(userId) {
    db.collection('users').doc(userId).get().then(doc => {
        if (doc.exists) {
            const userRole = doc.data().role;
            if (userRole === 'tourist') {
                // Tourist - allow login
                localStorage.setItem('userData', JSON.stringify(doc.data()));
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Not a tourist
                auth.signOut();
                document.getElementById('loginError').textContent = 'This account is not a tourist account. Please contact admin.';
            }
        } else {
            // User doesn't exist
            document.getElementById('loginError').textContent = 'User profile not found.';
        }
    });
}

function loadUserData(userId) {
    db.collection('users').doc(userId).get().then(doc => {
        if (doc.exists) {
            localStorage.setItem('userData', JSON.stringify(doc.data()));
        }
    });
}

// Ensure inline onclick handlers can always find these functions.
// (Some browsers can shadow globals via element ids/names, so this makes it explicit.)
window.switchTab = switchTab;
window.loginUser = loginUser;
window.loginWithGoogle = loginWithGoogle;
window.signupWithGoogle = signupWithGoogle;
window.signupWithEmail = signupWithEmail;
