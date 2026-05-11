export default function BundleDiscountNotice({ totals }) {
  if (totals.discount > 0) {
    return (
      <div className="rounded-3xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
          Bundle Unlocked
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{totals.appliedOffer}</h2>
        <p className="mt-2 text-zinc-300">{totals.bundleMessage}</p>
        <p className="mt-3 font-semibold text-[#e8d6b8]">
          You saved {totals.discount.toLocaleString()} EGP.
        </p>
      </div>
    );
  }

  if (totals.completeSets === 1) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
          Bundle Tip
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          Add one more complete set to unlock the Duo Bundle.
        </h2>
        <p className="mt-2 text-zinc-400">
          Two complete sets are priced at 2,000 EGP.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
        Complete The Set
      </p>
      <h2 className="mt-2 text-xl font-semibold">
        Add a T-Shirt and Pants together to unlock bundle pricing.
      </h2>
      <p className="mt-2 text-zinc-400">
        Duo Bundle: 2 complete sets for 2,000 EGP. Signature Bundle: 3 complete
        sets for 2,800 EGP.
      </p>
    </div>
  );
}