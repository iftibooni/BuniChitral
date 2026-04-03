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

// Enhanced JazzCash Payment Processing for BuniChitral

// Process payment via JazzCash (Pakistan) - Direct Transfer Method
async function processJazzCashPayment(bookingId, amount, phoneNumber) {
    try {
        console.log("📱 Processing JazzCash payment...");
        console.log("Amount:", amount, "PKR");
        console.log("Phone:", phoneNumber);

        // Create payment record in Firestore
        const paymentRecord = {
            bookingId: bookingId,
            amount: amount,
            currency: "PKR",
            phoneNumber: phoneNumber || "+92 300-XXXX",
            method: "jazzcash",
            status: "pending",
            reference: bookingId.substring(0, 12),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("payments").add(paymentRecord);
        console.log("✅ Payment record created for booking:", bookingId);

        // Update booking status to indicate payment in progress
        await db.collection("bookings").doc(bookingId).update({
            paymentStatus: "processing",
            bookingStatus: "pending_payment"
        });

        return {
            success: true,
            bookingId: bookingId,
            amount: amount,
            message: "Payment processing initiated. Redirecting to payment gateway..."
        };

    } catch (error) {
        console.error("❌ JazzCash payment error:", error);
        throw error;
    }
}

// Verify JazzCash payment (manual verification by admin)
async function verifyJazzCashPayment(bookingId, paymentVerified = true) {
    try {
        if (!paymentVerified) {
            throw new Error("Payment verification failed");
        }

        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) {
            throw new Error("Booking not found");
        }

        // Update booking status to confirmed
        await db.collection("bookings").doc(bookingId).update({
            paymentStatus: "confirmed",
            bookingStatus: "confirmed",
            confirmedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update payment record
        const paymentSnapshot = await db.collection("payments")
            .where("bookingId", "==", bookingId)
            .where("method", "==", "jazzcash")
            .get();

        if (!paymentSnapshot.empty) {
            const paymentDoc = paymentSnapshot.docs[0];
            await paymentDoc.ref.update({
                status: "confirmed",
                verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        console.log("✅ JazzCash payment verified for booking:", bookingId);
        return true;

    } catch (error) {
        console.error("❌ Error verifying JazzCash payment:", error);
        throw error;
    }
}

// Get pending JazzCash payments (for admin dashboard)
async function getPendingJazzCashPayments() {
    try {
        const snapshot = await db.collection("payments")
            .where("method", "==", "jazzcash")
            .where("status", "==", "pending")
            .orderBy("createdAt", "desc")
            .get();

        const pendingPayments = [];
        snapshot.forEach(doc => {
            pendingPayments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log("📋 Pending JazzCash payments:", pendingPayments.length);
        return pendingPayments;

    } catch (error) {
        console.error("Error fetching pending payments:", error);
        return [];
    }
}

// Add JazzCash payment to bookings
async function linkJazzCashPaymentToBooking(bookingId, paymentId) {
    try {
        await db.collection("bookings").doc(bookingId).update({
            paymentId: paymentId
        });
        console.log("✅ JazzCash payment linked to booking");
    } catch (error) {
        console.error("❌ Error linking payment:", error);
    }
}

// Calculate refund for cancelled JazzCash booking
async function calculateJazzCashRefund(bookingId) {
    try {
        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) {
            throw new Error("Booking not found");
        }

        const bookingData = booking.data();
        const daysUntilTrip = Math.ceil(
            (bookingData.startDate.toDate() - new Date()) / (1000 * 60 * 60 * 24)
        );

        let refundAmount = 0;
        let refundStatus = "no_refund";

        if (daysUntilTrip > 7) {
            refundAmount = bookingData.totalAmount;
            refundStatus = "full_refund";
        } else if (daysUntilTrip > 3) {
            refundAmount = Math.round(bookingData.totalAmount * 0.5);
            refundStatus = "50_percent_refund";
        }

        return {
            refundAmount: refundAmount,
            refundStatus: refundStatus,
            daysUntilTrip: daysUntilTrip
        };

    } catch (error) {
        console.error("❌ Error calculating refund:", error);
    }
}

// Process JazzCash refund for cancelled booking
async function processJazzCashRefund(bookingId) {
    try {
        const refundInfo = await calculateJazzCashRefund(bookingId);
        if (!refundInfo) return false;

        const booking = await db.collection("bookings").doc(bookingId).get();

        // Create refund record
        await db.collection("refunds").add({
            bookingId: bookingId,
            amount: refundInfo.refundAmount,
            originalAmount: booking.data().totalAmount,
            refundStatus: refundInfo.refundStatus,
            method: "jazzcash",
            status: "pending",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update booking
        await db.collection("bookings").doc(bookingId).update({
            bookingStatus: "cancelled",
            refundStatus: refundInfo.refundStatus,
            refundAmount: refundInfo.refundAmount,
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ JazzCash refund initiated:", refundInfo);
        return refundInfo;

    } catch (error) {
        console.error("❌ Error processing refund:", error);
    }
}

// Send JazzCash payment reminder
async function sendJazzCashPaymentReminder(userId, bookingId) {
    try {
        const user = await db.collection("users").doc(userId).get();
        const booking = await db.collection("bookings").doc(bookingId).get();

        if (!user.exists || !booking.exists) {
            throw new Error("User or booking not found");
        }

        // Create notification record
        await db.collection("notifications").add({
            userId: userId,
            type: "payment_reminder",
            email: user.data().email,
            subject: `⏰ Complete Your Payment - ${booking.data().guideName}`,
            data: {
                bookingId: bookingId,
                guideName: booking.data().guideName,
                amount: booking.data().totalAmount,
                paymentLink: `https://bunichitral.com/payment-confirmation.html?booking=${bookingId}`
            },
            sent: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("📧 Payment reminder notification queued");
        return true;

    } catch (error) {
        console.error("❌ Error sending payment reminder:", error);
    }
}

// Confirm JazzCash payment after user submits
async function confirmJazzCashPayment(bookingId, userId) {
    try {
        const user = auth.currentUser;
        if (!user || user.uid !== userId) {
            throw new Error("Unauthorized: User ID mismatch");
        }

        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) {
            throw new Error("Booking not found");
        }

        if (booking.data().userId !== userId) {
            throw new Error("Unauthorized: Booking does not belong to user");
        }

        // Update payment status
        await db.collection("bookings").doc(bookingId).update({
            paymentStatus: "confirmed",
            bookingStatus: "confirmed",
            confirmedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update payment record
        const paymentSnapshot = await db.collection("payments")
            .where("bookingId", "==", bookingId)
            .where("method", "==", "jazzcash")
            .get();

        if (!paymentSnapshot.empty) {
            const paymentDoc = paymentSnapshot.docs[0];
            await paymentDoc.ref.update({
                status: "confirmed",
                confirmedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        console.log("✅ JazzCash payment confirmed for booking:", bookingId);
        return true;

    } catch (error) {
        console.error("❌ Error confirming payment:", error);
        throw error;
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
