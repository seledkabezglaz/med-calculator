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
  './img/android-1.jpg',
  './img/android-2.jpg',
  './img/android-3.jpg',
  './img/ios-1.jpg',
  './img/ios-2.jpg',
  './img/ios-3.jpg'
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
  // Если браузер запрашивает index.html или формулы — сначала идем в сеть!
  if (e.request.mode === 'navigate' || e.request.url.includes('index.html') || e.request.url.includes('formulas.json')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Если сеть ответила, сохраняем свежую копию в кэш и отдаем её
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Если сети нет — отдаем из кэша (офлайн-режим)
          return caches.match(e.request);
        })
    );
  } else {
    // Для картинок и иконок: сначала кэш, потом сеть (чтобы грузилось быстро)
    e.respondWith(
      caches.match(e.request).then((response) => {
        return response || fetch(e.request);
      })
    );
  }
});
