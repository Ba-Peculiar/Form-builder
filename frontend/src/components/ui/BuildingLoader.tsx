const FIELD_DELAYS = [300, 600, 900]

export function BuildingLoader() {
  return (
    <div className="w-44 rounded-lg border border-slate-200 bg-white p-3 shadow-sm" aria-hidden="true">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-accent-600 animate-build-line" />
      </div>

      <div className="mt-2.5 space-y-1.5">
        {FIELD_DELAYS.map((delay) => (
          <div key={delay} className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-accent-300 animate-build-line"
              style={{ animationDelay: `${delay}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
