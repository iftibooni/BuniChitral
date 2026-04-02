let selectedGuide = null;
let dailyRate = 0;

document.addEventListener('DOMContentLoaded', loadBookingPage);

function loadBookingPage() {
    if (!requireLogin()) return;

    const params = new URLSearchParams(window.location.search);
    const guideId = params.get('guide');

    if (!guideId) {
        document.getElementById('bookingDetails').innerHTML = '<p>Error: No guide selected. <a href="guides.html">Go back to guides</a></p>';
        return;
    }

    db.collection('users').doc(guideId).get()
        .then(doc => {
            if (doc.exists) {
                selectedGuide = { id: doc.id, ...doc.data() };
                dailyRate = selectedGuide.dailyRate || 3000;

                document.getElementById('bookingDetails').innerHTML = `
                    <h3>${selectedGuide.name}</h3>
                    <p><strong>Daily Rate:</strong> Rs. ${dailyRate}</p>
                    <p><strong>Experience:</strong> ${selectedGuide.experience || 'Intermediate'}</p>
                    <p><strong>Rating:</strong> ⭐ ${(selectedGuide.rating || 0).toFixed(1)}</p>
                `;

                // Update total price when days change
                document.getElementById('days').addEventListener('change', updateTotalPrice);
                updateTotalPrice();
            }
        })
        .catch(error => {
            console.error('Error loading guide:', error);
            document.getElementById('bookingDetails').innerHTML = '<p>Error loading guide details. Please try again.</p>';
        });
}

function updateTotalPrice() {
    const days = parseInt(document.getElementById('days').value) || 1;
    const total = days * dailyRate;
    document.getElementById('totalPrice').textContent = `Rs. ${total}`;
}

function submitBooking() {
    if (!currentUser) {
        alert('Please login to continue');
        return;
    }

    if (!selectedGuide) {
        alert('Guide information missing');
        return;
    }

    const startDate = document.getElementById('startDate').value;
    const days = parseInt(document.getElementById('days').value);
    const specialRequests = document.getElementById('specialRequests').value;
    const errorMsg = document.getElementById('bookingError');

    if (!startDate || !days) {
        errorMsg.textContent = 'Please fill in all required fields';
        return;
    }

    const booking = {
        guideId: selectedGuide.id,
        userId: currentUser.uid,
        guideName: selectedGuide.name,
        date: new Date(startDate),
        days: days,
        specialRequests: specialRequests,
        totalPrice: days * dailyRate,
        status: 'pending',
        createdAt: new Date()
    };

    db.collection('bookings').add(booking)
        .then(() => {
            alert('Booking confirmed! Check your dashboard for details.');
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error('Error creating booking:', error);
            errorMsg.textContent = 'Error creating booking. Please try again.';
        });
}
