"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLACES, placeLabel, type Place } from "@/data/places";

type CafeHit = { id: string; name: string; address: string; featured: boolean };
type Option =
  | { kind: "place"; place: Place }
  | { kind: "cafe"; cafe: CafeHit }
  | { kind: "text" };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function SearchBox() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [cafeHits, setCafeHits] = useState<CafeHit[]>([]);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const typed = city.trim();

  // look up cafe names (waits 250 ms after the last keystroke)
  useEffect(() => {
    if (typed.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(typed)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) setCafeHits(await res.json());
      } catch {}
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [typed]);

  const places = useMemo(() => {
    const q = norm(city);
    if (!q) return PLACES.slice(0, 6);
    return PLACES.map((p) => {
      const names = [p.name, ...(p.aliases ?? [])].map(norm);
      const starts = names.some((n) => n.startsWith(q));
      const has = names.some((n) => n.includes(q));
      return { p, score: starts ? 0 : has ? 1 : 2 };
    })
      .filter((x) => x.score < 2)
      .sort((a, b) => a.score - b.score)
      .slice(0, 4)
      .map((x) => x.p);
  }, [city]);

  const hits = typed.length >= 2 ? cafeHits : [];

  const options: Option[] = [
    ...places.map((place) => ({ kind: "place" as const, place })),
    ...hits.map((cafe) => ({ kind: "cafe" as const, cafe })),
    ...(typed ? [{ kind: "text" as const }] : []),
  ];
  const current = Math.min(active, Math.max(options.length - 1, 0));

  function choose(opt: Option) {
    setOpen(false);
    if (opt.kind === "place") {
      const p = opt.place;
      router.push(
        `/cafes?lat=${p.lat}&lng=${p.lng}&name=${encodeURIComponent(placeLabel(p))}`
      );
    } else if (opt.kind === "cafe") {
      router.push(`/cafes/${opt.cafe.id}`);
    } else {
      router.push(`/cafes?city=${encodeURIComponent(typed)}`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!typed) return;
    const opt = options[current];
    if (opt) choose(opt);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((current + 1) % Math.max(options.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current - 1 + options.length) % Math.max(options.length, 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleNearMe() {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location. Please search by area.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        router.push(`/cafes?lat=${latitude}&lng=${longitude}`);
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Allow access or search by area.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm"
        >
          <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
          <Input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls="search-suggestions"
            autoComplete="off"
            placeholder="Search an area or a cafe name"
            className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="submit" className="h-10 rounded-full px-6">
            Search
          </Button>
        </form>

        {open && options.length > 0 && (
          <ul
            id="search-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-lg"
          >
            {!typed && (
              <li className="px-5 pb-1 pt-3 text-xs uppercase tracking-widest text-muted-foreground">
                Popular areas
              </li>
            )}

            {options.map((opt, i) => (
              <li
                key={
                  opt.kind === "place"
                    ? `p-${opt.place.name}`
                    : opt.kind === "cafe"
                      ? `c-${opt.cafe.id}`
                      : "text"
                }
                role="option"
                aria-selected={i === current}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(opt);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 px-5 py-3 text-sm ${
                  i === current ? "bg-secondary" : ""
                } ${opt.kind === "text" ? "border-t border-border" : ""}`}
              >
                {opt.kind === "place" && (
                  <>
                    <MapPin className="size-4 shrink-0 text-accent" />
                    <span>{placeLabel(opt.place)}</span>
                  </>
                )}
                {opt.kind === "cafe" && (
                  <>
                    <Coffee className="size-4 shrink-0 text-accent" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{opt.cafe.name}</span>
                      {opt.cafe.address && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {opt.cafe.address}
                        </span>
                      )}
                    </span>
                    {opt.cafe.featured && (
                      <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                        Menu
                      </span>
                    )}
                  </>
                )}
                {opt.kind === "text" && (
                  <>
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <span>
                      Search for <strong>“{typed}”</strong> anywhere in India
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handleNearMe}
        disabled={locating}
        className="mx-auto mt-4 flex items-center gap-2 text-sm font-medium text-accent transition hover:opacity-80 disabled:opacity-60"
      >
        {locating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MapPin className="size-4" />
        )}
        {locating ? "Finding you…" : "Use my current location"}
      </button>

      {error && <p className="mt-3 text-center text-sm text-red-700">{error}</p>}
    </div>
  );
}