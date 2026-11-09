import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Globe, MapPin, Navigation, Phone, Sun, Wifi } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { getCafeById, type Cafe } from "@/lib/cafes";
import { getFeatured } from "@/lib/featured";

export default async function CafeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cafe: Cafe | null = null;
  try {
    cafe = await getCafeById(id);
  } catch {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <BackLink />
        <p className="text-muted-foreground">
          The map data service is busy right now. Please refresh in a moment.
        </p>
      </main>
    );
  }
  if (!cafe) notFound();

  const extra = getFeatured(id);
  const images = extra?.images ?? [];
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`;
  const website = cafe.website?.startsWith("http") ? cafe.website : undefined;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <BackLink />

      <h1 className="font-display text-4xl sm:text-6xl">{cafe.name}</h1>
      {extra?.tagline && (
        <p className="mt-3 text-lg text-muted-foreground">{extra.tagline}</p>
      )}

      {/* Gallery */}
      <section className="mt-8">
        {images.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {images.slice(0, 5).map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-2xl bg-secondary ${
                  i === 0 ? "aspect-[4/3] sm:col-span-2 sm:row-span-2" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={src}
                  alt={`${cafe.name} interior ${i + 1}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex aspect-[16/7] items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            Interior photos coming soon
          </div>
        )}
      </section>

      {/* Info */}
      <section className="mt-10 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <p className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
          {cafe.address || "Address not listed"}
        </p>
        {cafe.openingHours && (
          <p className="flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
            {cafe.openingHours}
          </p>
        )}
        {cafe.phone && (
          <p className="flex items-start gap-2 text-sm">
            <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
            {cafe.phone}
          </p>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm hover:underline"
          >
            <Globe className="mt-0.5 size-4 shrink-0 text-accent" />
            Website
          </a>
        )}
        {cafe.wifi && (
          <p className="flex items-center gap-2 text-sm">
            <Wifi className="size-4 text-accent" /> WiFi available
          </p>
        )}
        {cafe.outdoorSeating && (
          <p className="flex items-center gap-2 text-sm">
            <Sun className="size-4 text-accent" /> Outdoor seating
          </p>
        )}
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground sm:col-span-2"
        >
          <Navigation className="size-4" /> Get directions
        </a>
      </section>

      {/* Coffee types */}
      {extra?.coffeeTypes && extra.coffeeTypes.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-3xl">Coffee they serve</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {extra.coffeeTypes.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm"
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Menu */}
      {extra?.menu && extra.menu.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-3xl">Menu</h2>
          <div className="mt-6 grid gap-10 sm:grid-cols-2">
            {extra.menu.map((section) => (
              <div key={section.category}>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
                  {section.category}
                </h3>
                <ul className="space-y-4">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-medium">{item.name}</span>
                        {item.price != null && (
                          <span className="text-sm">₹{item.price}</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fallback for cafes we haven't filled in */}
      {!extra && (
        <section className="mt-12 rounded-2xl border border-dashed border-border p-8 text-center">
          <h2 className="font-display text-2xl">Menu and coffee details coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We only have the basics for this cafe so far.
          </p>
        </section>
      )}
    </main>
  );
}