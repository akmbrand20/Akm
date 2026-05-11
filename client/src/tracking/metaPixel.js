const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

export const initMetaPixel = () => {
  if (!META_PIXEL_ID) return;
  if (window.fbq) return;

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );
  /* eslint-enable */

  window.fbq("init", META_PIXEL_ID);
};

export const trackMetaPageView = () => {
  if (!window.fbq) return;

  window.fbq("track", "PageView");
};

export const trackMetaEvent = (eventName, params = {}, eventId = "") => {
  if (!window.fbq) return;

  if (eventId) {
    window.fbq("track", eventName, params, {
      eventID: eventId,
    });
    return;
  }

  window.fbq("track", eventName, params);
};