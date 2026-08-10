// 最小限のサービスワーカー。
// 目的は「オフラインでも真っ白にならず、アプリの外枠だけは開ける」ようにすること。
// 共同編集などクラウドとの通信が必要な機能はオフラインでは使えないが、
// アプリ自体は起動できるようにしておくと、ホーム画面から開いた時にアプリらしくなる。
const CACHE_NAME = 'hugme-shell-v1';
const SHELL_FILES = ['/', '/index.html', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // ページ本体（HTML）だけをオフライン対応にする。それ以外（Supabaseへの通信など）は
    // そのまま素通しにして、キャッシュが原因で最新データが取れなくなるのを防ぐ。
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/index.html'))
        );
    }
});
