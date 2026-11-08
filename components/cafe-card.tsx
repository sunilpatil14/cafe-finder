import { Clock, MapPin, Sun, Wifi } from "lucide-react";
import type { Cafe } from "@/lib/cafes";

export function CafeCard({ cafe }: { cafe: Cafe }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-secondary text-sm text-muted-foreground">
        Photos coming soon
      </div>

      <h3 className="font-display text-xl leading-snug">{cafe.name}</h3>

      <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0" />
        <span>{cafe.address || "Address not listed"}</span>
      </p>

      {cafe.openingHours && (
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Clock className="mt-0.5 size-4 shrink-0" />
          <span className="line-clamp-1">{cafe.openingHours}</span>
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2 text-accent">
          {cafe.wifi && <Wifi className="size-4" aria-label="WiFi" />}
          {cafe.outdoorSeating && (
            <Sun className="size-4" aria-label="Outdoor seating" />
          )}
        </div>
        <span className="text-sm font-medium">
          {cafe.distanceKm.toFixed(1)} km
        </span>
      </div>
    </article>
  );
}