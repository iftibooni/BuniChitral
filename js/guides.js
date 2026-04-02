let guides = [];
let selectedGuideId = null;

// Load guides on page load
document.addEventListener('DOMContentLoaded', loadGuides);

function loadGuides() {
    const guidesList = document.getElementById('guidesList');
    guidesList.innerHTML = '<p>Loading guides...</p>';

    db.collection('users').where('role', '==', 'guide').get()
        .then(snapshot => {
            guides = [];
            if (snapshot.empty) {
                guidesList.innerHTML = '<p>No guides available yet. Check back soon!</p>';
                return;
            }

            snapshot.forEach(doc => {
                guides.push({ id: doc.id, ...doc.data() });
            });

            displayGuides(guides);
            setupFilters();
        })
        .catch(error => {
            console.error('Error loading guides:', error);
            guidesList.innerHTML = '<p>Error loading guides. Please try again.</p>';
        });
}

function displayGuides(guidesToShow) {
    const guidesList = document.getElementById('guidesList');
    guidesList.innerHTML = '';

    if (guidesToShow.length === 0) {
        guidesList.innerHTML = '<p>No guides found matching your filters.</p>';
        return;
    }

    guidesToShow.forEach(guide => {
        const guideCard = document.createElement('div');
        guideCard.className = 'guide-card';
        guideCard.innerHTML = `
            <div class="guide-image">👤</div>
            <div class="guide-info">
                <div class="guide-name">${guide.name}</div>
                <div class="guide-rating">⭐ ${(guide.rating || 0).toFixed(1)} (${guide.reviews || 0} reviews)</div>
                <p>📞 ${guide.phone || 'Not provided'}</p>
                <p>Experience: ${guide.experience || 'Intermediate'}</p>
                <div class="guide-price">Rs. ${guide.dailyRate || 3000}/day</div>
            </div>
        `;
        guideCard.onclick = () => showGuideDetail(guide);
        guidesList.appendChild(guideCard);
    });
}

function showGuideDetail(guide) {
    selectedGuideId = guide.id;
    const guideDetail = document.getElementById('guideDetail');
    guideDetail.innerHTML = `
        <div class="guide-image">👤</div>
        <h2>${guide.name}</h2>
        <p><strong>Email:</strong> ${guide.email}</p>
        <p><strong>Phone:</strong> ${guide.phone || 'Not provided'}</p>
        <p><strong>Experience Level:</strong> ${guide.experience || 'Intermediate'}</p>
        <p><strong>About:</strong> ${guide.about || 'No description provided'}</p>
        <p><strong>Daily Rate:</strong> Rs. ${guide.dailyRate || 3000}</p>
        <p><strong>Rating:</strong> ⭐ ${(guide.rating || 0).toFixed(1)} (${guide.reviews || 0} reviews)</p>
        <p><strong>Languages:</strong> ${guide.languages || 'Urdu, English'}</p>
    `;
    document.getElementById('guideModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('guideModal').style.display = 'none';
    selectedGuideId = null;
}

function bookGuide() {
    if (!requireLogin()) return;

    if (!selectedGuideId) {
        alert('Please select a guide first');
        return;
    }

    // Redirect to booking form with guide ID
    window.location.href = `booking.html?guide=${selectedGuideId}`;
}

function setupFilters() {
    const search = document.getElementById('searchInput');
    const experience = document.getElementById('experienceFilter');

    search.addEventListener('input', applyFilters);
    experience.addEventListener('change', applyFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const experienceFilter = document.getElementById('experienceFilter').value;

    let filtered = guides.filter(guide => {
        const matchesSearch = guide.name.toLowerCase().includes(searchTerm) ||
                            (guide.about && guide.about.toLowerCase().includes(searchTerm));
        const matchesExperience = !experienceFilter || guide.experience === experienceFilter;

        return matchesSearch && matchesExperience;
    });

    displayGuides(filtered);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('guideModal');
    if (event.target === modal) {
        modal.style.display = 'none';
        selectedGuideId = null;
    }
}
