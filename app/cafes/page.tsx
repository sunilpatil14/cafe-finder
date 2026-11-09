import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CafeCard } from "@/components/cafe-card";
import { CafeMap } from "@/components/cafe-map";
import { Reveal } from "@/components/reveal";
import { StatusState, type StatusKind } from "@/components/status-state";
import { findCafes, geocodeCity, type Cafe } from "@/lib/cafes";

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; lat?: string; lng?: string }>;
}) {
  const { city, lat, lng } = await searchParams;

  if (!city && !(lat && lng)) redirect("/");

  let title = "Cafes near you";
  let place = "your location";
  let cafes: Cafe[] = [];
  let status: StatusKind | null = null;

  try {
    let coords: { lat: number; lng: number } | null = null;

    if (lat && lng) {
      const la = parseFloat(lat);
      const ln = parseFloat(lng);
      if (Number.isNaN(la) || Number.isNaN(ln)) status = "notfound";
      else coords = { lat: la, lng: ln };
    } else if (city) {
      title = `Cafes in ${city}`;
      place = city;
      coords = await geocodeCity(city);
      if (!coords) status = "notfound";
    }

    if (coords) {
      cafes = await findCafes(coords.lat, coords.lng);
      if (cafes.length === 0) status = "empty";
    }
  } catch {
    status = "busy";
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to search
      </Link>

      <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
      {cafes.length > 0 && (
        <p className="mt-2 text-muted-foreground">
          {cafes.length} cafes found, nearest first
        </p>
      )}

      {status && <StatusState kind={status} place={place} />}

      {cafes.length > 0 && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="grid gap-6 sm:grid-cols-2">
            {cafes.map((cafe, i) => (
              <Reveal key={cafe.id} index={i}>
                <CafeCard cafe={cafe} />
              </Reveal>
            ))}
          </div>

          <div className="order-first h-[320px] overflow-hidden rounded-2xl border border-border lg:sticky lg:top-6 lg:order-last lg:h-[calc(100vh-3rem)]">
            <CafeMap
              cafes={cafes.map(({ id, name, lat, lng }) => ({ id, name, lat, lng }))}
            />
          </div>
        </div>
      )}
      <p className="mt-16 text-xs text-muted-foreground">
        Cafe data © OpenStreetMap contributors
      </p>
    </main>
  );
}