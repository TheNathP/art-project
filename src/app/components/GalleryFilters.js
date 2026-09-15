export default function GalleryFilters({
  years,
  movements,
  selectedYear,
  selectedMovement,
  onYearChange,
  onMovementChange,
  onReset,
}) {
  const hasActiveFilters =
    selectedYear !== "all" || selectedMovement !== "all";

  return (
    <div className="mb-12 flex flex-col gap-5 border-y border-neutral-300 py-6 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label
          htmlFor="year-filter"
          className="mb-2 block text-xs uppercase tracking-wider text-neutral-500"
        >
          Date
        </label>

        <select
          id="year-filter"
          value={selectedYear}
          onChange={(event) => onYearChange(event.target.value)}
          className="w-full border border-neutral-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-950 sm:max-w-xs"
        >
          <option value="all">Toutes les dates</option>

          {years.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label
          htmlFor="movement-filter"
          className="mb-2 block text-xs uppercase tracking-wider text-neutral-500"
        >
          Courant artistique
        </label>

        <select
          id="movement-filter"
          value={selectedMovement}
          onChange={(event) => onMovementChange(event.target.value)}
          className="w-full border border-neutral-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-950 sm:max-w-xs"
        >
          <option value="all">Tous les courants</option>

          {movements.map((movement) => (
            <option key={movement} value={movement}>
              {movement}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="px-1 py-3 text-left text-sm underline underline-offset-4 sm:text-center"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}