// JazzCash Payment Gateway for BuniChitral

// Configuration
const JAZZ_CONFIG = {
    accountName: "BuniChitral Services",
    accountPhone: "+92 300-XXXX", // Replace with actual JazzCash account
    accountType: "wallet", // JazzCash wallet account
    serviceFeePercent: 5 // 5% service fee
};

let currentBooking = null;
let selectedPaymentMethod = "jazzcash";

// Initialize payment page
document.addEventListener('DOMContentLoaded', initializePaymentPage);

function initializePaymentPage() {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking');

    if (!bookingId) {
        alert("Error: No booking found. Please go back and try again.");
        window.location.href = 'guides.html';
        return;
    }

    loadBookingDetails(bookingId);
}

// Load booking details from Firestore
async function loadBookingDetails(bookingId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        const bookingDoc = await db.collection("bookings").doc(bookingId).get();

        if (!bookingDoc.exists) {
            alert("Booking not found!");
            window.location.href = 'guides.html';
            return;
        }

        currentBooking = {
            id: bookingId,
            ...bookingDoc.data()
        };

        // Verify ownership
        if (currentBooking.userId !== user.uid) {
            alert("You don't have permission to access this booking.");
            window.location.href = 'dashboard.html';
            return;
        }

        displayBookingInfo();
    } catch (error) {
        console.error("Error loading booking:", error);
        alert("Error loading booking details: " + error.message);
        window.location.href = 'guides.html';
    }
}

// Display booking information
function displayBookingInfo() {
    if (!currentBooking) return;

    const startDate = currentBooking.startDate.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const endDate = currentBooking.endDate.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Update UI with booking details
    document.getElementById('guideName').textContent = currentBooking.guideName;
    document.getElementById('tripDates').textContent = `${startDate} - ${endDate}`;
    document.getElementById('guideFee').textContent = `Rs. ${currentBooking.totalAmount}`;

    // Calculate service fee
    const serviceFee = Math.round(currentBooking.totalAmount * JAZZ_CONFIG.serviceFeePercent / 100);
    const totalAmount = currentBooking.totalAmount + serviceFee;

    document.getElementById('serviceFee').textContent = `Rs. ${serviceFee}`;
    document.getElementById('totalAmount').textContent = `Rs. ${totalAmount}`;
    document.getElementById('paymentAmount').textContent = `Rs. ${totalAmount}`;
    document.getElementById('bookingRef').textContent = currentBooking.id.substring(0, 12);

    // Store for later
    currentBooking.serviceFee = serviceFee;
    currentBooking.totalWithFee = totalAmount;
}

// Select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Update UI
    document.querySelectorAll('.method-card').forEach(card => {
        card.classList.remove('active');
    });

    if (method === 'jazzcash') {
        document.querySelector('.jazzcash-method').classList.add('active');
    }
}

// Proceed to payment
function proceedToPayment() {
    if (selectedPaymentMethod === 'jazzcash') {
        document.getElementById('methodSelection').style.display = 'none';
        document.getElementById('jazzcashPayment').style.display = 'block';
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');

        // Generate QR code
        generateJazzCashQR();
    }
}

// Generate JazzCash QR Code
function generateJazzCashQR() {
    // Clear previous QR code
    document.getElementById('qrcode').innerHTML = '';

    if (!currentBooking) return;

    // JazzCash payment format for QR code
    // Format: jazzcash://wallet/{phone}/{amount}/{message}
    const qrData = `jazzcash://wallet/${JAZZ_CONFIG.accountPhone}/${currentBooking.totalWithFee}/BuniChitral-${currentBooking.id.substring(0, 8)}`;

    // Generate QR code
    new QRCode(document.getElementById('qrcode'), {
        text: qrData,
        width: 250,
        height: 250,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    console.log("QR Code generated for:", qrData);
}

// Go back to payment method selection
function goBackToMethod() {
    document.getElementById('jazzcashPayment').style.display = 'none';
    document.getElementById('methodSelection').style.display = 'block';
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
}

// Toggle confirm button
function toggleConfirmButton() {
    const isChecked = document.getElementById('paymentConfirm').checked;
    document.getElementById('confirmPaymentBtn').disabled = !isChecked;
}

// Complete payment
async function completePayment() {
    if (!currentBooking) {
        alert("Error: Booking not found");
        return;
    }

    try {
        console.log("💳 Processing JazzCash payment...");

        // Create payment record in Firestore
        const paymentRef = await db.collection("payments").add({
            bookingId: currentBooking.id,
            userId: currentBooking.userId,
            amount: currentBooking.totalWithFee,
            guideFee: currentBooking.totalAmount,
            serviceFee: currentBooking.serviceFee,
            currency: "PKR",
            method: "jazzcash",
            phoneNumber: JAZZ_CONFIG.accountPhone,
            status: "confirmed",
            referenceNumber: currentBooking.id.substring(0, 12),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            paymentDate: new Date().toISOString()
        });

        console.log("✅ Payment record created:", paymentRef.id);

        // Update booking status
        await db.collection("bookings").doc(currentBooking.id).update({
            paymentStatus: "confirmed",
            bookingStatus: "confirmed",
            paymentMethod: "jazzcash",
            paymentId: paymentRef.id,
            confirmedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Booking status updated to confirmed");

        // Send confirmation notification (optional - requires Cloud Functions)
        try {
            await db.collection("notifications").add({
                userId: currentBooking.userId,
                type: "payment_confirmed",
                email: currentBooking.userEmail,
                subject: `✅ Payment Confirmed - ${currentBooking.guideName}`,
                data: {
                    bookingId: currentBooking.id,
                    guideName: currentBooking.guideName,
                    amount: currentBooking.totalWithFee,
                    reference: currentBooking.id.substring(0, 12)
                },
                sent: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("📧 Confirmation notification queued");
        } catch (notifyErr) {
            console.warn("Notification queueing failed (non-critical):", notifyErr);
        }

        // Show success page
        showSuccess();

    } catch (error) {
        console.error("❌ Payment error:", error);
        alert("Error confirming payment: " + error.message);
    }
}

// Show success page
function showSuccess() {
    // Hide payment form
    document.getElementById('jazzcashPayment').style.display = 'none';
    document.getElementById('paymentComplete').style.display = 'block';

    // Update success page
    document.getElementById('confirmBookingId').textContent = currentBooking.id;
    document.getElementById('confirmAmount').textContent = `Rs. ${currentBooking.totalWithFee}`;

    // Update steps
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');

    console.log("✅ Payment completed successfully!");
}

// Go to dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Handle back button
window.addEventListener('popstate', function() {
    if (confirm('Are you sure you want to leave? Your payment may not be processed.')) {
        window.history.back();
    } else {
        window.history.forward();
    }
});
