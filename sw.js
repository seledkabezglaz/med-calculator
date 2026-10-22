// Забираем версию из адреса (которую мы передали из index.html)
const urlParams = new URLSearchParams(location.search);
const versionParam = urlParams.get('v') || 'v1'; 
const CACHE_NAME = 'medcalc-' + versionParam;

const ASSETS = [
  './',
  './index.html',
  './formulas.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './favicon.png',
  './qr.png' ,
  './img/android-1.jpg',
  './img/android-2.jpg',
  './img/android-3.jpg'
  
];

// Установка: сохраняем файлы в память
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // ДОБАВЛЕНО: Заставляем новый Service Worker активироваться немедленно, не ждать закрытия вкладок
  self.skipWaiting(); 
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
  // ДОБАВЛЕНО: Заставляем новый Service Worker взять контроль над всеми открытыми вкладками
  e.waitUntil(clients.claim());
});

// Работа: отдаем файлы из памяти, если нет интернета
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
