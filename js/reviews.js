// Reviews Management System for BuniChitral

// Add a review for a guide
async function addReview(guideId, rating, comment) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please login to leave a review");
            window.location.href = "auth.html";
            return;
        }

        if (rating < 1 || rating > 5) {
            alert("Rating must be between 1 and 5");
            return;
        }

        if (!comment.trim()) {
            alert("Please write a comment");
            return;
        }

        const review = {
            guideId: guideId,
            author: user.email,
            authorName: user.displayName || "Anonymous",
            userId: user.uid,
            rating: parseInt(rating),
            comment: comment,
            date: new Date(),
            verified: true,
            helpful: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection("reviews").add(review);
        console.log("✅ Review added with ID:", docRef.id);

        // Update guide's average rating
        await updateGuideRating(guideId);

        return docRef.id;
    } catch (error) {
        console.error("❌ Error adding review:", error);
        alert("Error: " + error.message);
    }
}

// Get reviews for a guide
async function getGuideReviews(guideId) {
    try {
        const snapshot = await db.collection("reviews")
            .where("guideId", "==", guideId)
            .orderBy("date", "desc")
            .get();

        const reviews = [];
        snapshot.forEach(doc => {
            reviews.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return reviews;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

// Update guide's average rating
async function updateGuideRating(guideId) {
    try {
        const snapshot = await db.collection("reviews")
            .where("guideId", "==", guideId)
            .get();

        if (snapshot.empty) return;

        let totalRating = 0;
        snapshot.forEach(doc => {
            totalRating += doc.data().rating;
        });

        const averageRating = (totalRating / snapshot.size).toFixed(1);

        await db.collection("guides").doc(guideId).update({
            rating: parseFloat(averageRating),
            reviews: snapshot.size
        });

        console.log(`✅ Guide rating updated: ${averageRating}`);
    } catch (error) {
        console.error("Error updating guide rating:", error);
    }
}

// Display reviews on guide profile
async function displayGuideReviews(guideId, containerId) {
    try {
        const reviews = await getGuideReviews(guideId);
        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = "";

        if (reviews.length === 0) {
            container.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
            return;
        }

        reviews.forEach(review => {
            const reviewHTML = `
                <div class="review-card">
                    <div class="review-header">
                        <div>
                            <strong>${review.authorName}</strong>
                            <span class="rating">${"⭐".repeat(review.rating)}</span>
                        </div>
                        <small>${new Date(review.date.seconds * 1000).toLocaleDateString()}</small>
                    </div>
                    <p class="review-comment">${review.comment}</p>
                    ${review.verified ? '<span class="badge verified">✓ Verified</span>' : ''}
                </div>
            `;
            container.innerHTML += reviewHTML;
        });
    } catch (error) {
        console.error("Error displaying reviews:", error);
    }
}

// Delete a review (only by author or admin)
async function deleteReview(reviewId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please login to delete reviews");
            return;
        }

        const review = await db.collection("reviews").doc(reviewId).get();
        if (review.data().userId !== user.uid) {
            alert("You can only delete your own reviews");
            return;
        }

        await db.collection("reviews").doc(reviewId).delete();
        console.log("✅ Review deleted");
        location.reload();
    } catch (error) {
        console.error("Error deleting review:", error);
        alert("Error: " + error.message);
    }
}
