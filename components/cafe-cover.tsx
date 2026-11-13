import { Coffee } from "lucide-react";

const PALETTES = [
  ["#ead9bf", "#d4b48c"],
  ["#e3d0c0", "#c99a7a"],
  ["#dfe0c8", "#b5b98f"],
  ["#e8d5c9", "#c9a08f"],
  ["#d9d2c3", "#a89a82"],
  ["#ecd9b8", "#c8954f"],
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