/* eslint-disable no-restricted-globals */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.hostname.includes('ngrok')) {
    return;
  }

  const headers = new Headers(request.headers);
  headers.set('ngrok-skip-browser-warning', '1');

  event.respondWith(
    (async () => {
      const init = {
        method: request.method,
        headers,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        integrity: request.integrity,
        keepalive: request.keepalive
      };

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const body = await request.clone().arrayBuffer();
        init.body = body;
      }

      const modifiedRequest = new Request(request.url, init);
      return fetch(modifiedRequest);
    })()
  );
});
