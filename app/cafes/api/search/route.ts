import { NextRequest, NextResponse } from "next/server";
import snapshot from "@/data/cafes-bengaluru.json";
import { getFeatured } from "@/lib/featured";

type Row = { id: string; name: string; address: string };
const ROWS = snapshot as unknown as Row[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function GET(req: NextRequest) {
  const q = norm(req.nextUrl.searchParams.get("q") ?? "");
  if (q.length < 2) return NextResponse.json([]);

  const hits = ROWS.filter((c) => norm(c.name).includes(q))
    .map((c) => ({
      id: c.id,
      name: c.name,
      address: c.address,
      featured: getFeatured(c.id) !== null,
      starts: norm(c.name).startsWith(q),
    }))
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        Number(b.starts) - Number(a.starts)
    )
    .slice(0, 6)
    .map(({ id, name, address, featured }) => ({ id, name, address, featured }));

  return NextResponse.json(hits);
}