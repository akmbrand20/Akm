import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedProducts } from "../../services/productService";
import { getOffers } from "../../services/offerService";
import { useSettings } from "../../context/SettingsContext";
import ProductCard from "../../components/product/ProductCard";
import SEO from "../../components/common/SEO";

export default function Home() {
  const { tagline, whatsappNumber } = useSettings();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: getFeaturedProducts,
  });

  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: getOffers,
  });

  const bundleOffers = offers.filter((offer) => offer.type === "bundle");

  return (
    <main className="min-h-screen bg-[#050505] text-[#f7f2ea]">
      <SEO
        title="AKM | Comfort You Can Feel"
        description="Explore AKM essentials. Clean everyday pieces designed for comfort, easy styling, and premium movement."
      />

      <section className="relative overflow-hidden px-5 py-20 md:px-12 md:py-24">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.04]">
          <h1 className="max-w-full text-[120px] font-black tracking-tight sm:text-[160px] md:text-[260px]">
            AKM
          </h1>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[#c8b89d] sm:tracking-[0.35em]">
            {tagline}
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl md:text-7xl">
            BUILT FOR THE STREETS. ENGINEERED FOR WAR.
          </h1>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/shop"
              className="rounded-full bg-[#f7f2ea] px-7 py-3 text-center font-medium text-black transition hover:bg-white"
            >
              Shop Collection
            </Link>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-7 py-3 text-center font-medium text-white transition hover:border-[#c8b89d]/60"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-12 md:py-16">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Bundle Offers
          </p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            Better value, cleaner rotation.
          </h2>
        </div>

        {offersLoading ? (
          <p className="text-zinc-400">Loading offers...</p>
        ) : bundleOffers.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-zinc-400">
            Bundle offers will appear here soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {bundleOffers.map((offer) => (
              <div
                key={offer._id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                {offer.badge ? (
                  <span className="inline-flex rounded-full bg-[#c8b89d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black">
                    {offer.badge}
                  </span>
                ) : null}

                <h3 className="mt-5 text-2xl font-semibold">{offer.title}</h3>
                <p className="mt-3 text-zinc-300">{offer.description}</p>

                <div className="mt-6 space-y-2">
                  <p className="text-zinc-400">
                    Regular price:{" "}
                    <span className="line-through">
                      {Number(offer.regularPrice || 0).toLocaleString()} EGP
                    </span>
                  </p>
                  <p className="text-3xl font-semibold">
                    {Number(offer.offerPrice || 0).toLocaleString()} EGP
                  </p>
                  <p className="text-[#c8b89d]">
                    You save {Number(offer.savings || 0).toLocaleString()} EGP
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-12 md:py-16">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Featured Collection
          </p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            Built around the complete set.
          </h2>
        </div>

        {productsLoading ? (
          <p className="text-zinc-400">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-zinc-400">
            Featured products will appear here soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}