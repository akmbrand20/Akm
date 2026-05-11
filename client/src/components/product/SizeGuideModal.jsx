import { X } from "lucide-react";
import { sizeGuideData } from "../../data/sizeGuideData";

export default function SizeGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 text-[#f7f2ea] shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c8b89d]">
              Size Guide
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Find your recommended size
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
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-[#c8b89d]">
              <tr>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium">Height</th>
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
          This guide is based on recommended height and weight ranges. For a more
          oversized or relaxed fit, consider sizing up.
        </p>
      </div>
    </div>
  );
}