"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import {
  Coffee,
  MapPin,
  Navigation,
  Search,
  Sun,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { IntroLoader } from "@/components/intro-loader";
import { SearchBox } from "@/components/search-box";
import { PLACES, placeLabel } from "@/data/places";

// resets on a full refresh, survives in-app navigation
let introPlayed = false;

const CAFE_COUNT = "1,100+"; // edit to match your snapshot

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const plainWords = ["Find", "the", "cafe", "that", "feels"];

const floaters: {
  icon: LucideIcon;
  label: string;
  className: string;
  delay: number;
}[] = [
  { icon: MapPin, label: "Nearest first", className: "left-[6%] top-[30%]", delay: 0 },
  { icon: Wifi, label: "WiFi spots", className: "right-[7%] top-[26%]", delay: 0.8 },
  { icon: Sun, label: "Outdoor seating", className: "right-[11%] bottom-[26%]", delay: 1.6 },
];

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Search,
    title: "Search your way",
    text: "Pick an area or type a cafe name. Suggestions appear as you type.",
  },
  {
    icon: Coffee,
    title: "See what's inside",
    text: "Menus, coffee types and offers wherever cafes have shared them.",
  },
  {
    icon: Navigation,
    title: "Get there easily",
    text: "Hours, WiFi and outdoor seating where listed, plus one-tap directions.",
  },
];

function AreaMarquee({ still }: { still: boolean }) {
  const row = PLACES.filter((p) => p.name !== "Bengaluru");
  const fade =
    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)";

  return (
    <div
      className="relative mt-16 w-full overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <motion.div
        className="flex w-max"
        animate={still ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 45, ease: "linear", repeat: Infinity }}
      >
        {[...row, ...row].map((p, i) => (
          <Link
            key={`${p.name}-${i}`}
            href={`/cafes?lat=${p.lat}&lng=${p.lng}&name=${encodeURIComponent(placeLabel(p))}`}
            className="mr-3 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:border-sky-deep hover:bg-sky/50"
          >
            {p.name}
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(() => !introPlayed);
  const [revealed, setRevealed] = useState(() => introPlayed);

  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => setMounted(false), []);

  useEffect(() => {
    introPlayed = true;
    if (reduceMotion) {
      setMounted(false);
      setRevealed(true);
    }
  }, [reduceMotion]);

  // glow that follows the pointer
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(191,221,240,0.6), transparent 60%)`;

  return (
    <>
      {mounted && <IntroLoader onReveal={handleReveal} onDone={handleDone} />}

      <main>
        <section
          className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pb-10 pt-24"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(((e.clientX - r.left) / r.width) * 100);
            my.set(((e.clientY - r.top) / r.height) * 100);
          }}
        >
          {/* backgrounds */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: spotlight }}
          />
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2">
            <motion.div
              className="size-[620px] rounded-full bg-sky/50 blur-3xl"
              animate={{ x: [0, 70, -50, 0], y: [0, 30, -20, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="pointer-events-none absolute -bottom-40 -right-20">
            <motion.div
              className="size-[440px] rounded-full bg-accent/10 blur-3xl"
              animate={{ x: [0, -60, 30, 0], y: [0, -40, 20, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* nav */}
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6"
          >
            <Link href="/" className="font-display flex items-center gap-2 text-xl">
              <Coffee className="size-5 text-accent" />
              Brew Atlas
            </Link>
            <a
              href="#how"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              How it works
            </a>
          </motion.nav>

          {/* floating chips (wide screens only) */}
          {floaters.map((f) => (
            <motion.div
              key={f.label}
              className={`pointer-events-none absolute hidden xl:block ${f.className}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.2 + f.delay, duration: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: f.delay,
                }}
                className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm shadow-sm backdrop-blur"
              >
                <f.icon className="size-4 text-sky-deep" />
                {f.label}
              </motion.div>
            </motion.div>
          ))}

          {/* content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={revealed ? "show" : "hidden"}
            className="relative flex flex-col items-center px-6 text-center"
          >
            <motion.p
              variants={item}
              className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground"
            >
              Cafe finder
            </motion.p>

            <h1 className="font-display max-w-3xl text-5xl leading-tight sm:text-7xl">
              {plainWords.map((w) => (
                <motion.span key={w} variants={item} className="mr-[0.25em] inline-block">
                  {w}
                </motion.span>
              ))}
              <motion.span
                variants={item}
                className="mr-[0.25em] inline-block italic text-accent"
              >
                just
              </motion.span>
              <motion.span
                variants={item}
                className="relative isolate inline-block italic text-accent"
              >
                right
                <motion.span
                  aria-hidden
                  className="absolute bottom-1 left-0 -z-10 h-3 w-full origin-left rounded-full bg-sky sm:h-4"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: revealed ? 1 : 0 }}
                  transition={{ delay: 1.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.span>
            </h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-lg text-lg text-muted-foreground"
            >
              Browse interiors, menus and coffee types in your city, before you
              step through the door.
            </motion.p>

            <motion.div variants={item} className="mt-10 flex w-full justify-center">
              <SearchBox />
            </motion.div>
          </motion.div>

          {/* area strip */}
          <motion.div
            className="relative w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ delay: 1.4, duration: 0.9 }}
          >
            <AreaMarquee still={!!reduceMotion} />
          </motion.div>
        </section>

        {/* how it works */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {CAFE_COUNT} cafes mapped in Bengaluru
            </p>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">How it works</h2>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-full rounded-3xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-sky/60 text-primary">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="font-display text-2xl">{f.title}</h3>
                  <p className="mt-3 text-muted-foreground">{f.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border px-6 py-10 text-center text-xs text-muted-foreground">
          <p className="font-display text-base text-foreground">Brew Atlas</p>
          <p className="mt-2">Cafe data © OpenStreetMap contributors</p>
        </footer>
      </main>
    </>
  );
}