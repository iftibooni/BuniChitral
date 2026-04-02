let plans = [];
let selectedPlanId = null;

// Load plans on page load
document.addEventListener('DOMContentLoaded', loadPlans);

function loadPlans() {
    const plansList = document.getElementById('plansList');
    plansList.innerHTML = '<p>Loading travel plans...</p>';

    db.collection('travelPlans').get()
        .then(snapshot => {
            plans = [];
            if (snapshot.empty) {
                // Create default plans if none exist
                createDefaultPlans();
                return;
            }

            snapshot.forEach(doc => {
                plans.push({ id: doc.id, ...doc.data() });
            });

            displayPlans(plans);
        })
        .catch(error => {
            console.error('Error loading plans:', error);
            plansList.innerHTML = '<p>Error loading plans. Please try again.</p>';
        });
}

function createDefaultPlans() {
    const defaultPlans = [
        {
            title: 'Kalash Valleys Trek',
            duration: 3,
            description: 'Explore the unique Kalash culture and pristine mountain valleys',
            price: 5000,
            rating: 4.8,
            reviews: 45,
            includes: ['Guide', 'Meals', 'Transport', 'Accommodation']
        },
        {
            title: 'Chitral River Adventure',
            duration: 2,
            description: 'Kayaking and adventure activities on the beautiful Chitral River',
            price: 4500,
            rating: 4.6,
            reviews: 32,
            includes: ['Guide', 'Equipment', 'Meals', 'Insurance']
        },
        {
            title: 'Mountain Photography Tour',
            duration: 4,
            description: 'Capture the stunning landscapes with expert photography tips from local guides',
            price: 6500,
            rating: 4.9,
            reviews: 28,
            includes: ['Expert Guide', 'Meals', 'Accommodation', 'Transport']
        },
        {
            title: 'Cultural Heritage Tour',
            duration: 2,
            description: 'Learn about the rich history and culture of Chitral through local stories',
            price: 3000,
            rating: 4.5,
            reviews: 52,
            includes: ['Knowledgeable Guide', 'Meals', 'Museum Visits']
        },
        {
            title: 'High Altitude Adventure',
            duration: 5,
            description: 'Experience high altitude trekking in the Hindu Kush Mountains',
            price: 7500,
            rating: 4.7,
            reviews: 18,
            includes: ['Expert Guide', 'All Meals', 'Camping', 'Equipment']
        },
        {
            title: 'Chitral Valley Family Tour',
            duration: 3,
            description: 'Family-friendly tour perfect for all ages with easy walks and cultural experiences',
            price: 4000,
            rating: 4.8,
            reviews: 61,
            includes: ['Guide', 'Meals', 'Transport', 'Family Activities']
        }
    ];

    defaultPlans.forEach(plan => {
        db.collection('travelPlans').add(plan)
            .catch(error => console.error('Error adding plan:', error));
    });

    // Reload plans
    setTimeout(loadPlans, 1000);
}

function displayPlans(plansToShow) {
    const plansList = document.getElementById('plansList');
    plansList.innerHTML = '';

    if (plansToShow.length === 0) {
        plansList.innerHTML = '<p>No travel plans available.</p>';
        return;
    }

    plansToShow.forEach(plan => {
        const planCard = document.createElement('div');
        planCard.className = 'plan-card';
        planCard.innerHTML = `
            <div class="plan-image">🏔️</div>
            <div class="plan-info">
                <div class="plan-title">${plan.title}</div>
                <div class="plan-rating">⭐ ${(plan.rating || 0).toFixed(1)} (${plan.reviews || 0} reviews)</div>
                <p>${plan.description}</p>
                <p><strong>Duration:</strong> ${plan.duration} days</p>
                <div class="plan-price">Rs. ${plan.price}</div>
            </div>
        `;
        planCard.onclick = () => showPlanDetail(plan);
        plansList.appendChild(planCard);
    });
}

function showPlanDetail(plan) {
    selectedPlanId = plan.id;
    const planDetail = document.getElementById('planDetail');
    const includes = Array.isArray(plan.includes) ? plan.includes.join(', ') : 'Not specified';

    planDetail.innerHTML = `
        <div class="plan-image">🏔️</div>
        <h2>${plan.title}</h2>
        <p><strong>Duration:</strong> ${plan.duration} days</p>
        <p><strong>Price per person:</strong> Rs. ${plan.price}</p>
        <p><strong>Rating:</strong> ⭐ ${(plan.rating || 0).toFixed(1)} (${plan.reviews || 0} reviews)</p>
        <p><strong>Description:</strong> ${plan.description}</p>
        <p><strong>Includes:</strong> ${includes}</p>
    `;
    document.getElementById('planModal').style.display = 'block';
}

function closePlanModal() {
    document.getElementById('planModal').style.display = 'none';
    selectedPlanId = null;
}

function bookPlan() {
    if (!requireLogin()) return;

    if (!selectedPlanId) {
        alert('Please select a plan first');
        return;
    }

    const date = document.getElementById('planDate').value;
    const participants = document.getElementById('planParticipants').value;

    if (!date || !participants) {
        alert('Please fill in all booking details');
        return;
    }

    // Create booking
    const booking = {
        planId: selectedPlanId,
        userId: currentUser.uid,
        date: new Date(date),
        participants: parseInt(participants),
        status: 'pending',
        createdAt: new Date()
    };

    db.collection('bookings').add(booking)
        .then(() => {
            alert('Booking created successfully! Check your dashboard for details.');
            closePlanModal();
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error('Error creating booking:', error);
            alert('Error creating booking. Please try again.');
        });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('planModal');
    if (event.target === modal) {
        modal.style.display = 'none';
        selectedPlanId = null;
    }
}
