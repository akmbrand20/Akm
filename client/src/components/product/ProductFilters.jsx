import { formatProductLabel } from "../../lib/constants";
import { useLanguage } from "../../hooks/useLanguage";

export default function ProductFilters({
  search,
  setSearch,
  category,
  setCategory,
  color,
  setColor,
  size,
  setSize,
  categoryOptions = [],
  colorOptions = [],
  sizeOptions = [],
}) {
  const { t } = useLanguage();
  const hasFilters = search || category || color || size;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("filters.search")}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
        >
          <option value="">{t("filters.allCategories")}</option>
          {categoryOptions.map((categoryOption) => (
            <option key={categoryOption} value={categoryOption}>
              {t(`categories.${categoryOption}`) ||
                formatProductLabel(categoryOption)}
            </option>
          ))}
        </select>

        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
        >
          <option value="">{t("filters.allColors")}</option>
          {colorOptions.map((colorOption) => (
            <option key={colorOption} value={colorOption}>
              {colorOption}
            </option>
          ))}
        </select>

        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
        >
          <option value="">{t("filters.allSizes")}</option>
          {sizeOptions.map((sizeOption) => (
            <option key={sizeOption} value={sizeOption}>
              {sizeOption}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setCategory("");
            setColor("");
            setSize("");
          }}
          className="mt-4 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-[#c8b89d]/60 hover:text-white"
        >
          {t("filters.clear")}
        </button>
      )}
    </div>
  );
}
