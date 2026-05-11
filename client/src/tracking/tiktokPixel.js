let activeTikTokPixelId = "";

export const initTikTokPixel = (pixelId = "") => {
  const finalPixelId = pixelId || import.meta.env.VITE_TIKTOK_PIXEL_ID || "";

  if (!finalPixelId) return;

  activeTikTokPixelId = finalPixelId;

  if (window.ttq) return;

  /* eslint-disable */
  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w[t] = w[t] || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
      "holdConsent",
      "revokeConsent",
      "grantConsent",
    ];
    ttq.setAndDefer = function (target, method) {
      target[method] = function () {
        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };

    for (let i = 0; i < ttq.methods.length; i += 1) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }

    ttq.instance = function (id) {
      const instance = ttq._i[id] || [];
      for (let i = 0; i < ttq.methods.length; i += 1) {
        ttq.setAndDefer(instance, ttq.methods[i]);
      }
      return instance;
    };

    ttq.load = function (id, options) {
      const url = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[id] = [];
      ttq._i[id]._u = url;
      ttq._t = ttq._t || {};
      ttq._t[id] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[id] = options || {};

      const script = d.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${url}?sdkid=${id}&lib=${t}`;

      const firstScript = d.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    };

    ttq.load(finalPixelId);
    ttq.page();
  })(window, document, "ttq");
  /* eslint-enable */
};

export const trackTikTokEvent = (eventName, params = {}) => {
  if (!window.ttq || !activeTikTokPixelId) return;

  window.ttq.track(eventName, params);
};