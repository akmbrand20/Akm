import { BadgeCheck, RefreshCcw, Truck } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../lib/formatCurrency";
import { useLanguage } from "../../hooks/useLanguage";

export default function TrustBadges() {
  const { deliveryFee, policies } = useSettings();
  const { t } = useLanguage();

  const badges = [
    {
      icon: Truck,
      title: t("trust.deliveryTitle"),
      text: t("trust.deliveryText", { amount: formatCurrency(deliveryFee) }),
    },
    {
      icon: RefreshCcw,
      title: t("trust.exchangeTitle"),
      text:
        policies?.returnPolicy ||
        t("trust.exchangeFallback"),
    },
    {
      icon: BadgeCheck,
      title: t("trust.secureTitle"),
      text: t("trust.secureText"),
    },
  ];

  return (
    <div className="grid gap-3">
      {badges.map((badge) => {
        const Icon = badge.icon;

        return (
          <div
            key={badge.title}
            className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c8b89d]/10 text-[#c8b89d]">
              <Icon size={18} />
            </div>

            <div>
              <p className="font-semibold">{badge.title}</p>
              <p className="mt-1 line-clamp-3 text-sm leading-5 text-zinc-400">
                {badge.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
