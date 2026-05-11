import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { initGA4 } from "../../tracking/ga4";
import { initGTM } from "../../tracking/googleTagManager";
import { initMetaPixel } from "../../tracking/metaPixel";
import { initTikTokPixel } from "../../tracking/tiktokPixel";
import { initSnapPixel } from "../../tracking/snapPixel";
import { trackPageView } from "../../tracking/trackingEvents";

export default function TrackingProvider() {
  const location = useLocation();

  useEffect(() => {
    initGTM();
    initGA4();
    initMetaPixel();
    initTikTokPixel();
    initSnapPixel();
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    trackPageView(path);
  }, [location.pathname, location.search]);

  return null;
}