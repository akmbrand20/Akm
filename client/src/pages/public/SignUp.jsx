import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import SEO from "../../components/common/SEO";
import { useLanguage } from "../../hooks/useLanguage";

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, isCustomerLoggedIn } = useCustomerAuth();
  const { t, isArabic } = useLanguage();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    acceptsMarketing: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isCustomerLoggedIn) {
    return <Navigate to="/my-orders" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await signup({
        ...form,
        email: form.email.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      navigate("/my-orders");
    } catch (err) {
      setError(err?.response?.data?.message || t("auth.failedCreate"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-20 text-[#f7f2ea] md:px-12">
      <SEO
        title={t("auth.signUpSeoTitle")}
        description={t("auth.signUpSeoDescription")}
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-7"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          {t("auth.join")}
        </p>

        <h1 className="mt-3 text-4xl font-semibold">{t("auth.createTitle")}</h1>

        <div className="mt-8 grid gap-4">
          <div>
            <label className="text-sm text-zinc-300">{t("auth.fullName")}</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              placeholder={t("auth.fullNamePlaceholder")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">{t("auth.email")}</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="example@email.com"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">{t("auth.phone")}</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              placeholder={t("auth.phonePlaceholder")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">{t("auth.password")}</label>

            <div className="mt-2 flex items-center rounded-2xl border border-white/10 bg-black/40 focus-within:border-[#c8b89d]/60">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder={t("auth.passwordPlaceholder")}
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

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-300">
            <input
              name="acceptsMarketing"
              type="checkbox"
              checked={form.acceptsMarketing}
              onChange={handleChange}
              className="mt-1"
            />
            <span>{t("auth.marketing")}</span>
          </label>
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
          {loading ? t("auth.creating") : t("auth.createButton")}
        </button>

        <p className="mt-5 text-center text-sm text-zinc-400">
          {t("auth.already")}{" "}
          <Link to="/signin" className="text-[#c8b89d] hover:text-white">
            {t("auth.signInLink")}
          </Link>
        </p>
      </form>
    </main>
  );
}
