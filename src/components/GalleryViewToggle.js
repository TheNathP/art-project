const VIEW_OPTIONS = [
  { value: "draggable", label: "Free" },
  { value: "grid", label: "Grid" },
];

export default function GalleryViewToggle({
  viewMode,
  onViewModeChange,
  disabled = false,
}) {
  return (
    <fieldset
      data-gallery-filter-item
      className="relative h-16 w-fit shrink-0 rounded-xs bg-white px-4 py-3 text-black shadow-[0_10px_30px_rgba(0,0,0,0.14)] after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black"
    >
      <legend className="sr-only">Gallery display mode</legend>

      <div className="relative z-10">
        <p className="text-[0.6rem] uppercase tracking-[0.16em] text-black/55">
          View
        </p>

        <div className="mt-1 flex gap-1">
          {VIEW_OPTIONS.map((option) => {
            const isActive = viewMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                disabled={disabled}
                onClick={() => onViewModeChange(option.value)}
                className={`w-fit cursor-pointer rounded-xs border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.08em] transition-[background-color,color,border-color,border-radius] duration-300 hover:rounded-sm hover:border-black hover:bg-[var(--main-highlight)] hover:text-black focus-visible:rounded-sm focus-visible:border-black focus-visible:bg-[var(--main-highlight)] focus-visible:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-50 ${
                  isActive
                    ? "border-black bg-[var(--main-highlight)] text-black"
                    : "border-black/30 bg-white text-black"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}
