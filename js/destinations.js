/**
 * Chitral Destinations — static showcase (images + video per spot).
 * Replace image/video URLs with your own media when ready.
 */
const DESTINATIONS = [
    {
        id: 'booni',
        name: 'Booni',
        summary: ' Booni, often called the golden heart of Upper Chitral, is a breathtaking alpine valley set against the dramatic backdrop of the Hindu Kush mountains. Serving as the administrative center of the region, it sits on a natural terrace where lush green orchards meet towering, snow-covered peaks, creating a striking and unforgettable landscape.Nature defines life in Booni. The expansive Qaqlasht Meadow hosts vibrant cultural festivals each spring, filled with music and traditional polo, while nearby highlands like Shupeshun offer peaceful trekking routes surrounded by wildflowers and untouched beauty. The valley’s charm is further enriched by its reputation as a fruit haven, with apples, apricots, and grapes growing abundantly along its winding paths.Beyond its scenic appeal, Booni is a gateway to adventure. Travelers can explore routes leading to the remote Broghil Valley and beyond. The local Khowar-speaking community welcomes visitors with warmth and rich cultural traditions. Whether you seek photography, cultural experiences, or pure tranquility, Booni offers a rare escape into nature’s calm, where every moment feels timeless and every visitor feels at home.       ',
        heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
            'https://picsum.photos/seed/booni-a/800/500'
        ],
        videoSrc: 'https://www.instagram.com/bunichitral/reel/DQO3yauDRqb/',
        videoCaption: 'Sample video placeholder — swap for your Booni footage.'
    },
    {
        id: 'kalash',
        name: 'Kalash Valley',
        summary: 'Home of the Kalasha people, with three main valleys (Bumburet, Rumbur, Birir), unique culture, and festival season highlights.',
        heroImage: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&auto=format&fit=crop&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1454496520488-4aba0c9e7c66?w=800&auto=format&fit=crop&q=80',
            'https://picsum.photos/seed/kalash-a/800/500'
        ],
        videoSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        videoCaption: 'Sample video placeholder — swap for Kalash Valley clips.'
    },
    {
        id: 'madaklasht',
        name: 'Madaklasht',
        summary: 'Known for cherry blossoms and alpine scenery, a peaceful side valley popular for spring visits and short hikes.',
        heroImage: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&auto=format&fit=crop&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
            'https://picsum.photos/seed/madak-a/800/500'
        ],
        videoSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoCaption: 'Sample video placeholder — swap for Madaklasht footage.'
    },
    {
        id: 'garam-chashma',
        name: 'Garam Chashma',
        summary: 'Famous hot springs and a cool mountain setting — ideal for a restorative stop after long road journeys.',
        heroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
            'https://picsum.photos/seed/garam-a/800/500'
        ],
        videoSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        videoCaption: 'Sample video placeholder — swap for Garam Chashma footage.'
    },
    {
        id: 'broghil',
        name: 'Broghil Valley',
        summary: 'Remote high valley near the Wakhan corridor, yaks, summer pastures, and some of the wildest trekking in the region.',
        heroImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&auto=format&fit=crop&q=80',
            'https://picsum.photos/seed/broghil-a/800/500'
        ],
        videoSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        videoCaption: 'Sample video placeholder — swap for Broghil Valley footage.'
    },
    {
        id: 'gobor',
        name: 'Gobor Valley',
        summary: 'A quieter mountain valley experience away from the main tourist routes — great for slow travel and landscape photography.',
        heroImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&auto=format&fit=crop&q=80',
            'https://picsum.photos/seed/gobor-a/800/500'
        ],
        videoSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        videoCaption: 'Sample video placeholder — swap for Gobor Valley footage.'
    },
    {
        id: 'shandur',
        name: 'Shandur Pass',
        summary: 'The “roof of the world” polo ground — dramatic high-altitude plateau and home to the famous Shandur polo festival.',
        heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&auto=format&fit=crop&q=80',
            'https://picsum.photos/seed/shandur-a/800/500'
        ],
        videoSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        videoCaption: 'Sample video placeholder — swap for Shandur Pass / polo footage.'
    }
];

let filteredDestinations = DESTINATIONS.slice();

document.addEventListener('DOMContentLoaded', function () {
    renderGrid(filteredDestinations);
    const search = document.getElementById('destinationSearch');
    if (search) {
        search.addEventListener('input', applySearch);
    }
});

function applySearch() {
    const q = document.getElementById('destinationSearch').value.trim().toLowerCase();
    if (!q) {
        filteredDestinations = DESTINATIONS.slice();
    } else {
        filteredDestinations = DESTINATIONS.filter(function (d) {
            return d.name.toLowerCase().indexOf(q) !== -1 || d.summary.toLowerCase().indexOf(q) !== -1;
        });
    }
    renderGrid(filteredDestinations);
}

function renderGrid(items) {
    const el = document.getElementById('destinationsList');
    el.innerHTML = '';

    if (items.length === 0) {
        el.innerHTML = '<p>No destinations match your search.</p>';
        return;
    }

    items.forEach(function (d) {
        const card = document.createElement('div');
        card.className = 'destination-card';
        card.innerHTML =
            '<img class="destination-card__img" src="' +
            d.heroImage +
            '" alt="" loading="lazy">' +
            '<div class="destination-card__body">' +
            '<div class="destination-card__title">' +
            escapeHtml(d.name) +
            '</div>' +
            '<p class="destination-card__summary">' +
            escapeHtml(d.summary) +
            '</p>' +
            '<span class="destination-card__hint">Photos & video →</span>' +
            '</div>';
        card.querySelector('img').alt = d.name;
        card.addEventListener('click', function () {
            openDestinationModal(d);
        });
        el.appendChild(card);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openDestinationModal(d) {
    const modal = document.getElementById('destinationModal');
    const detail = document.getElementById('destinationDetail');
    const galleryHtml =
        '<div class="destination-gallery">' +
        '<h3 class="destination-gallery__label">Gallery</h3>' +
        '<div class="destination-gallery__grid">' +
        [d.heroImage].concat(d.gallery).map(function (url) {
            return '<img src="' + url + '" alt="' + escapeHtml(d.name) + '" loading="lazy">';
        }).join('') +
        '</div></div>';

    detail.innerHTML =
        '<h2>' +
        escapeHtml(d.name) +
        '</h2>' +
        '<p class="destination-detail__text">' +
        escapeHtml(d.summary) +
        '</p>' +
        galleryHtml +
        '<h3 class="destination-video__label">Video</h3>' +
        '<div class="destination-video-wrap">' +
        '<video class="destination-video" controls playsinline preload="metadata" src="' +
        d.videoSrc +
        '"></video></div>' +
        '<p class="destination-video-caption">' +
        escapeHtml(d.videoCaption) +
        '</p>';

    modal.style.display = 'flex';
}

function closeDestinationModal() {
    const modal = document.getElementById('destinationModal');
    const v = modal.querySelector('video');
    if (v) {
        v.pause();
        v.src = '';
    }
    modal.style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('destinationModal');
    if (event.target === modal) {
        closeDestinationModal();
    }
};

window.closeDestinationModal = closeDestinationModal;
