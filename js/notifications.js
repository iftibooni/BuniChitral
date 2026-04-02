// Email Notifications System for BuniChitral
// This uses Firebase Cloud Functions + SendGrid API

// NOTE: This requires backend setup (Cloud Functions)
// For now, we'll create the client-side functions that trigger notifications

// Send booking confirmation email (triggered after successful booking)
async function sendBookingConfirmationEmail(bookingId) {
    try {
        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) return;

        const data = booking.data();
        const user = auth.currentUser;

        const emailData = {
            to: user.email,
            subject: `📅 Booking Confirmation - ${data.guideName}`,
            template: "booking_confirmation",
            data: {
                userName: user.displayName || "Tourist",
                guideName: data.guideName,
                startDate: data.startDate.toDate().toLocaleDateString(),
                endDate: data.endDate.toDate().toLocaleDateString(),
                numberOfPeople: data.numberOfPeople,
                totalAmount: data.totalAmount,
                currency: data.currency,
                bookingId: bookingId,
                bookingStatus: data.bookingStatus
            }
        };

        // Save notification record to Firestore
        await db.collection("notifications").add({
            userId: user.uid,
            type: "booking_confirmation",
            email: user.email,
            subject: emailData.subject,
            data: emailData.data,
            sent: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Notification queued for booking confirmation");
        return true;
    } catch (error) {
        console.error("Error sending booking confirmation email:", error);
    }
}

// Send payment reminder email
async function sendPaymentReminderEmail(bookingId) {
    try {
        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) return;

        const data = booking.data();
        const user = auth.currentUser;

        // Only send if payment is pending
        if (data.paymentStatus !== "pending") return;

        const emailData = {
            to: user.email,
            subject: `💳 Complete Your Payment - ${data.guideName} Booking`,
            template: "payment_reminder",
            data: {
                userName: user.displayName || "Tourist",
                guideName: data.guideName,
                bookingId: bookingId,
                amount: data.totalAmount,
                currency: data.currency,
                paymentLink: `https://bunichitral.com/payment/${bookingId}`
            }
        };

        await db.collection("notifications").add({
            userId: user.uid,
            type: "payment_reminder",
            email: user.email,
            subject: emailData.subject,
            data: emailData.data,
            sent: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Payment reminder email queued");
        return true;
    } catch (error) {
        console.error("Error sending payment reminder:", error);
    }
}

// Send trip reminder email (7 days before)
async function sendTripReminderEmail(bookingId) {
    try {
        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) return;

        const data = booking.data();
        const user = auth.currentUser;

        const emailData = {
            to: user.email,
            subject: `🏔️ Your Chitral Trip is Coming Up! - ${data.guideName}`,
            template: "trip_reminder",
            data: {
                userName: user.displayName || "Tourist",
                guideName: data.guideName,
                startDate: data.startDate.toDate().toLocaleDateString(),
                checklist: [
                    "Confirm with your guide",
                    "Check weather forecast",
                    "Pack appropriate clothing",
                    "Review itinerary",
                    "Arrange transportation"
                ]
            }
        };

        await db.collection("notifications").add({
            userId: user.uid,
            type: "trip_reminder",
            email: user.email,
            subject: emailData.subject,
            data: emailData.data,
            sent: false,
            scheduledFor: data.startDate,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Trip reminder email scheduled");
        return true;
    } catch (error) {
        console.error("Error scheduling trip reminder:", error);
    }
}

// Send review request email (after trip completion)
async function sendReviewRequestEmail(bookingId) {
    try {
        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) return;

        const data = booking.data();
        const user = auth.currentUser;

        const emailData = {
            to: user.email,
            subject: `⭐ Share Your Experience with ${data.guideName}`,
            template: "review_request",
            data: {
                userName: user.displayName || "Tourist",
                guideName: data.guideName,
                bookingId: bookingId,
                reviewLink: `https://bunichitral.com/review/${data.guideId}`
            }
        };

        await db.collection("notifications").add({
            userId: user.uid,
            type: "review_request",
            email: user.email,
            subject: emailData.subject,
            data: emailData.data,
            sent: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Review request email queued");
        return true;
    } catch (error) {
        console.error("Error sending review request:", error);
    }
}

// Send cancellation confirmation email
async function sendCancellationEmail(bookingId) {
    try {
        const booking = await db.collection("bookings").doc(bookingId).get();
        if (!booking.exists) return;

        const data = booking.data();
        const user = auth.currentUser;

        const emailData = {
            to: user.email,
            subject: `❌ Booking Cancelled - ${data.guideName}`,
            template: "cancellation",
            data: {
                userName: user.displayName || "Tourist",
                guideName: data.guideName,
                bookingId: bookingId,
                originalAmount: data.totalAmount,
                currency: data.currency,
                refundStatus: booking.data().refundStatus || "pending",
                refundAmount: calculateRefundAmount(data.totalAmount, booking.data().refundStatus)
            }
        };

        await db.collection("notifications").add({
            userId: user.uid,
            type: "cancellation",
            email: user.email,
            subject: emailData.subject,
            data: emailData.data,
            sent: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Cancellation email queued");
        return true;
    } catch (error) {
        console.error("Error sending cancellation email:", error);
    }
}

// Send guide message notification
async function sendMessageNotificationEmail(messageId, recipientId) {
    try {
        const message = await db.collection("messages").doc(messageId).get();
        const recipient = await db.collection("users").doc(recipientId).get();

        if (!message.exists || !recipient.exists) return;

        const msgData = message.data();
        const recipientData = recipient.data();

        const emailData = {
            to: recipientData.email,
            subject: `📬 New Message from ${msgData.senderName}`,
            template: "new_message",
            data: {
                userName: recipientData.displayName || "User",
                senderName: msgData.senderName,
                preview: msgData.message.substring(0, 100) + "...",
                messageLink: `https://bunichitral.com/messages/${messageId}`
            }
        };

        await db.collection("notifications").add({
            userId: recipientId,
            type: "new_message",
            email: recipientData.email,
            subject: emailData.subject,
            data: emailData.data,
            sent: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Message notification email queued");
        return true;
    } catch (error) {
        console.error("Error sending message notification:", error);
    }
}

// Send promotional emails (newsletters, new guides, etc.)
async function sendPromotionalEmail(userId, title, content, imageUrl) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) return;

        const user = userDoc.data();

        // Check if user has opted in to promotional emails
        if (user.emailPreferences && !user.emailPreferences.promotions) {
            console.log("User has opted out of promotional emails");
            return;
        }

        const emailData = {
            to: user.email,
            subject: title,
            template: "promotional",
            data: {
                userName: user.displayName || "Guest",
                title: title,
                content: content,
                imageUrl: imageUrl,
                unsubscribeLink: `https://bunichitral.com/unsubscribe/${userId}`
            }
        };

        await db.collection("notifications").add({
            userId: userId,
            type: "promotional",
            email: user.email,
            subject: emailData.subject,
            data: emailData.data,
            sent: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Promotional email queued");
        return true;
    } catch (error) {
        console.error("Error sending promotional email:", error);
    }
}

// Update email preferences
async function updateEmailPreferences(preferences) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        await db.collection("users").doc(user.uid).update({
            emailPreferences: {
                bookings: preferences.bookings !== false,
                payments: preferences.payments !== false,
                trips: preferences.trips !== false,
                reviews: preferences.reviews !== false,
                messages: preferences.messages !== false,
                promotions: preferences.promotions || false
            }
        });

        console.log("✅ Email preferences updated");
        alert("Email preferences saved successfully!");
    } catch (error) {
        console.error("Error updating preferences:", error);
        alert("Error: " + error.message);
    }
}

// Get user notification history
async function getNotificationHistory(limit = 10) {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const snapshot = await db.collection("notifications")
            .where("userId", "==", user.uid)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return notifications;
    } catch (error) {
        console.error("Error fetching notification history:", error);
        return [];
    }
}

// Helper function to calculate refund amount
function calculateRefundAmount(originalAmount, refundStatus) {
    const amounts = {
        "full_refund": originalAmount,
        "50_percent_refund": originalAmount * 0.5,
        "no_refund": 0
    };
    return amounts[refundStatus] || 0;
}

// ===== BACKEND CLOUD FUNCTION SETUP =====
// This is pseudo-code for Firebase Cloud Functions

/*
// firebaseFunction.js - Deploy to Firebase Cloud Functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email templates
const emailTemplates = {
    booking_confirmation: `
        <h1>Booking Confirmed! 📅</h1>
        <p>Hello {{userName}},</p>
        <p>Your booking with {{guideName}} is confirmed!</p>
        <p><strong>Details:</strong></p>
        <ul>
            <li>Guide: {{guideName}}</li>
            <li>Dates: {{startDate}} to {{endDate}}</li>
            <li>Guests: {{numberOfPeople}}</li>
            <li>Total: {{totalAmount}} {{currency}}</li>
        </ul>
        <a href="https://bunichitral.com/booking/{{bookingId}}">View Booking</a>
    `,
    // ... more templates
};

// Trigger when booking is created
exports.sendBookingConfirmationEmail = functions.firestore
    .document('bookings/{bookingId}')
    .onCreate(async (snap, context) => {
        const booking = snap.data();
        const user = await admin.auth().getUser(booking.userId);

        const msg = {
            to: user.email,
            from: 'info@bunichitral.com',
            subject: '📅 Booking Confirmation',
            html: generateEmail('booking_confirmation', booking),
        };

        await sgMail.send(msg);
        console.log('Email sent to', user.email);
    });

// Send payment reminders (scheduled)
exports.sendPaymentReminders = functions.pubsub
    .schedule('0 9 * * *')  // Daily at 9 AM
    .onRun(async (context) => {
        const snapshot = await admin.firestore()
            .collection('bookings')
            .where('paymentStatus', '==', 'pending')
            .get();

        for (const doc of snapshot.docs) {
            const booking = doc.data();
            // Send reminder email...
        }
    });
*/
