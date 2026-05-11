import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../../components/product/ProductCard";
import ProductFilters from "../../components/product/ProductFilters";
import { getProductFilters, getProducts } from "../../services/productService";
import SEO from "../../components/common/SEO";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  const queryParams = useMemo(() => {
    return {
      search: search || undefined,
      category: category || undefined,
      color: color || undefined,
      size: size || undefined,
    };
  }, [search, category, color, size]);

  const { data: filterOptions = {} } = useQuery({
    queryKey: ["productFilters"],
    queryFn: getProductFilters,
  });

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => getProducts(queryParams),
  });

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-20 text-[#f7f2ea] md:px-12">
      <SEO
        title="Shop AKM Collection | AKM"
        description="Shop AKM products, choose your color and size, and build your everyday rotation."
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Shop
          </p>

          <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
            AKM Collection
          </h1>

          <p className="mt-5 max-w-2xl text-zinc-300">
            Explore AKM essentials and seasonal drops. Choose your product,
            color, and size.
          </p>
        </div>

        <ProductFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          color={color}
          setColor={setColor}
          size={size}
          setSize={setSize}
          categoryOptions={filterOptions.categories || []}
          colorOptions={filterOptions.colors || []}
          sizeOptions={filterOptions.sizes || []}
        />

        <div className="mt-8">
          {isLoading && <p className="text-zinc-400">Loading products...</p>}

          {isError && (
            <p className="text-red-300">
              Something went wrong while loading products.
            </p>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <h2 className="text-2xl font-semibold">No products found</h2>
              <p className="mt-3 text-zinc-400">
                Try changing the filters or search term.
              </p>
            </div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}