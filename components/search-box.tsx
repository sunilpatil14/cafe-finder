"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBox() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const value = city.trim();
    if (!value) return;
    router.push(`/cafes?city=${encodeURIComponent(value)}`);
  }

  function handleNearMe() {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location. Please search by city.");
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
        setError("Couldn't get your location. Allow access or search by city.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm"
      >
        <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search a city or area, e.g. Indiranagar"
          className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button type="submit" className="h-10 rounded-full px-6">
          Search
        </Button>
      </form>

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

      {error && (
        <p className="mt-3 text-center text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}