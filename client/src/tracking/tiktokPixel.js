const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID;

export const initTikTokPixel = () => {
  if (!TIKTOK_PIXEL_ID) return;

  // Placeholder for TikTok Pixel.
  // We will activate it once the client provides the real Pixel ID.
};

export const trackTikTokEvent = (eventName, params = {}) => {
  if (!TIKTOK_PIXEL_ID) return;

  // Placeholder for TikTok event tracking.
  console.log("[TikTok Pixel Placeholder]", eventName, params);
};