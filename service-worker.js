

self.addEventListener('install', function(e) {

  e.waitUntil(
    caches.open('puzzle-static').then(function(cache) {
      return cache.addAll(
        [
            '/PuzzleGame-Georgescu-Mihail.html',
            '/PuzzleGame-Georgescu-Mihail.css',
            '/PuzzleGame-Georgescu-Mihail.js',
            '/media/buttonsound.mp3',
            '/media/dropsound.mp3',
            '/media/drums.mp3',
            '/media/garden.jpg',
            '/media/mountains-night-sky.jpg',
            '/media/paper.mp3',
            '/media/icons/icon-192x192.png',
            '/media/icons/icon-512x512.png'
        ]
      );
    })
  );
});


self.addEventListener('fetch', function(e) {

    console.log(e.request.url);
   
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
});