import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { BRAND, DELIVERY_FEE } from "../lib/constants";
import { getPublicSettings } from "../services/settingsService";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["publicSettings"],
    queryFn: getPublicSettings,
  });

  const announcement = settings?.announcement || {
    enabled: true,
    text: "Wear comfort. Move different.",
  };

  const localInstapayQr = {
    url: "/images/instapay-qr.webp",
    publicId: "",
  };

  const value = {
    isLoading,
    settings,

    brandName: settings?.brandName || BRAND.name,
    tagline: settings?.tagline || BRAND.tagline,

    announcement,
    announcementEnabled: announcement.enabled !== false,
    announcementText: announcement.text || "Wear comfort. Move different.",

    deliveryFee: settings?.deliveryFee ?? DELIVERY_FEE,
    freeShippingThreshold: settings?.freeShippingThreshold ?? null,
    phone: settings?.phone || BRAND.phone,
    whatsappNumber:
      settings?.whatsappNumber?.replace(/\D/g, "") || BRAND.whatsappNumber,

    instapayNumber: settings?.instapayNumber || "01014318607",

    instagramUrl: settings?.instagramUrl || BRAND.instagram,
    tiktokUrl: settings?.tiktokUrl || BRAND.tiktok,
    facebookUrl: settings?.facebookUrl || BRAND.facebook,

    instapayQr: settings?.instapayQr?.url ? settings.instapayQr : localInstapayQr,

    tracking: settings?.tracking || {},
    policies: settings?.policies || {},
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
}