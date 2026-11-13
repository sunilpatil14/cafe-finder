import { Coffee } from "lucide-react";

const PALETTES = [
  ["#f3e9d8", "#cfe4f2"],
  ["#efe2cf", "#e0c3a3"],
  ["#dcebf5", "#b7d6ea"],
  ["#e8d9c4", "#c8a784"],
  ["#f5ecde", "#bfddf0"],
  ["#e2d0ba", "#a9cde6"],
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function CafeCover({
  name,
  className = "",
  large = false,
}: {
  name: string;
  className?: string;
  large?: boolean;
}) {
  const [a, b] = PALETTES[hash(name) % PALETTES.length];
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      <Coffee className="absolute -bottom-6 -right-4 size-28 -rotate-12 text-black/[0.06]" />
      <span
        className={`font-display text-foreground/70 ${large ? "text-8xl" : "text-5xl"}`}
      >
        {initial}
      </span>
    </div>
  );
}