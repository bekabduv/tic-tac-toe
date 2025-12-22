const CACHE_NAME = "tictactoe-v1";
const urlsToCache = [
	"./",
	"./index.html",
	"./css/style.css",
	"./js/script.js",
	"./manifest.json",
	"./icons/16x16.png",
	"./icons/32x32.png",
	"./icons/72x72.png",
	"./icons/152x152.png",
	"./icons/167x167.png",
	"./icons/180x180.png",
	"./icons/192x192.png",
	"./icons/512x512.png",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(urlsToCache);
		}),
	);
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// Cache hit - return response
			if (response) {
				return response;
			}
			return fetch(event.request);
		}),
	);
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				}),
			);
		}),
	);
});
