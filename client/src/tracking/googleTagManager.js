const GTM_ID = import.meta.env.VITE_GTM_ID;

export const initGTM = () => {
  if (!GTM_ID) return;

  window.dataLayer = window.dataLayer || [];

  if (document.getElementById("gtm-script")) return;

  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);

  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });
};

export const pushToDataLayer = (eventData = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
};