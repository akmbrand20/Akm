let activeGA4MeasurementId = "";

export const initGA4 = (measurementId = "") => {
  const finalMeasurementId =
    measurementId || import.meta.env.VITE_GA4_MEASUREMENT_ID || "";

  if (!finalMeasurementId) return;

  activeGA4MeasurementId = finalMeasurementId;

  if (window.gtag) return;

  const existingScript = document.getElementById("ga4-script");

  if (!existingScript) {
    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${finalMeasurementId}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;

  window.gtag("js", new Date());
  window.gtag("config", finalMeasurementId, {
    send_page_view: false,
  });
};

export const trackGA4PageView = (path) => {
  if (!window.gtag || !activeGA4MeasurementId) return;

  window.gtag("event", "page_view", {
    page_path: path,
  });
};

export const trackGA4Event = (eventName, params = {}) => {
  if (!window.gtag || !activeGA4MeasurementId) return;

  window.gtag("event", eventName, params);
};