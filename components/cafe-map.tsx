"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Pin = { id: string; name: string; lat: number; lng: number };

export function CafeMap({ cafes }: { cafes: Pin[] }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || cafes.length === 0) return;

    const map = new maplibregl.Map({
      container: container.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [cafes[0].lng, cafes[0].lat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    const bounds = new maplibregl.LngLatBounds();

    cafes.forEach((c) => {
      const el = document.createElement("div");
      el.style.cssText =
        "width:16px;height:16px;border-radius:50%;background:#b8763e;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer;";

      const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setText(
        c.name
      );

      new maplibregl.Marker({ element: el })
        .setLngLat([c.lng, c.lat])
        .setPopup(popup)
        .addTo(map);

      bounds.extend([c.lng, c.lat]);
    });

    map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 0 });

    return () => map.remove();
  }, [cafes]);

  return <div ref={container} className="h-full w-full" />;
}