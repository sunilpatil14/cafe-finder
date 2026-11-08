import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CafeCard } from "@/components/cafe-card";
import { CafeMap } from "@/components/cafe-map";
import { findCafes, geocodeCity, type Cafe } from "@/lib/cafes";

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; lat?: string; lng?: string }>;
}) {
  const { city, lat, lng } = await searchParams;

  let title = "Cafes near you";
  let cafes: Cafe[] = [];
  let message = "";

  try {
    let coords: { lat: number; lng: number } | null = null;

    if (lat && lng) {
      coords = { lat: parseFloat(lat), lng: parseFloat(lng) };
    } else if (city) {
      title = `Cafes in ${city}`;
      coords = await geocodeCity(city);
      if (!coords) message = `We couldn't find "${city}". Try a different spelling.`;
    } else {
      message = "Search for a city to get started.";
    }

    if (coords) {
      cafes = await findCafes(coords.lat, coords.lng);
      if (cafes.length === 0) message = "No cafes found in this area yet.";
    }
  } catch {
    message =
      "The map data service is busy right now. Please try again in a moment.";
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

      {message && <p className="mt-10 text-muted-foreground">{message}</p>}

            {cafes.length > 0 && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="grid gap-6 sm:grid-cols-2">
            {cafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>

          <div className="order-first h-[320px] overflow-hidden rounded-2xl border border-border lg:sticky lg:top-6 lg:order-last lg:h-[calc(100vh-3rem)]">
            <CafeMap
              cafes={cafes.map(({ id, name, lat, lng }) => ({ id, name, lat, lng }))}
            />
          </div>
        </div>
      )}
    </main>
  );
}