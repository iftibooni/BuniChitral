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

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    const totalAmount = days * dailyRate;

    const booking = {
        guideId: selectedGuide.id,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        guideName: selectedGuide.name,
        startDate: firebase.firestore.Timestamp.fromDate(new Date(startDate)),
        endDate: firebase.firestore.Timestamp.fromDate(endDate),
        numberOfPeople: 1,
        totalAmount: totalAmount,
        currency: 'PKR',
        specialRequests: specialRequests,
        paymentStatus: 'pending',
        bookingStatus: 'pending_payment',
        paymentMethod: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Show loading state
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating booking...';

    db.collection('bookings').add(booking)
        .then((docRef) => {
            console.log('✅ Booking created:', docRef.id);
            alert('Booking created! Proceeding to payment...');
            // Redirect to payment page
            window.location.href = `payment-confirmation.html?booking=${docRef.id}`;
        })
        .catch(error => {
            console.error('Error creating booking:', error);
            errorMsg.textContent = 'Error creating booking. Please try again.';
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
}
