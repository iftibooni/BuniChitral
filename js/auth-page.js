console.log('✅ auth-page.js loaded successfully');

function formatAuthError(error) {
    if (!error) return 'Unknown error';
    if (error === 'Not a tourist account') return error;
    if (error.code === 'auth/unauthorized-domain') {
        return (
            'This domain is not authorized for Google sign-in. In the Firebase Console, go to ' +
            'Authentication → Settings → Authorized domains, and add: ' +
            window.location.hostname +
            ' (and localhost if you test locally).'
        );
    }
    return error.message || String(error);
}

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
            checkUserRole(userCredential.user.uid);
        })
        .catch(error => {
            errorMsg.textContent = 'Error: ' + formatAuthError(error);
        });
}

function loginWithGoogle() {
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
            errorMsg.textContent = 'Error: ' + formatAuthError(error);
        });
}

function signupWithGoogle() {
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

            return db.collection('users').doc(user.uid).get().then(doc => {
                if (!doc.exists) {
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
                return;
            }
            errorMsg.textContent = 'Error: ' + formatAuthError(error);
        });
}

function signupWithEmail() {
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
            errorMsg.textContent = 'Error: ' + formatAuthError(error);
        });
}

function checkUserRole(userId) {
    db.collection('users').doc(userId).get().then(doc => {
        if (doc.exists) {
            const userRole = doc.data().role;
            if (userRole === 'tourist') {
                localStorage.setItem('userData', JSON.stringify(doc.data()));
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                auth.signOut();
                document.getElementById('loginError').textContent = 'This account is not a tourist account. Please contact admin.';
            }
        } else {
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

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            switchTab(this.getAttribute('data-tab'));
        });
    });

    const btnLogin = document.getElementById('btnLogin');
    const btnLoginGoogle = document.getElementById('btnLoginGoogle');
    const btnSignupGoogle = document.getElementById('btnSignupGoogle');
    const btnSignupEmail = document.getElementById('btnSignupEmail');

    if (btnLogin) btnLogin.addEventListener('click', loginUser);
    if (btnLoginGoogle) btnLoginGoogle.addEventListener('click', loginWithGoogle);
    if (btnSignupGoogle) btnSignupGoogle.addEventListener('click', signupWithGoogle);
    if (btnSignupEmail) btnSignupEmail.addEventListener('click', signupWithEmail);
});
