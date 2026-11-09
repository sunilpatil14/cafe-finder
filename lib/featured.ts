import featured from "@/data/featured.json";

export type MenuItem = { name: string; price?: number; description?: string };
export type MenuSection = { category: string; items: MenuItem[] };
export type FeaturedCafe = {
  tagline?: string;
  images?: string[];
  coffeeTypes?: string[];
  menu?: MenuSection[];
};

const data = featured as unknown as Record<string, FeaturedCafe>;

export function getFeatured(id: string): FeaturedCafe | null {
  return data[id] ?? null;
}