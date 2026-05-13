import { X } from "lucide-react";
import { sizeGuideData } from "../../data/sizeGuideData";
import { useLanguage } from "../../hooks/useLanguage";

export default function SizeGuideModal({ isOpen, onClose }) {
  const { t, isArabic } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 text-[#f7f2ea] shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c8b89d]">
              {t("sizeGuide.label")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {t("sizeGuide.title")}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-zinc-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className={`w-full text-sm ${isArabic ? "text-right" : "text-left"}`}>
            <thead className="bg-white/[0.04] text-[#c8b89d]">
              <tr>
                <th className="px-4 py-3 font-medium">{t("sizeGuide.size")}</th>
                <th className="px-4 py-3 font-medium">{t("sizeGuide.weight")}</th>
                <th className="px-4 py-3 font-medium">{t("sizeGuide.height")}</th>
              </tr>
            </thead>

            <tbody>
              {sizeGuideData.map((row) => (
                <tr key={row.size} className="border-t border-white/10">
                  <td className="px-4 py-4 font-semibold">{row.size}</td>
                  <td className="px-4 py-4 text-zinc-300">{row.weight}</td>
                  <td className="px-4 py-4 text-zinc-300">{row.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-sm leading-6 text-zinc-400">
          {t("sizeGuide.note")}
        </p>
      </div>
    </div>
  );
}
