const CACHE_NAME = 'thailand-v1';

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/lib/phaser.min.js',
    '/js/config.js',
    '/js/save.js',
    '/js/utils/draw.js',
    '/js/utils/audio.js',
    '/js/main.js',
    '/js/scenes/BootScene.js',
    '/js/scenes/MapScene.js',
    '/js/scenes/StoryScene.js',
    '/js/scenes/WinScene.js',
    '/js/scenes/PassportScene.js',
    '/js/scenes/games/BangkokMapGame.js',
    '/js/scenes/games/KanchanaburiMemory.js',
    '/js/scenes/games/TrainReflexGame.js',
    '/js/scenes/games/KhaoSokPuzzle.js',
    '/js/scenes/games/LakeRaftGame.js',
    '/js/scenes/games/SamuiBeachGame.js',
    '/js/scenes/games/BangkokFinalGame.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
            .catch(() => caches.match('/index.html'))
    );
});
