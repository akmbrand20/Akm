import { useQuery } from "@tanstack/react-query";
import { PackageCheck, ReceiptText, Timer, Wallet } from "lucide-react";
import { getAdminStats } from "../../services/adminOrderService";
import { formatCurrency } from "../../lib/formatCurrency";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
  });

  const cards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ReceiptText,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: Wallet,
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Timer,
    },
    {
      title: "Delivered Orders",
      value: stats?.deliveredOrders || 0,
      icon: PackageCheck,
    },
  ];

  return (
    <div>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Overview</h1>
      </div>

      {isLoading ? (
        <p className="mt-8 text-zinc-400">Loading stats...</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c8b89d]/10 text-[#c8b89d]">
                  <Icon size={20} />
                </div>

                <p className="mt-5 text-sm text-zinc-400">{card.title}</p>
                <h2 className="mt-2 text-2xl font-semibold">{card.value}</h2>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}