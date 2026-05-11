import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useSettings } from "../../context/SettingsContext";

import { initGA4 } from "../../tracking/ga4";
import { initGTM } from "../../tracking/googleTagManager";
import { initMetaPixel } from "../../tracking/metaPixel";
import { initTikTokPixel } from "../../tracking/tiktokPixel";
import { initSnapPixel } from "../../tracking/snapPixel";
import { trackPageView } from "../../tracking/trackingEvents";

export default function TrackingProvider() {
  const location = useLocation();
  const { isLoading, tracking } = useSettings();

  const metaPixelId =
    tracking?.metaPixelId || import.meta.env.VITE_META_PIXEL_ID || "";

  const ga4MeasurementId =
    tracking?.ga4MeasurementId || import.meta.env.VITE_GA4_MEASUREMENT_ID || "";

  const gtmId = tracking?.gtmId || import.meta.env.VITE_GTM_ID || "";

  const tiktokPixelId =
    tracking?.tiktokPixelId || import.meta.env.VITE_TIKTOK_PIXEL_ID || "";

  const snapPixelId =
    tracking?.snapPixelId || import.meta.env.VITE_SNAP_PIXEL_ID || "";

  useEffect(() => {
    if (isLoading) return;

    initGTM(gtmId);
    initGA4(ga4MeasurementId);
    initMetaPixel(metaPixelId);
    initTikTokPixel(tiktokPixelId);
    initSnapPixel(snapPixelId);
  }, [
    isLoading,
    gtmId,
    ga4MeasurementId,
    metaPixelId,
    tiktokPixelId,
    snapPixelId,
  ]);

  useEffect(() => {
    if (isLoading) return;

    const path = `${location.pathname}${location.search}`;
    trackPageView(path);
  }, [isLoading, location.pathname, location.search]);

  return null;
}