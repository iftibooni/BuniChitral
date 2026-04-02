// Payment System for BuniChitral
// Supports both Stripe (international) and JazzCash (Pakistan)

// Initialize Stripe (add your publishable key)
const stripePublishableKey = "pk_test_YOUR_STRIPE_KEY"; // Replace with your Stripe key
if (stripePublishableKey !== "pk_test_YOUR_STRIPE_KEY") {
    // var stripe = Stripe(stripePublishableKey);
}

// Create a booking with payment
async function createBooking(bookingData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please login to book");
            window.location.href = "auth.html";
            return;
        }

        const booking = {
            userId: user.uid,
            userEmail: user.email,
            guideId: bookingData.guideId,
            planId: bookingData.planId || null,
            guideName: bookingData.guideName,
            startDate: new Date(bookingData.startDate),
            endDate: new Date(bookingData.endDate),
            numberOfPeople: bookingData.numberOfPeople,
            totalAmount: bookingData.totalAmount,
            currency: "PKR", // Pakistani Rupee
            paymentStatus: "pending",
            bookingStatus: "pending_confirmation",
            paymentMethod: bookingData.paymentMethod, // "stripe" or "jazzcash"
            specialRequests: bookingData.specialRequests || "",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection("bookings").add(booking);
        console.log("✅ Booking created with ID:", docRef.id);

        return {
            bookingId: docRef.id,
            booking: booking
        };
    } catch (error) {
        console.error("❌ Error creating booking:", error);
        alert("Error: " + error.message);
    }
}

// Process payment via Stripe
async function processStripePayment(bookingId, amount, email) {
    try {
        // This would normally call your backend to create a payment intent
        // For now, we'll use a simplified approach

        console.log("💳 Processing Stripe payment...");
        console.log("Amount:", amount, "PKR");
        console.log("Email:", email);

        // Record payment attempt
        await db.collection("payments").add({
            bookingId: bookingId,
            amount: amount,
            currency: "PKR",
            method: "stripe",
            status: "initiated",
            paymentIntentId: `pi_${Date.now()}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("For Stripe payments, you need a backend API.\nPlease integrate with your server.");

        return false;
    } catch (error) {
        console.error("❌ Stripe payment error:", error);
        alert("Error: " + error.message);
    }
}

// Process payment via JazzCash (Pakistan)
async function processJazzCashPayment(bookingId, amount, phoneNumber) {
    try {
        console.log("📱 Processing JazzCash payment...");
        console.log("Amount:", amount, "PKR");
        console.log("Phone:", phoneNumber);

        // JazzCash requires integration with their API
        // This is a template for integration

        const jazzcashPayment = {
            bookingId: bookingId,
            amount: amount,
            currency: "PKR",
            phoneNumber: phoneNumber,
            method: "jazzcash",
            status: "pending",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("payments").add(jazzcashPayment);

        alert("💳 JazzCash Payment\n\nAmount: " + amount + " PKR\n\nTo complete this payment, please:\n1. Go to your JazzCash app\n2. Initiate a payment\n3. Reference booking: " + bookingId);

        // Update booking status
        await db.collection("bookings").doc(bookingId).update({
            paymentStatus: "processing",
            bookingStatus: "pending_payment"
        });

        return true;
    } catch (error) {
        console.error("❌ JazzCash payment error:", error);
        alert("Error: " + error.message);
    }
}

// Confirm payment (backend would do this after webhook)
async function confirmPayment(bookingId, paymentStatus) {
    try {
        const status = paymentStatus === "success" ? "confirmed" : "failed";

        await db.collection("bookings").doc(bookingId).update({
            paymentStatus: paymentStatus,
            bookingStatus: status === "confirmed" ? "confirmed" : "cancelled"
        });

        console.log(`✅ Payment status updated: ${paymentStatus}`);

        // Send confirmation email (you'd do this on backend)
        if (paymentStatus === "success") {
            console.log("📧 Confirmation email would be sent here");
        }

        return true;
    } catch (error) {
        console.error("❌ Error confirming payment:", error);
    }
}

// Get user's bookings
async function getUserBookings() {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const snapshot = await db.collection("bookings")
            .where("userId", "==", user.uid)
            .orderBy("createdAt", "desc")
            .get();

        const bookings = [];
        snapshot.forEach(doc => {
            bookings.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return bookings;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}

// Get booking details
async function getBookingDetails(bookingId) {
    try {
        const doc = await db.collection("bookings").doc(bookingId).get();
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error("Error fetching booking:", error);
    }
}

// Cancel booking
async function cancelBooking(bookingId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please login");
            return;
        }

        const booking = await db.collection("bookings").doc(bookingId).get();
        if (booking.data().userId !== user.uid) {
            alert("You can only cancel your own bookings");
            return;
        }

        // Handle refunds based on cancellation policy
        const status = booking.data().bookingStatus;
        let refundStatus = "pending";

        if (status !== "confirmed") {
            refundStatus = "full_refund";
        } else {
            const daysUntilTrip = Math.ceil(
                (booking.data().startDate.toDate() - new Date()) / (1000 * 60 * 60 * 24)
            );
            if (daysUntilTrip > 7) {
                refundStatus = "full_refund";
            } else if (daysUntilTrip > 3) {
                refundStatus = "50_percent_refund";
            } else {
                refundStatus = "no_refund";
            }
        }

        await db.collection("bookings").doc(bookingId).update({
            bookingStatus: "cancelled",
            refundStatus: refundStatus,
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert(`✅ Booking cancelled.\nRefund: ${refundStatus.replace(/_/g, " ")}`);
        return true;
    } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Error: " + error.message);
    }
}

// Display booking history on dashboard
async function displayBookings(containerId) {
    try {
        const bookings = await getUserBookings();
        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = "";

        if (bookings.length === 0) {
            container.innerHTML = "<p>No bookings yet.</p>";
            return;
        }

        bookings.forEach(booking => {
            const statusBadge = {
                "confirmed": "✅ Confirmed",
                "pending_payment": "⏳ Awaiting Payment",
                "pending_confirmation": "⏳ Pending",
                "cancelled": "❌ Cancelled"
            }[booking.bookingStatus] || booking.bookingStatus;

            const bookingHTML = `
                <div class="booking-card">
                    <div class="booking-header">
                        <h4>${booking.guideName}</h4>
                        <span class="status-badge">${statusBadge}</span>
                    </div>
                    <p><strong>Date:</strong> ${booking.startDate.toDate().toLocaleDateString()} to ${booking.endDate.toDate().toLocaleDateString()}</p>
                    <p><strong>Guests:</strong> ${booking.numberOfPeople}</p>
                    <p><strong>Amount:</strong> ${booking.totalAmount} ${booking.currency}</p>
                    <p><strong>Payment:</strong> ${booking.paymentStatus}</p>
                    ${booking.bookingStatus !== "cancelled" ?
                        `<button onclick="cancelBooking('${booking.id}')" class="btn btn-danger">Cancel Booking</button>`
                        : ""
                    }
                </div>
            `;
            container.innerHTML += bookingHTML;
        });
    } catch (error) {
        console.error("Error displaying bookings:", error);
    }
}
