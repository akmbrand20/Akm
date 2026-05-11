import { useLocation } from "react-router-dom";
import PageLayout from "./components/layout/PageLayout";
import TrackingProvider from "./components/tracking/TrackingProvider";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}

  return (
    <>
    <ScrollToTop />
      <TrackingProvider />
      <PageLayout>
        <AppRoutes />
      </PageLayout>
    </>
  );
}