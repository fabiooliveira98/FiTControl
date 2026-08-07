export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-full bg-surface-strong" />
      <div className="h-28 animate-pulse rounded-[1.75rem] bg-surface-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-[1.75rem] bg-surface-muted" />
        <div className="h-40 animate-pulse rounded-[1.75rem] bg-surface-muted" />
      </div>
    </div>
  );
}
