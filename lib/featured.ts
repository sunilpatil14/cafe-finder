import featured from "@/data/featured.json";
import chains from "@/data/chains.json";

export type MenuItem = { name: string; price?: number; description?: string };
export type MenuSection = { category: string; items: MenuItem[] };
export type Offer = { title: string; details?: string; validTill?: string };
export type FeaturedCafe = {
  tagline?: string;
  images?: string[];
  photoCredit?: string;
  coffeeTypes?: string[];
  menu?: MenuSection[];
  offers?: Offer[];
  updatedAt?: string;
};

const byId = featured as unknown as Record<string, FeaturedCafe>;
const chainList = chains as unknown as { match: string[]; data: FeaturedCafe }[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function getFeatured(id: string, name?: string): FeaturedCafe | null {
  const own = byId[id] ?? null;
  const chain = name
    ? (chainList.find((c) => c.match.includes(norm(name)))?.data ?? null)
    : null;
  if (!own && !chain) return null;
  // branch-specific fields override the chain's
  return { ...chain, ...own };
}