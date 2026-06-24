const BARS = [
  { height: 'h-4', delay: 0 },
  { height: 'h-7', delay: 150 },
  { height: 'h-9', delay: 300 },
  { height: 'h-6', delay: 450 },
]

export function BuildingLoader() {
  return (
    <div className="flex items-end gap-1.5" aria-hidden="true">
      {BARS.map(({ height, delay }, i) => (
        <span
          key={i}
          className={`w-2.5 rounded-sm bg-accent-600 animate-build-block ${height}`}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}
