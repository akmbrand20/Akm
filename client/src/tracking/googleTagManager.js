let activeGTMId = "";

export const initGTM = (gtmId = "") => {
  const finalGTMId = gtmId || import.meta.env.VITE_GTM_ID || "";

  if (!finalGTMId) return;

  activeGTMId = finalGTMId;

  window.dataLayer = window.dataLayer || [];

  if (document.getElementById("gtm-script")) return;

  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${finalGTMId}`;
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