export default function ColorSelector({ colors = [], selectedColor, onSelect }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-white">Color</p>
        <p className="text-sm text-zinc-400">{selectedColor}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {colors.map((color) => {
          const active = selectedColor === color.name;

          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onSelect(color.name)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-[#c8b89d] bg-[#c8b89d] text-black"
                  : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/30"
              }`}
            >
              {color.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}