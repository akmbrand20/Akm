import { Link, useParams } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { useLanguage } from "../../hooks/useLanguage";

const policyConfig = {
  shipping: {
    labelKey: "policy.shipping",
    key: "shippingPolicy",
  },
  returns: {
    labelKey: "policy.returns",
    key: "returnPolicy",
  },
  privacy: {
    labelKey: "policy.privacy",
    key: "privacyPolicy",
  },
  terms: {
    labelKey: "policy.terms",
    key: "terms",
  },
};

export default function PolicyPage() {
  const { type } = useParams();
  const { policies } = useSettings();
  const { t } = useLanguage();

  const config = policyConfig[type];

  if (!config) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-300">{t("policy.notFound")}</p>
          <Link to="/" className="mt-5 inline-block text-[#c8b89d]">
            {t("common.backHome")}
          </Link>
        </div>
      </main>
    );
  }

  const content =
    policies?.[config.key] ||
    t("policy.fallback");

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          AKM
        </p>

        <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
          {t(config.labelKey)}
        </h1>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="whitespace-pre-line text-base leading-8 text-zinc-300">
            {content}
          </div>
        </div>
      </div>
    </main>
  );
}
