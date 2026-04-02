// Dashboard Management System for BuniChitral

let currentFilter = 'all';

// Check authentication on page load
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'auth.html';
    } else {
        loadDashboard();
    }
});

function loadDashboard() {
    loadUserProfile();
    displayBookings();
    displayUserReviews();
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');

    // Reload content when switching tabs
    if (tabName === 'reviews') {
        displayUserReviews();
    } else if (tabName === 'profile') {
        loadUserProfile();
    }
}

// ===== USER PROFILE =====
async function loadUserProfile() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        // Get user data from Firestore
        const userDoc = await db.collection("users").doc(user.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            document.querySelector('#userInfo h3').textContent = userData.displayName || "User";
            document.getElementById('userEmail').textContent = user.email;

            // Fill profile form
            document.getElementById('fullName').value = userData.displayName || "";
            document.getElementById('phone').value = userData.phone || "";
            document.getElementById('country').value = userData.country || "Pakistan";
            document.getElementById('language').value = userData.language || "English";
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function saveProfile() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const profileData = {
            displayName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            country: document.getElementById('country').value,
            language: document.getElementById('language').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Update Firebase Auth profile
        if (profileData.displayName) {
            await user.updateProfile({
                displayName: profileData.displayName
            });
        }

        // Update Firestore user document
        await db.collection("users").doc(user.uid).update(profileData);

        alert("✅ Profile updated successfully!");
        loadUserProfile();
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("❌ Error: " + error.message);
    }
}

// ===== BOOKINGS MANAGEMENT =====
async function displayBookings() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        let query = db.collection("bookings").where("userId", "==", user.uid);

        if (currentFilter !== 'all') {
            query = query.where("bookingStatus", "==", currentFilter);
        }

        const snapshot = await query.orderBy("createdAt", "desc").get();
        const container = document.getElementById('bookingsList');

        container.innerHTML = "";

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No bookings yet</p>
                    <a href="guides.html" class="btn btn-primary">Browse Guides</a>
                    <a href="plans.html" class="btn btn-secondary">View Plans</a>
                </div>
            `;
            return;
        }

        snapshot.forEach(doc => {
            const booking = doc.data();
            const startDate = booking.startDate.toDate().toLocaleDateString();
            const endDate = booking.endDate.toDate().toLocaleDateString();

            const statusBadge = {
                "confirmed": "✅ Confirmed",
                "pending_payment": "⏳ Awaiting Payment",
                "pending_confirmation": "⏳ Pending",
                "cancelled": "❌ Cancelled"
            }[booking.bookingStatus] || booking.bookingStatus;

            const bookingHTML = `
                <div class="booking-card">
                    <div class="booking-header">
                        <div>
                            <h4>${booking.guideName}</h4>
                            <small>${startDate} to ${endDate}</small>
                        </div>
                        <span class="status-badge">${statusBadge}</span>
                    </div>
                    <div class="booking-details">
                        <p><strong>Guests:</strong> ${booking.numberOfPeople}</p>
                        <p><strong>Amount:</strong> ${booking.totalAmount} ${booking.currency}</p>
                        <p><strong>Payment:</strong> ${booking.paymentStatus}</p>
                    </div>
                    <div class="booking-actions">
                        <button onclick="viewBookingDetails('${doc.id}')" class="btn btn-small">View Details</button>
                        ${booking.bookingStatus !== "cancelled" ?
                            `<button onclick="cancelBooking('${doc.id}')" class="btn btn-small btn-danger">Cancel</button>`
                            : ""
                        }
                    </div>
                </div>
            `;
            container.innerHTML += bookingHTML;
        });
    } catch (error) {
        console.error("Error displaying bookings:", error);
        document.getElementById('bookingsList').innerHTML = "<p>Error loading bookings</p>";
    }
}

function filterBookings(status) {
    currentFilter = status;

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    displayBookings();
}

async function viewBookingDetails(bookingId) {
    try {
        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) return;

        const data = booking.data();
        alert(`
📅 BOOKING DETAILS

Guide: ${data.guideName}
Dates: ${data.startDate.toDate().toLocaleDateString()} - ${data.endDate.toDate().toLocaleDateString()}
Guests: ${data.numberOfPeople}
Total: ${data.totalAmount} ${data.currency}
Status: ${data.bookingStatus}
Payment: ${data.paymentStatus}
${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ""}
        `);
    } catch (error) {
        console.error("Error:", error);
    }
}

// ===== REVIEWS =====
async function displayUserReviews() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const snapshot = await db.collection("reviews")
            .where("userId", "==", user.uid)
            .orderBy("date", "desc")
            .get();

        const container = document.getElementById('reviewsList');
        container.innerHTML = "";

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>You haven't left any reviews yet</p>
                    <a href="guides.html" class="btn btn-primary">Browse and Review Guides</a>
                </div>
            `;
            return;
        }

        snapshot.forEach(doc => {
            const review = doc.data();
            const reviewDate = review.date.toDate().toLocaleDateString();

            const reviewHTML = `
                <div class="review-card">
                    <div class="review-header">
                        <div>
                            <strong>Guide: ${review.guideName}</strong>
                            <div class="stars">${"⭐".repeat(review.rating)}</div>
                        </div>
                        <small>${reviewDate}</small>
                    </div>
                    <p class="review-text">${review.comment}</p>
                    <button onclick="deleteReview('${doc.id}')" class="btn-delete">Delete</button>
                </div>
            `;
            container.innerHTML += reviewHTML;
        });
    } catch (error) {
        console.error("Error displaying reviews:", error);
    }
}

async function deleteReview(reviewId) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
        await db.collection("reviews").doc(reviewId).delete();
        alert("✅ Review deleted");
        displayUserReviews();
    } catch (error) {
        console.error("Error deleting review:", error);
        alert("❌ Error: " + error.message);
    }
}

