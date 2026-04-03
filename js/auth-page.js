function switchTab(tab) {
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

function signupWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const errorMsg = document.getElementById('signupError');

    auth.signInWithPopup(provider)
        .then(result => {
            const user = result.user;

            // Check if user already exists
            return db.collection('users').doc(user.uid).get().then(doc => {
                if (!doc.exists) {
                    // Create new tourist user
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
            if (error === 'Not a tourist account') {
                // Error already set above
            } else {
                errorMsg.textContent = 'Error: ' + error.message;
            }
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
