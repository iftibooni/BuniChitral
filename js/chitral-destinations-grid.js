/**
 * Chitral Destinations — grid opens destination.html per place (no modal).
 */
const DESTINATIONS = window.BUNICHITRAL_DESTINATIONS || [];

let filteredDestinations = DESTINATIONS.slice();
let visualsManifest = {};

function webPathEncode(relPath) {
    if (!relPath) {
        return '';
    }
    return relPath
        .split('/')
        .map(function (seg) {
            return encodeURIComponent(seg);
        })
        .join('/');
}

function cardImageSrc(d) {
    const pack = visualsManifest[d.id];
    if (pack && pack.images && pack.images.length) {
        return webPathEncode(pack.images[0]);
    }
    const h = d.heroImage;
    if (!h) {
        return '';
    }
    if (/^https?:\/\//i.test(h)) {
        return h;
    }
    return webPathEncode(h);
}

document.addEventListener('DOMContentLoaded', function () {
    renderGrid(filteredDestinations);

    fetch('js/visuals-manifest.json?v=20260406')
        .then(function (r) {
            return r.ok ? r.json() : {};
        })
        .catch(function () {
            return {};
        })
        .then(function (m) {
            visualsManifest = m || {};
            renderGrid(filteredDestinations);
        });

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
    if (document.getElementById('destinationsList')) {
        renderGrid(filteredDestinations);
    }
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
        card.setAttribute('role', 'link');
        card.tabIndex = 0;
        card.innerHTML =
            '<img class="destination-card__img" src="' +
            cardImageSrc(d) +
            '" alt="" loading="lazy">' +
            '<div class="destination-card__body">' +
            '<div class="destination-card__title">' +
            escapeHtml(d.name) +
            '</div>' +
            '<p class="destination-card__summary">' +
            escapeHtml(d.summary) +
            '</p>' +
            '<span class="destination-card__hint">Photos &amp; videos →</span>' +
            '</div>';
        var thumb = card.querySelector('img');
        thumb.alt = d.name;
        thumb.addEventListener('error', function () {
            if (thumb.getAttribute('data-fallback-done')) {
                return;
            }
            thumb.setAttribute('data-fallback-done', '1');
            thumb.src =
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80';
        });
        function go() {
            window.location.href = 'destination.html?id=' + encodeURIComponent(d.id);
        }
        card.addEventListener('click', go);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                go();
            }
        });
        el.appendChild(card);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
