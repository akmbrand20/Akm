const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

export const initGA4 = () => {
  if (!GA4_MEASUREMENT_ID) return;
  if (window.gtag) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;

  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, {
    send_page_view: false,
  });
};

export const trackGA4PageView = (path) => {
  if (!window.gtag || !GA4_MEASUREMENT_ID) return;

  window.gtag("event", "page_view", {
    page_path: path,
  });
};

export const trackGA4Event = (eventName, params = {}) => {
  if (!window.gtag) return;

  window.gtag("event", eventName, params);
};