/**
 * destination.html — text from Visuals/.../text.txt, media from js/visuals-manifest.json.
 */
(function () {
    const DESTINATIONS = window.BUNICHITRAL_DESTINATIONS || [];

    function getQueryId() {
        const p = new URLSearchParams(window.location.search);
        return (p.get('id') || '').trim().toLowerCase();
    }

    function findDestination(id) {
        for (let i = 0; i < DESTINATIONS.length; i++) {
            if (DESTINATIONS[i].id === id) {
                return DESTINATIONS[i];
            }
        }
        return null;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

    function instagramEmbedSrc(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }
        const reel = url.match(/instagram\.com\/[^/]+\/reel\/([^/?#]+)/i);
        if (reel) {
            return 'https://www.instagram.com/reel/' + reel[1] + '/embed';
        }
        const p = url.match(/instagram\.com\/(?:p|tv)\/([^/?#]+)/i);
        if (p) {
            return 'https://www.instagram.com/p/' + p[1] + '/embed';
        }
        return null;
    }

    function renderInstagramBlock(url, title) {
        const src = instagramEmbedSrc(url);
        if (!src) {
            return (
                '<p class="destination-instagram-fallback"><a href="' +
                escapeHtml(url) +
                '" target="_blank" rel="noopener noreferrer">View on Instagram</a></p>'
            );
        }
        return (
            '<div class="destination-instagram-wrap">' +
            '<iframe class="destination-instagram-iframe" title="' +
            escapeHtml(title || 'Instagram') +
            '" src="' +
            escapeHtml(src) +
            '" allowfullscreen></iframe></div>'
        );
    }

    document.addEventListener('DOMContentLoaded', function () {
        const id = getQueryId();
        const root = document.getElementById('destinationPageRoot');
        const dest = findDestination(id);

        if (!id || !dest) {
            root.innerHTML =
                '<div class="destination-page-error">' +
                '<h1>Destination not found</h1>' +
                '<p><a href="destinations.html">← Back to Chitral Destinations</a></p>' +
                '</div>';
            document.title = 'Destination not found — BuniChitral';
            return;
        }

        document.title = dest.name + ' — BuniChitral';

        fetch('js/visuals-manifest.json?v=20260406')
            .then(function (r) {
                return r.ok ? r.json() : {};
            })
            .catch(function () {
                return {};
            })
            .then(function (manifest) {
                const pack = manifest[id] || { images: [], videos: [], textFile: null };

                const textPromise = pack.textFile
                    ? fetch(webPathEncode(pack.textFile)).then(function (r) {
                          return r.ok ? r.text() : '';
                      })
                    : Promise.resolve('');

                return textPromise.then(function (textBody) {
                    const bodyText = (textBody && textBody.trim()) || dest.summary.trim();
                    const images = pack.images && pack.images.length ? pack.images : [];
                    const videos = pack.videos && pack.videos.length ? pack.videos : [];

                    let galleryHtml = '<h2 class="destination-gallery__label">Photos</h2>';
                    if (images.length) {
                        galleryHtml +=
                            '<div class="destination-gallery__grid destination-gallery__grid--page">' +
                            images
                                .map(function (src) {
                                    const enc = webPathEncode(src);
                                    return (
                                        '<a class="destination-gallery__link" href="' +
                                        escapeHtml(enc) +
                                        '" target="_blank" rel="noopener noreferrer">' +
                                        '<img src="' +
                                        escapeHtml(enc) +
                                        '" alt="' +
                                        escapeHtml(dest.name) +
                                        '" loading="lazy"></a>'
                                    );
                                })
                                .join('') +
                            '</div>';
                    }
                    if (dest.instagramFallback) {
                        if (images.length) {
                            galleryHtml +=
                                '<p class="destination-instagram-subcap">Also on Instagram</p>';
                        }
                        galleryHtml += renderInstagramBlock(
                            dest.instagramFallback,
                            dest.name + ' on Instagram'
                        );
                    } else if (!images.length) {
                        galleryHtml +=
                            '<p class="destination-page-placeholder">Add images to <code>Visuals/' +
                            escapeHtml(pack.folder || '') +
                            '/</code> and run <code>npm run build:visuals</code>, or set <code>instagramFallback</code> in <code>chitral-destinations-data.js</code>.</p>';
                    }

                    let videosHtml = '<h2 class="destination-video__label">Videos</h2>';
                    if (videos.length) {
                        videosHtml +=
                            '<div class="destination-page-videos">' +
                            videos
                                .map(function (src) {
                                    const enc = webPathEncode(src);
                                    return (
                                        '<div class="destination-video-wrap">' +
                                        '<video class="destination-video" controls playsinline preload="metadata" src="' +
                                        escapeHtml(enc) +
                                        '"></video></div>'
                                    );
                                })
                                .join('') +
                            '</div>';
                    }
                    if (dest.instagramVideoFallback) {
                        if (videos.length) {
                            videosHtml +=
                                '<p class="destination-instagram-subcap">Also on Instagram</p>';
                        }
                        videosHtml += renderInstagramBlock(
                            dest.instagramVideoFallback,
                            dest.name + ' video on Instagram'
                        );
                    } else if (!videos.length && dest.instagramFallback) {
                        videosHtml += renderInstagramBlock(
                            dest.instagramFallback,
                            dest.name + ' video on Instagram'
                        );
                    } else if (!videos.length && !dest.instagramFallback) {
                        videosHtml +=
                            '<p class="destination-page-placeholder">Add videos to <code>Visuals/' +
                            escapeHtml(pack.folder || '') +
                            '/</code> or set <code>instagramVideoFallback</code> in <code>chitral-destinations-data.js</code>.</p>';
                    }

                    root.innerHTML =
                        '<nav class="destination-page-back"><a href="destinations.html">← All destinations</a></nav>' +
                        '<header class="destination-page-header">' +
                        '<h1>' +
                        escapeHtml(dest.name) +
                        '</h1></header>' +
                        '<p class="destination-detail__text destination-detail__text--page">' +
                        escapeHtml(bodyText) +
                        '</p>' +
                        galleryHtml +
                        videosHtml;
                });
            });
    });
})();
