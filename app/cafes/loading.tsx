export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="h-12 w-72 animate-pulse rounded-xl bg-secondary" />
      <p className="mt-4 text-muted-foreground">Finding cafes…</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
    </main>
  );
}