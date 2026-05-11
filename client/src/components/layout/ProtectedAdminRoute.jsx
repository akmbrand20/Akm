import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-zinc-400">
        Checking admin access...
      </main>
    );
  }

  if (!isAuthenticated) {
    const nextPath = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/signin?next=${encodeURIComponent(nextPath)}`}
        replace
      />
    );
  }

  return children;
}