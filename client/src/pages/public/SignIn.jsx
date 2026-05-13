import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useAuth } from "../../context/AuthContext";
import { loginUnified } from "../../services/authService";
import SEO from "../../components/common/SEO";
import { useLanguage } from "../../hooks/useLanguage";

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isArabic } = useLanguage();

  const { isCustomerLoggedIn, saveCustomerSession } = useCustomerAuth();
  const { isAuthenticated: isAdminLoggedIn, saveAdminSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get("next");

  if (isAdminLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  if (isCustomerLoggedIn) {
    return <Navigate to="/my-orders" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setError(t("auth.required"));
      return;
    }

    try {
      setError("");
      setLoading(true);

      const data = await loginUnified({
        email: cleanEmail,
        password,
      });

      if (data.userType === "admin") {
        saveAdminSession({
          token: data.token,
          admin: data.admin,
        });

        navigate(nextPath?.startsWith("/admin") ? nextPath : "/admin");
        return;
      }

      if (data.userType === "customer") {
        saveCustomerSession({
          token: data.token,
          customer: data.customer,
        });

        navigate(
          nextPath && !nextPath.startsWith("/admin") ? nextPath : "/my-orders"
        );
        return;
      }

      setError(t("auth.invalidResponse"));
    } catch (err) {
      setError(err?.response?.data?.message || t("auth.invalidLogin"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-20 text-[#f7f2ea] md:px-12">
      <SEO
        title={t("auth.signInSeoTitle")}
        description={t("auth.signInSeoDescription")}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-7"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          {t("auth.welcome")}
        </p>

        <h1 className="mt-3 text-4xl font-semibold">{t("auth.signInTitle")}</h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {t("auth.signInSubtitle")}
        </p>

        <div className="mt-8 grid gap-4">
          <div>
            <label className="text-sm text-zinc-300">{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">{t("auth.password")}</label>

            <div className="mt-2 flex items-center rounded-2xl border border-white/10 bg-black/40 focus-within:border-[#c8b89d]/60">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.enterPassword")}
                className="w-full rounded-2xl bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={`rounded-full p-2 text-zinc-400 hover:text-white ${
                  isArabic ? "ml-3" : "mr-3"
                }`}
                aria-label={
                  showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </button>

        <p className="mt-5 text-center text-sm text-zinc-400">
          {t("auth.newToAkm")}{" "}
          <Link to="/signup" className="text-[#c8b89d] hover:text-white">
            {t("auth.createAccount")}
          </Link>
        </p>
      </form>
    </main>
  );
}
