import { useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import PageLayout from "./components/layout/PageLayout";
import TrackingProvider from "./components/tracking/TrackingProvider";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";
import { LanguageProvider } from "./context/LanguageContext";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <ScrollToTop />
        <AppRoutes />
        <Analytics />
        <SpeedInsights />
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <LanguageProvider>
        <TrackingProvider />
        <PageLayout>
          <AppRoutes />
        </PageLayout>
      </LanguageProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
