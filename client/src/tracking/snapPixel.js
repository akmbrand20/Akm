let activeSnapPixelId = "";

export const initSnapPixel = (pixelId = "") => {
  const finalPixelId = pixelId || import.meta.env.VITE_SNAP_PIXEL_ID || "";

  if (!finalPixelId) return;

  activeSnapPixelId = finalPixelId;

  if (window.snaptr) {
    window.snaptr("init", finalPixelId);
    window.snaptr("track", "PAGE_VIEW");
    return;
  }

  /* eslint-disable */
  (function (e, t, n) {
    if (e.snaptr) return;

    const a = (e.snaptr = function () {
      a.handleRequest
        ? a.handleRequest.apply(a, arguments)
        : a.queue.push(arguments);
    });

    a.queue = [];

    const s = "script";
    const r = t.createElement(s);
    r.async = true;
    r.src = n;

    const u = t.getElementsByTagName(s)[0];
    u.parentNode.insertBefore(r, u);
  })(window, document, "https://sc-static.net/scevent.min.js");
  /* eslint-enable */

  window.snaptr("init", finalPixelId);
  window.snaptr("track", "PAGE_VIEW");
};

export const trackSnapEvent = (eventName, params = {}) => {
  if (!window.snaptr || !activeSnapPixelId) return;

  window.snaptr("track", eventName, params);
};