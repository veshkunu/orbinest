/** A right-rail block: its heading sits outside the card, 8px above it, per the app style. */
export function RailSection({ title, action, children, padded = false }) {
  return (
    <section>
      <div className="mb-2 flex min-h-8 items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {action}
      </div>
      <div className={padded ? "rounded-lg border border-line bg-surface p-5" : "rounded-lg border border-line bg-surface"}>{children}</div>
    </section>
  );
}
