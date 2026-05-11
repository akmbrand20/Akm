import { BadgeCheck, RefreshCcw, Truck } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../lib/formatCurrency";

export default function TrustBadges() {
  const { deliveryFee, policies } = useSettings();

  const badges = [
    {
      icon: Truck,
      title: "Delivery in Egypt",
      text: `Delivery fee is ${formatCurrency(
        deliveryFee
      )}. Delivery details will be confirmed after placing your order.`,
    },
    {
      icon: RefreshCcw,
      title: "Exchange Support",
      text:
        policies?.returnPolicy ||
        "Exchange policy details will be confirmed by AKM.",
    },
    {
      icon: BadgeCheck,
      title: "Secure Checkout",
      text: "Your order details are safely submitted to AKM.",
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