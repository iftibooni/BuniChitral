/**
 * Scans Visuals/<Place>/ for images, videos, and text.txt (or file named "text").
 * Writes js/visuals-manifest.json for use on destination detail pages.
 *
 * Run: node scripts/build-visuals-manifest.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VISUALS = path.join(ROOT, 'Visuals');
const OUT = path.join(ROOT, 'js', 'visuals-manifest.json');

/** Maps folder names on disk to destination ids in chitral-destinations-data.js */
const FOLDER_TO_ID = {
    Booni: 'booni',
    'Kalash Valley': 'kalash',
    Madaklasht: 'madaklasht',
    'Garam Chashma': 'garam-chashma',
    'Broghil Valley': 'broghil',
    'Gobor Valley': 'gobor',
    'Shandur Pass': 'shandur'
};

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v']);

function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

/** Collect images/videos under Visuals/<folder>/ including subfolders (e.g. Photos/, Videos/). */
function collectMediaRecursive(placeAbsDir, folderName, images, videos) {
    function walk(relFromPlace) {
        const absDir = relFromPlace ? path.join(placeAbsDir, relFromPlace) : placeAbsDir;
        let entries;
        try {
            entries = fs.readdirSync(absDir, { withFileTypes: true });
        } catch (e) {
            return;
        }
        entries.forEach(function (ent) {
            const nm = ent.name;
            const relFromPlaceNext = relFromPlace ? path.join(relFromPlace, nm) : nm;
            if (ent.isDirectory()) {
                walk(relFromPlaceNext);
            } else {
                const ext = path.extname(nm).toLowerCase();
                const parts = relFromPlaceNext.split(/[/\\]/);
                const posixRel = path.posix.join('Visuals', folderName, parts.join('/'));
                if (IMAGE_EXT.has(ext)) {
                    images.push(posixRel);
                }
                if (VIDEO_EXT.has(ext)) {
                    videos.push(posixRel);
                }
            }
        });
    }
    walk('');
}

function main() {
    const manifest = {};
    if (!fs.existsSync(VISUALS)) {
        fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
        console.log('No Visuals folder; wrote empty manifest.');
        return;
    }

    const dirs = fs
        .readdirSync(VISUALS, { withFileTypes: true })
        .filter(function (d) {
            return d.isDirectory();
        })
        .map(function (d) {
            return d.name;
        });

    dirs.forEach(function (folder) {
        const id = FOLDER_TO_ID[folder] || slugify(folder);
        const dirPath = path.join(VISUALS, folder);
        let rootFiles;
        try {
            rootFiles = fs.readdirSync(dirPath);
        } catch (e) {
            return;
        }

        const images = [];
        const videos = [];
        collectMediaRecursive(dirPath, folder, images, videos);
        images.sort();
        videos.sort();

        let textFile = null;
        if (rootFiles.indexOf('text.txt') !== -1) {
            textFile = path.posix.join('Visuals', folder, 'text.txt');
        } else if (rootFiles.indexOf('text') !== -1) {
            textFile = path.posix.join('Visuals', folder, 'text');
        }

        manifest[id] = {
            folder: folder,
            images: images,
            videos: videos,
            textFile: textFile
        };
    });

    fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
    console.log('Wrote', OUT, '(' + Object.keys(manifest).length + ' places)');
}

main();
