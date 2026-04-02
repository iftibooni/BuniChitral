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
            // Load user profile and redirect
            loadUserData(userCredential.user.uid);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch(error => {
            errorMsg.textContent = 'Error: ' + error.message;
        });
}

function signupUser() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;
    const phone = document.getElementById('signupPhone').value;
    const errorMsg = document.getElementById('signupError');

    if (!name || !email || !password || !role) {
        errorMsg.textContent = 'Please fill in all required fields';
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = 'Password must be at least 6 characters';
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const userId = userCredential.user.uid;

            // Save user data to Firestore
            return db.collection('users').doc(userId).set({
                name: name,
                email: email,
                phone: phone,
                role: role,
                createdAt: new Date(),
                rating: role === 'guide' ? 0 : null,
                reviews: role === 'guide' ? 0 : null
            }).then(() => {
                document.getElementById('signupError').textContent = '';
                document.getElementById('authSuccess').textContent = 'Account created successfully! Redirecting...';
                setTimeout(() => {
                    window.location.href = role === 'guide' ? 'dashboard.html' : 'guides.html';
                }, 2000);
            });
        })
        .catch(error => {
            errorMsg.textContent = 'Error: ' + error.message;
        });
}

function loadUserData(userId) {
    db.collection('users').doc(userId).get().then(doc => {
        if (doc.exists) {
            localStorage.setItem('userData', JSON.stringify(doc.data()));
        }
    });
}
