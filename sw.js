const CACHE_NAME = 'medcalc-v1';
const ASSETS = [
  './',
  './index.html',
  './formulas.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon.png'
];

// Установка: сохраняем файлы в память
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Активация: удаляем старый кэш, если версия обновилась
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Работа: отдаем файлы из памяти, если нет интернета
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});