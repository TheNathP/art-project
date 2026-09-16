import SearchBar from "./SearchBar";


export default function GalleryFilters({
  years,
  movements,
  selectedYear,
  selectedMovement,
  searchQuery,
  resultCount,
  onYearChange,
  onMovementChange,
  onReset,
}) {
  const hasActiveFilters =
    selectedYear !== "all" || selectedMovement !== "all" || searchQuery !== "";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex justify-center px-4">
      <aside
        aria-label="Filtres de la galerie"
        className="pointer-events-auto w-full max-w-5xl overflow-hidden rounded-sm border-2 border-black backdrop-blur-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <div className="flex shrink-0 items-center justify-between border-b border-black/20 px-4 py-3 sm:w-36 sm:border-b-0 sm:border-r">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.18em] text-neutral-500">
                Collection
              </p>

              <p
                aria-live="polite"
                className="mt-0.5 text-sm font-medium"
              >
                {resultCount} œuvre
                {resultCount !== 1 ? "s" : ""}
              </p>
            </div>

            {hasActiveFilters && (
              <span
                aria-hidden="true"
                className="ml-3 size-2 rounded-full bg-black sm:hidden"
              />
            )}
          </div>

          <div className="grid flex-1 grid-cols-1 sm:grid-cols-[minmax(12rem,1.4fr)_minmax(9rem,0.8fr)_minmax(11rem,1fr)]">
            <SearchBar/>

            <div className="min-w-0 border-b border-black/20 px-3 py-2 sm:border-b-0 sm:border-r">
              <label
                htmlFor="year-filter"
                className="block text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500"
              >
                Date
              </label>

              <select
                id="year-filter"
                value={selectedYear}
                onChange={(event) => onYearChange(event.target.value)}
                className="mt-0.5 w-full cursor-pointer appearance-none truncate border-0 bg-transparent py-1 pr-5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <option value="all">Toutes les dates</option>

                {years.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0 px-3 py-2">
              <label
                htmlFor="movement-filter"
                className="block text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500"
              >
                Courant
              </label>

              <select
                id="movement-filter"
                value={selectedMovement}
                onChange={(event) => onMovementChange(event.target.value)}
                className="mt-0.5 w-full cursor-pointer appearance-none truncate border-0 bg-transparent py-1 pr-5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <option value="all">Tous les courants</option>

                {movements.map((movement) => (
                  <option key={movement} value={movement}>
                    {movement}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              aria-label="Réinitialiser les filtres"
              onClick={onReset}
              className="group flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 border-0 border-t border-black bg-black px-5 text-xs uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white sm:border-l sm:border-t-0"
            >
              <span>Effacer</span>

              <span
                aria-hidden="true"
                className="text-lg leading-none transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none"
              >
                ×
              </span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}